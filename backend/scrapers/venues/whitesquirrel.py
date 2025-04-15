"""
White Squirrel Scraper

Scraper for the White Squirrel venue in Minneapolis.
"""

import re
import requests
from ics import Calendar
from bs4 import BeautifulSoup
from datetime import datetime

import sys
import os
# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_scraper import BaseScraper

class WhiteSquirrelScraper(BaseScraper):
    """Scraper for the White Squirrel venue in Minneapolis."""
    
    def __init__(self, headless=True, max_events=None):
        """
        Initialize the White Squirrel scraper.
        
        Args:
            headless: Whether to run Chrome in headless mode (not used for this scraper)
            max_events: Maximum number of events to process (None for all)
        """
        super().__init__(
            venue_name="White Squirrel",
            url="https://whitesquirrelbar.com/calendar/?ical=1",
            headless=headless,
            max_events=max_events
        )
        # We don't actually use Selenium in our scrape method, but we'll let it initialize
        self.default_image_url = "https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg"
        # Set default age restriction for White Squirrel
        self.default_age_restriction = "All Ages"
    
    def split_band_names(self, band_string):
        """
        Split a string of band names into individual names.
        
        Args:
            band_string: String containing multiple band names
            
        Returns:
            List of individual band names
        """
        bands = re.split(r'\s+w\.?\s+', band_string)
        separated_bands = []
        for band in bands:
            separated_bands.extend(band.split(","))
        return [b.strip() for b in separated_bands if b.strip()]
    
    def get_flyer_image(self, event_uid, ics_content):
        """
        Extract the flyer image URL from the ICS file.
        
        Args:
            event_uid: UID of the event
            ics_content: Content of the ICS file
            
        Returns:
            str: URL of the flyer image, or None if not found
        """
        try:
            # Use regex to find the block of the event corresponding to the UID
            event_block_pattern = re.compile(rf"UID:{event_uid}.*?END:VEVENT", re.DOTALL)
            event_block_match = event_block_pattern.search(ics_content)

            if event_block_match:
                event_block = event_block_match.group(0)
                
                # Refine regex to match the ATTACH field with FMTTYPE and URL
                attach_pattern = re.compile(r"ATTACH;FMTTYPE=image/[^:]+:(.+)")
                attach_match = attach_pattern.search(event_block)

                if attach_match:
                    flyer_image = attach_match.group(1).strip()
                    self.log(f"Flyer image found for UID {event_uid}: {flyer_image}", "debug")
                    return flyer_image  # Return the URL if found

            # If no ATTACH field is found, return None
            self.log(f"No ATTACH field found for UID {event_uid}", "debug")
            return None
        except Exception as e:
            self.log(f"Error extracting flyer image for UID {event_uid}: {e}", "error")
            return None
    
    def scrape(self):
        """
        Scrape events from the White Squirrel website by parsing their ICS calendar.
        
        Returns:
            bool: True if scraping was successful, False otherwise
        """
        try:
            # Fetch the ICS file
            self.log(f"Fetching ICS from {self.url}")
            response = requests.get(self.url)
            response.raise_for_status()  # Check if the download was successful
            ics_content = response.text
            
            # Parse the ICS file
            calendar = Calendar(ics_content)
            events = list(calendar.events)
            
            # Limit events if max_events is set
            if self.max_events is not None and len(events) > self.max_events:
                self.log(f"Limiting to {self.max_events} events (out of {len(events)} found)")
                events = events[:self.max_events]
            
            self.log(f"Found {len(events)} events in the calendar")
            
            # Loop through each event in the calendar
            for event in events:
                try:
                    self._process_event(event, ics_content)
                except Exception as e:
                    self.log(f"Error processing event {event.name}: {e}", "error")
            
            return True
            
        except Exception as e:
            self.log(f"Error fetching or parsing ICS: {e}", "error")
            return False
    
    def _process_event(self, event, ics_content):
        """
        Process an individual event from the ICS calendar.
        
        Args:
            event: Event object from the ICS calendar
            ics_content: Raw content of the ICS file for image extraction
        """
        # Parse event details
        bands = self.split_band_names(event.name)
        start = event.begin.datetime.replace(tzinfo=None)
        event_link = event.url if hasattr(event, 'url') and event.url else None
        
        # Get the flyer image from the ICS
        flyer_image = self.get_flyer_image(event.uid, ics_content)
        
        # Use the default image if none was found
        if flyer_image is None:
            flyer_image = self.default_image_url
            self.log(f"Using default image for event: {event.name} -> {self.default_image_url}", "debug")
        
        # Skip events without bands
        if not bands:
            self.log(f"Skipping event due to missing bands: {event.name}", "warning")
            return
            
        # Format bands as a comma-separated string
        bands_str = ", ".join(bands)
        
        # Save the event to the database
        self.save_event(bands_str, start, event_link, flyer_image)