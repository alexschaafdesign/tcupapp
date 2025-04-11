from ics import Calendar
import requests
import re
from datetime import datetime
from db_utils import connect_to_db, get_venue_id, insert_show

# URL of the .ics file
ics_url = "https://whitesquirrelbar.com/calendar/?ical=1"

DEFAULT_IMAGE_URL = "https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg"

# Fetch and parse the .ics content
response = requests.get(ics_url)
response.raise_for_status()  # Check if the download was successful
ics_content = response.text
calendar = Calendar(ics_content)

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
    # Get the venue ID for "White Squirrel"
    venue_id = get_venue_id(cursor, "White Squirrel")

    # Function to split band names based on custom rules
    def split_band_names(band_string):
        bands = re.split(r'\s+w\.?\s+', band_string)
        separated_bands = []
        for band in bands:
            separated_bands.extend(band.split(","))
        return [b.strip() for b in separated_bands if b.strip()]
    
    from bs4 import BeautifulSoup

    # Function to extract flyer image URL
    def get_flyer_image(event_uid):
        """
        Extract the flyer image URL from the ICS file.
        """
        try:
            # Use regex to find the block of the event corresponding to the UID
            event_block_pattern = re.compile(rf"UID:{event_uid}.*?END:VEVENT", re.DOTALL)
            event_block_match = event_block_pattern.search(ics_content)

            if event_block_match:
                event_block = event_block_match.group(0)
                
                # Refine regex to match the ATTACH field with FMTTYPE and URL
                attach_pattern = re.compile(r"ATTACH;FMTTYPE=image/[^:]+:(.+)")
                attach_match = attach_pattern.search(event_block)

                if attach_match:
                    flyer_image = attach_match.group(1).strip()
                    print(f"Flyer image found for UID {event_uid}: {flyer_image}")
                    return flyer_image  # Return the URL if found

            # If no ATTACH field is found, return None
            print(f"No ATTACH field found for UID {event_uid}.")
            return None
        except Exception as e:
            print(f"Error extracting flyer image for UID {event_uid}: {e}")
            return None

    # Counters for tracking results
    show_count = 0
    inserted_shows = 0
    skipped_shows = 0
    modified_shows = 0  # New counter for modified events
    band_count = 0
    inserted_bands = 0
    linked_bands = 0

    # Loop through each event in the .ics file
    for event in calendar.events:
        show_count += 1  # Increment the total show count

        # Parse event details
        bands = split_band_names(event.name)
        start = event.begin.datetime.replace(tzinfo=None)
        event_link = event.url if event.url else None

        # Get the flyer image from the ICS
        flyer_image = get_flyer_image(event.uid)

        # Use the default image if none was found
        if flyer_image is None:
            flyer_image = DEFAULT_IMAGE_URL
            print(f"Default image assigned for event: {event.name} -> {DEFAULT_IMAGE_URL}")

        print(f"Inserting/Updating show with parameters: "
            f"Venue ID: {venue_id}, Bands: {bands}, Start: {start}, Event Link: {event_link}, Flyer Image: {flyer_image}")

        # Insert or update the show
        try:
            show_id, was_inserted = insert_show(conn, cursor, venue_id, ", ".join(bands), start, event_link, flyer_image)
            if was_inserted:
                inserted_shows += 1
            else:
                # Verify if the row was actually updated (optional logic)
                if cursor.rowcount > 0:
                    modified_shows += 1
                else:
                    skipped_shows += 1  # No actual modification made
        except Exception as e:
            print(f"Error inserting or updating show: {e}")
            skipped_shows += 1  # Count as skipped if an error occurs
            continue

    # Log the results
    print("\nScraping Results:")
    print(f"Total shows found: {show_count}")
    print(f"Inserted shows: {inserted_shows}")
    print(f"Modified shows: {modified_shows}")  # New log for modified events
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