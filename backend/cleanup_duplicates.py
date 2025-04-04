#!/usr/bin/env python3
import os
import sys
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env.development file
env_path = Path(os.path.dirname(os.path.abspath(__file__))) / '.env.development'
load_dotenv(dotenv_path=env_path)

# Database connection parameters
db_params = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
}

def find_duplicates():
    """Find duplicate shows in the database."""
    try:
        # Connect to database
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Set the schema
        cursor.execute("SET search_path TO development, public")
        
        # Get Icehouse venue ID
        cursor.execute("SELECT id FROM venues WHERE venue = 'Icehouse'")
        venue_row = cursor.fetchone()
        if not venue_row:
            print("Error: Could not find Icehouse venue")
            return
            
        venue_id = venue_row[0]
        print(f"Found Icehouse venue with ID {venue_id}")
        
        # Find duplicate shows (same band, same day, different times)
        cursor.execute("""
            SELECT 
                bands, 
                TO_CHAR(start::date, 'YYYY-MM-DD') as show_date,
                array_agg(TO_CHAR(start, 'YYYY-MM-DD HH24:MI:SS')) as times,
                array_agg(id) as ids,
                COUNT(*) as count
            FROM shows
            WHERE venue_id = %s
            GROUP BY bands, start::date
            HAVING COUNT(*) > 1
            ORDER BY show_date DESC, bands
        """, (venue_id,))
        
        duplicates = cursor.fetchall()
        
        if not duplicates:
            print("No duplicates found!")
            return
            
        print(f"Found {len(duplicates)} sets of duplicate shows:")
        print("=" * 80)
        
        # Display each set of duplicates
        for dup in duplicates:
            bands, show_date, times, ids, count = dup
            
            print(f"\nBand: {bands}")
            print(f"Date: {show_date}")
            print(f"Found {count} entries:")
            
            for i in range(len(ids)):
                print(f"  [{i+1}] ID: {ids[i]}, Time: {times[i]}")
                
            # Generate SQL to delete all but the first occurrence
            delete_ids = ", ".join(str(id) for id in ids[1:])
            print("\nTo delete all except the first one, use:")
            print(f"DELETE FROM development.shows WHERE id IN ({delete_ids});")
            print("-" * 60)
        
        print("\nRECOMMENDATION:")
        print("1. Review each set of duplicates above")
        print("2. For each set, determine which entry is correct (usually the earliest time)")
        print("3. Run the DELETE statement for each set to remove incorrect entries")
        print("4. Or for a specific correction, use:")
        print("   UPDATE development.shows SET start = 'YYYY-MM-DD HH:MM:SS' WHERE id = X;")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    find_duplicates()