import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By 
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

def run_aster_cafe_scraper():
    """
    Runs the Aster Café scraper and returns a log dict with:
      - scraper_name: identifier for the scraper.
      - added_count: number of events inserted.
      - duplicate_count: number of duplicate events skipped.
      - added_shows: list of inserted show IDs.
      - errors: list of error messages encountered.
    """
    added_count = 0
    duplicate_count = 0
    added_shows = []
    errors = []

    print("Starting Aster Café scraper...")

    # Set up headless Chrome with necessary options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--enable-javascript")

    try:
        driver = webdriver.Chrome(options=chrome_options)
    except Exception as e:
        error_msg = f"Error initializing Chrome: {e}"
        print(error_msg)
        errors.append(error_msg)
        return {
            'scraper_name': 'aster_cafe',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    try:
        url = "https://astercafe.com/live-music-calendar/"
        print(f"Loading calendar page: {url}")
        driver.get(url)
        print("Waiting for calendar to load (15s)...")
        time.sleep(15)  # Wait for calendar to fully load

        # Execute JavaScript to extract event data
        script = """
        return Array.from(document.querySelectorAll('.cl-event-card')).map(card => {
            const titleElement = card.querySelector('.cl-event-card__title');
            const title = titleElement ? titleElement.textContent.trim() : '';
            
            const detailsElement = card.querySelector('.cl-event-card__details');
            const details = detailsElement ? detailsElement.textContent.trim() : '';
            
            const imageElement = card.querySelector('img');
            const imageUrl = imageElement ? imageElement.src : null;
            
            const linkElement = card.querySelector('a');
            const link = linkElement ? linkElement.href : '';
            
            return {
                title: title,
                details: details,
                flyer: imageUrl,
                link: link,
                rawHtml: card.innerHTML
            };
        });
        """
        print("Extracting event data...")
        events = driver.execute_script(script)
        print(f"Found {len(events)} events.")
    except Exception as e:
        error_msg = f"Error during extraction: {e}"
        print(error_msg)
        errors.append(error_msg)
        driver.quit()
        return {
            'scraper_name': 'aster_cafe',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }
    finally:
        driver.quit()

    # Optional: Print raw data for debugging
    for idx, event in enumerate(events):
        print(f"\nEvent {idx+1}:")
        print(f"Title: {event.get('title')}")
        print(f"Details: {event.get('details')}")
        print(f"Link: {event.get('link')}")
        print(f"Flyer: {event.get('flyer')}")
        print("Raw HTML snippet:", event.get('rawHtml')[:200] + "...")

    # Connect to the database
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
    except Exception as e:
        error_msg = f"DB connection error: {e}"
        print(error_msg)
        errors.append(error_msg)
        return {
            'scraper_name': 'aster_cafe',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Get venue ID for "Aster Café"
    try:
        venue_id = get_venue_id(cursor, "Aster Café")
    except Exception as e:
        error_msg = f"Error getting venue ID for Aster Café: {e}"
        print(error_msg)
        errors.append(error_msg)
        conn.close()
        return {
            'scraper_name': 'aster_cafe',
            'added_count': added_count,
            'duplicate_count': duplicate_count,
            'added_shows': added_shows,
            'errors': errors,
        }

    # Process each event
    for event in events:
        # For demonstration, use the event title as the show/band name.
        # You can refine this extraction by parsing 'details' or 'rawHtml'
        event_title = event.get('title', '').strip()
        event_details = event.get('details', '').strip()
        flyer_image = event.get('flyer')
        event_link = event.get('link')

        # In this example, we do not extract a date/time.
        # Use the current datetime as a placeholder.
        start = datetime.now()

        # Use the title as the bands string (or apply further parsing as needed)
        bands_str = event_title if event_title else "Unknown Event"

        try:
            show_id, was_inserted = insert_show(
                conn, cursor, venue_id, bands_str, start, event_link, flyer_image
            )
            if was_inserted:
                added_count += 1
                added_shows.append(show_id)
                print(f"Inserted event: {bands_str} at {start}")
            else:
                duplicate_count += 1
                print(f"Duplicate event skipped: {bands_str} at {start}")
        except Exception as e:
            error_msg = f"Error processing event '{event_title}': {e}"
            print(error_msg)
            errors.append(error_msg)
            conn.rollback()
            continue

    conn.commit()
    cursor.close()
    conn.close()

    # Return the log details
    return {
        'scraper_name': 'aster_cafe',
        'added_count': added_count,
        'duplicate_count': duplicate_count,
        'added_shows': added_shows,
        'errors': errors,
    }

if __name__ == "__main__":
    log = run_aster_cafe_scraper()
    print("Scraper Log:", log)