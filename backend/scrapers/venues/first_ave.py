"""
First Avenue Scraper

Scraper for the First Avenue venue in Minneapolis.
"""

import re
import json
from datetime import datetime
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import requests

import sys
import os
# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from base_scraper import BaseScraper

class FirstAvenueScraper(BaseScraper):
    """Scraper for the First Avenue venue in Minneapolis."""
    
    def __init__(self, headless=True, max_events=None):
        """
        Initialize the First Avenue scraper.
        
        Args:
            headless: Whether to run Chrome in headless mode
            max_events: Maximum number of events to process (None for all)
        """
        super().__init__(
            venue_name="First Avenue",
            url="https://first-avenue.com/shows/?post_type=event",
            headless=headless,
            max_events=max_events
        )
        self.urls = [
            'https://first-avenue.com/shows/?post_type=event&start_date=20250401',  # April
            'https://first-avenue.com/shows/?post_type=event&start_date=20250501',  # May
            'https://first-avenue.com/shows/?post_type=event&start_date=20250601',  # June
            'https://first-avenue.com/shows/?post_type=event&start_date=20250701',  # July
            'https://first-avenue.com/shows/?post_type=event&start_date=20250801',  # August
        ]
        self.month_mapping = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
            "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
            "Nov": "11", "Dec": "12"
        }
        # Default is unknown - First Avenue has different age restrictions per show
        self.default_age_restriction = None
    
    def convert_time_to_24_hour_format(self, time_str):
        """
        Convert time string to 24-hour format.
        
        Args:
            time_str: Time string to convert
            
        Returns:
            Time string in 24-hour format (HH:MM)
        """
        try:
            if 'AM' in time_str or 'PM' in time_str:
                time_str = time_str.strip().upper()
                if ':' in time_str:
                    hour, minute = time_str[:-2].split(':')
                else:
                    hour = time_str[:-2]
                    minute = '00'
                hour = int(hour) % 12
                if 'PM' in time_str:
                    hour += 12
                return f"{hour:02}:{minute}"
            return '00:00'
        except Exception as e:
            self.log(f"Error converting time '{time_str}': {e}", 'error')
            return '00:00'
    
    def get_event_details(self, event_url):
        """
        Get detailed information about an event from its page.
        
        Args:
            event_url: URL of the event page
            
        Returns:
            Tuple of (event_time, age_restriction, flyer_image)
        """
        self.log(f"Fetching event details from: {event_url}")
        try:
            response = requests.get(event_url)
        except Exception as e:
            self.log(f"Error fetching URL {event_url}: {e}", 'error')
            return None, None, None

        if response.status_code == 200:
            event_soup = BeautifulSoup(response.content, 'html.parser')
            show_details = event_soup.find('div', class_='show_details text-center')
            event_time = None
            age_restriction = None
            
            if show_details:
                for item in show_details.find_all('div', class_='col-6 col-md'):
                    header = item.find('h6')
                    if header:
                        header_text = header.get_text(strip=True)
                        if "Show Starts" in header_text:
                            time_tag = item.find('h2')
                            event_time = (
                                self.convert_time_to_24_hour_format(time_tag.get_text(strip=True))
                                if time_tag else '00:00'
                            )
                # Extract age restriction
                age_div = show_details.find('div', class_='col')
                if age_div:
                    age_text = age_div.find('h2', class_='mt-1')
                    if age_text:
                        age_restriction = age_text.get_text(strip=True)

            flyer_img_tag = event_soup.find('img', class_='gig_poster no-lazy')
            flyer_image = flyer_img_tag['src'] if flyer_img_tag else None

            return event_time, age_restriction, flyer_image
        else:
            self.log(f"Failed to fetch event details from {event_url}. Status code: {response.status_code}", 'error')
            return None, None, None
    
    def get_bands_from_event_page(self, event_url):
        """
        Extract band names from an event page.
        
        Args:
            event_url: URL of the event page
            
        Returns:
            List of band names
        """
        bands = []
        self.log(f"Fetching band names from: {event_url}")
        try:
            response = requests.get(event_url)
        except Exception as e:
            self.log(f"Error fetching band data from {event_url}: {e}", 'error')
            return bands

        if response.status_code == 200:
            event_soup = BeautifulSoup(response.content, 'html.parser')
            performer_items = event_soup.find_all('div', class_='performer_list_item')
            for item in performer_items:
                band_name_element = item.find('div', class_='performer_content_col')
                if band_name_element:
                    band = band_name_element.find('h2')
                    if band:
                        band_name = band.get_text(strip=True)
                        bands.append(band_name)
                        self.log(f"Band found: {band_name}", 'debug')
        else:
            self.log(f"Failed to retrieve band data from {event_url}. Status code: {response.status_code}", 'error')
        return bands
    
    def scrape(self):
        """
        Scrape events from the First Avenue website.
        
        Returns:
            bool: True if scraping was successful, False otherwise
        """
        # Process each URL in our list of month pages
        for url in self.urls:
            self.log(f"Processing URL: {url}")
            try:
                response = requests.get(url)
            except Exception as e:
                self.log(f"Error fetching {url}: {e}", 'error')
                continue

            if response.status_code != 200:
                self.log(f"Failed to retrieve data from {url}. Status code: {response.status_code}", 'error')
                continue
                
            self.log("Request successful. Parsing shows...")
            soup = BeautifulSoup(response.content, 'html.parser')
            show_items = soup.find_all('div', class_='show_list_item')
            
            # Track how many events we've processed
            events_processed = 0
            
            for show in show_items:
                try:
                    # Check if we've hit our max events limit
                    if self.max_events is not None and events_processed >= self.max_events:
                        self.log(f"Reached maximum events limit ({self.max_events}), stopping.")
                        return True
                    
                    # Process the show
                    self._process_show(show)
                    events_processed += 1
                    
                except Exception as e:
                    self.log(f"Error processing show: {e}", 'error')
            
        return True
    
    def _process_show(self, show):
        """
        Process an individual show listing.
        
        Args:
            show: BeautifulSoup object for the show listing
        """
        # Extract date information
        date_container = show.find('div', class_='date_container')
        if not date_container:
            self.log("Skipping show without date information", 'warning')
            return
            
        month_text = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else None
        day_text = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else None
        
        if not month_text or not day_text:
            self.log("Skipping show with incomplete date information", 'warning')
            return
            
        # Convert month text to month number
        month_number = self.month_mapping.get(month_text)
        if not month_number:
            self.log(f"Unknown month: {month_text}", 'warning')
            return
            
        # Determine year based on month
        year = 2024 if month_number in ["11", "12"] else 2025
        
        # Format date string
        try:
            event_date = f"{year}-{month_number}-{int(day_text):02d}"
            self.log(f"Extracted date: {event_date}", 'debug')
        except Exception as e:
            self.log(f"Error forming event date: {e}", 'error')
            return
        
        # Extract venue name
        venue_name_element = show.find('div', class_='venue_name')
        if not venue_name_element:
            self.log("Skipping show without venue information", 'warning')
            return
            
        venue_name = venue_name_element.get_text(strip=True)
        
        # Since First Avenue owns multiple venues, we need to update the venue name
        # Note: The BaseScraper.save_event method will get the venue ID for us
        self.venue_name = venue_name
        
        # Extract event link
        a_tag = show.find('a')
        if not a_tag or not a_tag.has_attr('href'):
            self.log("Skipping show without event link", 'warning')
            return
            
        event_link = a_tag['href']
        if not event_link.startswith('http'):
            event_url = f"https://first-avenue.com{event_link}"
        else:
            event_url = event_link
        
        # Get detailed information from the event page
        event_time, age_restriction, flyer_image = self.get_event_details(event_url)
        
        # Create datetime object
        try:
            start_datetime = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
            self.log(f"Combined start datetime: {start_datetime}", 'debug')
        except ValueError as e:
            self.log(f"Error combining date and time: {e}", 'error')
            return
        
        # Get band names
        band_names = self.get_bands_from_event_page(event_url)
        bands = ", ".join(band_names)
        
        if not bands:
            self.log(f"Skipping show without band information: {event_url}", 'warning')
            return
        
        # Save the event to the database with the age restriction
        self.save_event(bands, start_datetime, event_url, flyer_image, age_restriction)


if __name__ == "__main__":
    # Example usage
    scraper = FirstAvenueScraper(headless=True, max_events=None)
    success = scraper.run()
    if success:
        scraper.log_statistics()
    else:
        scraper.log("Scraping failed", 'error')