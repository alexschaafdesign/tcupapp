import sys
import re
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup
import requests
from db_utils import connect_to_db, get_venue_id, insert_show

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
        sys.stderr.write(f"Error converting time '{time_str}': {e}\n")
        return '00:00'

def get_event_details(event_url):
    sys.stderr.write(f"Fetching event details from: {event_url}\n")
    try:
        response = requests.get(event_url)
    except Exception as e:
        sys.stderr.write(f"Error fetching URL {event_url}: {e}\n")
        return None, None, None

    if response.status_code == 200:
        event_soup = BeautifulSoup(response.content, 'html.parser')
        show_details = event_soup.find('div', class_='show_details text-center')
        event_time = None
        age_restriction = None
        
        if show_details:
            for item in show_details.find_all('div', class_='col-6 col-md'):
                header = item.find('h6')
                if header:
                    header_text = header.get_text(strip=True)
                    if "Show Starts" in header_text:
                        time_tag = item.find('h2')
                        event_time = (
                            convert_time_to_24_hour_format(time_tag.get_text(strip=True))
                            if time_tag else '00:00'
                        )
            # Extract age restriction (if needed)
            age_div = show_details.find('div', class_='col')
            if age_div:
                age_text = age_div.find('h2', class_='mt-1')
                if age_text:
                    age_restriction = age_text.get_text(strip=True)

        flyer_img_tag = event_soup.find('img', class_='gig_poster no-lazy')
        flyer_image = flyer_img_tag['src'] if flyer_img_tag else None

        return event_time, age_restriction, flyer_image
    else:
        sys.stderr.write(f"Failed to fetch event details from {event_url}. Status code: {response.status_code}\n")
        return None, None, None

def get_bands_from_event_page(event_url):
    bands = []
    sys.stderr.write(f"Fetching band names from: {event_url}\n")
    try:
        response = requests.get(event_url)
    except Exception as e:
        sys.stderr.write(f"Error fetching band data from {event_url}: {e}\n")
        return bands

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
                    sys.stderr.write(f"Band found: {band_name}\n")
    else:
        sys.stderr.write(f"Failed to retrieve band data from {event_url}. Status code: {response.status_code}\n")
    return bands

def run_first_avenue_scraper():
    """
    Runs the first-avenue scraper and returns a log dict.
    """
    added_count = 0
    skipped_count = 0
    errors = []

    sys.stderr.write("Starting first-avenue scraper...\n")
    # Connect to the database
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        err_msg = f"DB connection error: {e}"
        sys.stderr.write(err_msg + "\n")
        errors.append(err_msg)
        return {
            'scraper_name': 'first_avenue',
            'added_count': added_count,
            'skipped_count': skipped_count,
            'errors': errors,
        }

    urls = [

        'https://first-avenue.com/shows/?post_type=event&start_date=20250401',  # April
        'https://first-avenue.com/shows/?post_type=event&start_date=20250501',  # May
        'https://first-avenue.com/shows/?post_type=event&start_date=20250601',  # June
        'https://first-avenue.com/shows/?post_type=event&start_date=20250701',  # July
        'https://first-avenue.com/shows/?post_type=event&start_date=20250801',  # August
    ]

    month_mapping = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
        "Nov": "11", "Dec": "12"
    }

    # Process each URL
    for url in urls:
        sys.stderr.write(f"Sending request to {url}...\n")
        try:
            response = requests.get(url)
        except Exception as e:
            sys.stderr.write(f"Error fetching {url}: {e}\n")
            errors.append(f"Error fetching {url}: {e}")
            continue

        if response.status_code == 200:
            sys.stderr.write("Request successful. Parsing shows...\n")
            soup = BeautifulSoup(response.content, 'html.parser')
            show_items = soup.find_all('div', class_='show_list_item')
            for show in show_items:
                date_container = show.find('div', class_='date_container')
                if date_container:
                    month_text = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
                    day_text = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
                else:
                    continue
                month_number = month_mapping.get(month_text, "N/A")
                year = 2024 if month_number in ["11", "12"] else 2025
                try:
                    event_date = f"{year}-{month_number}-{int(day_text):02d}"
                except Exception as e:
                    sys.stderr.write(f"Error forming event date: {e}\n")
                    continue
                sys.stderr.write(f"Extracted date: {event_date}\n")

                venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
                try:
                    venue_id = get_venue_id(cursor, venue_name)
                except Exception as e:
                    sys.stderr.write(f"Error getting venue ID for {venue_name}: {e}\n")
                    continue

                event_link = show.find('a')['href'] if show.find('a') else None
                if event_link:
                    if not event_link.startswith('http'):
                        event_url = f"https://first-avenue.com{event_link}"
                    else:
                        event_url = event_link
                else:
                    event_url = 'N/A'

                event_time, age_restriction, flyer_image = get_event_details(event_url)
                try:
                    start_datetime = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
                    sys.stderr.write(f"Combined start datetime: {start_datetime}\n")
                except ValueError as e:
                    sys.stderr.write(f"Error combining date and time: {e}\n")
                    errors.append(f"Error combining date and time for event at {event_url}: {e}")
                    start_datetime = None

                band_names = get_bands_from_event_page(event_url)
                bands = ", ".join(band_names)

                try:
                    show_id, was_inserted = insert_show(conn, cursor, venue_id, bands, start_datetime, event_link, flyer_image)
                    if was_inserted:
                        added_count += 1
                    else:
                        skipped_count += 1
                    sys.stderr.write(f"Processed show ID: {show_id} (New: {was_inserted})\n")
                except Exception as e:
                    sys.stderr.write(f"Error processing show at {event_url}: {e}\n")
                    errors.append(f"Error processing show at {event_url}: {e}")
            try:
                conn.commit()
            except Exception as e:
                sys.stderr.write(f"Error committing DB changes: {e}\n")
                errors.append(f"Error committing DB changes: {e}")
        else:
            sys.stderr.write(f"Failed to retrieve data from {url}. Status code: {response.status_code}\n")
            errors.append(f"Failed to retrieve data from {url}. Status code: {response.status_code}")

    cursor.close()
    conn.close()

    log = {
        'scraper_name': 'first_avenue',
        'added_count': added_count,
        'skipped_count': skipped_count,
        'errors': errors,
    }
    return log

if __name__ == "__main__":
    log = run_first_avenue_scraper()
    print(json.dumps(log))