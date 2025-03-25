import re
import datetime
import time
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
    print(f"Error fetching venue ID: {e}")
    conn.close()
    exit()

# Web scraper setup
driver = webdriver.Chrome()
driver.set_page_load_timeout(60)

# Load the URL and handle retries if needed
url = 'https://www.pilllar.com/pages/events'
try:
    print("Loading the URL...")
    driver.get(url)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
except Exception as e:
    print("Error loading page:", e)
    driver.quit()
    conn.close()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event blocks
event_blocks = soup.find_all(class_='sse-row sse-clearfix')
events_data = []

# Track the current month
current_month = ""

# Function to normalize time strings
def normalize_time(time_str):
    time_str = time_str.lower().replace('.', '')
    if ':' not in time_str:
        time_str = time_str.replace("am", ":00 am").replace("pm", ":00 pm")
    return time_str

# Function to clean band names
def clean_band_name(name):
    """
    Cleans band names by removing unnecessary words and patterns.
    """
    stop_words = ['with', 'and', 'featuring']
    # Remove dollar amounts (e.g., "$12") and times (e.g., "7:00pm")
    name = re.sub(r'\$\d+(\.\d{2})?', '', name)  # Remove dollar amounts
    name = re.sub(r'\d{1,2}(:\d{2})?\s?(am|pm)', '', name, flags=re.IGNORECASE)  # Remove times
    return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

def normalize_time(time_str):
    """
    Normalize time strings to ensure compatibility with datetime parsing.
    """
    time_str = time_str.lower().replace('.', '').strip()
    if ':' not in time_str:
        time_str = time_str.replace("am", ":00 am").replace("pm", ":00 pm")
    elif 'am' not in time_str and 'pm' not in time_str:
        time_str += " pm"  # Assume PM for missing periods
    return time_str.capitalize()

# Loop through each event block
for block in event_blocks:
    event_details = {"venue": "Pilllar Forum"}  # Default venue name

    # Set a static event link for all events
    event_details = {"event_link": "https://www.pilllar.com/pages/events"}  # Default event link

    # Extract the date (month and day)
    date_tag = block.find('h1', class_='sse-size-64')
    if date_tag:
        raw_date = date_tag.get_text(strip=True)
        # Extract the month and day, handling "Dec." or similar
        cleaned_date = re.sub(r'\.', '', raw_date)  # Remove periods
        current_year = datetime.datetime.now().year
        # If the event is in December, keep the current year; otherwise, use the next year
        event_year = 2025        
        event_details['date'] = f"{cleaned_date} {event_year}"
        try:
            event_date = datetime.datetime.strptime(event_details['date'], "%b %d %Y")
            event_details['date'] = event_date.strftime("%Y-%m-%d")  # Format as YYYY-MM-DD
        except ValueError:
            print(f"Error parsing date: {raw_date}")
            event_details['date'] = None
    else:
        event_details['date'] = None  # Ensure the 'date' key exists

    # Extract the "Music" time
    time_tags = block.find_all('p')  # Find all <p> tags
    music_time = None
    for tag in time_tags:
        if "Music" in tag.get_text():
            music_time = tag.get_text(strip=True).split()[-1]  # Get the last part (time)
            break

    if music_time:
        try:
            event_details['time'] = normalize_time(music_time)  # Normalize the time
        except ValueError:
            print(f"Error parsing time: {music_time}")
            event_details['time'] = None
    else:
        event_details['time'] = None  # Ensure the 'time' key exists

    # Combine date and time into `start`
    try:
        if event_details['date'] and event_details['time']:
            # Combine date and time into a single datetime object
            combined_datetime_str = f"{event_details['date']} {event_details['time']}"
            event_details['start'] = datetime.datetime.strptime(
                combined_datetime_str, "%Y-%m-%d %I:%M %p"
            )
        else:
            event_details['start'] = None
    except ValueError as ve:
        print(f"Error combining date and time for event: {ve}")
        event_details['start'] = None

        # Append event details to the list
        events_data.append(event_details)

    # Debug output to verify
    print(f"Extracted {len(events_data)} events.")
    for event in events_data:
        print(event)

    # Extract bands (headliner + support acts)
    bands = []

    # Define excluded terms (all in lowercase for case-insensitive matching)
    excluded_terms = ["all ages", "day of show", "tickets", "ticket advance", "advance"]

    # Extract the primary band (headliner)
    name_tag = block.find('span', style=re.compile(r'font-size:\s*24px'))
    if name_tag:
        primary_band = name_tag.get_text(strip=True)
        if primary_band:
            cleaned_primary = clean_band_name(primary_band)
            # Only add if none of the excluded terms appear
            if not any(term in cleaned_primary.lower() for term in excluded_terms):
                bands.append(cleaned_primary)

    # Extract additional bands from other <p> tags
    additional_bands_tags = block.find_all('p')
    for tag in additional_bands_tags:
        if "Music" not in tag.get_text() and "Doors" not in tag.get_text():  # Ignore time-related lines
            additional_band_text = tag.get_text(strip=True)
            additional_bands = [
                clean_band_name(band.strip())
                for band in re.split(r',|\band\b|, and\b|with\b', additional_band_text, flags=re.IGNORECASE)
                if band.strip()
            ]
            # Append only bands that don't include any excluded terms
            for band in additional_bands:
                if not any(term in band.lower() for term in excluded_terms):
                    bands.append(band)

    # Deduplicate and clean band names
    bands = list(dict.fromkeys(bands))  # Remove duplicates
    bands_str = ", ".join(bands)  # Convert to a comma-separated string for database insertion
    event_details['bands'] = bands_str  # Assign to 'bands'

    # Debug print statement for verification
    print(f"Extracted bands: {bands}")

    # Extract show flyer
    image_div = block.find('div', class_='sse-column sse-half sse-center')
    if image_div:
        image_tag = image_div.find('img')
        event_details['show_flyer'] = image_tag['src'] if image_tag else "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"
    else:
        event_details['show_flyer'] = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"

    # Append event details
    events_data.append(event_details)

# Insert events into the database
added_count = 0
duplicate_count = 0
for event in events_data:
    if not event.get('start'):
        continue

    cursor.execute("""
        SELECT 1 FROM shows WHERE start = %s AND venue_id = %s AND bands = %s
    """, (event['start'], venue_id, event['bands']))
    if not cursor.fetchone():
        insert_show(conn, cursor, venue_id, event['bands'], event['start'], event['event_link'], event['show_flyer'])
        added_count += 1
    else:
        duplicate_count += 1

# Close the database connection
cursor.close()
conn.close()

print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}.")