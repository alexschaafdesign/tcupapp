"""
Database utility functions for scrapers.
"""

import os
import logging
import psycopg2
from datetime import datetime
from typing import Tuple, Optional, Dict, Any, Callable

# Set up logging
logger = logging.getLogger('db_utils')

def connect_to_db():
    """
    Connect to the PostgreSQL database using environment variables.
    
    Returns:
        PostgreSQL connection object
    """
    # Get database connection parameters from environment variables
    # with fallbacks to default development values
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '5432')
    db_name = os.environ.get('DB_NAME', 'tcup_db')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'postgres')
    db_schema = os.environ.get('DB_SCHEMA', 'public')
    
    # Log connection attempt (without password)
    logger.info(f"Connecting to database: {db_name} on {db_host}:{db_port} as {db_user} (schema: {db_schema})")
    
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password
        )
        
        # Set the search path to use the specified schema
        with conn.cursor() as cursor:
            cursor.execute(f"SET search_path TO {db_schema}")
            conn.commit()
            
        logger.info("Database connection successful")
        return conn
        
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

def get_venue_id(cursor, venue_name: str) -> int:
    """
    Get venue ID from the database. 
    
    Args:
        cursor: Database cursor
        venue_name: Name of the venue
        
    Returns:
        Venue ID as integer
        
    Raises:
        ValueError: If venue is not found
    """
    try:
        # Query for the venue by name using the 'venue' column
        logger.info(f"Looking for venue '{venue_name}' in the 'venue' column")
        cursor.execute("SELECT id FROM venues WHERE venue ILIKE %s", (venue_name,))
        result = cursor.fetchone()
        
        if result:
            venue_id = result[0]
            logger.info(f"Found venue '{venue_name}' with ID {venue_id}")
            return venue_id
        else:
            # Try with a more flexible search in case the exact name doesn't match
            cursor.execute("SELECT id FROM venues WHERE venue ILIKE %s", (f"%{venue_name}%",))
            result = cursor.fetchone()
            
            if result:
                venue_id = result[0]
                logger.info(f"Found venue containing '{venue_name}' with ID {venue_id}")
                return venue_id
            else:
                # If still not found, list available venues to help troubleshoot
                cursor.execute("SELECT id, venue FROM venues LIMIT 10")
                available_venues = cursor.fetchall()
                venue_list = ", ".join([f"'{row[1]}' (ID: {row[0]})" for row in available_venues])
                logger.info(f"Available venues (first 10): {venue_list}")
                
                raise ValueError(f"Venue '{venue_name}' not found in database")
            
    except Exception as e:
        logger.error(f"Error getting venue ID: {e}")
        raise

def insert_show(conn, cursor, venue_id: int, bands: str, start_time: datetime,
                event_url: str = "", flyer_image: str = "") -> Tuple[int, str]:
    """
    Insert a show into the database or update if it already exists.
    Includes detailed logging for debugging update vs duplicate logic.

    Args:
        conn: Database connection
        cursor: Database cursor
        venue_id: ID of the venue
        bands: String with band names
        start_time: Show start time (maps to 'start' column)
        event_url: URL for the event page (maps to 'event_link' column)
        flyer_image: URL for the event flyer image (maps to 'flyer_image' column)

    Returns:
        Tuple of (show ID, status) where status is one of:
        - "added": A new show was added
        - "updated": An existing show was updated
        - "duplicate": The show already exists and was not changed
    """
    # --- Log Input Parameters ---
    logger.info(f"[insert_show] Called with: venue_id={venue_id}, start_time={start_time}")
    logger.info(f"[insert_show]   bands={repr(bands)}") # Use repr to see details
    logger.info(f"[insert_show]   event_url={repr(event_url)}")
    logger.info(f"[insert_show]   flyer_image={repr(flyer_image)}")
    # --- End Log ---

    try: # Wrap core logic in try/except for robustness
        # Check if show already exists at this venue and time (regardless of bands)
        cursor.execute(
            "SELECT id, bands FROM shows WHERE venue_id = %s AND start = %s AND is_deleted = FALSE",
            (venue_id, start_time)
        )
        existing_show = cursor.fetchone()

        if existing_show:
            # Show exists, check if we need to update it
            show_id = existing_show[0]
            current_bands_db = existing_show[1] # Raw value from DB
            logger.info(f"[insert_show] Show exists with ID {show_id}. Checking for updates.")
            logger.info(f"[insert_show]   Current Bands from DB: {repr(current_bands_db)}")

            # Get current link/image values to compare
            cursor.execute(
                "SELECT event_link, flyer_image FROM shows WHERE id = %s",
                (show_id,)
            )
            current_values = cursor.fetchone()
            current_link_db_raw = current_values[0] if current_values else None
            current_image_db_raw = current_values[1] if current_values else None

            # Normalize None from DB to empty string "" for comparison purposes
            current_link_db_norm = current_link_db_raw if current_link_db_raw is not None else ""
            current_image_db_norm = current_image_db_raw if current_image_db_raw is not None else ""

            logger.info(f"[insert_show]   Current Event Link from DB (Raw): {repr(current_link_db_raw)}")
            logger.info(f"[insert_show]   Current Flyer Image from DB (Raw): {repr(current_image_db_raw)}")
            logger.info(f"[insert_show]   Normalized DB Link for comparison: {repr(current_link_db_norm)}")
            logger.info(f"[insert_show]   Normalized DB Image for comparison: {repr(current_image_db_norm)}")


            # Check if anything needs to be updated
            update_fields = []
            update_values = []
            needs_update = False # Flag to track if any difference is found

            # --- Compare Bands ---
            logger.info(f"[insert_show] Comparing bands: Scraped={repr(bands)} vs DB={repr(current_bands_db)}")
            if bands != current_bands_db:
                logger.warning(f"[insert_show] ---> Bands DIFFER <---") # Highlight difference
                needs_update = True
                update_fields.append("bands = %s")
                update_values.append(bands)
            else:
                 logger.info(f"[insert_show] Bands MATCH.")
            # --- End Compare Bands ---

            # --- Compare Event Link ---
            # Normalize scraped URL for comparison (treat None/empty as "")
            scraped_link_norm = event_url if event_url else ""
            logger.info(f"[insert_show] Comparing event_link: Scraped (Normalized)={repr(scraped_link_norm)} vs DB (Normalized)={repr(current_link_db_norm)}")
            if scraped_link_norm != current_link_db_norm:
                logger.warning(f"[insert_show] ---> Event Link DIFFER <---") # Highlight difference
                needs_update = True
                update_fields.append("event_link = %s")
                # Store the normalized version to keep DB consistent (or store original event_url if preferred)
                update_values.append(scraped_link_norm)
            else:
                logger.info(f"[insert_show] Event Links MATCH.")
            # --- End Compare Event Link ---

            # --- Compare Flyer Image ---
            # Normalize scraped image for comparison (treat None/empty as "")
            scraped_image_norm = flyer_image if flyer_image else ""
            logger.info(f"[insert_show] Comparing flyer_image: Scraped (Normalized)={repr(scraped_image_norm)} vs DB (Normalized)={repr(current_image_db_norm)}")
            if scraped_image_norm != current_image_db_norm:
                logger.warning(f"[insert_show] ---> Flyer Image DIFFER <---") # Highlight difference
                needs_update = True
                update_fields.append("flyer_image = %s")
                # Store the normalized version
                update_values.append(scraped_image_norm)
            else:
                 logger.info(f"[insert_show] Flyer Images MATCH.")
            # --- End Compare Flyer Image ---

            # Check if any differences were flagged
            if needs_update: # Use the flag instead of checking update_fields list length
                if not update_fields:
                     # This case should ideally not happen if needs_update is true, but log if it does
                     logger.error(f"[insert_show] needs_update is True but update_fields is empty for show ID {show_id}. Returning duplicate.")
                     return show_id, "duplicate"

                # Perform the update
                update_query = f"UPDATE shows SET {', '.join(update_fields)}, updated_at = NOW() WHERE id = %s" # Also update updated_at
                final_update_values = update_values + [show_id]
                logger.info(f"[insert_show] Executing update for show ID {show_id}: Query: {cursor.mogrify(update_query, final_update_values).decode('utf-8')}") # Log exact query
                cursor.execute(update_query, final_update_values)
                logger.info(f"[insert_show] Update successful for show ID {show_id}. Returning 'updated'.")
                return show_id, "updated"

            # No differences found
            logger.info(f"[insert_show] No changes detected for show ID {show_id}. Returning 'duplicate'.")
            return show_id, "duplicate"
        else:
            # Insert new show
            logger.info(f"[insert_show] Show does not exist. Creating new record for bands: {repr(bands)}")
            # Normalize URL/Image before inserting
            insert_link = event_url if event_url else ""
            insert_image = flyer_image if flyer_image else ""
            insert_query = """
                INSERT INTO shows
                (venue_id, bands, start, event_link, flyer_image, is_deleted, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            """
            insert_values = (venue_id, bands, start_time, insert_link, insert_image, False)
            logger.info(f"[insert_show] Running insert: {cursor.mogrify(insert_query, insert_values).decode('utf-8')}") # Log exact query
            cursor.execute(insert_query, insert_values)
            show_id = cursor.fetchone()[0]
            logger.info(f"[insert_show] Inserted new show with ID {show_id}. Returning 'added'.")
            return show_id, "added"

    except Exception as e:
        logger.exception(f"[insert_show] EXCEPTION occurred: {e}") # Use logger.exception to include traceback
        # Attempt to rollback before re-raising or returning error
        try:
            conn.rollback()
            logger.info("[insert_show] Transaction rolled back due to exception.")
        except Exception as rb_e:
            logger.error(f"[insert_show] Error during rollback: {rb_e}")
        # Re-raise the exception so the calling function knows something went wrong
        raise e 