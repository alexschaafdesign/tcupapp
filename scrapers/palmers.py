import re
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from dateutil.parser import parse
from selenium.common.exceptions import TimeoutException
from db_utils import connect_to_db, insert_show, get_venue_id

print("Starting scraper...")

# Initialize WebDriver
# List of URLs for multiple months
urls = [
    'https://palmers-bar.com/?view=calendar&month=11-2024',
    'https://palmers-bar.com/?view=calendar&month=12-2024',
    'https://palmers-bar.com/?view=calendar&month=01-2025',
]

# Initialize WebDriver
print("Starting scraper...")
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=chrome_options)
driver.delete_all_cookies()

# Store all events from all months
all_events_data = []

for url in urls:
    print(f"Processing URL: {url}")
    
    # Retry logic for loading the page
    retry_count = 5
    timeout = 90
    
    for attempt in range(retry_count):
        try:
            driver.get(url)
            WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'yui3-calendar-row'))
            )
            print(f"Successfully loaded calendar for {url}.")
            break
        except TimeoutException:
            print(f"Attempt {attempt + 1} failed: Timeout while loading {url}.")
            if attempt < retry_count - 1:
                time.sleep(5)
            else:
                print(f"Failed to load {url} after {retry_count} attempts. Skipping.")
                continue
        except Exception as e:
            print(f"Error loading {url}: {e}")
            continue

    # Parse the page source
    print(f"Parsing events from {url}...")
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    calendar_body = soup.find("div", class_="yui3-u-1")
    
    if calendar_body:
        weeks = calendar_body.find_all("tr", class_="yui3-calendar-row")
        print(f"Found {len(weeks)} week rows in the calendar.")
        
        for week in weeks:
            days = week.find_all("td", class_=lambda x: x and "yui3-calendar-day" in x)
            print(f"Processing week with {len(days)} days.")
            
            for day in days:
                if "has-event" in day.get("class", []):
                    print("Found a day with events.")
                    
                    # Locate the event list within the day
                    event_list = day.find("ul", class_="itemlist itemlist--iseventscollection")
                    if event_list:
                        event_items = event_list.find_all("li", class_="item")
                        print(f"Found {len(event_items)} events on this day.")
                        
                        for event_item in event_items:
                            link_tag = event_item.find("a", class_="item-link", href=True)
                            if link_tag:
                                full_event_url = f"https://palmers-bar.com{link_tag['href']}"
                                print(f"Navigating to event page: {full_event_url}")
                                driver.get(full_event_url)
                                WebDriverWait(driver, 30).until(
                                    EC.presence_of_element_located((By.CLASS_NAME, 'sqs-events-collection-item'))
                                )
                                print(f"Loaded event page: {full_event_url}")
                                
                                # Parse the event page for details
                                event_soup = BeautifulSoup(driver.page_source, 'html.parser')
                                event_details = {'venue': "Palmer's Bar", 'event_link': full_event_url}
                                
                                # Extract bands
                                title_tag = event_soup.find("h1", class_="eventitem-title")
                                if title_tag:
                                    event_details['bands'] = title_tag.get_text(strip=True)
                                    print(f"Extracted band name: {event_details['bands']}")
                                else:
                                    print("Band title not found.")
                                    event_details['bands'] = "N/A"
                                
                                # Extract date and time
                                date_time_main_container = event_soup.find("div", class_="eventitem-column-meta")
                                if date_time_main_container:
                                    date_time_container = date_time_main_container.find("ul", class_="eventitem-meta event-meta event-meta-date-time-container")
                                    if date_time_container:
                                        date_tag = date_time_container.find("time", class_="event-date")
                                        time_tag = date_time_container.find("time", class_="event-time-12hr-start")
                                        
                                        if date_tag and time_tag:
                                            date_text = date_tag.get("datetime", "")
                                            time_text = time_tag.get_text(strip=True)
                                            date_time_text = f"{date_text} {time_text}"
                                            print(f"Raw date and time text: {date_time_text}")
                                            try:
                                                event_datetime = parse(date_time_text)
                                                event_details['start'] = event_datetime
                                                print(f"Parsed start datetime: {event_details['start']}")
                                            except (ValueError, TypeError) as e:
                                                print(f"Error parsing date and time: {e}")
                                                event_details['start'] = None
                                        else:
                                            print("Time or date tag not found.")
                                            event_details['start'] = None
                                    else:
                                        print("Date and time container not found.")
                                        event_details['start'] = None
                                else:
                                    print("Top-level date and time container not found.")
                                    event_details['start'] = None

                                # Append event details to the list
                                all_events_data.append(event_details)
                                print(f"Added event: {event_details}")
                    else:
                        print("Event list not found for this day.")
    else:
        print(f"No calendar body found for {url}.")

# Close the driver
# Close the driver
driver.quit()

# Process collected events (e.g., insert into the database)
print("\nAll collected events from all months:")
for event in all_events_data:
    print(event)

# Connect to the database
try:
    conn = connect_to_db()
    cursor = conn.cursor()
    print("Connected to the database.")
except Exception as e:
    print(f"Failed to connect to the database: {e}")
    exit()

# Initialize counters
added_count = 0
updated_count = 0
duplicate_count = 0

# Insert events into the database
for event in all_events_data:
    try:
        # Extract event details
        bands = event['bands']
        start = event['start']
        event_link = event['event_link']
        venue = event['venue']

        # Get venue ID for the venue (adjust as needed)
        venue_id = get_venue_id(cursor, venue)

        # Insert the event into the database
        show_id, was_inserted = insert_show(
            conn, cursor, venue_id, bands, start, event_link, None  # Assuming no flyer image
        )

        # Update counters based on insertion result
        if was_inserted:
            added_count += 1
            print(f"Inserted event: {bands} at {start}.")
        else:
            duplicate_count += 1
            print(f"Duplicate event found: {bands} at {start}. Skipping.")
    except Exception as e:
        print(f"Error processing event: {event}. Error: {e}")
        conn.rollback()  # Rollback on error
        continue

# Commit changes and close the database connection
conn.commit()
cursor.close()
conn.close()

# Print summary
print(f"All events processed. Added: {added_count}, Updated: {updated_count}, Duplicates skipped: {duplicate_count}.")