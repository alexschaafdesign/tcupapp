import requests
import json
from bs4 import BeautifulSoup
from datetime import datetime
from db_utils import connect_to_db, get_venue_id, insert_show

# Database connection
conn = connect_to_db()
cursor = conn.cursor()

# Counters for added and skipped events
added_count = 0
skipped_count = 0

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()
            if ':' in time_str:
                hour, minute = time_str[:-2].split(':')
            else:
                hour = time_str[:-2]
                minute = '00'
            hour = int(hour) % 12
            if 'PM' in time_str:
                hour += 12
            return f"{hour:02}:{minute}"
        return '00:00'
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'

def get_event_details(event_url):
    print(f"Fetching event details from: {event_url}")
    response = requests.get(event_url)
    if response.status_code == 200:
        event_soup = BeautifulSoup(response.content, 'html.parser')

        # Extract event time
        show_details = event_soup.find('div', class_='show_details text-center')
        event_time = None
        if show_details:
            for item in show_details.find_all('div', class_='col-6 col-md'):
                header = item.find('h6')
                if header and "Show Starts" in header.get_text(strip=True):
                    time_tag = item.find('h2')
                    event_time = (
                        convert_time_to_24_hour_format(time_tag.get_text(strip=True))
                        if time_tag else '00:00'
                    )
        
        # Extract flyer image
        flyer_img_tag = event_soup.find('img', class_='gig_poster no-lazy')
        flyer_image = flyer_img_tag['src'] if flyer_img_tag else None

        return event_time, flyer_image
    else:
        print(f"Failed to fetch event details from {event_url}. Status code: {response.status_code}")
        return None, None

# Function to fetch and extract social media links for a specific band
def get_links_for_band(band_element):
    links = {}
    social_links_section = band_element.find('div', class_='col-md-auto social_links_col')

    if social_links_section:
        social_items = social_links_section.find_all('a', class_='social_icon')
        for item in social_items:
            link = item.get('href')
            platform = item.get('title', '').lower()

            if not platform:
                platform = item.find('i')['class'][0] if item.find('i') else ''

            if platform:
                platform = platform.replace('zocial-', '')

            if link:
                links[platform] = link
                print(f"Found {platform} link for specific band: {link}")
    return links

# Function to get band names from the event page
def get_bands_from_event_page(event_url):
    bands = []
    print(f"Fetching band names from: {event_url}")
    response = requests.get(event_url)

    if response.status_code == 200:
        event_soup = BeautifulSoup(response.content, 'html.parser')
        performer_items = event_soup.find_all('div', class_='performer_list_item')

        for item in performer_items:
            band_name_element = item.find('div', class_='performer_content_col')
            if band_name_element:
                band = band_name_element.find('h2')
                if band:
                    band_name = band.get_text(strip=True)
                    bands.append(band_name)
                    print(f"Band found: {band_name}")
    else:
        print(f"Failed to retrieve band data from {event_url}. Status code: {response.status_code}")

    return bands

# Function to fetch and process events from the given URL
def fetch_and_process_events(url):
    global added_count, skipped_count

    print(f"Sending request to {url}...")
    response = requests.get(url)

    if response.status_code == 200:
        print("Request successful. Parsing shows...")
        soup = BeautifulSoup(response.content, 'html.parser')

        for show in soup.find_all('div', class_='show_list_item'):
            date_container = show.find('div', class_='date_container')
            month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
            day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'

            month_mapping = {
                "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
                "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
                "Nov": "11", "Dec": "12"
            }
            month_number = month_mapping.get(month, "N/A")
            year = 2024 if month_number in ["11", "12"] else 2025

            event_date = f"{year}-{month_number}-{int(day):02d}"
            print(f"Extracted date: {event_date}")

            venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
            venue_id = get_venue_id(cursor, venue_name)

            event_link = show.find('a')['href'] if show.find('a') else None
            event_url = event_link if event_link and event_link.startswith('http') else f"https://first-avenue.com{event_link}" if event_link else 'N/A'

            event_time, flyer_image = get_event_details(event_url)
            try:
                start_datetime = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
                print(f"Combined start datetime: {start_datetime}")
            except ValueError as e:
                print(f"Error combining date and time: {e}")
                start_datetime = None

            # Extract band names from the event page
            band_names = get_bands_from_event_page(event_url)
            bands = ", ".join(band_names)

            # Insert the show into the database
            try:
                show_id, was_inserted = insert_show(conn, cursor, venue_id, bands, start_datetime, event_link, flyer_image)

                if was_inserted:
                    added_count += 1
                else:
                    skipped_count += 1

                print(f"Processed show ID: {show_id} (New: {was_inserted})")

            except Exception as e:
                print(f"Error processing show at {event_link}: {e}")

        conn.commit()  # Commit after processing all shows for the current URL

    else:
        print(f"Failed to retrieve data from {url}. Status code: {response.status_code}")

# List of URLs for different months
urls = [
    'https://first-avenue.com/shows/?post_type=event&start_date=20241201',  # URL for December
    'https://first-avenue.com/shows/?post_type=event&start_date=20241201',  # URL for December
    'https://first-avenue.com/shows/?post_type=event&start_date=20250101',  # URL for January
    'https://first-avenue.com/shows/?post_type=event&start_date=20250201',  # URL for February
    'https://first-avenue.com/shows/?post_type=event&start_date=20250301',  # URL for March
    'https://first-avenue.com/shows/?post_type=event&start_date=20250401',  # URL for April
    'https://first-avenue.com/shows/?post_type=event&start_date=20250501',  # URL for May
    'https://first-avenue.com/shows/?post_type=event&start_date=20250601',  # URL for June
    'https://first-avenue.com/shows/?post_type=event&start_date=20250701',  # URL for July
    'https://first-avenue.com/shows/?post_type=event&start_date=20250801',  # URL for August
]

# Process each URL
for url in urls:
    try:
        fetch_and_process_events(url)
    except Exception as e:
        print(f"Error processing URL {url}: {e}")
        conn.rollback()  # Rollback if any error occurs

# Close the database connection
cursor.close()
conn.close()

print(f"All events processed. Added: {added_count}, Skipped: {skipped_count}.")