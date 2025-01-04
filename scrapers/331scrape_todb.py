import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

# Initialize WebDriver
# Set up Chrome options before initializing WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # Enable headless mode
chrome_options.add_argument("--disable-gpu")  # Disable GPU usage
chrome_options.add_argument("--no-sandbox")  # Bypass OS security model
chrome_options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource issues

# Initialize WebDriver with options
print("Starting headless Chrome...")
driver = webdriver.Chrome(options=chrome_options)
print("Chrome initialized successfully")
url = 'https://331club.com/#calendar'
print(f"Navigating to {url}")
driver.get(url)
print("Page loaded, waiting for 'See all upcoming events' button...")

# Click "See all upcoming events" button
try:
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '.more_events a'))
    ).click()
except Exception as e:
    print(f"Error clicking 'See all upcoming events' button: {e}")
    driver.quit()
    exit()

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'event'))
    )
except Exception as e:
    print(f"Error waiting for event cards: {e}")
    driver.quit()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
events = soup.find_all("div", class_="event")

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for "331 Club"
try:
    venue_id = get_venue_id(cursor, "331 Club")
except ValueError as e:
    print(e)
    conn.close()
    exit()

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Define a function to calculate the event year
def get_event_year(month):
    if month in ["11", "12"]:
        return 2024
    return 2025

# Normalize time
def normalize_time(time_str):
    """
    Normalize various time string formats into 'HH:MM PM' format.
    """
    try:
        # Clean the input string
        time_str = time_str.lower().strip()
        
        # Handle cases without minutes (e.g., "9pm" -> "9:00pm")
        if ':' not in time_str:
            time_str = re.sub(r'(\d+)(am|pm)', r'\1:00\2', time_str)
        
        # Ensure space before am/pm
        time_str = re.sub(r'(am|pm)', r' \1', time_str)
        
        # Parse and normalize
        return datetime.strptime(time_str, "%I:%M %p").strftime("%I:%M %p")
    except Exception:
        return None
    
def clean_band_name(name):
    """
    Cleans up band names by removing unwanted stop words and extra spaces.
    """
    stop_words = ['with', 'and']
    return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()

# Loop through each event to extract details
for event in events:
    # Extract date details
    date_tag = event.find("div", class_="event-date")
    if date_tag:
        month_text = date_tag.find("span", class_="month").get_text(strip=True)
        day_text = date_tag.find("span", class_="date").get_text(strip=True)
        month_mapping = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
            "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
            "Nov": "11", "Dec": "12"
        }
        month = month_mapping.get(month_text, "N/A")
        year = get_event_year(month)
        date_str = f"{year}-{month}-{int(day_text):02d}"
    else:
        date_str = None

    # Find event content
    event_content = event.find("div", class_="event-content")
    if not event_content:
        continue

    # Extract each column as a separate event
    columns_div = event_content.find("div", class_="columns")
    if not columns_div:
        continue

    def get_default_time(bands_str):
        """
        Return default time based on event patterns at 331 Club
        """
        if any(event in bands_str for event in ["Worker's Playtime", "Movie Music Trivia", "Drinkin' Spelling Bee"]):
            return "06:00 PM"
        elif "Harold's House Party" in bands_str:
            return "04:00 PM"
        elif "Dr. Sketchy" in bands_str:
            return "02:00 PM"
        elif "Conspiracy Series" in bands_str:
            return "09:00 PM"
        # Most shows at 331 Club start at 10 PM
        return "10:00 PM"

    # In your main event processing loop:
    for column in columns_div.find_all("div", class_="column"):
        # Extract event details
        p_tag = column.find("p")
        if not p_tag:
            continue

        # Get all text nodes including the time
        contents = [node.strip() for node in p_tag.stripped_strings]
        
        # Extract time - it's usually the last text node after the <br> tags
        event_time = None
        time_pattern = re.compile(r'\d{1,2}:?\d{0,2}\s*(?:am|pm)', re.IGNORECASE)
        
        # Look for time in the contents
        for content in reversed(contents):  # Search from end since time is usually last
            if time_match := time_pattern.search(content):
                time_text = time_match.group().strip()
                event_time = normalize_time(time_text)
                break
        
        # If no time found, use default based on event type
        if not event_time:
            # Combine all non-time text to check for event patterns
            full_text = ' '.join(content for content in contents if not time_pattern.search(content))
            event_time = get_default_time(full_text)

        # Extract bands (everything except the time)
        bands = []
        for content in contents:
            if not time_pattern.search(content) and content.strip():
                bands.append(clean_band_name(content))

        # If we still don't have a time but see a raw time string
        if not event_time:
            raw_text = p_tag.get_text()
            time_match = re.search(r'\d{1,2}:\d{2}(?:am|pm)', raw_text.lower())
            if time_match:
                event_time = normalize_time(time_match.group())
            else:
                # Default time based on event type
                if any("Worker's Playtime" in band for band in bands):
                    event_time = "06:00 PM"
                elif any("Dr. Sketchy" in band for band in bands):
                    event_time = "02:00 PM"
                elif any("Conspiracy Series" in band for band in bands):
                    event_time = "09:00 PM"
                else:
                    event_time = "08:00 PM"  # Default evening show time

        # Clean up band list - remove any remaining time strings
        bands = [band for band in bands if not re.search(r'\d{1,2}:\d{2}(?:am|pm)', band.lower())]
        bands = [band for band in bands if band.strip()]  # Remove empty strings
        
        bands_str = ", ".join(bands)

        # Combine date and time
        try:
            start = datetime.strptime(f"{date_str} {event_time}", "%Y-%m-%d %I:%M %p")
        except ValueError as e:
            print(f"Skipping event due to date/time issue: {bands_str}. Error: {e}")
            continue

        # Extract event link
        event_link = None
        link_tag = column.find("a", href=True)
        if link_tag:
            event_link = link_tag['href']

        # Extract flyer
        flyer_image = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"

        # Insert into database
        try:
            show_id, was_inserted = insert_show(
                conn, cursor, venue_id, bands_str, start, event_link, flyer_image
            )
            if was_inserted:
                added_count += 1
            #    print(f"Inserted event: {bands_str} at {start}")
            else:
                duplicate_count += 1
            #    print(f"Duplicate event skipped: {bands_str} at {start}")
        except Exception as e:
            print(f"Error processing event: {bands_str}. Error: {e}")
            conn.rollback()
            continue

# Commit and close the database
conn.commit()
cursor.close()
conn.close()

# Print summary of added, updated, and skipped events
print(f"All events processed. Added: {added_count}, Updated: {updated_count}, Duplicates skipped: {duplicate_count}.")