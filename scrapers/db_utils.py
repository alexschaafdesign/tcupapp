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
    Insert or update a show, and print whether it was newly inserted or updated.
    If updated, print what changed.
    """
    # 1) Fetch the old row if it exists (based on your unique constraint).
    old_row = None
    try:
        cursor.execute(
            """
            SELECT id, bands, event_link, flyer_image
              FROM shows
             WHERE venue_id = %s
               AND start = %s
            """,
            (venue_id, start)
        )
        old_row = cursor.fetchone()  # Could be None if no matching row
    except Exception as e:
        print(f"[DEBUG] Could not fetch old row: {e}")

    try:
        # 2) Perform the UPSERT
        insert_query = """
            INSERT INTO shows (venue_id, bands, start, event_link, flyer_image)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT ON CONSTRAINT unique_show DO UPDATE
            SET
                bands = EXCLUDED.bands,
                event_link = EXCLUDED.event_link,
                flyer_image = CASE
                    WHEN shows.flyer_image IS NULL OR shows.flyer_image = ''
                         THEN EXCLUDED.flyer_image
                    ELSE shows.flyer_image
                END
            RETURNING id, xmax = 0 AS was_inserted;
        """
        cursor.execute(insert_query, (venue_id, bands, start, event_link, flyer_image))
        conn.commit()

        result = cursor.fetchone()
        show_id = result[0]
        was_inserted = result[1]  # True if INSERT, False if an UPDATE

        # 3) If newly inserted, log it and return
        if was_inserted:
            print(f"[INSERT] New show with ID={show_id}")
            return show_id, True

        # 4) Otherwise, it was an UPDATE or no-op. Let's see if anything changed.
        #    Re-fetch the current row for comparison:
        cursor.execute(
            "SELECT id, bands, event_link, flyer_image FROM shows WHERE id = %s",
            (show_id,)
        )
        new_row = cursor.fetchone()

        if old_row is None:
            # This would be unusual if we have a unique constraint on (venue_id, start).
            # Possibly the row was created in the same transaction by something else.
            print(f"[UPDATE] Show ID={show_id} updated, but old row wasn't found before UPSERT.")
            return show_id, False

        # old_row and new_row are both tuples: (id, bands, event_link, flyer_image)
        changes = []

        # Compare BANDS
        if old_row[1] != new_row[1]:
            changes.append(
                f"bands: '{old_row[1]}' -> '{new_row[1]}'"
            )

        # Compare EVENT_LINK
        if old_row[2] != new_row[2]:
            changes.append(
                f"event_link: '{old_row[2]}' -> '{new_row[2]}'"
            )

        # Compare FLYER_IMAGE
        if old_row[3] != new_row[3]:
            changes.append(
                f"flyer_image: '{old_row[3]}' -> '{new_row[3]}'"
            )

        if changes:
            print(f"[UPDATE] Show ID={show_id} updated. Changes: {', '.join(changes)}")
     #   else:
     #       print(f"[NO CHANGE] Show ID={show_id} was already up to date.")

        return show_id, False

    except Exception as e:
        print(f"Error inserting or updating show: {e}")
        print(f"Query parameters: venue_id={venue_id}, bands={bands}, "
              f"start={start}, event_link={event_link}, flyer_image={flyer_image}")
        conn.rollback()
        raise