"""
331 Club Scraper

Scraper for the 331 Club venue in Minneapolis.
"""

import re
from datetime import datetime
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup

import sys
import os
# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_scraper import BaseScraper

class Club331Scraper(BaseScraper):
    """Scraper for the 331 Club venue in Minneapolis."""
    
    def __init__(self, headless=True, max_events=None):
        """
        Initialize the 331 Club scraper.
        
        Args:
            headless: Whether to run Chrome in headless mode
            max_events: Maximum number of events to process (None for all)
        """
        super().__init__(
            venue_name="331 Club",
            url="https://331club.com/#calendar",
            headless=headless,
            max_events=max_events
        )
        # Set default age restriction for 331 Club
        self.default_age_restriction = "21+"
    
    def normalize_time(self, time_str):
        """
        Normalize time string to a consistent format.
        
        Args:
            time_str: Time string to normalize
            
        Returns:
            Normalized time string in format "HH:MM AM/PM"
        """
        try:
            time_str = time_str.lower().strip()
            if ':' not in time_str:
                time_str = re.sub(r'(\d+)(am|pm)', r'\1:00\2', time_str)
            time_str = re.sub(r'(am|pm)', r' \1', time_str)
            return datetime.strptime(time_str, "%I:%M %p").strftime("%I:%M %p")
        except Exception:
            return None
    
    def clean_band_name(self, name):
        """
        Clean band name by removing common connecting words.
        
        Args:
            name: Band name to clean
            
        Returns:
            Cleaned band name
        """
        stop_words = ['with', 'and']
        return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()
    
    def get_default_time(self, bands_str):
        """
        Get default time for specific events based on their name.
        
        Args:
            bands_str: String containing band names
            
        Returns:
            Default time string for the event
        """
        if any(keyword in bands_str for keyword in ["Worker's Playtime", "Movie Music Trivia", "Drinkin' Spelling Bee"]):
            return "06:00 PM"
        elif "Harold's House Party" in bands_str:
            return "04:00 PM"
        elif "Dr. Sketchy" in bands_str:
            return "02:00 PM"
        elif "Conspiracy Series" in bands_str:
            return "09:00 PM"
        return "10:00 PM"
    
    def get_event_year(self, month):
        """
        Determine event year based on month.
        
        Args:
            month: Month as string number (e.g., "01", "12")
            
        Returns:
            Year as integer
        """
        if month in ["11", "12"]:
            return 2024
        return 2025
    
    def scrape(self):
        """
        Scrape events from the 331 Club website.
        
        Returns:
            bool: True if scraping was successful, False otherwise
        """
        # Navigate to the events page
        if not self.navigate_to_page():
            return False
            
        # Wait for the calendar to load
        if not self.wait_for_element("#calendar", By.CSS_SELECTOR):
            self.log("Could not find calendar", 'error')
            return False
        
        # Try to find and click the "See all upcoming events" button if it exists
        try:
            self.log("Looking for 'See all upcoming events' button...")
            more_events_btn = self.wait_for_element('.more_events a', By.CSS_SELECTOR, timeout=5, clickable=True)
            if more_events_btn:
                self.log("Found 'See all upcoming events' button, clicking it...")
                self.driver.execute_script("arguments[0].click();", more_events_btn)
        except Exception as e:
            self.log(f"'See all upcoming events' button not found or not clickable: {e}", 'warning')
            self.log("Continuing with currently visible events...")
        
        # Wait for event cards to load
        if not self.wait_for_element('.event', By.CSS_SELECTOR):
            self.log("Could not find event cards", 'error')
            return False
            
        # Get the page source and parse with BeautifulSoup
        soup = self.get_soup()
        
        # Find all event elements
        events = soup.find_all("div", class_="event")
        self.log(f"Found {len(events)} events on the page")
        
        # Limit events if max_events is set
        if self.max_events is not None and len(events) > self.max_events:
            self.log(f"Limiting to {self.max_events} events (out of {len(events)} found)")
            events = events[:self.max_events]
        
        # Process each event
        for event in events:
            try:
                self._process_event(event)
            except Exception as e:
                self.log(f"Error processing event: {e}", 'error')
        
        return True
    
    def _process_event(self, event):
        """
        Process an individual event.
        
        Args:
            event: BeautifulSoup object for the event
        """
        # Extract date information
        date_tag = event.find("div", class_="event-date")
        if not date_tag:
            self.log("Skipping event without date information", 'warning')
            return
            
        # Get month and day
        month_text = date_tag.find("span", class_="month").get_text(strip=True)
        day_text = date_tag.find("span", class_="date").get_text(strip=True)
        
        # Map month abbreviation to number
        month_mapping = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
            "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
            "Nov": "11", "Dec": "12"
        }
        month = month_mapping.get(month_text, "N/A")
        
        # Determine year based on month
        year = self.get_event_year(month)
        
        # Format date string
        date_str = f"{year}-{month}-{int(day_text):02d}"
        
        # Find event content
        event_content = event.find("div", class_="event-content")
        if not event_content:
            self.log("Skipping event without content", 'warning')
            return
            
        columns_div = event_content.find("div", class_="columns")
        if not columns_div:
            self.log("Skipping event without columns", 'warning')
            return
            
        # Process each column (each column can contain a separate event on the same day)
        for column in columns_div.find_all("div", class_="column"):
            p_tag = column.find("p")
            if not p_tag:
                continue
                
            # Extract all text content from the paragraph
            contents = [node.strip() for node in p_tag.stripped_strings]
            
            # Extract time information
            event_time = None
            time_pattern = re.compile(r'\d{1,2}:?\d{0,2}\s*(?:am|pm)', re.IGNORECASE)
            
            # Look for time in the content
            for content in reversed(contents):
                time_match = time_pattern.search(content)
                if time_match:
                    time_text = time_match.group().strip()
                    event_time = self.normalize_time(time_text)
                    break
            
            # If no time found, use default based on event name
            if not event_time:
                full_text = ' '.join(content for content in contents if not time_pattern.search(content))
                event_time = self.get_default_time(full_text)
            
            # Extract band names
            bands = []
            for content in contents:
                if not time_pattern.search(content) and content.strip():
                    bands.append(self.clean_band_name(content))
            
            # Filter out any entries that might be times
            bands = [band for band in bands if band and not re.search(r'\d{1,2}:\d{2}(?:am|pm)', band.lower())]
            bands_str = ", ".join(bands)
            
            # Skip if no bands found
            if not bands:
                self.log(f"Skipping event on {date_str} due to missing bands", 'warning')
                continue
            
            # Combine date and time to create datetime object
            try:
                start = datetime.strptime(f"{date_str} {event_time}", "%Y-%m-%d %I:%M %p")
            except ValueError as e:
                self.log(f"Skipping event ({bands_str}) due to date/time issue: {e}", 'warning')
                continue
            
            # Extract event link if available
            event_link = None
            link_tag = column.find("a", href=True)
            if link_tag:
                event_link = link_tag['href']
            
            # Use a default flyer image for 331 Club
            flyer_image = "https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp"
            
            # Save the event to the database
            super().save_event(bands_str, start, event_link, flyer_image)


if __name__ == "__main__":
    # Example usage
    scraper = Club331Scraper(headless=True, max_events=None)
    success = scraper.run()
    if success:
        scraper.log_statistics()
    else:
        scraper.log("Scraping failed", 'error')