"""
Green Room Scraper

Scraper for the Green Room venue in Minneapolis.
"""

import re
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

import sys
import os
# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_scraper import BaseScraper

class GreenRoomScraper(BaseScraper):
    """Scraper for the Green Room venue in Minneapolis."""
    
    def __init__(self, headless=True, max_events=None):
        """
        Initialize the Green Room scraper.
        
        Args:
            headless: Whether to run Chrome in headless mode
            max_events: Maximum number of events to process (None for all)
        """
        super().__init__(
            venue_name="Green Room",
            url="https://www.greenroommn.com/events#/events",
            headless=headless,
            max_events=max_events
        )
        self.base_url = "https://www.greenroommn.com"
        # Set default age restriction for Green Room
        self.default_age_restriction = "All Ages"
    
    def scrape(self):
        """
        Scrape events from the Green Room website.
        
        Returns:
            bool: True if scraping was successful, False otherwise
        """
        # Navigate to the events page
        if not self.navigate_to_page():
            return False
            
        # Wait for event cards to load
        if not self.wait_for_element('.vp-event-card', By.CSS_SELECTOR):
            self.log("Could not find event cards", 'error')
            return False
            
        # Get the page source and parse with BeautifulSoup
        soup = self.get_soup()
        
        # Find all event cards
        event_cards = soup.find_all(class_='vp-event-card')
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
        # Extract event details
        name_tag = card.find(class_='vp-event-name')
        date_tag = card.find(class_='vp-date')
        time_tag = card.find(class_='vp-time')
        
        event_name = name_tag.get_text(strip=True) if name_tag else "N/A"
        event_date = date_tag.get_text(strip=True) if date_tag else "N/A"
        event_time = time_tag.get_text(strip=True) if time_tag else "N/A"
        
        # Determine the event year based on the month
        event_year = self._get_event_year(event_date)
        date_str = f"{event_date} {event_year}"
        
        # Combine date and time into a single datetime object
        try:
            start = datetime.strptime(f"{date_str} {event_time}", "%a %b %d %Y %I:%M %p")
        except ValueError:
            try:
                start = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
            except ValueError as e:
                self.log(f"Skipping event due to date/time format issue: {event_name}. Error: {e}", 'warning')
                return
        
        # Get the bands directly from the event card
        bands = self._extract_bands(card)
        
        # Pass as a comma-separated string
        bands_str = ", ".join(bands)
        
        # Extract event link
        event_link = self._extract_event_link(card)
        
        # Extract the show flyer
        flyer_image = self._extract_flyer_image(card)
        
        # Save the event to the database
        self.save_event(bands_str, start, event_link, flyer_image)
    
    def _get_event_year(self, event_date):
        """
        Determine the event year based on the month.
        
        Args:
            event_date: String representing the event date
            
        Returns:
            int: The year of the event
        """
        try:
            # Extract the month from the event date string
            event_month_str = event_date.split()[1]  # Assuming "Fri May 2" format
            event_month = datetime.strptime(event_month_str, "%b").month
            
            # If the month is December (12), it's the current year
            if event_month == 12:
                return 2024
            # Otherwise, assume the next year
            return 2025
        except Exception as e:
            self.log(f"Error determining year for event date '{event_date}': {e}", 'warning')
            return datetime.now().year  # Fallback to current year if parsing fails
    
    def _extract_bands(self, card):
        """
        Extract band names from an event card.
        
        Args:
            card: BeautifulSoup object representing an event card
            
        Returns:
            list: A list of band names
        """
        bands = []
        
        # Extract the headliner band from vp-event-name
        name_tag = card.find(class_='vp-event-name')
        if name_tag:
            headliner = name_tag.get_text(strip=True)
            if headliner:
                bands.append(headliner)
        
        # Extract the additional bands from vp-support
        support_tag = card.find(class_='vp-support')
        if support_tag:
            # Split the text by commas or other delimiters
            additional_bands = [band.strip() for band in re.split(r',|\band\b|\bwith\b', support_tag.get_text(strip=True), flags=re.IGNORECASE) if band.strip()]
            bands.extend(additional_bands)
        
        # Remove duplicates and clean up band names
        bands = list(dict.fromkeys([self._clean_band_name(band) for band in bands]))
        
        return bands
    
    def _clean_band_name(self, name):
        """
        Clean up a band name by removing stop words.
        
        Args:
            name: String representing a band name
            
        Returns:
            str: Cleaned band name
        """
        stop_words = ['with', 'and']
        return ' '.join(word for word in name.split() if word.lower() not in stop_words).strip()
    
    def _extract_event_link(self, card):
        """
        Extract the event link from an event card.
        
        Args:
            card: BeautifulSoup object representing an event card
            
        Returns:
            str or None: The event link URL or None if not found
        """
        link_tag = card.find('a', class_='vp-event-link', href=True)
        if link_tag:
            partial_href = link_tag['href']
            if partial_href.startswith('#'):  # Check if it's a relative link
                return f"{self.base_url}{partial_href}"  # Construct full URL
            return partial_href  # Use the full URL if already provided
        return None
    
    def _extract_flyer_image(self, card):
        """
        Extract the flyer image URL from an event card.
        
        Args:
            card: BeautifulSoup object representing an event card
            
        Returns:
            str or None: The flyer image URL or None if not found
        """
        flyer_div = card.find(class_='vp-cover-img')
        if flyer_div:
            # Check if the div contains an <img> tag with the flyer image
            img_tag = flyer_div.find('img')
            if img_tag and img_tag.has_attr('src'):
                return img_tag['src']  # Extract the image URL
            
            # If no <img> tag, check for inline styles with background-image
            style_attr = flyer_div.get('style', '')
            match = re.search(r'url\((.*?)\)', style_attr)  # Extract URL from background-image
            if match:
                return match.group(1).strip('\'"')  # Remove quotes around the URL
        
        return None