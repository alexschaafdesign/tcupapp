import psycopg2
import json
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

# Load the correct environment file
env_path = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / '.env.development'
load_dotenv(dotenv_path=env_path)

# Default image URL to use when none is provided
DEFAULT_IMAGE_URL = "https://www.example.com/default-show-image.jpg"

def connect_to_db():
    """Establish a connection to the database."""
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
        )
        
        # Set the search path to the development schema
        with conn.cursor() as cur:
            cur.execute("SET search_path TO development, public")
        
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        print(f"Connection parameters: dbname={os.getenv('DB_NAME')}, user={os.getenv('DB_USER')}, host={os.getenv('DB_HOST')}, port={os.getenv('DB_PORT')}")
        raise e

def get_venue_id(cursor, venue_name):
    """Fetch the venue_id for a given venue name."""
    try:
        # Query with explicit schema
        cursor.execute("SELECT id FROM development.venues WHERE venue = %s", (venue_name,))
        venue_row = cursor.fetchone()
        
        if not venue_row:
            raise ValueError(f"Venue '{venue_name}' not found in the venues table.")
        
        return venue_row[0]
    except Exception as e:
        print(f"Error in get_venue_id: {e}")
        raise e


def insert_show(conn, cursor, venue_id, bands, start, event_link, flyer_image, log_fn=None):
    """
    Insert or update a show in the database.
    Returns: (show_id, status)
    where status is: "added", "updated", or "duplicate".
    This version respects the manual_override flag: if manual_override is true,
    any changes are skipped.
    """
    # Default logger
    logger = log_fn if callable(log_fn) else lambda msg: print(msg, file=sys.stderr)
    
    # Set default image if none provided
    flyer_image = flyer_image or "https://example.com/default.jpg"
    
    try:
        # Debug logging
        logger(f"[DEBUG] Processing show with venue_id={venue_id}, bands='{bands}', start={start}")
        
        # First check if the show exists, along with its manual_override status
        check_query = """
        SELECT id, bands, event_link, flyer_image, manual_override 
        FROM development.shows 
        WHERE venue_id = %s AND start = %s
        """
        cursor.execute(check_query, (venue_id, start))
        existing = cursor.fetchone()
        
        if existing:
            existing_id, existing_bands, existing_link, existing_image, manual_override = existing
            
            # If manual_override is true, do not update the record.
            if manual_override:
                logger(f"[DB SKIP - Manual Override] Show ID={existing_id} is manually overridden. Skipping update.")
                return existing_id, "duplicate"
            
            # Determine if an update is needed
            needs_update = False
            band_update = existing_bands
            # If new bands are not already present, update them.
            if bands not in existing_bands:
                band_update = existing_bands + ", " + bands if existing_bands else bands
                needs_update = True
            
            # Determine if event link or flyer image need updating
            link_update = event_link if event_link and event_link != existing_link else existing_link
            needs_update = needs_update or (link_update != existing_link)
            
            image_update = flyer_image if flyer_image and flyer_image != existing_image else existing_image
            needs_update = needs_update or (image_update != existing_image)
            
            if needs_update:
                # Update the existing show while setting manual_override to false
                update_query = """
                UPDATE development.shows
                SET bands = %s,
                    event_link = %s,
                    flyer_image = %s,
                    updated_at = CURRENT_TIMESTAMP,
                    manual_override = false
                WHERE id = %s
                RETURNING id
                """
                
                cursor.execute(update_query, (band_update, link_update, image_update, existing_id))
                show_id = cursor.fetchone()[0]
                logger(f"[DB UPDATE] Updated show ID={show_id} for '{bands}' at {start}")
                conn.commit()
                return show_id, "updated"
            else:
                logger(f"[DB SKIP] Duplicate show ID={existing_id} for '{bands}' at {start} (no changes needed)")
                return existing_id, "duplicate"
                
        else:
            # No existing record: insert new show with manual_override set to false
            insert_query = """
            INSERT INTO development.shows (venue_id, bands, start, event_link, flyer_image, manual_override)
            VALUES (%s, %s, %s, %s, %s, false)
            RETURNING id
            """
            
            cursor.execute(insert_query, (venue_id, bands, start, event_link, flyer_image))
            show_id = cursor.fetchone()[0]
            logger(f"[DB INSERT] New show ID={show_id} for '{bands}' at {start}")
            conn.commit()
            return show_id, "added"
        
    except Exception as e:
        error_msg = f"[DB ERROR] processing show '{bands}' on {start}: {e}"
        logger(error_msg)
        try:
            conn.rollback()
            logger("[DB ROLLBACK] Transaction rolled back.")
        except Exception as rb_e:
            logger(f"[DB ROLLBACK ERROR] Failed to rollback transaction: {rb_e}")
        raise e