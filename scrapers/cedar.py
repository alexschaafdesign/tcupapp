import re
import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Set ChromeDriver path (adjust if necessary)
CHROMEDRIVER_PATH = '/usr/local/bin/chromedriver'

def navigate_to_event(driver, url, max_retries=3):
    """
    Navigates to a given URL and waits for a critical element to appear.
    Returns True if the page loads successfully, otherwise False.
    """
    for attempt in range(max_retries):
        try:
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.eventitem-column-meta"))
            )
            return True
        except TimeoutException:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            print(f"Failed to load page after {max_retries} attempts: {url}")
            return False

def run_the_cedar_scraper():
    """
    Runs the Cedar Cultural Center scraper and returns a log dict containing:
      - scraper_name: Identifier for the scraper.
      - added_count: Number of events inserted.
      - duplicate_count: Number of duplicate events skipped.
      - added_shows: List of inserted show IDs.
      - errors: List of error messages encountered.
    """
    scraper_name = 'the_cedar'
    added_count = 0
    duplicate_count = 0
    added_shows = []
    errors = []

    print("Starting The Cedar scraper...")

    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    try:
        service = Service(CHROMEDRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        err_msg = f"Error initializing Chrome: {e}"
        print(err_msg)
        errors.append(err_msg)
        return {
            'scraper_name': scraper_name,
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Load the main events page
    main_url = 'https://www.thecedar.org/events'
    try:
        driver.get(main_url)
    except Exception as e:
        err_msg = f"Error loading main page {main_url}: {e}"
        print(err_msg)
        errors.append(err_msg)
        driver.quit()
        return {
            'scraper_name': scraper_name,
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Wait for event cards to load
    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "article.eventlist-event"))
        )
        print("Event cards loaded successfully.")
    except Exception as e:
        err_msg = f"Event cards did not load in time: {e}"
        print(err_msg)
        errors.append(err_msg)
        driver.quit()
        return {
            'scraper_name': scraper_name,
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Parse the main events page
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    events = soup.select("article.eventlist-event")
    print(f"Found {len(events)} event cards on main page.")

    events_data = []
    # Each event card is assumed to be for The Cedar Cultural Center
    for event in events:
        event_details = {'venue': "The Cedar Cultural Center", 'venue_id': 16}

        # Get the event URL
        link = event.find("a", href=True)
        if not link:
            print("No event link found for this event card.")
            continue

        event_url = link['href']
        full_event_url = f"https://www.thecedar.org{event_url}"
        event_details['event_link'] = full_event_url

        # Get the event date from a <time> element
        date_tag = event.find("time", class_="event-date")
        if date_tag and date_tag.has_attr("datetime"):
            try:
                date_text = date_tag["datetime"]
                event_date = datetime.strptime(date_text, "%Y-%m-%d").date()
                event_details['date'] = event_date
            except Exception as e:
                err_msg = f"Error parsing event date: {e}"
                print(err_msg)
                errors.append(err_msg)
                continue
        else:
            print("Event date not found.")
            continue

        # Extract start time from a <time> element with localized start
        try:
            start_time_tag = event.find("time", class_="event-time-localized-start")
            if start_time_tag:
                start_time_text = start_time_tag.get_text(strip=True).replace(" ", " ")
                show_time = datetime.strptime(start_time_text, "%I:%M %p").time()
                event_details['start'] = datetime.combine(event_date, show_time)
            else:
                event_details['start'] = None
        except Exception as e:
            err_msg = f"Error parsing start time: {e}"
            print(err_msg)
            errors.append(err_msg)
            event_details['start'] = None

        # Navigate to individual event page for additional details
        if not navigate_to_event(driver, full_event_url):
            continue
        event_soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Extract band names from meta div
        meta_div = event_soup.find("div", class_="eventitem-column-meta")
        if meta_div:
            title_tag = meta_div.find("h1", class_="eventitem-title")
            if title_tag:
                title_text = title_tag.get_text(strip=True)
                # Split on various connectors to capture multiple bands
                connectors = [" and ", " + ", " & ", " with ", " featuring "]
                for connector in connectors:
                    if connector in title_text.lower():
                        band_names = [band.strip() for band in title_text.split(connector)]
                        break
                else:
                    band_names = [title_text.strip()]
                event_details['bands'] = ", ".join(band_names)
            else:
                print("Band title not found.")
        else:
            print("Meta div not found for band names.")

        # Extract flyer image
        try:
            flyer_image_tag = event_soup.select_one("div.sqs-image-shape-container-element img")
            if flyer_image_tag and 'src' in flyer_image_tag.attrs:
                flyer_image = flyer_image_tag['src'].replace("-size", "-original")
                event_details['flyer_image'] = flyer_image
            else:
                event_details['flyer_image'] = None
        except Exception as e:
            err_msg = f"Error parsing flyer image: {e}"
            print(err_msg)
            errors.append(err_msg)
            event_details['flyer_image'] = None

        # Check for critical data before saving
        if not event_details.get('start'):
            print(f"Missing start time for event: {event_details['event_link']}")
        if not event_details.get('bands'):
            print(f"Missing band information for event: {event_details['event_link']}")

        if event_details.get('start') and event_details.get('bands'):
            events_data.append(event_details)
        else:
            print(f"Skipped event due to missing critical data: {event_details}")

    # Connect to the database to insert events
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        err_msg = f"DB connection error: {e}"
        print(err_msg)
        errors.append(err_msg)
        driver.quit()
        return {
            'scraper_name': scraper_name,
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Fetch existing events (avoid duplicates)
    try:
        cursor.execute("SELECT venue_id, start FROM shows")
        existing_events = set(cursor.fetchall())
    except Exception as e:
        err_msg = f"Error fetching existing events: {e}"
        print(err_msg)
        errors.append(err_msg)
        existing_events = set()

    # Insert events into the database
    for event in events_data:
        if (event['venue_id'], event['start']) not in existing_events:
            try:
                show_id, was_inserted = insert_show(
                    conn, cursor,
                    event['venue_id'],
                    event['bands'],
                    event['start'],
                    event['event_link'],
                    event['flyer_image']
                )
                if was_inserted:
                    added_count += 1
                    added_shows.append(show_id)
                    print(f"Inserted event: {event['bands']} on {event['start']}")
                else:
                    duplicate_count += 1
                    print(f"Duplicate event found: {event['bands']} on {event['start']}")
            except Exception as e:
                err_msg = f"Error processing event: {event['bands']}. Error: {e}"
                print(err_msg)
                errors.append(err_msg)
                conn.rollback()
        else:
            duplicate_count += 1

    # Commit changes and clean up
    try:
        conn.commit()
    except Exception as e:
        err_msg = f"Error committing changes: {e}"
        print(err_msg)
        errors.append(err_msg)
    cursor.close()
    conn.close()

    driver.quit()

    print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}.")
    return {
        'scraper_name': scraper_name,
        'added_count': added_count,
        'duplicate_count': duplicate_count,
        'added_shows': added_shows,
        'errors': errors,
    }

if __name__ == "__main__":
    log = run_the_cedar_scraper()
    print("Scraper Log:", log)