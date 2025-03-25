import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

def run_331_club_scraper():
    """
    Runs the scraper for 331 Club events and returns a log dict containing:
      - scraper_name: Name identifier of the scraper.
      - added_count: Number of events inserted.
      - duplicate_count: Number of duplicate events skipped.
      - added_shows: List of inserted show IDs.
      - errors: List of error messages encountered.
    """
    added_count = 0
    duplicate_count = 0
    added_shows = []
    errors = []

    # Set up headless Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    try:
        driver = webdriver.Chrome(options=chrome_options)
        print("Chrome initialized successfully")
    except Exception as e:
        error_msg = f"Error initializing Chrome: {e}"
        print(error_msg)
        errors.append(error_msg)
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    url = 'https://331club.com/#calendar'
    print(f"Navigating to {url}")
    try:
        driver.get(url)
    except Exception as e:
        error_msg = f"Error navigating to {url}: {e}"
        print(error_msg)
        errors.append(error_msg)
        driver.quit()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    print("Page loaded, waiting for 'See all upcoming events' button...")
    try:
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '.more_events a'))
        ).click()
    except Exception as e:
        error_msg = f"Error clicking 'See all upcoming events' button: {e}"
        print(error_msg)
        errors.append(error_msg)
        driver.quit()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Wait for event cards to load
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, 'event'))
        )
    except Exception as e:
        error_msg = f"Error waiting for event cards: {e}"
        print(error_msg)
        errors.append(error_msg)
        driver.quit()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Parse page source with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    events = soup.find_all("div", class_="event")
    print(f"Found {len(events)} events on the page.")

    # Connect to the database
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        error_msg = f"DB connection error: {e}"
        print(error_msg)
        errors.append(error_msg)
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Get venue ID for "331 Club"
    try:
        venue_id = get_venue_id(cursor, "331 Club")
    except Exception as e:
        error_msg = f"Error getting venue ID for 331 Club: {e}"
        print(error_msg)
        errors.append(error_msg)
        conn.close()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Helper functions used within the scraper
    def get_event_year(month):
        if month in ["11", "12"]:
            return 2024
        return 2025

    def normalize_time(time_str):
        """
        Normalize various time string formats into a consistent format, e.g., 'HH:MM AM/PM'.
        """
        try:
            time_str = time_str.lower().strip()
            if ':' not in time_str:
                time_str = re.sub(r'(\d+)(am|pm)', r'\1:00\2', time_str)
            time_str = re.sub(r'(am|pm)', r' \1', time_str)
            return datetime.strptime(time_str, "%I:%M %p").strftime("%I:%M %p")
        except Exception:
            return None

    def clean_band_name(name):
        """
        Remove unwanted stop words from a band name.
        """
        stop_words = ['with', 'and']
        return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

    def get_default_time(bands_str):
        """
        Return a default time based on known event patterns at 331 Club.
        """
        if any(keyword in bands_str for keyword in ["Worker's Playtime", "Movie Music Trivia", "Drinkin' Spelling Bee"]):
            return "06:00 PM"
        elif "Harold's House Party" in bands_str:
            return "04:00 PM"
        elif "Dr. Sketchy" in bands_str:
            return "02:00 PM"
        elif "Conspiracy Series" in bands_str:
            return "09:00 PM"
        return "10:00 PM"

    # Process each event on the page
    for event in events:
        # Extract the date
        date_tag = event.find("div", class_="event-date")
        if date_tag:
            month_text = date_tag.find("span", class_="month").get_text(strip=True)
            day_text = date_tag.find("span", class_="date").get_text(strip=True)
            month_mapping = {
                "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
                "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
                "Nov": "11", "Dec": "12"
            }
            month = month_mapping.get(month_text, "N/A")
            year = get_event_year(month)
            date_str = f"{year}-{month}-{int(day_text):02d}"
        else:
            continue  # Skip events without a valid date

        # Find event content and columns
        event_content = event.find("div", class_="event-content")
        if not event_content:
            continue
        columns_div = event_content.find("div", class_="columns")
        if not columns_div:
            continue

        # Loop through each event column
        for column in columns_div.find_all("div", class_="column"):
            p_tag = column.find("p")
            if not p_tag:
                continue

            # Get text nodes including time info
            contents = [node.strip() for node in p_tag.stripped_strings]
            event_time = None
            time_pattern = re.compile(r'\d{1,2}:?\d{0,2}\s*(?:am|pm)', re.IGNORECASE)

            for content in reversed(contents):
                if time_match := time_pattern.search(content):
                    time_text = time_match.group().strip()
                    event_time = normalize_time(time_text)
                    break

            # If no time found, derive default based on event text
            if not event_time:
                full_text = ' '.join(content for content in contents if not time_pattern.search(content))
                event_time = get_default_time(full_text)

            # Extract band names, filtering out time strings
            bands = []
            for content in contents:
                if not time_pattern.search(content) and content.strip():
                    bands.append(clean_band_name(content))
            bands = [band for band in bands if band and not re.search(r'\d{1,2}:\d{2}(?:am|pm)', band.lower())]
            bands_str = ", ".join(bands)

            # Combine date and time into a datetime object
            try:
                start = datetime.strptime(f"{date_str} {event_time}", "%Y-%m-%d %I:%M %p")
            except ValueError as e:
                error_msg = f"Skipping event ({bands_str}) due to date/time issue: {e}"
                print(error_msg)
                errors.append(error_msg)
                continue

            # Extract event link (if available)
            event_link = None
            link_tag = column.find("a", href=True)
            if link_tag:
                event_link = link_tag['href']

            # Use a static flyer image (or extract dynamically if needed)
            flyer_image = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"

            # Insert the show into the database
            try:
                show_id, was_inserted = insert_show(
                    conn, cursor, venue_id, bands_str, start, event_link, flyer_image
                )
                if was_inserted:
                    added_count += 1
                    added_shows.append(show_id)
                    print(f"Inserted event: {bands_str} at {start}")
                else:
                    duplicate_count += 1
            except Exception as e:
                error_msg = f"Error processing event ({bands_str}): {e}"
                print(error_msg)
                errors.append(error_msg)
                conn.rollback()
                continue

    conn.commit()
    cursor.close()
    conn.close()

    # Return the log as a dict
    return {
        'scraper_name': '331_club',
        'added_count': added_count,
        'duplicate_count': duplicate_count,
        'added_shows': added_shows,
        'errors': errors,
    }

if __name__ == "__main__":
    log = run_331_club_scraper()
    print("Scraper Log:", log)