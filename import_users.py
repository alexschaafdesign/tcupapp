import json
import psycopg2
from datetime import datetime
import sys

# Database connection parameters
DB_PARAMS = {
    'dbname': 'tcup_db',
    'user': 'aschaaf',
    'password': 'notthesame',
    'host': 'localhost',
    'port': 5432
}

def import_users(filename):
    print(f"Starting import from file: {filename}")
    
    # First test file reading
    try:
        with open(filename, 'r') as file:
            print("Successfully opened file")
            first_line = file.readline()
            print(f"First line of file: {first_line}")
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return

    # Try database connection
    try:
        print("\nAttempting database connection...")
        conn = psycopg2.connect(**DB_PARAMS)
        print("Database connection successful!")
        cur = conn.cursor()
        
        success_count = 0
        error_count = 0
        
        print("\nStarting user import...")
        with open(filename, 'r') as file:
            for line_num, line in enumerate(file, 1):
                try:
                    print(f"\nProcessing line {line_num}...")
                    user = json.loads(line.strip())
                    print(f"Parsed user data: {user}")
                    
                    # Insert user with current timestamp
                    cur.execute("""
                        INSERT INTO users 
                        (auth0_id, username, email, created_at, avatar_url)
                        VALUES (%s, %s, %s, CURRENT_TIMESTAMP, NULL)
                        ON CONFLICT (auth0_id) DO NOTHING
                        RETURNING id;
                    """, (
                        user['auth0_id'],
                        user['username'],
                        user['email']
                    ))
                    
                    # Check if insert happened
                    result = cur.fetchone()
                    if result:
                        print(f"Inserted user {user['username']}")
                        success_count += 1
                    else:
                        print(f"User {user['username']} already exists")
                    
                except json.JSONDecodeError as e:
                    print(f"JSON Error on line {line_num}: {str(e)}")
                    print(f"Problematic line: {line.strip()}")
                    error_count += 1
                except Exception as e:
                    print(f"Error processing line {line_num}: {str(e)}")
                    error_count += 1
                    continue
        
        # Commit the transaction
        print("\nCommitting changes...")
        conn.commit()
        print("Changes committed successfully!")
        
        print(f"\nImport completed!")
        print(f"Successfully imported: {success_count} users")
        print(f"Errors encountered: {error_count}")
            
    except Exception as e:
        print(f"Database error: {str(e)}")
        if 'conn' in locals() and conn:
            conn.rollback()
            print("Changes rolled back")
    finally:
        if 'conn' in locals() and conn:
            conn.close()
            print("Database connection closed")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python import_users.py users.json")
        sys.exit(1)
        
    filename = sys.argv[1]
    import_users(filename)