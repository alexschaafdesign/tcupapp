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
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.dayblockbrewing.com/events/'
driver.get(url)

# Function to load each event URL
def load_event_url(driver, url):
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'ecs-event-description'))
        )
        print(f"Loaded event page: {url}")
        return True
    except:
        print(f"Failed to load page: {url}")
        return False

# Wait for event cards to load
try:
    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'ecs-event'))
    )
    print("Event cards loaded successfully.")
except:
    print("Event cards did not load in time.")
    driver.quit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')

# Find all music event cards
events = soup.find_all("div", class_="col-lg-4 col-sm-12 col-xs-12 ecs-event ecs-event-posts clearfix live-music_ecs_category")
events_data = []
band_names = set()

# Loop through each music event card
for event in events:
    event_details = {'venue': "Day Block Brewing"}
    
    # Get date from main event card
    date_tag = event.find("span", class_="decm_date")
    if date_tag:
        date_text = date_tag.get_text(strip=True)
        try:
            event_details['date'] = datetime.strptime(date_text, "%B %d, %Y").date()
        except ValueError as e:
            print(f"Error parsing date: {e}")
            event_details['date'] = None
    else:
        print("Date tag not found on main page.")
        event_details['date'] = None

    # Get start time from main event card
    time_tag = event.find("span", class_="decm_date 87")
    if time_tag:
        time_text = time_tag.get_text(strip=True).split('–')[0].split('-')[0].strip()
        try:
            event_details['time'] = datetime.strptime(time_text, "%I:%M %p").time()
        except ValueError as e:
            print(f"Error parsing time: {e}")
            event_details['time'] = None
    else:
        print("Time tag not found on main page.")
        event_details['time'] = None

    # Combine date and time to create `start`
    if event_details['date'] and event_details['time']:
        event_details['start'] = datetime.combine(event_details['date'], event_details['time'])
        print(f"Successfully parsed start datetime: {event_details['start']}")
    else:
        event_details['start'] = None
        print(f"Failed to parse start datetime: date={event_details['date']} time={event_details['time']}")

    # Get the event URL and click through to get bands
    link = event.find("a", href=True)
    if link:
        event_url = link['href']
        event_details['event_link'] = event_url
        if load_event_url(driver, event_url):
            soup_event = BeautifulSoup(driver.page_source, 'html.parser')
            bands_section = soup_event.find("div", class_="ecs-event-description")
            if bands_section:
                bands = [h3.get_text(strip=True) for h3 in bands_section.find_all("h3")]
                event_details['bands'] = ", ".join(bands)
                band_names.update(bands)
            else:
                event_details['bands'] = ""
        else:
            print(f"Failed to load bands for {event_url}")
            event_details['bands'] = ""

    print(f"Parsed event details: {event_details}")  # Log each parsed event for verification
    events_data.append(event_details.copy())

driver.quit()

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Create tables if they don't exist
cursor.execute("""
    CREATE TABLE IF NOT EXISTS shows (
        venue TEXT,
        bands TEXT,
        start TIMESTAMP,
        event_link TEXT
    );
""")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS bands (
        band TEXT PRIMARY KEY
    );
""")

# Fetch existing events to avoid duplicates
cursor.execute("SELECT venue, start, event_link FROM shows")
existing_events = set(cursor.fetchall())

# Prepare rows for 'shows' table insertion, only if 'bands' is not empty
rows_to_add = []
for event in events_data:
    if event['start'] and event['bands'] and (event['venue'], event['start'], event['event_link']) not in existing_events:
        print(f"Adding event to rows_to_add: {event}")
        rows_to_add.append((
            event['venue'],
            event['bands'],
            event['start'],
            event['event_link']
        ))

# Insert rows if they exist
if rows_to_add:
    insert_query = """
    INSERT INTO shows (venue, bands, start, event_link)
    VALUES (%s, %s, %s, %s)
    """
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the shows table.")
else:
    print("No new events to add to the shows table.")

# Fetch existing bands to avoid duplicates
cursor.execute("SELECT band FROM bands")
existing_bands = set(row[0] for row in cursor.fetchall())

# Insert unique bands into the 'bands' table
bands_to_add = [(band,) for band in band_names if band and band not in existing_bands]
if bands_to_add:
    cursor.executemany("INSERT INTO bands (band) VALUES (%s)", bands_to_add)
    conn.commit()
    print(f"{len(bands_to_add)} new bands added to the bands table.")
else:
    print("No new bands to add to the bands table.")

# Close the database connection
cursor.close()
conn.close()

print("Events processed and added to the database.")