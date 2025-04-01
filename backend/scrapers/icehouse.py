import re
import time
import sys
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, get_venue_id, insert_show

# URL and default flyer image
venue_url = "https://icehouse.turntabletickets.com/"
DEFAULT_IMAGE_URL = "https://icehouse.turntabletickets.com/default_image.jpg"

# Define function to run the scraper
def run_icehouse_scraper():
    # Logs and counters
    errors = []
    added_count = 0
    duplicate_count = 0
    skipped_count = 0
    added_shows = []
    
    # Set up Selenium WebDriver in headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.binary_location = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        sys.stderr.write("Chrome initialized successfully\n")
    except Exception as e:
        error_msg = f"Error initializing Chrome: {e}"
        sys.stderr.write(error_msg + "\n")
        return {
            'scraper_name': 'icehouse',
            'added_count': 0,
            'duplicate_count': 0,
            'skipped_count': 1,
            'added_shows': [],
            'errors': [error_msg],
        }

    driver.get(venue_url)
    sys.stderr.write(f"Navigating to {venue_url}\n")

    # Wait for the event elements to load. Adjust the selector if needed.
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.details"))
        )
    except Exception as e:
        error_msg = f"Error waiting for events to load: {e}"
        sys.stderr.write(error_msg + "\n")
        driver.quit()
        return {
            'scraper_name': 'icehouse',
            'added_count': 0,
            'duplicate_count': 0,
            'skipped_count': 1,
            'added_shows': [],
            'errors': [error_msg],
        }

    # Give a little extra time if necessary (tweak sleep duration as needed)
    time.sleep(2)

    # Get the fully rendered page source and close the driver
    html_content = driver.page_source
    driver.quit()

    soup = BeautifulSoup(html_content, 'html.parser')
    sys.stderr.write("Page parsed with BeautifulSoup\n")

    # Connect to the PostgreSQL database
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        error_msg = f"DB connection error: {e}"
        sys.stderr.write(error_msg + "\n")
        return {
            'scraper_name': 'icehouse',
            'added_count': 0,
            'duplicate_count': 0,
            'skipped_count': 1,
            'added_shows': [],
            'errors': [error_msg],
        }

    try:
        # Get the venue ID for "Icehouse"
        venue_id = get_venue_id(cursor, "Icehouse")
    except Exception as e:
        error_msg = f"Error getting venue ID for Icehouse: {e}"
        sys.stderr.write(error_msg + "\n")
        conn.close()
        return {
            'scraper_name': 'icehouse',
            'added_count': 0,
            'duplicate_count': 0,
            'skipped_count': 1,
            'added_shows': [],
            'errors': [error_msg],
        }

    def split_band_names(band_string):
        # Remove "Brunch with" and split by common delimiters
        band_string = band_string.replace("Brunch with", "").strip()
        bands = re.split(r'\s+(w/|and|\+|\&)\s+', band_string)
        return [b.strip() for b in bands if b.strip() and b.strip().lower() not in ['w/', 'and', '+', '&', 'with']]

    # Find all event elements (adjust the class if the page structure changes)
    events = soup.find_all('div', class_="details flex flex-col gap-2 md:flex-row border-b last:border-b-0 border-linear-g-primary py-12 px-4 md:px-0 md:py-16 md:gap-10")
    
    if not events:
        error_msg = "No events found. The page structure may have changed."
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)

    for event in events:
        try:
            # Extract the flyer image URL
            flyer_image_tag = event.find('picture', class_="show-image")
            flyer_image = flyer_image_tag.img['src'] if flyer_image_tag and flyer_image_tag.img else DEFAULT_IMAGE_URL

            # Get performance details
            performance_div = event.find('div', class_="performances whitespace-pre-line w-full md:w-3/4")
            bands_tag = performance_div.find('h3') if performance_div else None
            bands = split_band_names(bands_tag.text) if bands_tag else []

            # Extract the date (assumed format like "Fri, May 2")
            date_tag = performance_div.find('h4', class_="day-of-week") if performance_div else None
            show_date_text = date_tag.text.strip() if date_tag else None
            sys.stderr.write(f"Show Date Text: {show_date_text}\n")

            # Extract the time from a <span> within the performance div
            if performance_div:
                time_span = performance_div.find('span')
                if time_span:
                    time_text = time_span.text.strip()
                    # Find the first time occurrence (e.g., "5:30PM" or "6PM")
                    time_match = re.search(r'(\d{1,2}(:\d{2})?\s?(am|pm|AM|PM))', time_text)
                    if time_match:
                        doors_time = time_match.group(1).lower()
                    else:
                        doors_time = ""
                    
                    # Combine date and time; adjust year logic as needed
                    if show_date_text:
                        event_date = show_date_text.strip()
                        try:
                            # Expecting format "%a, %b %d" (e.g., "Fri, May 2")
                            dt_temp = datetime.strptime(event_date, "%a, %b %d")
                        except ValueError as e:
                            error_msg = f"Error parsing event date '{event_date}': {e}"
                            sys.stderr.write(error_msg + "\n")
                            errors.append(error_msg)
                            skipped_count += 1
                            continue
                        month = dt_temp.month
                        year = 2024 if month == 12 else 2025
                        formatted_date = f"{year} {event_date}"
                        full_date = f"{formatted_date} {doors_time}"
                        
                        try:
                            if ":" in doors_time:
                                show_start_time = datetime.strptime(full_date, "%Y %a, %b %d %I:%M%p")
                            else:
                                show_start_time = datetime.strptime(full_date, "%Y %a, %b %d %I%p")
                        except ValueError as e:
                            error_msg = f"Error parsing combined date and time: {e}"
                            sys.stderr.write(error_msg + "\n")
                            errors.append(error_msg)
                            skipped_count += 1
                            continue
                    else:
                        error_msg = "No date text found."
                        sys.stderr.write(error_msg + "\n")
                        errors.append(error_msg)
                        skipped_count += 1
                        continue
                else:
                    error_msg = "No time span found in performance div."
                    sys.stderr.write(error_msg + "\n")
                    errors.append(error_msg)
                    skipped_count += 1
                    continue
            else:
                error_msg = "No performance div found."
                sys.stderr.write(error_msg + "\n")
                errors.append(error_msg)
                skipped_count += 1
                continue

            # Extract event link
            event_link_tag = performance_div.find('a', href=True) if performance_div else None
            event_link = event_link_tag['href'] if event_link_tag else None
            if event_link and event_link.startswith('/'):
                event_link = f"https://icehouse.turntabletickets.com{event_link}"

            # Insert or update the show in the database
            try:
                show_id, was_inserted = insert_show(conn, cursor, venue_id, ", ".join(bands), show_start_time, event_link, flyer_image)
                if was_inserted:
                    added_count += 1
                    added_shows.append(show_id)
                    sys.stderr.write(f"Inserted event: {', '.join(bands)} at {show_start_time}\n")
                else:
                    duplicate_count += 1
                    sys.stderr.write(f"Duplicate event skipped: {', '.join(bands)} at {show_start_time}\n")
            except Exception as e:
                error_msg = f"Error inserting or updating show ({', '.join(bands)}): {e}"
                sys.stderr.write(error_msg + "\n")
                errors.append(error_msg)
                skipped_count += 1
                continue

        except Exception as e:
            error_msg = f"Error parsing event: {e}"
            sys.stderr.write(error_msg + "\n")
            errors.append(error_msg)
            skipped_count += 1

    # Commit changes to the database
    conn.commit()
    
    # Close database connection
    cursor.close()
    conn.close()
    
    # Return the results
    return {
        'scraper_name': 'icehouse',
        'added_count': added_count,
        'duplicate_count': duplicate_count,
        'skipped_count': skipped_count,
        'added_shows': added_shows,
        'errors': errors,
    }

# Run the scraper if called directly
if __name__ == "__main__":
    log = run_icehouse_scraper()
    print(json.dumps(log))