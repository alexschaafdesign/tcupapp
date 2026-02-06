import re
import requests
from datetime import datetime

# Airtable settings
AIRTABLE_ACCESS_TOKEN = 'patVzYKecddbREcwN.d7b2f97f0c6a378cea0f05c639998f1189be10b8f49b107a6cf74e0ac14c0fc6'
BASE_ID = 'appWhJi1YbIsdiXrw'
TABLE_NAME = 'VRC Tracker v2'

# Airtable API endpoint
AIRTABLE_ENDPOINT = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}'

# Headers for the Airtable API
headers = {
    'Authorization': f'Bearer {AIRTABLE_ACCESS_TOKEN}',
    'Content-Type': 'application/json'
}

# Function to fetch existing records
def fetch_existing_records():
    all_records = []
    offset = None

    while True:
        params = {"offset": offset} if offset else {}
        response = requests.get(AIRTABLE_ENDPOINT, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            all_records.extend(data.get('records', []))
            offset = data.get('offset')

            if not offset:
                break
        else:
            print(f"Error fetching records: {response.json()}")
            break

    return all_records

# Fetch existing records and determine the starting position
existing_records = fetch_existing_records()
starting_row = len(existing_records) + 3  # Start 3 rows after the last filled row

# Concert data
concert_data = """
THU NOV 14
...
"""

# Parse the date at the top
date_match = re.search(r"([A-Z]{3} [A-Z]{3} \d{1,2})", concert_data)
if date_match:
    concert_date = datetime.strptime(date_match.group(0), "%a %b %d").replace(year=2024).strftime("%Y-%m-%d")
else:
    print("Date not found.")
    exit()

# Separate the first concert section from the rest of the data
data_parts = concert_data.split("\n\n", 1)
if len(data_parts) < 2:
    print("Concert data not in expected format.")
    exit()

# The initial concert section (first concert without a preceding '=')
initial_concert_section = data_parts[1].split('=', 1)[0]

# Split remaining concerts by '='
remaining_concerts = data_parts[1].split('=')[1:]

# Process each show section, starting with the initial section
all_shows = [initial_concert_section] + remaining_concerts

show_list = []

for index, show_section in enumerate(all_shows, start=starting_row):
    # Find the venue and time (e.g., "@ Venue Name 6PM" or "@ Venue Name 6:30PM")
    venue_match = re.search(r"@ ([\w\s]+) \d{1,2}(:\d{2})?PM", show_section, re.IGNORECASE)
    if venue_match:
        venue_name = venue_match.group(1).strip()
    else:
        venue_name = "Unknown"

    # Get the bands and their Instagram handles, allowing empty handles
    bands = re.findall(r"^([A-Za-z0-9\s]+)(?:\s+@([\w.]+))?$", show_section, re.MULTILINE)

    # Parse the time of each show and convert to datetime for sorting
    time_match = re.search(r"(\d{1,2}(:\d{2})?PM)", show_section)
    if time_match:
        show_time = time_match.group(1)
        show_datetime_str = f"{concert_date} {show_time}"
        show_datetime = datetime.strptime(show_datetime_str, "%Y-%m-%d %I:%M%p")
    else:
        show_datetime = None  # If no time is found, set as None

    # Filter out shows that are in the past
    if show_datetime and show_datetime >= datetime.now():
        # Add each band's information to Airtable
        for band_name, instagram_handle in bands:
            # Format the Instagram handle as a full URL
            instagram_url = f"https://instagram.com/{instagram_handle.strip()}" if instagram_handle else ""

            record_data = {
                "fields": {
                    "Show Date": concert_date,
                    "Band/Artist": band_name.strip(),
                    "Instagram handle": instagram_url,  # Store full URL
                    "Venue": venue_name,
                    "Show Time": show_datetime.strftime("%Y-%m-%d %H:%M:%S") if show_datetime else ""
                }
            }

            # Append to the show list for sorting later
            if show_datetime:
                show_list.append((show_datetime, record_data))

# Sort all shows by datetime (from today onward)
show_list.sort(key=lambda x: x[0])

# Send the sorted events to Airtable
for show_datetime, record_data in show_list:
    response = requests.post(AIRTABLE_ENDPOINT, headers=headers, json=record_data)

    if response.status_code == 200:
        print(f"Added {record_data['fields']['Band/Artist']} to Airtable successfully.")
    else:
        print(f"Error adding {record_data['fields']['Band/Artist']}: {response.json()}")

print("All entries processed.")