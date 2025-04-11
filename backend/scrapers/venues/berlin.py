"""
Berlin Scraper

Scraper for the Berlin venue in Minneapolis.
"""

import re
from datetime import datetime
from dateutil import parser
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup

import sys
import os
# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_scraper import BaseScraper

class BerlinScraper(BaseScraper):
    """Scraper for the Berlin venue in Minneapolis."""
    
    def __init__(self, headless=True, max_events=None):
        """
        Initialize the Berlin scraper.
        
        Args:
            headless: Whether to run Chrome in headless mode
            max_events: Maximum number of events to process (None for all)
        """
        super().__init__(
            venue_name="Berlin",
            url="https://www.berlinmpls.com/calendar",
            headless=headless,
            max_events=max_events
        )
        self.base_url = "https://www.berlinmpls.com"
        # Set default age restriction for Berlin
        self.default_age_restriction = "All Ages"
    
    def split_band_names(self, band_string):
        """
        Split a string of band names into individual names.
        
        Args:
            band_string: String containing multiple band names
            
        Returns:
            List of individual band names
        """
        return [b.strip() for b in re.split(r'\s*(?:,|w/|&|\+)\s*', band_string) if b.strip()]
    
    def scrape(self):
        """
        Scrape events from the Berlin website.
        
        Returns:
            bool: True if scraping was successful, False otherwise
        """
        # Navigate to the events page
        if not self.navigate_to_page():
            return False
            
        # Wait for event cards to load
        if not self.wait_for_element('.eventlist-event--upcoming', By.CSS_SELECTOR):
            self.log("Could not find event cards", 'error')
            return False
            
        # Get the page source and parse with BeautifulSoup
        soup = self.get_soup()
        
        # Find all event cards
        event_cards = soup.find_all("article", class_="eventlist-event--upcoming")
        self.log(f"Found {len(event_cards)} event cards")
        
        # Limit events if max_events is set
        if self.max_events is not None and len(event_cards) > self.max_events:
            self.log(f"Limiting to {self.max_events} events (out of {len(event_cards)} found)")
            event_cards = event_cards[:self.max_events]
        
        # Process each event card
        for card in event_cards:
            try:
                self._process_event_card(card)
            except Exception as e:
                self.log(f"Error processing event card: {e}", 'error')
        
        return True
    
    def _process_event_card(self, card):
        """
        Process an individual event card.
        
        Args:
            card: BeautifulSoup object for the event card
        """
        # Extract basic information
        event_name = None
        event_link = None
        flyer_image = None
        bands = []
        
        # Extract event name and link
        h1_tag = card.find("h1", class_="eventlist-title")
        if h1_tag:
            a_tag = h1_tag.find("a", href=True)
            if a_tag:
                event_name = a_tag.get_text(strip=True)
                event_link = f"{self.base_url}{a_tag['href']}"
            else:
                event_name = h1_tag.get_text(strip=True)
        
        # If we have an event link, navigate to the event page for more details
        start = None
        if event_link:
            if not self.navigate_to_page(event_link):
                self.log(f"Could not navigate to event page: {event_link}", 'warning')
                return
            
            # Wait for either time element to be present
            try:
                self.wait_for_element('.event-time-localized-start', By.CSS_SELECTOR, timeout=5)
            except:
                # Fallback to look for the regular time element
                if not self.wait_for_element('.event-time-localized', By.CSS_SELECTOR, timeout=5):
                    self.log("Could not find time element on event page", 'warning')
            
            # Parse the event page
            event_soup = self.get_soup()
            
            # Extract flyer image
            image_wrapper = event_soup.find("div", class_="image-block-wrapper")
            if image_wrapper:
                img_tag = image_wrapper.find("img", src=True)
                if img_tag:
                    flyer_image = img_tag['src']
            
            # Extract date and time
            time_span = event_soup.find("time", class_="event-time-localized-start")
            if not time_span:
                time_span = event_soup.find("time", class_="event-time-localized")
                
            if time_span:
                # The date might be in the `datetime` attribute (e.g. "2024-12-26"),
                # or you might only have text like "4:30 PM", etc.
                date_str = time_span.get("datetime", "").strip()    # e.g. "2025-01-10"
                time_str = time_span.get_text(strip=True)           # e.g. "10:15 PM"

                # If the HTML consistently puts the date in `datetime` and the time in get_text,
                # you can just combine them:
                if date_str and time_str:
                    # e.g. "2025-01-10 10:15 PM"
                    combined_str = f"{date_str} {time_str}"
                else:
                    # If it's *all* in the text or the attribute is missing, you can still parse
                    # just from text using dateutil.parser
                    combined_str = time_str or date_str

                try:
                    # dateutil.parser can handle many "mixed" formats without specifying strptime masks
                    start = parser.parse(combined_str)
                    self.log(f"Parsed datetime: {start}", 'debug')
                except ValueError as e:
                    self.log(f"Could not parse time/date: {combined_str}", 'warning')
        
        # Extract bands
        if event_name:
            bands.append(event_name)
            
        support_tag = card.find(class_="vp-support")
        if support_tag:
            additional_bands = self.split_band_names(support_tag.get_text(strip=True))
            bands.extend(additional_bands)

        # Remove duplicates and clean band names
        bands = list(dict.fromkeys([band.strip() for band in bands if band.strip()]))
        bands_str = ", ".join(bands)
        
        # Skip events without a valid date or bands
        if not start:
            self.log(f"Skipping event due to missing date: {event_name}", 'warning')
            return
            
        if not bands:
            self.log(f"Skipping event due to missing bands: {event_name}", 'warning')
            return
        
        # Save the event to the database with the default age restriction for Berlin
        super().save_event(bands_str, start, event_link, flyer_image)

