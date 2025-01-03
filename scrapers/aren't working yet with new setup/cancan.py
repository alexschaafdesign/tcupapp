import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from db_utils import connect_to_db, get_venue_id, insert_show
import random

# URL of the new venue's event page
venue_url = "https://www.cancanwonderland.com/entertainment"

DEFAULT_IMAGE_URL = "https://www.cancanwonderland.com/default_image.jpg"  # Update as needed

user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"
]

headers = {
    "User-Agent": random.choice(user_agents),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Referer": "https://www.cancanwonderland.com/"
}

# Fetch the HTML content of the venue page
response = requests.get(venue_url)
response.raise_for_status()  # Check if the download was successful
html_content = response.text
soup = BeautifulSoup(html_content, 'html.parser')

# Connect to the PostgreSQL database
conn = connect_to_db()
cursor = conn.cursor()

# Counters for tracking results
show_count = 0
inserted_shows = 0
skipped_shows = 0
band_count = 0
inserted_bands = 0
linked_bands = 0

try:
    # Get the venue ID for "Can Can Wonderland"
    venue_id = get_venue_id(cursor, "Can Can Wonderland")

    def split_band_names(band_string):
        # Example of simple splitting logic
        bands = re.split(r'\s+(w/|and|\+|\&)\s+', band_string)  # Split by these separators with optional spaces around them
        return [b.strip() for b in bands if b.strip()]

    # Loop through each event on the page
    events = soup.find_all('div', class_="row pm-calendar-events")
    for event in events:
        show_count += 1  # Increment the total show count

        # Parse event details
        try:
            # Get the flyer image (from picture class "pm-calendar-event-pic-link")
            flyer_image_tag = event.find('div', class_="MuiBox-root jss394 pm-calendar-event-pic-link")
            flyer_image = flyer_image_tag.find('picture').img['src'] if flyer_image_tag else DEFAULT_IMAGE_URL

            # Get the show details (band name, etc.)
            event_card = event.find('div', class_="pm-calendar-event pm-calendar-event-card")
            bands_tag = event_card.find('div', class_="pm-calendar-event-content")
            bands = split_band_names(bands_tag.text) if bands_tag else []

            # Extract the date and time
            date_time_tag = event_card.find('div', class_="pm-calendar-event-content-right")
            if date_time_tag:
                date_time_text = date_time_tag.text.strip()
                # Example: "Sun, Dec 15, 12:00 pm - 3:00 pm"
                date_time_match = re.search(r'(\w{3},\s\w{3}\s\d{1,2},\s\d{1,2}:\d{2}\s\w{2})', date_time_text)
                if date_time_match:
                    show_date_time_str = date_time_match.group(1)

                    # Parse the date and time
                    event_date = datetime.strptime(show_date_time_str, "%a, %b %d, %I:%M %p")
                    
                    # Determine the year based on the month
                    if event_date.month == 12:
                        event_date = event_date.replace(year=2024)  # Set year to 2024 if it's December
                    else:
                        event_date = event_date.replace(year=2025)  # Set year to 2025 otherwise

                    # Extract the time only (in case of a range like "12:00 pm - 3:00 pm")
                    time_start = event_date.strftime("%Y-%m-%d %I:%M %p")

                    # Print the event details
                    print(f"Event Date: {event_date}, Start Time: {time_start}, Bands: {bands}")

                    # Get the event link (from the 'a' tag in the same div)
                    event_link_tag = event_card.find('a', href=True)
                    event_link = event_link_tag['href'] if event_link_tag else None
                    if event_link and event_link.startswith('/'):
                        event_link = f"https://www.cancanwonderland.com{event_link}"  # Prepend base URL

                    # Log the event details for debugging
                    print(f"Inserting/Updating show with parameters: "
                          f"Venue ID: {venue_id}, Bands: {bands}, Start: {time_start}, Event Link: {event_link}, Flyer Image: {flyer_image}")

                    # Insert or update the show in the database
                    try:
                        show_id, was_inserted = insert_show(conn, cursor, venue_id, ", ".join(bands), event_date, event_link, flyer_image)
                        if was_inserted:
                            inserted_shows += 1
                        else:
                            skipped_shows += 1  # No modification made
                    except Exception as e:
                        print(f"Error inserting or updating show: {e}")
                        skipped_shows += 1  # Count as skipped if an error occurs
                        continue
                else:
                    print(f"Date/Time format not found in text: {date_time_text}")
                    skipped_shows += 1
                    continue
            else:
                print("No date/time found in event.")
                skipped_shows += 1
                continue

        except Exception as e:
            print(f"Error parsing event: {e}")
            skipped_shows += 1  # Count as skipped if an error occurs

    # Log the results
    print("\nScraping Results:")
    print(f"Total shows found: {show_count}")
    print(f"Inserted shows: {inserted_shows}")
    print(f"Skipped shows (duplicates or errors): {skipped_shows}")
    print(f"Total bands found: {band_count}")
    print(f"Inserted bands: {inserted_bands}")
    print(f"Bands linked to shows: {linked_bands}")

except Exception as e:
    print(f"Error: {e}")
    conn.rollback()

finally:
    # Close the database connection
    cursor.close()
    conn.close()