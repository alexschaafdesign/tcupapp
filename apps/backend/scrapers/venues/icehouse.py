# icehouse.py

import re
import json
import sys
import traceback
import requests
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common import TimeoutException # Added
from selenium.webdriver.support.ui import WebDriverWait # Added

# --- Import Real db_utils ---
try:
    from backend.scrapers.utils.db_utils import connect_to_db, get_venue_id, insert_show
except ImportError:
    sys.stderr.write("ERROR: Failed to import from db_utils. Make sure db_utils.py is accessible.\n")
    # Define dummy functions to prevent NameError if import fails, allowing script to exit gracefully
    def connect_to_db(): raise ImportError("db_utils not found")
    def get_venue_id(c, v): raise ImportError("db_utils not found")
    def insert_show(co, cu, v, b, s, e, f, log_fn=None): raise ImportError("db_utils not found")
# --- End Import ---


VENUE_URL = "https://icehouse.turntabletickets.com/"
DEFAULT_IMAGE_URL = "https://assets-prod.turntabletickets.com/media/icehouse/default.jpg"
API_BASE = "https://api.turntabletickets.com/web/performances" # Kept for reference

def log(msg, output):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    # sys.stderr.write(f"[{timestamp}] {msg}\n") # Optional: uncomment for live stderr debugging
    output.append(f"[{timestamp}] {msg}")

# fetch_selenium_performances (Use the version from the previous response with WebDriverWait)
def fetch_selenium_performances(log_fn):
    """Fetches performances using Selenium."""
    log_fn("Attempting Selenium scrape...")
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

    driver = None
    try:
        # Ensure chromedriver is in PATH or specify path
        driver = webdriver.Chrome(options=options)
        driver.get(VENUE_URL)

        # --- Use EXPLICIT WAIT ---
        wait_time = 15 # seconds
        log_fn(f"Waiting up to {wait_time}s for __tt_preload.performances to be populated...")
        try:
            WebDriverWait(driver, wait_time).until(
                lambda d: d.execute_script("return window.__tt_preload && window.__tt_preload.performances && window.__tt_preload.performances.length > 0")
            )
            log_fn("Condition met: __tt_preload.performances seems populated.")
        except TimeoutException:
            log_fn(f"Timed out waiting for __tt_preload.performances after {wait_time}s. Trying to get data anyway or it might be empty.")
        except Exception as e:
            log_fn(f"Error during explicit wait: {e}")

        script = "return window.__tt_preload?.performances || []"
        log_fn(f"Executing script: {script}")
        data = driver.execute_script(script)

        if data is None: data = []
        elif not isinstance(data, list):
             log_fn(f"Selenium script returned non-list type: {type(data)}. Forcing empty list.")
             data = []

        log_fn(f"Selenium scrape found {len(data)} raw performance objects.")
        return data
    except Exception as e:
        log_fn(f"Selenium failed: {e}")
        log_fn(f"Traceback: {traceback.format_exc()}")
        return []
    finally:
         if driver:
             try:
                 log_fn("Quitting Selenium driver...")
                 driver.quit()
             except Exception as e:
                 log_fn(f"Error quitting Selenium driver: {e}")

# parse_show_datetime, extract_bands, extract_image, extract_event_link remain the same as before
# Make sure parse_show_datetime uses log_fn for its internal logging
def parse_show_datetime(perf, log_fn):
    """Parses the performance datetime string."""
    raw = perf.get("datetime")
    if not raw:
        # log_fn("Skipping performance due to missing 'datetime' field.") # Logging done in process_performances
        return None
    try:
        dt_utc = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        # Central Time (America/Chicago) Offset - Use pytz/dateutil for accuracy if needed
        # Current time is: Tuesday, April 1, 2025 at 5:41:50 PM CDT -> DST is active (UTC-5)
        is_dst = True # Simple assumption based on current date, improve if needed
        offset_hours = 5 if is_dst else 6
        local_dt = dt_utc - timedelta(hours=offset_hours)
        return local_dt.replace(tzinfo=None)
    except ValueError:
        log_fn(f"Could not parse datetime string: {raw}")
    except Exception as e:
        log_fn(f"Error parsing datetime {raw}: {e}")
    return None

def extract_bands(name):
    if not name: return []
    name = re.sub(r"^(?:Presents:|An Evening With|Brunch with)\s+", "", name, flags=re.IGNORECASE).strip()
    name = re.sub(r"\s+(?:Presents| Residency)$", "", name, flags=re.IGNORECASE).strip()
    delimiters = r'\s*(?:w/|and|\+|&|with|feat\.|featuring)\s+'
    bands = [b.strip() for b in re.split(delimiters, name, flags=re.IGNORECASE) if b.strip()]
    return bands

def extract_image(perf):
    srcset = perf.get("show", {}).get("srcset", {})
    if isinstance(srcset, dict):
      for key in ["original", "rectLg", "sqLg", "rectMd", "sqMd", "rectSm", "sqSm"]:
          if key in srcset and isinstance(srcset[key], dict) and srcset[key].get("src"):
              return srcset[key]["src"]
    top_image = perf.get("show", {}).get("image")
    if top_image: return top_image
    return DEFAULT_IMAGE_URL

def extract_event_link(perf):
    show_uri = perf.get("show", {}).get("uri")
    perf_uri = perf.get("uri")
    uri = show_uri or perf_uri
    if uri:
        if not uri.startswith('/'): uri = '/' + uri
        return f"{VENUE_URL.rstrip('/')}{uri}"
    return VENUE_URL

# --- REVISED process_performances ---
def process_performances(performances, venue_id, cursor, conn, log_fn):
    """
    Processes performances using insert_show from db_utils.
    """
    added_count, skipped_count, updated_count = 0, 0, 0 # Use updated_count instead of duped
    added_ids = []
    processed_signatures = set() # Still useful for skipping duplicates within the *batch*

    if not performances:
        log_fn("No performances received for processing.")
        return added_count, skipped_count, updated_count, added_ids

    log_fn(f"Processing {len(performances)} potential shows...")

    for i, perf in enumerate(performances):
        name = perf.get("show", {}).get("name")
        if not name:
            log_fn(f"Skipping performance #{i+1} due to missing show name.")
            skipped_count += 1
            continue

        bands = extract_bands(name)
        if not bands:
             log_fn(f"Skipping performance '{name}' (#{i+1}) as no bands were extracted.")
             skipped_count += 1
             continue

        dt = parse_show_datetime(perf, log_fn)
        if not dt:
            log_fn(f"Skipping performance '{name}' (#{i+1}) due to invalid/missing datetime.")
            skipped_count += 1
            continue

        # Create signature for batch duplicate check (optional but good)
        # Use date() for checking duplicates on the same day, regardless of time changes
        show_signature = (venue_id, tuple(sorted(bands)), dt.date())
        if show_signature in processed_signatures:
            log_fn(f"Skipping '{name}' on {dt.date()} as duplicate within this batch.")
            # Don't count batch duplicates towards final DB duplicate/update count yet
            continue
        processed_signatures.add(show_signature)

        image = extract_image(perf)
        link = extract_event_link(perf)
        band_str = ", ".join(bands)

        try:
            # Call the unified insert/update function from db_utils
            show_id, was_inserted = insert_show(
                conn, cursor, venue_id, band_str, dt, link, image, log_fn=log_fn
            )

            # Update counts based on the result
            if was_inserted:
                added_count += 1
                added_ids.append(show_id)
            else:
                # Existing show was potentially updated or found identical
                updated_count += 1

        except Exception as e:
            # Log errors raised from insert_show (which should have already logged details)
            log_fn(f"Failed to process show '{band_str}' on {dt}: {e} (Error likely logged previously by db_utils)")
            # log_fn(traceback.format_exc()) # Optionally log traceback here too
            skipped_count += 1
            # No rollback needed here, insert_show handles its own rollback on error

    log_fn(f"Finished processing batch. Added: {added_count}, Updated/Existing: {updated_count}, Skipped: {skipped_count}")
    # Renaming 'duped' to 'updated' count might be clearer if using ON CONFLICT DO UPDATE
    return added_count, skipped_count, updated_count, added_ids


# --- REVISED run_icehouse_scraper ---
def run_icehouse_scraper():
    """Main function to run the Icehouse scraper using Selenium and real DB utils."""
    output_log = []
    log_fn = lambda msg: log(msg, output_log)
    result = {
        "scraper_name": "icehouse",
        "added_count": 0,
        "duplicate_count": 0, # Keep this key for consistency, will represent updated/existing
        "skipped_count": 0,
        "added_shows": [],
        "errors": [],
        "stdout": ""
    }

    conn = None # Define conn and cursor outside try block for finally clause
    cursor = None

    try:
        log_fn("Starting Icehouse scraper (Selenium Only Mode)...")
        performances = fetch_selenium_performances(log_fn)

        if not performances:
            log_fn("No shows found via Selenium method.")
            # No need to error out, just proceed to close DB if open & return 0 counts
        else:
            log_fn(f"Found {len(performances)} performance objects to process.")

        # --- Database Operations ---
        try:
            log_fn("Connecting to database...")
            conn = connect_to_db() # Uses real db_utils now
            cursor = conn.cursor()
            venue_id = get_venue_id(cursor, "Icehouse") # Uses real db_utils now
            log_fn(f"Connected to DB. Venue ID for Icehouse: {venue_id}")

            if performances:
                 # Pass real conn, cursor to process_performances
                 added, skipped, updated, added_ids = process_performances(
                     performances, venue_id, cursor, conn, log_fn
                 )
                 result["added_count"] = added
                 result["skipped_count"] = skipped
                 result["duplicate_count"] = updated # Assign updated count to duplicate_count key
                 result["added_shows"] = added_ids
            else:
                 log_fn("Skipping database processing as no shows were found.")

        except ImportError:
            # Handle case where db_utils failed to import
             error_msg = "Database processing skipped: db_utils could not be imported."
             log_fn(error_msg)
             result["errors"].append(error_msg)
        except Exception as e:
             # Catch errors from connect_to_db, get_venue_id, or process_performances
             error_msg = f"Database error during connection or processing: {e}"
             log_fn(error_msg)
             log_fn(f"Traceback: {traceback.format_exc()}") # Log traceback for DB errors
             result["errors"].append(error_msg)
             # No rollback needed here if commit/rollback is handled per show in insert_show

    except Exception as e:
         # Catch-all for unexpected errors (e.g., Selenium setup, etc.)
         error_msg = f"FATAL: Unhandled exception in run_icehouse_scraper: {e}"
         log_fn(error_msg)
         log_fn(f"Traceback: {traceback.format_exc()}")
         result["errors"].append(error_msg)

    finally:
        # --- Ensure DB resources are always closed ---
        if cursor:
            try: cursor.close()
            except Exception as e: log_fn(f"Error closing cursor: {e}")
        if conn:
            try: conn.close()
            except Exception as e: log_fn(f"Error closing connection: {e}")
        log_fn("Database connection closed (if opened).")

        # Populate stdout and return
        result["stdout"] = "\n".join(output_log)
        return result


if __name__ == "__main__":
    # Ensure required libraries are installed
    try:
        import psycopg2
        import dotenv
    except ImportError as e:
         sys.stderr.write(f"ERROR: Missing required library. Please install psycopg2-binary and python-dotenv.\n{e}\n")
         # Output a minimal JSON error message
         print(json.dumps({
             "scraper_name": "icehouse", "errors": [f"Missing library: {e}"], "stdout": f"ERROR: Missing library: {e}"
         }, indent=2))
         sys.exit(1) # Exit with error code

    final_result = run_icehouse_scraper()
    print(json.dumps(final_result, indent=2))