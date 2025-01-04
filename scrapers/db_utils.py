import psycopg2
import json

# Database connection parameters
DB_NAME = "tcup_db"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

def connect_to_db():
    """Establish a connection to the database."""
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST
    )

def get_venue_id(cursor, venue_name):
    """Fetch the venue_id for a given venue name."""
    cursor.execute("SELECT id FROM venues WHERE venue = %s", (venue_name,))
    venue_row = cursor.fetchone()
    if not venue_row:
        raise ValueError(f"Venue '{venue_name}' not found in the venues table.")
    return venue_row[0]

def insert_show(conn, cursor, venue_id, bands, start, event_link, flyer_image):
    """
    Insert or update a show and return whether it was newly inserted or modified.
    """
    try:
        insert_query = """
            INSERT INTO shows (venue_id, bands, start, event_link, flyer_image)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT ON CONSTRAINT unique_show DO UPDATE
            SET
                bands = EXCLUDED.bands,
                event_link = EXCLUDED.event_link,
                flyer_image = CASE
                    WHEN shows.flyer_image IS NULL OR shows.flyer_image = '' THEN EXCLUDED.flyer_image
                    ELSE shows.flyer_image
                END
            RETURNING id, xmax = 0 AS was_inserted;
        """
      #  print(f"Executing query with values: venue_id={venue_id}, bands={bands}, start={start}, event_link={event_link}, flyer_image={flyer_image}")
        cursor.execute(insert_query, (venue_id, bands, start, event_link, flyer_image))
        conn.commit()
        result = cursor.fetchone()
        show_id = result[0]
        was_inserted = result[1]
        return show_id, was_inserted
    except Exception as e:
        print(f"Error inserting or updating show: {e}")
        print(f"Query parameters: venue_id={venue_id}, bands={bands}, start={start}, event_link={event_link}, flyer_image={flyer_image}")
        conn.rollback()
        raise