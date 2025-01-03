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
DB_NAME = "tcup_db"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.zhoradarling.com/events'  # Replace with actual URL
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'sc-88e0adda-0'))
    )
    print("Event cards loaded successfully.")
except:
    print("Event cards did not load in time.")

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
events = soup.find_all("article", class_="sc-88e0adda-0")
events_data = []
band_names = set()

# Function to split band names based on custom rules
def split_band_names(band_string):
    bands = re.split(r'\s*(?:,|w/|&)\s*', band_string)
    return [b.strip() for b in bands if b.strip()]

# Loop through each event block
for event in events:
    event_details = {}

    # Set the venue name
    event_details['venue_id'] = 32

    # Adjust date and time extraction
    date_time_tag = event.find("time", class_="sc-88e0adda-1")
    if date_time_tag:
        date_time_text = date_time_tag.get_text(strip=True)
        
        # Handle different cases for date format
        try:
            # Case 1: Date without a year (assume year based on month)
            if "―" in date_time_text and len(date_time_text.split()) == 5:
                # Example format: "Mon 18 Nov ― 7:00pm"
                date_part, time_part = date_time_text.split("―")
                month = date_part.split()[2]
                year = 2024 if month in ["Nov", "Dec"] else 2025  # Use 2024 for Nov/Dec, otherwise 2025
                full_date_time = f"{date_part.strip()} {time_part.strip()} {year}"
                start_datetime = datetime.strptime(full_date_time, "%a %d %b %I:%M%p %Y")
            
            # Case 2: Date with a year already included
            elif "―" in date_time_text and len(date_time_text.split()) == 6:
                # Example format: "Wed 15 Jan 2025 ― 6:30pm"
                date_part, time_part = date_time_text.split("―")
                full_date_time = f"{date_part.strip()} {time_part.strip()}"
                start_datetime = datetime.strptime(full_date_time, "%a %d %b %Y %I:%M%p")
            
            event_details['start'] = start_datetime
        except ValueError as e:
            print(f"Error parsing date and time for event: {date_time_text}")
            event_details['start'] = None
    else:
        event_details['start'] = None

    # Extract bands and event link
    title_tag = event.find("a", class_="sc-88e0adda-3 eijtNw dice_event-title")
    if title_tag:
        event_details['event_link'] = title_tag['href']
        band_names_list = split_band_names(title_tag.get_text(strip=True))
        event_details['bands'] = ", ".join(band_names_list)
        band_names.update(band_names_list)
    else:
        event_details['event_link'] = "N/A"
        event_details['bands'] = "N/A"

    events_data.append(event_details.copy())

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()


# Fetch existing events to avoid duplicates
cursor.execute("SELECT bands, start FROM shows")
existing_events = set(cursor.fetchall())

# Insert new events into the 'shows' table
rows_to_add = [
    (event['venue_id'], event['bands'], event['start'], event['event_link'])
    for event in events_data
    if event['start'] and (event['bands'], event['start']) not in existing_events
]

if rows_to_add:
    insert_query = """
    INSERT INTO shows (venue_id, bands, start, event_link)
    VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING
    """
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the shows table.")
else:
    print("No new events to add to the shows table. All entries are duplicates.")


# Close the database connection
cursor.close()
conn.close()

print("Events processed and added to the database.")