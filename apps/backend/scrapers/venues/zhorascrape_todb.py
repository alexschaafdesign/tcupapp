import re
import time
from datetime import datetime
from dateutil import parser
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from backend.scrapers.utils.db_utils import connect_to_db, insert_show, get_venue_id
import json

chrome_driver_path = "/opt/homebrew/bin/chromedriver"  # Update if different

from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

service = Service(chrome_driver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)
url = 'https://www.zhoradarling.com/events'
driver.get(url)

try:
    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'sc-88e0adda-0'))
    )
except Exception as e:
    print(f"Error waiting for event cards: {e}")
    driver.quit()
    exit()

soup = BeautifulSoup(driver.page_source, 'html.parser')
events = soup.find_all("article", class_="sc-88e0adda-0")

conn = connect_to_db()
cursor = conn.cursor()

try:
    venue_id = get_venue_id(cursor, "Zhora Darling") 
except ValueError as e:
    print(e)
    conn.close()
    exit()

def split_band_names(band_string):
    bands = re.split(r'\s*(?:,|w/|&)\s*', band_string)
    return [b.strip() for b in bands if b.strip()]

# Initialize counters and logs for updated tracking
added_count = 0
updated_count = 0
duplicate_count = 0
skipped_count = 0
added_shows = []
updated_shows = []
errors = []

for event in events:
    event_details = {}
    event_details['venue_id'] = venue_id

    # Extract flyer image URL – find img tag that follows an a tag
    for link in event.find_all('a'):
        img_tag = link.find_next('img')
        if img_tag:
            event_details['show_flyer'] = img_tag['src']
            break
    if 'show_flyer' not in event_details:
        event_details['show_flyer'] = None

    date_time_tag = event.find("time", class_="sc-88e0adda-1")
    if date_time_tag:
        date_time_text = date_time_tag.get_text(strip=True)
        try:
            if "―" in date_time_text and len(date_time_text.split()) == 5:
                date_part, time_part = date_time_text.split("―")
                month = date_part.split()[2]
                year = 2024 if month in ["Nov", "Dec"] else 2025
                full_date_time = f"{date_part.strip()} {time_part.strip()} {year}"
                start_datetime = datetime.strptime(full_date_time, "%a %d %b %I:%M%p %Y")
            elif "―" in date_time_text and len(date_time_text.split()) == 6:
                date_part, time_part = date_time_text.split("―")
                full_date_time = f"{date_part.strip()} {time_part.strip()}"
                start_datetime = datetime.strptime(full_date_time, "%a %d %b %Y %I:%M%p")
            event_details['start'] = start_datetime
        except ValueError as e:
            print(f"Error parsing date and time for event: {date_time_text}")
            event_details['start'] = None
    else:
        event_details['start'] = None

    title_tag = event.find("a", class_="sc-88e0adda-3 eijtNw dice_event-title")
    if title_tag:
        event_details['event_link'] = title_tag['href']
        band_names_list = split_band_names(title_tag.get_text(strip=True))
        event_details['bands'] = ", ".join(band_names_list)
    else:
        event_details['event_link'] = "N/A"
        event_details['bands'] = "N/A"

    try:
        # Call insert_show and capture returned show_id and status.
        show_id, status = insert_show(
            conn, 
            cursor, 
            event_details['venue_id'],
            event_details['bands'],
            event_details['start'],
            event_details['event_link'],
            event_details['show_flyer']
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
        print(f"Error processing event with bands {event_details['bands']}: {e}")
        conn.rollback()
        skipped_count += 1
        errors.append(f"Error processing event with bands {event_details['bands']}: {e}")

conn.commit()
cursor.close()
conn.close()
driver.quit()

log = {
    'scraper_name': 'zhoradarling_scraper',
    'added_count': added_count,
    'updated_count': updated_count,
    'duplicate_count': duplicate_count,
    'skipped_count': skipped_count,
    'added_shows': added_shows,
    'updated_shows': updated_shows,
    'errors': errors,
}

print(json.dumps(log))