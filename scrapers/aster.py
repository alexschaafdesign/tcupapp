import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By 
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from db_utils import connect_to_db, insert_show, get_venue_id

print("Starting Aster Cafe scraper...")

# Initialize WebDriver with additional settings
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--window-size=1920,1080")
# Add JavaScript enabled explicitly
chrome_options.add_argument("--enable-javascript")

driver = webdriver.Chrome(options=chrome_options)

try:
    # Load the calendar page
    url = "https://astercafe.com/live-music-calendar/"
    print(f"Loading calendar page: {url}")
    driver.get(url)

    # Wait longer for initial calendar load
    print("Waiting for calendar to load...")
    time.sleep(15)  # Increased wait time

    # Execute JavaScript to wait for and extract calendar data
    script = """
    // Wait for the calendar cards to load
    return Array.from(document.querySelectorAll('.cl-event-card')).map(card => {
        // Get the title element and content
        const titleElement = card.querySelector('.cl-event-card__title');
        const title = titleElement ? titleElement.textContent.trim() : '';
        
        // Get the details element
        const detailsElement = card.querySelector('.cl-event-card__details');
        const details = detailsElement ? detailsElement.textContent.trim() : '';
        
        // Get any image/flyer
        const imageElement = card.querySelector('img');
        const imageUrl = imageElement ? imageElement.src : null;
        
        // Get the link
        const linkElement = card.querySelector('a');
        const link = linkElement ? linkElement.href : '';

        // Log entire card content for debugging
        console.log('Card content:', card.innerHTML);
        
        return {
            title: title,
            details: details,
            flyer: imageUrl,
            link: link,
            rawHtml: card.innerHTML
        };
    });
    """

    # Execute the script to get events
    print("Extracting event data...")
    events = driver.execute_script(script)
    
    print(f"Found {len(events)} events")
    
    # Print raw event data for debugging
    print("\nRaw event data found:")
    for event in events:
        print("\nEvent:")
        print(f"Title: {event.get('title')}")
        print(f"Details: {event.get('details')}")
        print(f"Link: {event.get('link')}")
        print(f"Flyer: {event.get('flyer')}")
        print("Raw HTML snippet:")
        print(event.get('rawHtml')[:200] + "...")  # Print first 200 chars of HTML

    # Also print page source after JavaScript execution
    print("\nFull page source after JS execution:")
    print(driver.page_source[:1000])  # First 1000 chars

    # If no events found, check for specific calendar elements
    if len(events) == 0:
        print("\nChecking for calendar elements...")
        calendar_elements = driver.find_elements(By.CLASS_NAME, "cl-calendar")
        component_elements = driver.find_elements(By.CLASS_NAME, "cl-component")
        card_elements = driver.find_elements(By.CLASS_NAME, "cl-card")
        
        print(f"Calendar elements found: {len(calendar_elements)}")
        print(f"Component elements found: {len(component_elements)}")
        print(f"Card elements found: {len(card_elements)}")

except Exception as e:
    print(f"Error during scraping: {e}")
    
finally:
    driver.quit()

print("\nScraping completed.")