import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://331club.com/#calendar'
driver.get(url)

# Click "See all upcoming events" button
try:
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '.more_events a'))
    ).click()
except Exception as e:
    print(f"Error clicking 'See all upcoming events' button: {e}")
    driver.quit()
    exit()

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'event'))
    )
except Exception as e:
    print(f"Error waiting for event cards: {e}")
    driver.quit()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
events = soup.find_all("div", class_="event")

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for "331 Club"
try:
    venue_id = get_venue_id(cursor, "331 Club")
except ValueError as e:
    print(e)
    conn.close()
    exit()

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Define a function to calculate the event year
def get_event_year(month):
    if month in ["11", "12"]:
        return 2024
    return 2025

# Normalize time
def normalize_time(time_str):
    """
    Normalize the time string into the format 'HH:MM am/pm'.
    """
    try:
        # Add a colon if it's missing (e.g., '7pm' -> '7:00 pm')
        if ':' not in time_str:
            time_str = time_str.replace('am', ':00 am').replace('pm', ':00 pm')
        else:
            time_str = re.sub(r'(\d+:\d{2})\s?(am|pm)', r'\1 \2', time_str)

        # Parse and return the normalized time
        normalized_time = datetime.strptime(time_str, "%I:%M %p").strftime("%I:%M %p")
        return normalized_time
    except Exception as e:
        print(f"Error normalizing time: {time_str}. Error: {e}")
        return None
    
def clean_band_name(name):
    """
    Cleans up band names by removing unwanted stop words and extra spaces.
    """
    stop_words = ['with', 'and']
    return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

# Loop through each event to extract details
for event in events:
    # Extract date details
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
        date_str = None

    # Find event content
    event_content = event.find("div", class_="event-content")
    if not event_content:
        continue

    # Extract each column as a separate event
    columns_div = event_content.find("div", class_="columns")
    if not columns_div:
        continue

    for column in columns_div.find_all("div", class_="column"):
        # Extract event details
        name_tag = column.find("p")
        if not name_tag:
            continue

        # Extract bands and times from the column
        full_text = name_tag.get_text(separator="\n", strip=True).split("\n")
        bands = []
        event_time = None

        for line in full_text:
            line = line.strip()
            if re.search(r'\d{1,2}(:\d{2})?\s?[ap]m', line, re.IGNORECASE):  # Line is a time
                event_time = normalize_time(line)  # Normalize the time
            else:
                bands.append(line)  # Add line as a band

        # Deduplicate and clean band names
        bands = list(dict.fromkeys([clean_band_name(band) for band in bands]))  # Remove duplicates
        bands_str = ", ".join(bands)

        # Combine date and time
        try:
            start = datetime.strptime(f"{date_str} {event_time}", "%Y-%m-%d %I:%M %p")
        except ValueError as e:
            print(f"Skipping event due to date/time issue: {bands_str}. Error: {e}")
            continue

        # Extract event link
        event_link = None
        link_tag = column.find("a", href=True)
        if link_tag:
            event_link = link_tag['href']

        # Extract flyer
        flyer_image = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"

        # Insert into database
        try:
            show_id, was_inserted = insert_show(
                conn, cursor, venue_id, bands_str, start, event_link, flyer_image
            )
            if was_inserted:
                added_count += 1
                print(f"Inserted event: {bands_str} at {start}")
            else:
                duplicate_count += 1
                print(f"Duplicate event skipped: {bands_str} at {start}")
        except Exception as e:
            print(f"Error processing event: {bands_str}. Error: {e}")
            conn.rollback()
            continue

# Commit and close the database
conn.commit()
cursor.close()
conn.close()

# Print summary of added, updated, and skipped events
print(f"All events processed. Added: {added_count}, Updated: {updated_count}, Duplicates skipped: {duplicate_count}.")