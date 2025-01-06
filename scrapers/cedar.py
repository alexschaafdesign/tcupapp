import re
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime
from db_utils import connect_to_db, insert_show

# Set ChromeDriver path
CHROMEDRIVER_PATH = '/usr/local/bin/chromedriver'  # Replace with your ChromeDriver path

# Configure Chrome options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

# Initialize WebDriver
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=chrome_options)

# URL of the event page
url = 'https://www.thecedar.org/events'
driver.get(url)

# Function to navigate to the event page
def navigate_to_event(driver, url, max_retries=3):
    for attempt in range(max_retries):
        try:
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.eventitem-column-meta"))
            )
        #    print("Event cards loaded successfully.")
            return True
        except TimeoutException:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            print(f"Failed to load page after {max_retries} attempts: {url}")
            return False

# Wait for event cards to load
try:
    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "article.eventlist-event"))
    )
    print("Event cards loaded successfully.")
except:
    print("Event cards did not load in time.")
    driver.quit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')

# Find all music event cards
events = soup.select("article.eventlist-event")
events_data = []

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Iterate through events
for event in events:
    event_details = {'venue': "The Cedar Cultural Center", 'venue_id': 16}

    # Get the event URL
    link = event.find("a", href=True)
    if not link:
        print("No event link found for this event card.")
        continue

    # Get the full event URL
    event_url = link['href']
    full_event_url = f"https://www.thecedar.org{event_url}"
    event_details['event_link'] = full_event_url

    # Get the event date
    date_tag = event.find("time", class_="event-date")
    if date_tag and date_tag.has_attr("datetime"):
        date_text = date_tag["datetime"]
        event_date = datetime.strptime(date_text, "%Y-%m-%d").date()
        event_details['date'] = event_date
    else:
        print("Event date not found.")
        continue

    # Extract start time
    try:
        start_time_tag = event.find("time", class_="event-time-localized-start")
        if start_time_tag:
            start_time_text = start_time_tag.get_text(strip=True).replace(" ", " ")
            show_time = datetime.strptime(start_time_text, "%I:%M %p").time()
            event_details['start'] = datetime.combine(event_date, show_time)
        else:
            event_details['start'] = None
    except Exception as e:
        print(f"Error parsing start time: {e}")
        event_details['start'] = None

    # Navigate to individual event page
    if not navigate_to_event(driver, full_event_url):
        continue
    event_soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Extract band names
    meta_div = event_soup.find("div", class_="eventitem-column-meta")
    if meta_div:
        title_tag = meta_div.find("h1", class_="eventitem-title")
        if title_tag:
            title_text = title_tag.get_text(strip=True)
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
        flyer_image_tag = event_soup.select_one(
            "div.sqs-image-shape-container-element img"
        )
        if flyer_image_tag and 'src' in flyer_image_tag.attrs:
            flyer_image = flyer_image_tag['src'].replace("-size", "-original")
            event_details['flyer_image'] = flyer_image
        else:
            event_details['flyer_image'] = None
    except Exception as e:
        print(f"Error parsing flyer image: {e}")
        event_details['flyer_image'] = None

    # Append if valid
    if not event_details['start']:
        print(f"Missing start time for event: {event_details['event_link']}")
    if not event_details['flyer_image']:
        print(f"Missing flyer image for event: {event_details['event_link']}")
    if event_details['start'] and event_details['bands']:
        events_data.append(event_details)
    else:
        print(f"Skipped event due to missing critical data: {event_details}")

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Fetch existing events to avoid duplicates
cursor.execute("SELECT venue_id, start FROM shows")
existing_events = set(cursor.fetchall())
# print(f"Existing events for venue_id 16: {existing_events}")


# Prepare rows for 'shows' table insertion, only if 'bands' is not empty
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
                print(f"Inserted event: {event['bands']} on {event['start']}")
            else:
                duplicate_count += 1
                print(f"Duplicate event found: {event['bands']} on {event['start']}")
        except Exception as e:
            print(f"Error processing event: {event['bands']}. Error: {e}")
            conn.rollback()

# Close the database connection
cursor.close()

# Commit the changes and close the connection
conn.close()

# Close the WebDriver
driver.quit()

# Print summary
print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}.")