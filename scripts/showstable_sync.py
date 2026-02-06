import psycopg2
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='/Users/musicdaddy/Desktop/venues/backend/.env.development')

# Create connections for both local and production
local_conn = psycopg2.connect(
    dbname=os.getenv("LOCAL_DB_NAME"),
    user=os.getenv("LOCAL_DB_USER"),
    password=os.getenv("LOCAL_DB_PASSWORD"),
    host=os.getenv("LOCAL_DB_HOST"),
    port=int(os.getenv("LOCAL_DB_PORT")),
)

prod_conn = psycopg2.connect(
    dbname=os.getenv("PROD_DB_NAME"),
    user=os.getenv("PROD_DB_USER"),
    password=os.getenv("PROD_DB_PASSWORD"),
    host=os.getenv("PROD_DB_HOST"),
    port=int(os.getenv("PROD_DB_PORT")),
    sslmode="require",
)

print(f"Environment: {os.getenv('ENV')}")
print(f"Local Connection: {local_conn}")
print(f"Production Connection: {prod_conn}")

def fetch_new_records(local_cursor, table_name, batch_size=100):
    """
    Fetch all records from the local database in batches using OFFSET.
    """
    offset = 0
    while True:
        query = f"""
        SELECT * FROM {table_name}
        LIMIT {batch_size} OFFSET {offset}
        """
        local_cursor.execute(query)
        rows = local_cursor.fetchall()
        if not rows:
            break
        print(f"Fetched {len(rows)} rows starting at offset {offset}.")
        yield rows, [desc[0] for desc in local_cursor.description]
        offset += batch_size

def sync_table(table_name):
    print(f"Syncing table: {table_name}")
    local_cursor = local_conn.cursor()
    prod_cursor = prod_conn.cursor()

    if table_name == "shows":
        conflict_columns = ["venue_id", "start"]
        exclude_columns = ["venue_id", "start", "created_at"]
    elif table_name == "venues":
        conflict_columns = ["id"]  # Use id as the conflict column
        exclude_columns = ["created_at"]
    else:
        raise ValueError(f"Unknown table: {table_name}")

    added_rows = 0
    updated_rows = 0
    skipped_rows = 0

    for rows, columns in fetch_new_records(local_cursor, table_name):
        for row in rows:
            try:
                # Start a new transaction for each row
                prod_conn.rollback()  # Clear any previous failed transaction
                
                insert_query = f"""
                INSERT INTO {table_name} ({', '.join(columns)}) 
                VALUES ({', '.join(['%s'] * len(row))})
                ON CONFLICT ({', '.join(conflict_columns)}) DO UPDATE SET
                    {', '.join([f"{col} = EXCLUDED.{col}" for col in columns if col not in exclude_columns])};
                """
                prod_cursor.execute(insert_query, row)
                prod_conn.commit()  # Commit each row individually

                if prod_cursor.statusmessage.startswith("INSERT"):
                    added_rows += 1
                elif prod_cursor.statusmessage.startswith("UPDATE"):
                    updated_rows += 1

            except psycopg2.Error as e:
                prod_conn.rollback()  # Rollback on any error
                print(f"Error processing row {row}: {e}")
                skipped_rows += 1
                continue

    print(f"Summary for {table_name}:")
    print(f"  Added rows: {added_rows}")
    print(f"  Updated rows: {updated_rows}")
    print(f"  Skipped rows: {skipped_rows}")

    local_cursor.close()
    prod_cursor.close()

    return added_rows, updated_rows, skipped_rows


# Tables to sync
tables = ["venues", "shows"]

# Overall summary
overall_summary = {}

# Sync each table and collect the summary
for table in tables:
    added, updated, skipped = sync_table(table)
    overall_summary[table] = {
        "added": added,
        "updated": updated,
        "skipped": skipped,
    }

# Print overall summary
print("\n=== Sync Summary ===")
for table, summary in overall_summary.items():
    print(f"Table: {table}")
    print(f"  Added: {summary['added']}")
    print(f"  Updated: {summary['updated']}")
    print(f"  Skipped: {summary['skipped']}")