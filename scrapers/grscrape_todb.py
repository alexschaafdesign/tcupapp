import re
import requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.greenroommn.com/events#/events'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'vp-event-card'))
    )
except Exception as e:
    print(f"Error waiting for event cards: {e}")
    driver.quit()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
event_cards = soup.find_all(class_='vp-event-card')

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for "Green Room"
try:
    venue_id = get_venue_id(cursor, "Green Room")
except ValueError as e:
    print(e)
    conn.close()
    exit()

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Loop through each event card to extract details and process
for card in event_cards:
    # Extract event details
    name_tag = card.find(class_='vp-event-name')
    date_tag = card.find(class_='vp-date')
    time_tag = card.find(class_='vp-time')
    
    event_name = name_tag.get_text(strip=True) if name_tag else "N/A"
    event_date = date_tag.get_text(strip=True) if date_tag else "N/A"
    event_time = time_tag.get_text(strip=True) if time_tag else "N/A"

    # Determine the event year based on the month
    def get_event_year(event_date):
        try:
            # Extract the month from the event date string
            event_month_str = event_date.split()[1]  # Assuming "Fri May 2" format
            event_month = datetime.strptime(event_month_str, "%b").month
            # If the month is December (12), it's the current year
            if event_month == 12:
                return 2024
            # Otherwise, assume the next year
            return 2025
        except Exception as e:
            print(f"Error determining year for event date '{event_date}': {e}")
            return datetime.now().year  # Fallback to current year if parsing fails

    # Adjusted year logic
    event_year = get_event_year(event_date)
    date_str = f"{event_date} {event_year}"

    # Combine date and time into a single datetime object
    try:
        start = datetime.strptime(f"{date_str} {event_time}", "%a %b %d %Y %I:%M %p")
    except ValueError:
        try:
            start = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
        except ValueError as e:
            print(f"Skipping event due to date/time format issue: {event_name}. Error: {e}")
            continue

    # Get the bands directly from the event card
    bands = []

    # Extract the headliner band from vp-event-name
    name_tag = card.find(class_='vp-event-name')
    if name_tag:
        headliner = name_tag.get_text(strip=True)
        if headliner:
            bands.append(headliner)

    # Extract the additional bands from vp-support
    support_tag = card.find(class_='vp-support')
    if support_tag:
        # Split the text by commas or other delimiters if needed
        additional_bands = [band.strip() for band in re.split(r',|\band\b|\bwith\b', support_tag.get_text(strip=True), flags=re.IGNORECASE) if band.strip()]
        bands.extend(additional_bands)

    # Remove duplicates and clean up band names
    def clean_band_name(name):
        stop_words = ['with', 'and']
        return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

    bands = list(dict.fromkeys([clean_band_name(band) for band in bands]))

    # Pass as a comma-separated string to insert_show
    bands_str = ", ".join(bands)

    # Properly formatted output
    print(f"Found bands: {bands_str}")  # This will print the bands cleanly

    # Extract event link
    event_link = None
    link_tag = card.find('a', class_='vp-event-link', href=True)  # Look for <a> with class 'vp-event-link'
    if link_tag:
        partial_href = link_tag['href']
        if partial_href.startswith('#'):  # Check if it's a relative link
            event_link = f"https://www.greenroommn.com{partial_href}"  # Construct full URL
        else:
            event_link = partial_href  # Use the full URL if already provided
    print(f"Found event link: {event_link}")  # Print the event link
    
    # Extracting the show flyer
    flyer_image = None
    flyer_div = card.find(class_='vp-cover-img')  # Locate the div
    if flyer_div:
        # Check if the div contains an <img> tag with the flyer image
        img_tag = flyer_div.find('img')
        if img_tag and img_tag.has_attr('src'):
            flyer_image = img_tag['src']  # Extract the image URL
        else:
            # If no <img> tag, check for inline styles with background-image
            style_attr = flyer_div.get('style', '')
            match = re.search(r'url\((.*?)\)', style_attr)  # Extract URL from background-image
            if match:
                flyer_image = match.group(1).strip('\'"')  # Remove quotes around the URL
    print(f"Found show flyer: {flyer_image}")  # Print the flyer URL

    # Process the show
    try:
        show_id, was_inserted = insert_show(conn, cursor, venue_id, bands_str, start, event_link, flyer_image)
        if was_inserted:
            added_count += 1
            print(f"Inserted event: {event_name} on {start}")
        else:
            if flyer_image:  # Flyer updated
                updated_count += 1
                print(f"Updated event with flyer: {event_name} on {start}")
            else:
                duplicate_count += 1
                print(f"Duplicate event found (no update needed): {event_name} on {start}")

    except Exception as e:
        print(f"Error processing event: {event_name}. Error: {e}")
        conn.rollback()  # Rollback on error to maintain consistency
        continue

# Commit all changes to the database
conn.commit()

# Close the database connection
cursor.close()
conn.close()

# Print summary of added, updated, and skipped events
print(f"All events processed. Added: {added_count}, Updated: {updated_count}, Duplicates skipped: {duplicate_count}.")