import sys
sys.stderr.write(f"DEBUG: Script starting, sys module imported as: {sys}\n")
import re
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

def run_331_club_scraper():
    added_count = 0
    updated_count = 0  # New counter for updated shows
    duplicate_count = 0
    skipped_count = 0
    added_shows = []
    updated_shows = []  # New list for updated show IDs
    errors = []  # This is where you collect error messages

    sys.stderr.write("Initializing headless Chrome...\n")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.binary_location = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

    try:
        # For MacOS, we need to specify the Chrome binary location
        driver = webdriver.Chrome(options=chrome_options)
        sys.stderr.write("Chrome initialized successfully\n")
    except Exception as e:
        error_msg = f"Error initializing Chrome: {e}"
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)
        skipped_count += 1
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'skipped_count': skipped_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    url = 'https://331club.com/#calendar'
    sys.stderr.write(f"Navigating to {url}\n")
    try:
        driver.get(url)
    except Exception as e:
        error_msg = f"Error navigating to {url}: {e}"
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)
        skipped_count += 1
        driver.quit()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'skipped_count': skipped_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    sys.stderr.write("Page loaded, looking for 'See all upcoming events' button...\n")
    try:
        # Wait for the page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "calendar"))
        )
        
        # Try to find and click the "See all upcoming events" button if it exists
        try:
            more_events_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '.more_events a'))
            )
            sys.stderr.write("Found 'See all upcoming events' button, clicking it...\n")
            more_events_btn.click()
        except Exception as e:
            # If the button is not found, it's possible the site layout changed or all events are already visible
            sys.stderr.write(f"'See all upcoming events' button not found or not clickable: {e}\n")
            sys.stderr.write("Continuing with currently visible events...\n")
            # We'll continue anyway as some events may still be visible
    except Exception as e:
        error_msg = f"Error waiting for calendar to load: {e}"
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)
        skipped_count += 1
        driver.quit()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'skipped_count': skipped_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, 'event'))
        )
    except Exception as e:
        error_msg = f"Error waiting for event cards: {e}"
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)
        skipped_count += 1
        driver.quit()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'skipped_count': skipped_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    events = soup.find_all("div", class_="event")
    sys.stderr.write(f"Found {len(events)} events on the page.\n")

    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        error_msg = f"DB connection error: {e}"
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)
        skipped_count += 1
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'skipped_count': skipped_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    try:
        venue_id = get_venue_id(cursor, "331 Club")
    except Exception as e:
        error_msg = f"Error getting venue ID for 331 Club: {e}"
        sys.stderr.write(error_msg + "\n")
        errors.append(error_msg)
        skipped_count += 1
        conn.close()
        return {
            'scraper_name': '331_club',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'skipped_count': skipped_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    def get_event_year(month):
        if month in ["11", "12"]:
            return 2024
        return 2025

    def normalize_time(time_str):
        try:
            time_str = time_str.lower().strip()
            if ':' not in time_str:
                time_str = re.sub(r'(\d+)(am|pm)', r'\1:00\2', time_str)
            time_str = re.sub(r'(am|pm)', r' \1', time_str)
            return datetime.strptime(time_str, "%I:%M %p").strftime("%I:%M %p")
        except Exception:
            return None

    def clean_band_name(name):
        stop_words = ['with', 'and']
        return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

    def get_default_time(bands_str):
        if any(keyword in bands_str for keyword in ["Worker's Playtime", "Movie Music Trivia", "Drinkin' Spelling Bee"]):
            return "06:00 PM"
        elif "Harold's House Party" in bands_str:
            return "04:00 PM"
        elif "Dr. Sketchy" in bands_str:
            return "02:00 PM"
        elif "Conspiracy Series" in bands_str:
            return "09:00 PM"
        return "10:00 PM"

    for event in events:
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
            continue

        event_content = event.find("div", class_="event-content")
        if not event_content:
            continue
        columns_div = event_content.find("div", class_="columns")
        if not columns_div:
            continue

        for column in columns_div.find_all("div", class_="column"):
            p_tag = column.find("p")
            if not p_tag:
                continue

            contents = [node.strip() for node in p_tag.stripped_strings]
            event_time = None
            time_pattern = re.compile(r'\d{1,2}:?\d{0,2}\s*(?:am|pm)', re.IGNORECASE)

            for content in reversed(contents):
                if time_match := time_pattern.search(content):
                    time_text = time_match.group().strip()
                    event_time = normalize_time(time_text)
                    break

            if not event_time:
                full_text = ' '.join(content for content in contents if not time_pattern.search(content))
                event_time = get_default_time(full_text)

            bands = []
            for content in contents:
                if not time_pattern.search(content) and content.strip():
                    bands.append(clean_band_name(content))
            bands = [band for band in bands if band and not re.search(r'\d{1,2}:\d{2}(?:am|pm)', band.lower())]
            bands_str = ", ".join(bands)

            try:
                start = datetime.strptime(f"{date_str} {event_time}", "%Y-%m-%d %I:%M %p")
            except ValueError as e:
                error_msg = f"Skipping event ({bands_str}) due to date/time issue: {e}"
                sys.stderr.write(error_msg + "\n")
                errors.append(error_msg)
                skipped_count += 1
                continue

            event_link = None
            link_tag = column.find("a", href=True)
            if link_tag:
                event_link = link_tag['href']

            flyer_image = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"

            try:
                show_id, status = insert_show(
                    conn, cursor, venue_id, bands_str, start, event_link, flyer_image
                )
                if status == "added":
                    added_count += 1
                    added_shows.append(show_id)
                elif status == "updated":
                    updated_count += 1
                    updated_shows.append(show_id)
                elif status == "duplicate":
                    duplicate_count += 1
            except Exception as e:
                skipped_count += 1
                errors.append(f"Error inserting show: {e}")

    # Return updated log with all categories after processing all events/columns
    log = {
        'scraper_name': '331_club',
        'added_count': added_count,
        'updated_count': updated_count,
        'duplicate_count': duplicate_count,
        'skipped_count': skipped_count,
        'added_shows': added_shows,
        'updated_shows': updated_shows,
        'errors': errors,
    }
    return log

if __name__ == "__main__":
    log = run_331_club_scraper()
    

    
    print(json.dumps(log))