import re
import time
from datetime import datetime
from dateutil import parser
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Set ChromeDriver path (adjust if needed)
CHROMEDRIVER_PATH = '/usr/local/bin/chromedriver'

def split_band_names(band_string):
    """Splits a band string into individual names, removing extra delimiters."""
    return [b.strip() for b in re.split(r'\s*(?:,|w/|&|\+)\s*', band_string) if b.strip()]

def run_berlin_mpls_scraper():
    """
    Runs the BerlinMPLS scraper and returns a log dict containing:
      - scraper_name: Identifier for the scraper.
      - added_count: Number of events inserted.
      - duplicate_count: Number of duplicate events skipped.
      - added_shows: List of inserted show IDs.
      - errors: List of error messages encountered.
    """
    added_count = 0
    duplicate_count = 0
    added_shows = []
    errors = []

    print("Starting BerlinMPLS scraper...")

    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    try:
        service = Service(CHROMEDRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("Chrome initialized successfully")
    except Exception as e:
        err_msg = f"Error initializing Chrome: {e}"
        print(err_msg)
        errors.append(err_msg)
        return {
            'scraper_name': 'berlin_mpls',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    url = 'https://www.berlinmpls.com/calendar'
    print(f"Navigating to {url}")
    try:
        driver.get(url)
    except Exception as e:
        err_msg = f"Error navigating to {url}: {e}"
        print(err_msg)
        errors.append(err_msg)
        driver.quit()
        return {
            'scraper_name': 'berlin_mpls',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Wait for event cards to load
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, 'eventlist-event--upcoming'))
        )
        print("Event cards loaded successfully.")
    except Exception as e:
        err_msg = f"Error waiting for event cards: {e}"
        print(err_msg)
        errors.append(err_msg)
        driver.quit()
        return {
            'scraper_name': 'berlin_mpls',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Parse the page with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    event_cards = soup.find_all("article", class_="eventlist-event--upcoming")
    print(f"Found {len(event_cards)} event cards.")

    # Connect to the database
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        err_msg = f"DB connection error: {e}"
        print(err_msg)
        errors.append(err_msg)
        driver.quit()
        return {
            'scraper_name': 'berlin_mpls',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Get the venue ID for Berlin
    try:
        venue_id = get_venue_id(cursor, "Berlin")
    except Exception as e:
        err_msg = f"Error getting venue ID for Berlin: {e}"
        print(err_msg)
        errors.append(err_msg)
        conn.close()
        driver.quit()
        return {
            'scraper_name': 'berlin_mpls',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Process each event card
    for card in event_cards:
        event_name = None
        event_link = None
        flyer_image = None
        bands = []
        start = None  # Will hold the parsed datetime

        # Extract event name and link
        h1_tag = card.find("h1", class_="eventlist-title")
        if h1_tag:
            a_tag = h1_tag.find("a", href=True)
            if a_tag:
                event_name = a_tag.get_text(strip=True)
                event_link = "https://www.berlinmpls.com" + a_tag['href']
            else:
                event_name = h1_tag.get_text(strip=True)

        # If an event link exists, navigate to it for more details
        if event_link:
            try:
                driver.get(event_link)
                time.sleep(2)  # Allow time for the event page to load
                event_soup = BeautifulSoup(driver.page_source, 'html.parser')

                # Extract flyer image
                image_wrapper = event_soup.find("div", class_="image-block-wrapper")
                if image_wrapper:
                    img_tag = image_wrapper.find("img", src=True)
                    if img_tag:
                        flyer_image = img_tag['src']

                # Extract date and time from the <time> element
                time_span = event_soup.find("time", class_="event-time-localized-start")
                if not time_span:
                    time_span = event_soup.find("time", class_="event-time-localized")
                if time_span:
                    date_str = time_span.get("datetime", "").strip()   # e.g., "2025-01-10"
                    time_str = time_span.get_text(strip=True)          # e.g., "10:15 PM"
                    if date_str and time_str:
                        combined_str = f"{date_str} {time_str}"
                    else:
                        combined_str = time_str or date_str
                    try:
                        start = parser.parse(combined_str)
                    except Exception as e:
                        err_msg = f"Could not parse datetime '{combined_str}': {e}"
                        print(err_msg)
                        errors.append(err_msg)
                else:
                    err_msg = "No time element found on event page."
                    print(err_msg)
                    errors.append(err_msg)
            except Exception as e:
                err_msg = f"Error processing event page for {event_name}: {e}"
                print(err_msg)
                errors.append(err_msg)
                continue

        # Extract bands: use event name and also additional support info if available
        if event_name:
            bands.append(event_name)
        support_tag = card.find(class_="vp-support")
        if support_tag:
            additional_bands = split_band_names(support_tag.get_text(strip=True))
            bands.extend(additional_bands)

        # Remove duplicate band names and extra whitespace
        bands = list(dict.fromkeys(band.strip() for band in bands if band.strip()))
        bands_str = ", ".join(bands)

        # Process the event: Insert into the database
        try:
            show_id, was_inserted = insert_show(conn, cursor, venue_id, bands_str, start, event_link, flyer_image)
            if was_inserted:
                added_count += 1
                added_shows.append(show_id)
                print(f"Inserted event: {event_name} on {start}")
            else:
                duplicate_count += 1
                print(f"Duplicate event skipped: {event_name} on {start}")
        except Exception as e:
            err_msg = f"Error processing event '{event_name}': {e}"
            print(err_msg)
            errors.append(err_msg)
            conn.rollback()
            continue

    # Commit changes and close DB connection
    conn.commit()
    cursor.close()
    conn.close()

    driver.quit()

    # Return a log of the run
    return {
        'scraper_name': 'berlin_mpls',
        'added_count': added_count,
        'duplicate_count': duplicate_count,
        'added_shows': added_shows,
        'errors': errors,
    }

if __name__ == "__main__":
    log = run_berlin_mpls_scraper()
    print("Scraper Log:", log)