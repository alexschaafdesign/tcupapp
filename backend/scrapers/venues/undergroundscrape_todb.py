import re
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"  # replace with your database username
DB_PASSWORD = "notthesame"  # replace with your database password
DB_HOST = "localhost"  # or use your database host if it's hosted remotely

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.undergroundmusicvenue.com/events'  # Replace with the actual URL of Underground's events page
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'sc-88e0adda-12'))
    )
except:
    print("Event cards did not load in time.")

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
events = soup.find_all("div", class_="sc-88e0adda-12 hOijMG")

events_data = []

# Loop through each event block
for event in events:
    # Initialize a dictionary to store the event details for each event
    event_details = {}

    # Extract the event link and headliner
    event_link_tag = event.find("a", class_="sc-88e0adda-3 dfYaIT dice_event-title")
    if event_link_tag:
        event_details['event_link'] = event_link_tag['href']
        event_details['headliner'] = event_link_tag.get_text(strip=True)
    else:
        print("Skipping event: no link or headliner found.")
        continue  # Skip if no link or headliner found

    # Extract the event date and time
    time_tag = event.find("time", class_="sc-88e0adda-1 kWbGGg")
    if time_tag:
        date_time_text = time_tag.get_text(strip=True)
        print(f"Attempting to parse date and time: '{date_time_text}'")
        
        # Replace the special dash (―) with a regular hyphen (-)
        date_time_text = date_time_text.replace("―", "-")
        
        try:
            # Check if the date includes a year
            if re.search(r'\b\d{4}\b', date_time_text):
                # Format with year, e.g., "Sat 11 Jan 2025 - 7:00pm"
                event_date_time = datetime.strptime(date_time_text, "%a %d %b %Y - %I:%M%p")
            else:
                # Format without year, e.g., "Fri 22 Nov - 6:00pm"
                event_date_time = datetime.strptime(date_time_text, "%a %d %b - %I:%M%p")
                
                # Infer the year: Use current year, or next year if the date has already passed
                today = datetime.today()
                event_date_time = event_date_time.replace(year=today.year)
                
                if event_date_time < today:
                    # If the parsed date is in the past, set it to the next year
                    event_date_time = event_date_time.replace(year=today.year + 1)
            
            event_details['start'] = event_date_time  # Store as datetime object for timestamp
            print(f"Parsed start time: {event_details['start']}")
        except ValueError as e:
            print(f"Failed to parse date and time '{date_time_text}': {e}")
            event_details['start'] = None  # Set to None if parsing fails
    else:
        print("Skipping event: no date and time found.")
        event_details['start'] = None  # Set to None if no time found

    # Set the venue for the event
    event_details['venue'] = "Underground Music Venue"
    event_details['support'] = "N/A"

    # Append the event to events_data
    events_data.append(event_details.copy())  # Use `.copy()` to avoid overwriting data in subsequent loops

# Close the main page after all events are processed
driver.quit()

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Check if the table exists; create it if not
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "shows" (
        venue TEXT,
        headliner TEXT,
        start TIMESTAMP,
        support TEXT,
        event_link TEXT
    );
""")

# Fetch existing events to avoid duplicates
cursor.execute('SELECT headliner, start FROM "shows"')
existing_events = set(cursor.fetchall())

# Initialize counters for added, duplicate, and missing start events
added_count = 0
duplicate_count = 0
missing_start_count = 0

# Prepare rows to add to the database with explicit string conversion for `start`
rows_to_add = []
for event in events_data:
    event_start = event['start']
    
    # Check if start date is missing
    if event_start is None:
        missing_start_count += 1
        print(f"Skipping event due to missing start date: {event}")
    # Check for duplicates if start date is present
    elif (event['headliner'], event_start) in existing_events:
        duplicate_count += 1
        print(f"Skipping duplicate event: {event}")
    else:
        # Add unique event to rows_to_add
        rows_to_add.append((
            event['venue'],
            event['headliner'],
            event_start,  # Pass datetime object directly
            event['support'],
            event['event_link']
        ))
        added_count += 1

# Insert new events into the database if there are any rows to add
if rows_to_add:
    insert_query = """
    INSERT INTO "shows" (venue, headliner, start, support, event_link)
    VALUES (%s, %s, %s, %s, %s)
    """

    # Perform the insertion and commit the transaction
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the database.")
else:
    print("No new events to add. All entries are duplicates or missing required data.")

# Close the database connection
cursor.close()
conn.close()

# Print summary of added, duplicate, and missing start events
print(f"Scraping completed.")
print(f"Events added: {added_count}")
print(f"Events skipped due to duplicates: {duplicate_count}")
print(f"Events skipped due to missing start date: {missing_start_count}")