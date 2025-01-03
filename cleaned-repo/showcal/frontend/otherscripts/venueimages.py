import pandas as pd
import requests
import os

# Read the CSV file (update the file path accordingly)
csv_file = '/Users/musicdaddy/Downloads/vvv2.csv'
df = pd.read_csv(csv_file)

# Folder where you want to save the images
image_folder = '/Users/musicdaddy/Downloads/venueimages'

# Ensure the image folder exists
os.makedirs(image_folder, exist_ok=True)

# Loop through the CSV rows
for index, row in df.iterrows():
    venue_name = row['VENUE']  # Assuming the column is named 'venue'
    image_url = row['COVER_IMAGE']  # Assuming the column is named 'cover_image'

    # Clean the venue name to avoid invalid file names
    clean_venue_name = venue_name.replace(' ', '_').replace('/', '_')

    # Define the image path
    image_path = os.path.join(image_folder, f"{clean_venue_name}.jpg")

    # Download the image
    try:
        print(f"Downloading {venue_name} from {image_url}...")
        response = requests.get(image_url)
        response.raise_for_status()  # Check if the request was successful
        
        # Write the image content to a file
        with open(image_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded {venue_name} successfully!")
    except Exception as e:
        print(f"Error downloading {venue_name}: {e}")

print("All images downloaded.")