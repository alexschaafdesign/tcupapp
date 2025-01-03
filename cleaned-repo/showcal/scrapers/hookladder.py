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
base_url = 'https://thehookmpls.com/upcoming-events/'
driver.get(base_url)

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for "The Hook and Ladder"
try:
    venue_id = get_venue_id(cursor, "Hook & Ladder")
except ValueError as e:
    print(e)
    conn.close()
    exit()

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Function to process a page of events
def process_event_page(soup):
    global added_count, updated_count, duplicate_count

    # Find all event rows
    event_rows = soup.find_all(class_='tribe-events-calendar-list__event-row')

    # Loop through each event row to extract details
    for event in event_rows:
        # Extract event name and link
        name_tag = event.find('a', class_='tribe-events-calendar-list__event-title-link')
        event_name = name_tag.get_text(strip=True) if name_tag else "N/A"
        event_link = name_tag['href'] if name_tag and name_tag.has_attr('href') else None

        # Extract date and time
        datetime_wrapper = event.find('div', class_='tribe-events-calendar-list__event-datetime-wrapper')
        date_attr = datetime_wrapper.find('time', class_='tribe-events-calendar-list__event-datetime')['datetime'] if datetime_wrapper else None
        date_text = datetime_wrapper.find('span', class_='tribe-event-date-start').get_text(strip=True) if datetime_wrapper else None

        # Combine date and time
        start = None
        try:
            if date_attr:
                start = datetime.strptime(date_attr, "%Y-%m-%d")
            if date_text:
                start = datetime.strptime(date_text, "%a, %b %d, %Y @ %I:%M %p")
        except Exception as e:
            print(f"Error parsing date/time for event '{event_name}': {e}")
            continue

        # Extract bands (split and clean band names)
        bands = []
        if event_name:
            bands = [band.strip() for band in re.split(r',|\band\b|\bwith\b|\b&\b', event_name, flags=re.IGNORECASE) if band.strip()]

        # Extract flyer image
        flyer_section = event.find('div', class_='col medium-7 small-12 large-7')
        flyer_image = None
        if flyer_section:
            img_tag = flyer_section.find('img', class_='tribe-events-calendar-list__event-featured-image')
            if img_tag and img_tag.has_attr('src') and not img_tag['src'].startswith("data:image/"):
                flyer_image = img_tag['src']
            if not flyer_image and img_tag and img_tag.has_attr('srcset'):
                srcset = img_tag['srcset']
                flyer_image = srcset.split(",")[-1].split()[0]
            if not flyer_image:
                style_attr = flyer_section.get('style', '')
                match = re.search(r'url\((.*?)\)', style_attr)
                if match:
                    flyer_image = match.group(1).strip('\'"')

        # Default to None if no valid image found
        if not flyer_image:
            flyer_image = None

        # Clean and join bands into a comma-separated string
        bands = list(dict.fromkeys(bands))  # Remove duplicates
        bands_str = ", ".join(bands)

        # Log extracted data
        print(f"Event: {event_name}, Bands: {bands_str}, Start: {start}, Link: {event_link}, Flyer: {flyer_image}")

        # Process the show
        try:
            show_id, was_inserted = insert_show(conn, cursor, venue_id, bands_str, start, event_link, flyer_image)
            if was_inserted:
                added_count += 1
                print(f"Inserted event: {event_name} on {start}")
            else:
                if flyer_image:
                    updated_count += 1
                    print(f"Updated event with flyer: {event_name} on {start}")
                else:
                    duplicate_count += 1
                    print(f"Duplicate event found (no update needed): {event_name} on {start}")
        except Exception as e:
            print(f"Error processing event: {event_name}. Error: {e}")
            conn.rollback()
            continue

# Process all pages
while True:
    # Parse the current page
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    process_event_page(soup)

    # Check for the "Next Events" link
    next_link = soup.find('a', class_='tribe-events-c-nav__next')
    if next_link and next_link.has_attr('href'):
        next_page_url = next_link['href']
        print(f"Moving to next page: {next_page_url}")
        driver.get(next_page_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, 'tribe-events-calendar-list__event-row'))
        )
    else:
        print("No more pages to process.")
        break

# Commit all changes to the database
conn.commit()

# Close the database connection
cursor.close()
conn.close()
driver.quit()

# Print summary of added, updated, and skipped events
print(f"All events processed. Added: {added_count}, Updated: {updated_count}, Duplicates skipped: {duplicate_count}.")