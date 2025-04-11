"""
Base Scraper Module

Provides a robust base class for venue scrapers with error handling,
logging, and database interactions.
"""

import os
import sys
import time
import json
import random
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, 
    NoSuchElementException, 
    StaleElementReferenceException,
    WebDriverException
)
from bs4 import BeautifulSoup

from utils.db_utils import connect_to_db, insert_show, get_venue_id

class BaseScraper:
    """Base class for venue scrapers with common functionality."""
    
    def __init__(
        self,
        venue_name: str,
        url: str,
        headless: bool = True,
        max_retries: int = 3,
        timeout: int = 10,
        max_events: Optional[int] = None,
        log_to_file: bool = True,
        log_to_stderr: bool = True
    ):
        """
        Initialize the base scraper.
        
        Args:
            venue_name: Name of the venue to scrape
            url: URL of the venue's event page
            headless: Whether to run Chrome in headless mode
            max_retries: Maximum number of retry attempts for operations
            timeout: Default timeout for waiting on elements (seconds)
            max_events: Maximum number of events to process (None for all)
            log_to_file: Whether to log to a file
            log_to_stderr: Whether to log to stderr
        """
        self.venue_name = venue_name
        self.url = url
        self.headless = headless
        self.max_retries = max_retries
        self.timeout = timeout
        self.max_events = max_events
        self.log_to_file = log_to_file
        self.log_to_stderr = log_to_stderr
        
        # Initialize logging
        self.setup_logging()
        
        # Statistics
        self.added_count = 0
        self.updated_count = 0
        self.duplicate_count = 0
        self.error_count = 0
        self.added_shows = []
        self.updated_shows = []
        self.errors = []
        
        # Initialize to None, will be created in setup()
        self.driver = None
        self.db_connection = None
        self.db_cursor = None
        self.venue_id = None
        
        # Track whether setup has been called
        self.is_setup = False
    
    def setup_logging(self):
        """Configure logging based on environment."""
        self.logger = logging.getLogger(f"{self.venue_name}Scraper")
        self.logger.setLevel(logging.INFO)
        
        # Clear existing handlers
        if self.logger.handlers:
            self.logger.handlers.clear()
        
        # Create a formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # Add stderr handler if requested
        if self.log_to_stderr:
            stderr_handler = logging.StreamHandler(sys.stderr)
            stderr_handler.setFormatter(formatter)
            self.logger.addHandler(stderr_handler)
        
        # Add a file handler for persistent logs if requested
        if self.log_to_file:
            # Create logs directory if it doesn't exist
            log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
            os.makedirs(log_dir, exist_ok=True)
            
            # Create a log file with timestamp
            log_file = os.path.join(
                log_dir, 
                f"{self.venue_name.lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
            )
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
            
            self.log_file = log_file
        else:
            self.log_file = None
    
    def log(self, message: str, level: str = 'info'):
        """Log a message with the appropriate level."""
        if level == 'debug':
            self.logger.debug(message)
        elif level == 'info':
            self.logger.info(message)
        elif level == 'warning':
            self.logger.warning(message)
        elif level == 'error':
            self.logger.error(message)
            self.errors.append(message)
            self.error_count += 1
        else:
            self.logger.info(message)
    
    def setup(self):
        """Set up the scraper by initializing the web driver and database."""
        if self.is_setup:
            return
            
        self.log(f"Setting up scraper for {self.venue_name}")
        
        try:
            # Set up Chrome options
            chrome_options = Options()
            if self.headless:
                chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            
            # Use chrome binary from environment if available
            chrome_binary = os.getenv('CHROME_BINARY_PATH')
            if chrome_binary:
                chrome_options.binary_location = chrome_binary
            
            # Initialize WebDriver
            self.driver = webdriver.Chrome(options=chrome_options)
            self.log("Chrome initialized successfully")
            
            # Set default timeout
            self.driver.implicitly_wait(self.timeout)
            
            # Set up database connection
            self.setup_database()
            
            self.is_setup = True
            self.log(f"Setup complete for {self.venue_name}")
            
        except Exception as e:
            error_msg = f"Error during setup: {e}"
            self.log(error_msg, 'error')
            self.teardown()
            raise RuntimeError(error_msg)
    
    def setup_database(self):
        """Set up the database connection and get venue ID."""
        try:
            self.log(f"Connecting to database")
            self.db_connection = connect_to_db()
            self.db_cursor = self.db_connection.cursor()
            
            self.log(f"Getting venue ID for {self.venue_name}")
            try:
                self.venue_id = get_venue_id(self.db_cursor, self.venue_name)
                self.log(f"Venue ID for {self.venue_name}: {self.venue_id}")
            except ValueError as e:
                error_msg = f"Error getting venue ID: {e}"
                self.log(error_msg, 'error')
                raise
                
        except Exception as e:
            error_msg = f"Error setting up database: {e}"
            self.log(error_msg, 'error')
            raise
    
    def navigate_to_page(self, url: Optional[str] = None) -> bool:
        """
        Navigate to the specified URL with retry logic.
        
        Args:
            url: URL to navigate to (defaults to self.url if None)
            
        Returns:
            bool: True if navigation was successful, False otherwise
        """
        target_url = url or self.url
        self.log(f"Navigating to {target_url}")
        
        for attempt in range(self.max_retries):
            try:
                self.driver.get(target_url)
                # Wait a bit to ensure page loads
                time.sleep(2)
                return True
            except WebDriverException as e:
                if attempt < self.max_retries - 1:
                    self.log(f"Navigation attempt {attempt+1} failed: {e}", 'warning')
                    # Add a bit of randomness to retry timing
                    sleep_time = 2 + random.random() * 2
                    self.log(f"Retrying in {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    error_msg = f"Navigation failed after {self.max_retries} attempts: {e}"
                    self.log(error_msg, 'error')
                    return False
        
        return False
    
    def wait_for_element(self, selector: str, by: By = By.CSS_SELECTOR, timeout: Optional[int] = None) -> bool:
        """
        Wait for an element to be present on the page.
        
        Args:
            selector: CSS selector or XPath to find the element
            by: Type of selector (CSS_SELECTOR, XPATH, etc.)
            timeout: Timeout in seconds (defaults to self.timeout)
            
        Returns:
            bool: True if element was found, False otherwise
        """
        actual_timeout = timeout or self.timeout
        
        try:
            WebDriverWait(self.driver, actual_timeout).until(
                EC.presence_of_element_located((by, selector))
            )
            return True
        except TimeoutException as e:
            self.log(f"Timeout waiting for element: {selector}", 'warning')
            return False
    
    def get_soup(self) -> BeautifulSoup:
        """
        Get a BeautifulSoup object for the current page.
        
        Returns:
            BeautifulSoup: Parsed HTML of the current page
        """
        return BeautifulSoup(self.driver.page_source, 'html.parser')
    
    def scrape(self) -> bool:
        """
        Main scraping method to be implemented by subclasses.
        
        This method should be overridden by venue-specific scraper classes.
        
        Returns:
            bool: True if scraping was successful, False otherwise
        """
        raise NotImplementedError("Subclasses must implement the scrape method")
    
    def save_event(self, bands: str, start_time, event_url: str = "", flyer_image: Optional[str] = None) -> bool:
        """
        Save an event to the database.
        
        Args:
            bands: Band names (comma separated)
            start_time: Event start time (datetime)
            event_url: URL to the event page
            flyer_image: URL to the event flyer image
            
        Returns:
            bool: True if saving was successful, False otherwise
        """

        age_restriction = getattr(self, 'default_age_restriction', None)


        if not bands or not start_time:
            self.log(f"Missing required fields for event. Bands: '{bands}', Start: {start_time}", 'warning')
            return False
            
        try:
            # Insert the show and track result
            show_id, status = insert_show(
                self.db_connection,
                self.db_cursor,
                self.venue_id,
                bands,
                start_time,
                event_url,
                flyer_image
            )
            
            # Update statistics based on status
            if status == "added":
                self.added_count += 1
                self.added_shows.append(show_id)
                self.log(f"Added event: {bands} on {start_time}")
            elif status == "updated":
                self.updated_count += 1
                self.updated_shows.append(show_id)
                self.log(f"Updated event: {bands} on {start_time}")
            elif status == "duplicate":
                self.duplicate_count += 1
                self.log(f"Duplicate event skipped: {bands} on {start_time}", 'debug')
                
            return True
            
        except Exception as e:
            error_msg = f"Error saving event: {e}"
            self.log(error_msg, 'error')
            # Rollback transaction if an error occurred
            if self.db_connection:
                try:
                    self.db_connection.rollback()
                    self.log("Transaction rolled back")
                except Exception as rb_e:
                    self.log(f"Error rolling back transaction: {rb_e}", 'error')
            return False
    
    def run(self) -> Dict[str, Any]:
        """
        Run the scraper with proper setup and teardown.
        
        Returns:
            Dict[str, Any]: Statistics and results from the scraping run
        """
        start_time = datetime.now()
        success = False
        
        try:
            # Setup scraper (webdriver and database)
            self.setup()
            
            # Run the actual scraping logic
            success = self.scrape()
            
            # Commit database changes if successful
            if success and self.db_connection:
                self.db_connection.commit()
                self.log("Database changes committed")
                
        except Exception as e:
            error_msg = f"Error during scraping: {e}"
            self.log(error_msg, 'error')
            # Rollback database changes if there was an error
            if self.db_connection:
                try:
                    self.db_connection.rollback()
                    self.log("Transaction rolled back")
                except Exception as rb_e:
                    self.log(f"Error rolling back transaction: {rb_e}", 'error')
        finally:
            # Clean up resources
            self.teardown()
            
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Prepare result report
        results = {
            "scraper_name": self.venue_name.lower().replace(" ", "_"),
            "success": success,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "added_count": self.added_count,
            "updated_count": self.updated_count,
            "duplicate_count": self.duplicate_count,
            "error_count": self.error_count,
            "added_shows": self.added_shows,
            "updated_shows": self.updated_shows,
            "errors": self.errors,
            "log_file": self.log_file
        }
        
        # Log summary
        self.log(
            f"Scraper finished: {self.venue_name} | "
            f"Success: {success} | "
            f"Added: {self.added_count} | "
            f"Updated: {self.updated_count} | "
            f"Duplicates: {self.duplicate_count} | "
            f"Errors: {self.error_count} | "
            f"Duration: {duration:.2f}s"
        )
        
        # Save results to JSON file
        if self.log_file:
            results_file = self.log_file.replace('.log', '_results.json')
            try:
                with open(results_file, 'w') as f:
                    json.dump(results, f, indent=2)
                self.log(f"Results saved to {results_file}")
            except Exception as e:
                self.log(f"Error saving results to {results_file}: {e}", 'error')
        
        return results
    
    def teardown(self):
        """Clean up resources (close webdriver, database connections)."""
        self.log("Cleaning up resources")
        
        # Close webdriver
        if self.driver:
            try:
                self.driver.quit()
                self.log("WebDriver closed")
            except Exception as e:
                self.log(f"Error closing webdriver: {e}", 'warning')
            finally:
                self.driver = None
        
        # Close database cursor
        if self.db_cursor:
            try:
                self.db_cursor.close()
                self.log("Database cursor closed")
            except Exception as e:
                self.log(f"Error closing database cursor: {e}", 'warning')
            finally:
                self.db_cursor = None
                
        # Close database connection
        if self.db_connection:
            try:
                self.db_connection.close()
                self.log("Database connection closed")
            except Exception as e:
                self.log(f"Error closing database connection: {e}", 'warning')
            finally:
                self.db_connection = None
                
        self.is_setup = False