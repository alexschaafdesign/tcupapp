import re
import datetime
import time
import sys
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from db_utils import connect_to_db, get_venue_id, insert_show

# Database connection
conn = connect_to_db()
cursor = conn.cursor()

# Fetch venue ID
try:
    venue_id = get_venue_id(cursor, "Pilllar Forum")
except ValueError as e:
    sys.stderr.write(f"Error fetching venue ID: {e}\n")
    conn.close()
    exit()

# Web scraper setup
try:
    driver = webdriver.Chrome()
    driver.set_page_load_timeout(60)
except Exception as e:
    sys.stderr.write(f"Error initializing Chrome: {e}\n")
    conn.close()
    exit()

# Load the URL and handle retries if needed
url = 'https://www.pilllar.com/pages/events'
try:
    sys.stderr.write("Loading the URL...\n")
    driver.get(url)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
except Exception as e:
    sys.stderr.write(f"Error loading page: {e}\n")
    driver.quit()
    conn.close()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event blocks
event_blocks = soup.find_all(class_='sse-row sse-clearfix')
events_data = []

# Function to clean band names
def clean_band_name(name):
    stop_words = ['with', 'and', 'featuring']
    name = re.sub(r'\$\d+(\.\d{2})?', '', name)  # Remove dollar amounts
    name = re.sub(r'\d{1,2}(:\d{2})?\s?(am|pm)', '', name, flags=re.IGNORECASE)  # Remove times
    return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

# Function to normalize time strings
def normalize_time(time_str):
    time_str = time_str.lower().replace('.', '').strip()
    if ':' not in time_str:
        time_str = time_str.replace("am", ":00 am").replace("pm", ":00 pm")
    elif 'am' not in time_str and 'pm' not in time_str:
        time_str += " pm"  # Assume PM for missing periods
    return time_str.capitalize()

# Loop through each event block
for block in event_blocks:
    event_details = {}
    event_details['venue'] = "Pilllar Forum"
    event_details['event_link'] = "https://www.pilllar.com/pages/events"
    
    date_tag = block.find('h1', class_='sse-size-64')
    if date_tag:
        raw_date = date_tag.get_text(strip=True)
        cleaned_date = re.sub(r'\.', '', raw_date)
        event_year = 2025        
        event_details['date'] = f"{cleaned_date} {event_year}"
        try:
            event_date = datetime.datetime.strptime(event_details['date'], "%b %d %Y")
            event_details['date'] = event_date.strftime("%Y-%m-%d")
        except ValueError:
            sys.stderr.write(f"Error parsing date: {raw_date}\n")
            event_details['date'] = None
    else:
        event_details['date'] = None  
    
    time_tags = block.find_all('p')
    music_time = None
    for tag in time_tags:
        if "Music" in tag.get_text():
            music_time = tag.get_text(strip=True).split()[-1]
            break
    if music_time:
        try:
            event_details['time'] = normalize_time(music_time)
        except ValueError:
            sys.stderr.write(f"Error parsing time: {music_time}\n")
            event_details['time'] = None
    else:
        event_details['time'] = None
    
    try:
        if event_details['date'] and event_details['time']:
            combined_datetime_str = f"{event_details['date']} {event_details['time']}"
            event_details['start'] = datetime.datetime.strptime(combined_datetime_str, "%Y-%m-%d %I:%M %p")
        else:
            event_details['start'] = None
    except ValueError as ve:
        sys.stderr.write(f"Error combining date and time for event: {ve}\n")
        event_details['start'] = None
    
    sys.stderr.write(f"Processed event date/time: {event_details}\n")
    
    bands = []
    excluded_terms = ["all ages", "day of show", "tickets", "ticket advance", "advance"]
    
    name_tag = block.find('span', style=re.compile(r'font-size:\s*24px'))
    if name_tag:
        primary_band = name_tag.get_text(strip=True)
        if primary_band:
            cleaned_primary = clean_band_name(primary_band)
            if not any(term in cleaned_primary.lower() for term in excluded_terms):
                bands.append(cleaned_primary)
    
    additional_bands_tags = block.find_all('p')
    for tag in additional_bands_tags:
        text = tag.get_text()
        if "Music" not in text and "Doors" not in text:
            additional_band_text = text.strip()
            additional_bands = [clean_band_name(band.strip()) for band in re.split(r',|\band\b|, and\b|with\b', additional_band_text, flags=re.IGNORECASE) if band.strip()]
            for band in additional_bands:
                if not any(term in band.lower() for term in excluded_terms):
                    bands.append(band)
    
    bands = list(dict.fromkeys(bands))
    bands_str = ", ".join(bands)
    event_details['bands'] = bands_str
    
    sys.stderr.write(f"Extracted bands: {bands}\n")
    
    image_div = block.find('div', class_='sse-column sse-half sse-center')
    if image_div:
        image_tag = image_div.find('img')
        event_details['show_flyer'] = image_tag['src'] if image_tag else "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"
    else:
        event_details['show_flyer'] = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"
    
    events_data.append(event_details)

sys.stderr.write(f"Extracted {len(events_data)} events.\n")
for event in events_data:
    sys.stderr.write(f"{event}\n")
    
# Insert events into the database using insert_show for update tracking
added_count = 0
updated_count = 0
duplicate_count = 0
added_shows = []
updated_shows = []
skipped_count = 0
errors = []

for event in events_data:
    if not event.get('start'):
        continue
    try:
        # Let insert_show determine whether to insert, update, or skip
        show_id, status = insert_show(conn, cursor, venue_id, event['bands'], event['start'], event['event_link'], event['show_flyer'])
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

cursor.close()
conn.commit()
conn.close()

log = {
    'scraper_name': 'pilllarscrape_todb',
    'added_count': added_count,
    'updated_count': updated_count,
    'duplicate_count': duplicate_count,
    'skipped_count': skipped_count,
    'added_shows': added_shows,
    'updated_shows': updated_shows,
    'errors': errors,
}

print(json.dumps(log))