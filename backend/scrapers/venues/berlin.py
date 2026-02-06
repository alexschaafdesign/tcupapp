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
    
    def _process_event_card(self, card: BeautifulSoup):
        """
        Process an individual event card directly from the calendar page HTML.

        Args:
            card: BeautifulSoup object for the event card
                  (<article class="eventlist-event--upcoming ...">)
        """
        event_name = None
        event_link = None
        flyer_image = None
        start = None
        bands = []
        date_str = None
        time_str = None

        try:
            # --- Extract Event Name and Link ---
            h1_tag = card.find("h1", class_="eventlist-title")
            a_tag_title = h1_tag.find("a", href=True, class_="eventlist-title-link") if h1_tag else None
            if a_tag_title:
                event_name = a_tag_title.get_text(strip=True)
                event_link = f"{self.base_url}{a_tag_title['href']}"
                self.log(f"Found event: {event_name} - {event_link}", 'debug')
            elif h1_tag: # Handle cases where title might not be a link (less likely)
                 event_name = h1_tag.get_text(strip=True)
                 self.log(f"Found event (no link in title): {event_name}", 'debug')
            else:
                self.log("Could not find event title H1.", 'warning')
                # Optionally skip if name/link is essential
                # return

            # --- Extract Flyer Image ---
            thumb_link_tag = card.find("a", class_="eventlist-column-thumbnail")
            img_tag = thumb_link_tag.find("img", src=True) if thumb_link_tag else None
            if img_tag:
                flyer_image = img_tag['src']
                self.log(f"Found image: {flyer_image}", 'debug')
            else:
                self.log(f"No flyer image found for {event_name}", 'debug') # Debug level, not an error

            # --- Extract Date ---
            date_tag = card.find("time", class_="event-date")
            if date_tag and date_tag.has_attr('datetime'):
                date_str = date_tag['datetime'].strip() # Should be YYYY-MM-DD
                self.log(f"Found date string: {date_str}", 'debug')
            else:
                 self.log(f"Could not find date string for {event_name}", 'warning')

            # --- Extract Time ---
            time_tag = card.find("time", class_="event-time-localized-start")
            if time_tag:
                time_str = time_tag.get_text(strip=True) # Should be H:MM AM/PM
                self.log(f"Found time string: {time_str}", 'debug')
            else:
                self.log(f"Could not find time string for {event_name}", 'warning')

            # --- Combine and Parse Date/Time ---
            if date_str and time_str:
                combined_str = f"{date_str} {time_str}"
                try:
                    # Use dateutil.parser which is flexible
                    start = parser.parse(combined_str)
                    self.log(f"Parsed start datetime: {start}", 'info')
                except ValueError as e:
                    self.log(f"Could not parse combined datetime '{combined_str}': {e}", 'error')
                    start = None # Ensure start is None if parsing fails
            else:
                self.log(f"Skipping datetime parsing due to missing date or time for {event_name}", 'warning')


            # --- Extract Bands ---
            # Start with the main event title
            if event_name:
                bands.append(event_name)

            # Check for support acts (using the original class selector)
            support_tag = card.find(class_="vp-support")
            if support_tag:
                additional_bands = self.split_band_names(support_tag.get_text(strip=True))
                self.log(f"Found support acts: {additional_bands}", 'debug')
                bands.extend(additional_bands)

            # Remove duplicates and clean band names
            bands = list(dict.fromkeys([band.strip() for band in bands if band.strip()]))
            bands_str = ", ".join(bands)
            self.log(f"Final bands string: {bands_str}", 'debug')

            # --- Validation and Saving ---
            if not start:
                self.log(f"Skipping event due to missing/unparsable date/time: {event_name}", 'warning')
                return # Skip if we couldn't get a valid start time

            if not bands_str:
                self.log(f"Skipping event due to missing bands: {event_name or 'Unknown'}", 'warning')
                return # Skip if no bands were found

            # Save the event using data extracted directly from the card
            # Note: event_link might be None if title wasn't a link
            self.save_event(bands_str, start, event_link if event_link else "", flyer_image)

        except Exception as e:
            # Log any unexpected errors during card processing
            self.log(f"Unexpected error processing event card for '{event_name or 'Unknown'}': {e}", 'error')
            # Optionally log the card's HTML for debugging
            # self.log(f"Problematic Card HTML: {card.prettify()}", 'debug')
        
        # Save the event to the database with the default age restriction for Berlin
        super().save_event(bands_str, start, event_link, flyer_image)

