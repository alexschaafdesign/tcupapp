import os
import time
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
from db_utils import connect_to_db, insert_show

# If modifying access, you'll need to authenticate
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Token file that stores user's access and refresh tokens
token_path = 'token.json'

# Load credentials (if available)
def get_credentials():
    creds = None
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '/Users/musicdaddy/Desktop/venues/scrapers/credentials.json', SCOPES)
            flow.redirect_uri = 'http://localhost:57504/'  # Set the correct redirect URI
            creds = flow.run_local_server(port=57504)
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
    return creds

# Function to get events within the next 6 months
def get_events(calendar_id):
    creds = get_credentials()
    try:
        service = build('calendar', 'v3', credentials=creds)

        # Get the current date and time
        now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time

        # Calculate the time 6 months from now
        six_months_later = (datetime.utcnow() + timedelta(days=180)).isoformat() + 'Z'  # 6 months ahead

        events_data = []

        # Get the first batch of events (only for the next 6 months)
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=now,  # Start from the current time
            timeMax=six_months_later,  # End at 6 months from now
            singleEvents=True,
            orderBy='startTime',
        ).execute()

        events_data.extend(events_result.get('items', []))  # Add the first batch of events

        # Paginate through all events if there are more
        while 'nextPageToken' in events_result:
            page_token = events_result['nextPageToken']
            events_result = service.events().list(
                calendarId=calendar_id,
                pageToken=page_token,
                timeMin=now,
                timeMax=six_months_later,  # Ensure the pagination still respects the 6-month range
                singleEvents=True,
                orderBy='startTime',
            ).execute()
            events_data.extend(events_result.get('items', []))  # Add the next batch of events

        if not events_data:
            print('No upcoming events found.')
        return events_data

    except HttpError as error:
        print(f'An error occurred: {error}')
        return []

# Extract the calendar events using the calendar ID
calendar_id = 'teflgutelllvla7r6vfcmjdjjo@group.calendar.google.com'  # Use the specific calendar ID

events = get_events(calendar_id)

# Initialize counters
shows_added = 0
shows_skipped = 0
bands_added = 0
bands_skipped = 0

# Set to track already visited event links
visited_event_links = set()

# List to store event data for database insertion
events_data = []

# List of words to exclude from event titles
excluded_words = [
    "Toys For Tots!",
    "Karaoke",
    "Dart",
    "Bingo",
    "Meeting",
    "Trustee",
    "League",
    "Dance",
    "Party",
    "Dancers"
]

# Function to check if an event title contains any of the excluded words
def is_event_excluded(event_name):
    return any(word.lower() in event_name.lower() for word in excluded_words)

# Default flyer image path (adjust the path if needed)
default_flyer_image = "https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg"  # Relative path

# Process the events and insert them into the database
for event in events:
    event_details = {}
    event_name = event['summary']

    # Skip event if it contains any excluded word
    if is_event_excluded(event_name):
        print(f"Skipping event: {event_name} (contains excluded word)")
        continue  # Skip the rest of the loop for this event

    event_link = event.get('htmlLink', 'No link available')
    start_time = event['start'].get('dateTime', event['start'].get('date'))  # Time or Date
    start_time_parsed = None

    # Try to parse the date and time to a datetime object (if available)
    if start_time:
        try:
            start_time_parsed = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S%z")  # datetime format for events
        except ValueError as e:
            try:
                start_time_parsed = datetime.strptime(start_time, "%Y-%m-%d")  # Date-only format
            except ValueError:
                print(f"Error parsing event time: {e}")
                continue

    # Default flyer image (if no flyer is found)
    flyer_image = default_flyer_image  # Default to the default flyer image

    conn = connect_to_db()

    # Update all existing events in the database with the new default flyer image if necessary
    def update_flyer_images_with_default(new_default_image, conn):
        try:
            cursor = conn.cursor()
            # Update all rows in the `shows` table with the new default flyer image
            update_query = """
                UPDATE shows
                SET flyer_image = %s
            """
            cursor.execute(update_query, (new_default_image,))
            conn.commit()
            print(f"Updated {cursor.rowcount} events with the new default flyer image.")
        except Exception as e:
            print(f"Error updating flyer images: {e}")
            conn.rollback()
        finally:
            cursor.close()

    # Prepare the event details for your database
    event_details = {
        'bands': event_name,  # Now using 'bands' field instead of 'event_name'
        'event_link': event_link,
        'start_time': start_time_parsed,
        'flyer_image': flyer_image,
    }

    # Add event details to the list
    events_data.append(event_details)

# Now, insert the events into your database
conn = connect_to_db()
cursor = conn.cursor()

# Directly assign the correct venue_id
venue_id = 20  # Correct venue ID

for event_details in events_data:
    try:
        # Insert or update the show
        show_id, was_inserted = insert_show(
            conn, cursor,
            venue_id=venue_id,  # Use the correct venue_id directly
            bands=event_details['bands'],  # Use 'bands' here
            start=event_details['start_time'],
            event_link=event_details['event_link'],
            flyer_image=event_details['flyer_image'],  # Use the flyer image here
        )
        if was_inserted:
            shows_added += 1
        else:
            shows_skipped += 1
    except Exception as e:
        print(f"Error processing event: {event_details['bands']}. Error: {e}")
        conn.rollback()

# Commit all changes and close the connection
conn.commit()
cursor.close()
conn.close()

# Print summary
print(f"Events processed. Added: {shows_added}, Updated: {shows_skipped}.")