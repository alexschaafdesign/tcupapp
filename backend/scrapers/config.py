"""
Configuration settings for scrapers.

This file contains shared configuration settings used by all scrapers.
Settings can be overridden using environment variables.
"""

import os
from typing import Dict, Any

# Database settings
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
    'dbname': os.environ.get('DB_NAME', 'tcup_db'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'postgres'),
    'schema': os.environ.get('DB_SCHEMA', 'public'),
}

# Selenium settings
SELENIUM_CONFIG = {
    'chrome_binary_path': os.environ.get('CHROME_BINARY_PATH', None),
    'chromedriver_path': os.environ.get('CHROMEDRIVER_PATH', None),
    'default_timeout': int(os.environ.get('SELENIUM_TIMEOUT', '10')),
    'default_headless': os.environ.get('SELENIUM_HEADLESS', 'true').lower() == 'true',
}

# Scraper settings
SCRAPER_CONFIG = {
    'max_retries': int(os.environ.get('SCRAPER_MAX_RETRIES', '3')),
    'max_events': int(os.environ.get('SCRAPER_MAX_EVENTS', '0')) or None,  # 0 means no limit
    'log_to_file': os.environ.get('SCRAPER_LOG_TO_FILE', 'true').lower() == 'true',
    'log_to_stderr': os.environ.get('SCRAPER_LOG_TO_STDERR', 'true').lower() == 'true',
}

# Email notification settings
EMAIL_CONFIG = {
    'enabled': os.environ.get('EMAIL_ENABLED', 'false').lower() == 'true',
    'from_email': os.environ.get('EMAIL_FROM', 'scrapers@tcupboard.org'),
    'to_email': os.environ.get('EMAIL_TO', 'admin@tcupboard.org'),
    'smtp_server': os.environ.get('EMAIL_SMTP_SERVER', 'localhost'),
    'smtp_port': int(os.environ.get('EMAIL_SMTP_PORT', '25')),
    'smtp_user': os.environ.get('EMAIL_SMTP_USER', None),
    'smtp_password': os.environ.get('EMAIL_SMTP_PASSWORD', None),
    'use_tls': os.environ.get('EMAIL_USE_TLS', 'false').lower() == 'true',
}

# Registered scrapers
SCRAPERS = {
    'berlin': {
        'class': 'venues.berlin.BerlinScraper',
        'name': 'Berlin',
        'enabled': True,
    },
    '331': {
        'class': 'venues.331.Club331Scraper',
        'name': '331',
        'enabled': True,
    },
    'firstave': {
        'class': 'venues.first_ave.FirstAvenueScraper',
        'name': 'First Avenue',
        'enabled': True,
    },
    'greenroom': {
        'class': 'venues.green_room.GreenRoomScraper',
        'name': 'Green Room',
        'enabled': True,
    },
    'whitesquirrel': {
        'class': 'venues.whitesquirrel.WhiteSquirrelScraper',
        'name': 'White Squirrel',
        'enabled': True,
    },
    # Add more scrapers here as they are implemented
}

def get_scraper_config(scraper_id: str) -> Dict[str, Any]:
    """
    Get configuration for a specific scraper.
    
    Args:
        scraper_id: ID of the scraper
        
    Returns:
        Dictionary with scraper configuration
    """
    if scraper_id not in SCRAPERS:
        raise ValueError(f"Unknown scraper: {scraper_id}")
        
    return SCRAPERS[scraper_id]