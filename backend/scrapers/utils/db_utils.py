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
    logger.info(f"Attempting to insert/update show: {bands} at venue {venue_id} on {start_time}")
    
    # Check if show already exists at this venue and time (regardless of bands)
    cursor.execute(
        "SELECT id, bands FROM shows WHERE venue_id = %s AND start = %s AND is_deleted = FALSE",
        (venue_id, start_time)
    )
    existing_show = cursor.fetchone()
    
    if existing_show:
        # Show exists, check if we need to update it
        show_id = existing_show[0]
        current_bands = existing_show[1]
        logger.info(f"Show already exists with ID {show_id}, checking for updates")
        
        # Get current values to compare
        cursor.execute(
            "SELECT event_link, flyer_image FROM shows WHERE id = %s",
            (show_id,)
        )
        current_values = cursor.fetchone()
        current_link = current_values[0] if current_values[0] is not None else ""
        current_image = current_values[1] if current_values[1] is not None else ""
        
        # Check if anything needs to be updated
        update_fields = []
        update_values = []
        
        # Always check if bands have changed
        if bands != current_bands:
            update_fields.append("bands = %s")
            update_values.append(bands)
            
        if event_url and event_url != current_link:
            update_fields.append("event_link = %s")
            update_values.append(event_url)
            
        if flyer_image and flyer_image != current_image:
            update_fields.append("flyer_image = %s")
            update_values.append(flyer_image)
            
        if update_fields:
            update_query = f"UPDATE shows SET {', '.join(update_fields)} WHERE id = %s"
            logger.info(f"Updating show: {update_query}")
            cursor.execute(update_query, update_values + [show_id])
            return show_id, "updated"
        
        logger.info(f"No changes needed for show ID {show_id}")
        return show_id, "duplicate"
    else:
        # Insert new show
        logger.info("Show does not exist, creating new record")
        insert_query = """
            INSERT INTO shows 
            (venue_id, bands, start, event_link, flyer_image, is_deleted) 
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        logger.info(f"Running insert: {insert_query}")
        cursor.execute(
            insert_query,
            (venue_id, bands, start_time, event_url, flyer_image, False)
        )
        show_id = cursor.fetchone()[0]
        logger.info(f"Inserted new show with ID: {show_id}")
        return show_id, "added"