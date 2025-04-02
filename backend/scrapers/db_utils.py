import psycopg2
import json
from dotenv import load_dotenv
import os
from pathlib import Path

# Load the correct environment file
env_path = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / '.env.development'
load_dotenv(dotenv_path=env_path)

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
        raise

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
        raise

# --- MODIFIED insert_show ---
def insert_show(conn, cursor, venue_id, bands, start, event_link, flyer_image, log_fn=None):
    """
    Insert or update a show in the database.
    Accepts an optional log_fn for logging messages.
    Returns the show ID and a boolean indicating if it was newly inserted.
    """
    # Default logger if none provided (prints to stderr to avoid polluting stdout)
    logger = log_fn if callable(log_fn) else lambda msg: print(msg, file=sys.stderr)

    try:
        # Ensure flyer_image is not None before inserting (DB might not allow NULL)
        flyer_image = flyer_image or DEFAULT_IMAGE_URL # Use default if None/empty

        # Simple insert with ON CONFLICT handling
        # Ensure 'unique_show' constraint exists, e.g., on (venue_id, start, bands) or similar
        query = """
        INSERT INTO development.shows (venue_id, bands, start, event_link, flyer_image)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT ON CONSTRAINT unique_show -- Adjust constraint name if different
        DO UPDATE SET
            bands = EXCLUDED.bands,
            event_link = EXCLUDED.event_link,
            flyer_image = CASE
                WHEN development.shows.flyer_image IS NULL
                    OR development.shows.flyer_image = ''
                    OR development.shows.flyer_image LIKE '%example.com%' -- Placeholder check
                    OR development.shows.flyer_image LIKE '%default%'     -- Placeholder check
                    OR (NOT development.shows.flyer_image LIKE 'http%') -- Basic URL check
                    OR (development.shows.flyer_image NOT LIKE '%.jpg%'  -- Extension check
                       AND development.shows.flyer_image NOT LIKE '%.png%'
                       AND development.shows.flyer_image NOT LIKE '%.jpeg%' -- Add jpeg
                       AND development.shows.flyer_image NOT LIKE '%.webp%')
                THEN EXCLUDED.flyer_image -- Update if current image seems invalid/default
                ELSE development.shows.flyer_image -- Keep existing valid image otherwise
            END,
            updated_at = CURRENT_TIMESTAMP -- Add an updated_at timestamp if table has one
        RETURNING id, (xmax = 0) AS was_inserted
        """

        # Execute the query
        cursor.execute(query, (venue_id, bands, start, event_link, flyer_image))

        # Get result
        result = cursor.fetchone()

        if not result:
            # This shouldn't happen with RETURNING if the insert/update worked
            raise ValueError("Insert/Update operation returned no result (id, was_inserted).")

        show_id, was_inserted = result

        # Log the action using the provided logger
        if was_inserted:
            logger(f"[DB INSERT] New show ID={show_id} for '{bands}' at {start.strftime('%Y-%m-%d %H:%M')}")
        else:
            # Optional: Fetch old values ONLY if needed for detailed update logging
            # This adds an extra query, potentially slowing things down.
            # Consider logging just the update fact unless details are crucial.
            logger(f"[DB UPDATE] Existing show ID={show_id} for '{bands}' at {start.strftime('%Y-%m-%d %H:%M')} (data potentially updated)")
            # Detailed update logging (comment out if not needed)
            # cursor.execute("SELECT bands, event_link, flyer_image FROM development.shows WHERE id = %s", (show_id,))
            # old_data = cursor.fetchone() # Fetch immediately after update if needed
            # ... (rest of detailed comparison logic using logger) ...

        # Commit the transaction *after* successful operation
        conn.commit()

        return show_id, was_inserted

    except Exception as e:
        # Log error using the provided logger (or stderr) and roll back
        error_msg = f"[DB ERROR] inserting/updating show '{bands}' on {start}: {e}"
        logger(error_msg)
        try:
            conn.rollback()
            logger("[DB ROLLBACK] Transaction rolled back.")
        except Exception as rb_e:
             logger(f"[DB ROLLBACK ERROR] Failed to rollback transaction: {rb_e}")
        raise # Re-raise the exception so the caller (process_performances) knows it failed