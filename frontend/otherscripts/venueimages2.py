import os
import psycopg2

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Path to your image folder
image_folder_path = '/Users/musicdaddy/Desktop/venues/assets/images/venuecoverimages'

# Get a list of image filenames in the folder (assuming the filenames match the venue names)
image_files = [f for f in os.listdir(image_folder_path) if os.path.isfile(os.path.join(image_folder_path, f))]

# Connect to the PostgreSQL database
conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST)
cursor = conn.cursor()

# Loop through all venues and update the cover_image field
for image in image_files:
    # Remove the file extension and replace underscores or spaces with the venue format
    venue_name = image.split('.')[0]  # Assuming the image name matches the venue name (e.g., armory.webp -> armory)
    venue_name = venue_name.replace("_", " ")  # Replace underscores with spaces if that's how they appear in the DB
    
    # Update the cover_image field with the correct filename
    update_query = """
    UPDATE venues
    SET cover_image = %s
    WHERE venue = %s;
    """
    cursor.execute(update_query, (image, venue_name))

# Commit the changes and close the connection
conn.commit()
cursor.close()
conn.close()

print("Database updated with correct cover_image filenames.")