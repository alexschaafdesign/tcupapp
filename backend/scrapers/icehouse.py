import re
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, get_venue_id, insert_show

# URL and default flyer image
venue_url = "https://icehouse.turntabletickets.com/"
DEFAULT_IMAGE_URL = "https://icehouse.turntabletickets.com/default_image.jpg"

# Set up Selenium WebDriver in headless mode
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
driver = webdriver.Chrome(options=chrome_options)

driver.get(venue_url)

# Wait for the event elements to load. Adjust the selector if needed.
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.details"))
    )
except Exception as e:
    print(f"Error waiting for events to load: {e}")
    driver.quit()
    exit()

# Give a little extra time if necessary (tweak sleep duration as needed)
time.sleep(2)

# Get the fully rendered page source and close the driver
html_content = driver.page_source
driver.quit()

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
    # Get the venue ID for "Icehouse"
    venue_id = get_venue_id(cursor, "Icehouse")

    def split_band_names(band_string):
        # Remove "Brunch with" and split by common delimiters
        band_string = band_string.replace("Brunch with", "").strip()
        bands = re.split(r'\s+(w/|and|\+|\&)\s+', band_string)
        return [b.strip() for b in bands if b.strip() and b.strip().lower() not in ['w/', 'and', '+', '&', 'with']]

    # Find all event elements (adjust the class if the page structure changes)
    events = soup.find_all('div', class_="details flex flex-col gap-2 md:flex-row border-b last:border-b-0 border-linear-g-primary py-12 px-4 md:px-0 md:py-16 md:gap-10")
    
    if not events:
        print("No events found. The page structure may have changed.")

    for event in events:
        show_count += 1  # Increment the total show count

        try:
            # Extract the flyer image URL
            flyer_image_tag = event.find('picture', class_="show-image")
            flyer_image = flyer_image_tag.img['src'] if flyer_image_tag and flyer_image_tag.img else DEFAULT_IMAGE_URL

            # Get performance details
            performance_div = event.find('div', class_="performances whitespace-pre-line w-full md:w-3/4")
            bands_tag = performance_div.find('h3') if performance_div else None
            bands = split_band_names(bands_tag.text) if bands_tag else []

            # Extract the date (assumed format like "Fri, May 2")
            date_tag = performance_div.find('h4', class_="day-of-week") if performance_div else None
            show_date_text = date_tag.text.strip() if date_tag else None
            print(f"Show Date Text: {show_date_text}")

            # Extract the time from a <span> within the performance div
            if performance_div:
                time_span = performance_div.find('span')
                if time_span:
                    time_text = time_span.text.strip()
                    # Find the first time occurrence (e.g., "5:30PM" or "6PM")
                    time_match = re.search(r'(\d{1,2}(:\d{2})?\s?(am|pm|AM|PM))', time_text)
                    if time_match:
                        doors_time = time_match.group(1).lower()
                        print(f"First Time Found: {doors_time}")
                    else:
                        doors_time = ""
                    
                    # Combine date and time; adjust year logic as needed
                    if show_date_text:
                        event_date = show_date_text.strip()
                        try:
                            # Expecting format "%a, %b %d" (e.g., "Fri, May 2")
                            dt_temp = datetime.strptime(event_date, "%a, %b %d")
                        except ValueError as e:
                            print(f"Error parsing event date '{event_date}': {e}")
                            continue
                        month = dt_temp.month
                        year = 2024 if month == 12 else 2025
                        formatted_date = f"{year} {event_date}"
                        full_date = f"{formatted_date} {doors_time}"
                        
                        try:
                            if ":" in doors_time:
                                show_start_time = datetime.strptime(full_date, "%Y %a, %b %d %I:%M%p")
                            else:
                                show_start_time = datetime.strptime(full_date, "%Y %a, %b %d %I%p")
                            print(f"Parsed Start Time: {show_start_time}")
                        except ValueError as e:
                            print(f"Error parsing combined date and time: {e}")
                            show_start_time = None
                    else:
                        print("No date text found.")
                        show_start_time = None
                else:
                    print("No time span found in performance div.")
                    show_start_time = None
            else:
                print("No performance div found.")
                show_start_time = None

            print(f"Final Start Time: {show_start_time}")

            # Extract event link
            event_link_tag = performance_div.find('a', href=True) if performance_div else None
            event_link = event_link_tag['href'] if event_link_tag else None
            if event_link and event_link.startswith('/'):
                event_link = f"https://icehouse.turntabletickets.com{event_link}"
            print(f"Event Link: {event_link}")

            # Insert or update the show in the database
            print(f"Inserting/Updating show with parameters:\n"
                  f"  Venue ID: {venue_id}\n"
                  f"  Bands: {bands}\n"
                  f"  Start: {show_start_time}\n"
                  f"  Event Link: {event_link}\n"
                  f"  Flyer Image: {flyer_image}")
            try:
                show_id, was_inserted = insert_show(conn, cursor, venue_id, ", ".join(bands), show_start_time, event_link, flyer_image)
                if was_inserted:
                    inserted_shows += 1
                else:
                    skipped_shows += 1
            except Exception as e:
                print(f"Error inserting or updating show: {e}")
                skipped_shows += 1
                continue

        except Exception as e:
            print(f"Error parsing event: {e}")
            skipped_shows += 1

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
    cursor.close()
    conn.close()