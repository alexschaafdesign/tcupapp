import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from db_utils import connect_to_db, get_venue_id, insert_show

# URL of the new venue's event page
venue_url = "https://icehouse.turntabletickets.com/"

DEFAULT_IMAGE_URL = "https://icehouse.turntabletickets.com/default_image.jpg"  # Update as needed

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
    # Get the venue ID for "Icehouse"
    venue_id = get_venue_id(cursor, "Icehouse")

    def split_band_names(band_string):
        # First, handle the case of "Brunch with"
        band_string = band_string.replace("Brunch with", "").strip()  # Remove "Brunch with"

        # Now, handle "w/", "and", "&", and "+" as separators between bands
        bands = re.split(r'\s+(w/|and|\+|\&)\s+', band_string)  # Split by these separators with optional spaces around them
        
        # Clean up extra spaces around each band name
        return [b.strip() for b in bands if b.strip() and b.strip().lower() not in ['w/', 'and', '+', '&', 'with']]  # Clean unwanted separators
    
    # Loop through each event on the page
    events = soup.find_all('div', class_="details flex flex-col gap-2 md:flex-row border-b last:border-b-0 border-linear-g-primary py-12 px-4 md:px-0 md:py-16 md:gap-10")
    for event in events:
        show_count += 1  # Increment the total show count

        # Parse event details
        try:
            # Get the flyer image (from picture class "show-image")
            flyer_image_tag = event.find('picture', class_="show-image")
            flyer_image = flyer_image_tag.img['src'] if flyer_image_tag and flyer_image_tag.img else DEFAULT_IMAGE_URL

            # Get the show details
            performance_div = event.find('div', class_="performances whitespace-pre-line w-full md:w-3/4")
            bands_tag = performance_div.find('h3')
            bands = split_band_names(bands_tag.text) if bands_tag else []

            # Extract the date from the h4 tag with class "day-of-week"
            date_tag = performance_div.find('h4', class_="day-of-week")
            show_date_text = date_tag.text.strip() if date_tag else None
            print(f"Show Date Text: {show_date_text}")  # Log the extracted date

            # Extract the parent div with class "performances whitespace-pre-line"
            performance_div = event.find('div', class_="performances whitespace-pre-line w-full md:w-3/4")
            if performance_div:

                # Extract the <span> within the performance div, which contains the time text
                time_span = performance_div.find('span')
                if time_span:
                    time_text = time_span.text.strip()

                    # Use regex to find the first valid time (e.g., "5:30PM", "6PM", "8pm", etc.)
                    time_match = re.search(r'(\d{1,2}(:\d{2})?\s?(am|pm|AM|PM))', time_text)  # Flexible for lower/uppercase AM/PM
                    if time_match:
                        doors_time = time_match.group(1).lower()  # Convert to lowercase for consistency
                        print(f"First Time Found: {doors_time}")  # Log the found time
                        
                    # Extract the year from the event URL or another source
                    event_date = show_date_text.strip()  # Use the extracted show date text directly
                    month = datetime.strptime(event_date, "%a, %b %d").month  # Extract the month from event date text

                    # Determine the year based on the month
                    if month == 12:  # If the event is in December
                        year = 2024
                    else:  # Otherwise, it will be in 2025
                        year = 2025

                    # Format the full date correctly (ensure the format matches datetime's expectations)
                    formatted_date = f"{year} {event_date}"

                    # Combine the formatted date with the time
                    full_date = f"{formatted_date} {doors_time}"

                    # Try parsing the combined string into a datetime object
                    try:
                        # If the time has minutes, use "%I:%M%p"; otherwise use "%I%p"
                        if ":" in doors_time:
                            show_start_time = datetime.strptime(full_date, "%Y %a, %b %d %I:%M%p")
                        else:
                            show_start_time = datetime.strptime(full_date, "%Y %a, %b %d %I%p")
                        
                        print(f"Parsed Start Time: {show_start_time}")  # Log the parsed datetime
                    except ValueError as e:
                        print(f"Error parsing date and time: {e}")
                        show_start_time = None
                else:
                    print("No time span found in the performance div.")
                    show_start_time = None
            else:
                print("No performance div found.")
                show_start_time = None

            # Log the final result
            print(f"Final Start Time: {show_start_time}")

            # Now show_start_time will contain the combined date and time (if both were found)
            print(f"Combined start time: {show_start_time}")

            # Get the event link (from the a tag in the same div)
            event_link_tag = performance_div.find('a', href=True)
            event_link = event_link_tag['href'] if event_link_tag else None
            if event_link and event_link.startswith('/'):
                event_link = f"https://icehouse.turntabletickets.com{event_link}"  # Prepend base URL

            # Print the event link to verify it's working
            print(f"Event Link: {event_link}")

            # Print out the parsed event information
            print(f"Inserting/Updating show with parameters: "
                  f"Venue ID: {venue_id}, Bands: {bands}, Start: {show_start_time}, Event Link: {event_link}, Flyer Image: {flyer_image}")

            # Insert or update the show in the database
            try:
                show_id, was_inserted = insert_show(conn, cursor, venue_id, ", ".join(bands), show_start_time, event_link, flyer_image)
                if was_inserted:
                    inserted_shows += 1
                else:
                    skipped_shows += 1  # No modification made
            except Exception as e:
                print(f"Error inserting or updating show: {e}")
                skipped_shows += 1  # Count as skipped if an error occurs
                continue

        except Exception as e:
            print(f"Error parsing event: {e}")
            skipped_shows += 1  # Count as skipped if an error occurs

    # Log the results
    print("\nScraping Results:")
    print(f"Total shows found: {show_count}")
    print(f"Inserted shows: {inserted_shows}")
    print(f"Skipped shows (duplicates): {skipped_shows}")
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