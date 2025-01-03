import os
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
import pytesseract
from PIL import Image
import re
import json

# Path to Tesseract executable (set this according to your system)
pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'
# For macOS/Linux, it might look like '/usr/local/bin/tesseract'

# Step 1: Initialize WebDriver
driver = webdriver.Chrome()  # Make sure the correct WebDriver version is installed
url = 'https://www.cloudlandtheater.com/'
driver.get(url)

# Step 2: Locate images
images = driver.find_elements(By.TAG_NAME, 'img')

# Create a directory for downloaded images
os.makedirs('images', exist_ok=True)

# Download each image
print("Downloading images...")
for idx, img in enumerate(images):
    src = img.get_attribute('src')
    if src:
        # Ensure the image source is a valid URL
        if not src.startswith("http"):
            continue
        response = requests.get(src, stream=True)
        if response.status_code == 200:
            with open(f'images/image_{idx}.png', 'wb') as file:
                for chunk in response.iter_content(1024):
                    file.write(chunk)
            print(f"Downloaded: {src}")
        else:
            print(f"Failed to download: {src}")
driver.quit()

# Step 3: Process Images with Tesseract OCR
print("Processing images with OCR...")
extracted_data = []
image_dir = 'images'

for image_file in os.listdir(image_dir):
    if image_file.endswith('.png'):
        image_path = os.path.join(image_dir, image_file)
        try:
            text = pytesseract.image_to_string(Image.open(image_path))
            extracted_data.append(text)
            print(f"Extracted text from {image_file}:")
            print(text)
        except Exception as e:
            print(f"Error processing {image_file}: {e}")

# Step 4: Parse Extracted Text
def parse_event_data(extracted_text):
    parsed_events = []
    for text in extracted_text:
        try:
            # Example regex for extracting date
            date_match = re.search(r'\b(?:[A-Z][a-z]+)\s\d{1,2},\s\d{4}\b', text)
            date = date_match.group(0) if date_match else "Unknown Date"

            # Example regex for extracting time
            time_match = re.search(r'\b\d{1,2}:\d{2}\s?[apAP][mM]\b', text)
            time = time_match.group(0) if time_match else "Unknown Time"

            # Example regex for extracting band/artist names
            bands_match = re.findall(r'[A-Z][a-zA-Z0-9& ]+', text)
            bands = ', '.join(bands_match) if bands_match else "Unknown Bands"

            parsed_events.append({
                "date": date,
                "time": time,
                "bands": bands
            })
        except Exception as e:
            print(f"Error parsing text: {e}")
    return parsed_events

parsed_events = parse_event_data(extracted_data)

# Step 5: Output Results
print("\nParsed Events:")
for event in parsed_events:
    print(event)

# Optional: Save the parsed events to a file
with open('parsed_events.json', 'w') as f:
    json.dump(parsed_events, f, indent=4)
    print("\nParsed events saved to parsed_events.json")