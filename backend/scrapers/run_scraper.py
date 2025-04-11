#!/usr/bin/env python3
"""
Script to run venue scrapers.

This is the main entry point for running scrapers from the command line.
"""

import os
import sys
import argparse
import logging
import importlib
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

import config
from base_scraper import BaseScraper

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('run_scraper')

def get_scraper_class(scraper_id: str):
    """
    Import and return the scraper class for a given scraper ID.
    
    Args:
        scraper_id: ID of the scraper
        
    Returns:
        Scraper class
    """
    try:
        # Get the fully qualified class name
        scraper_config = config.get_scraper_config(scraper_id)
        class_path = scraper_config['class']
        
        # Split into module and class
        module_path, class_name = class_path.rsplit('.', 1)
        
        # Import the module
        module = importlib.import_module(module_path)
        
        # Get the class
        scraper_class = getattr(module, class_name)
        
        return scraper_class
    except Exception as e:
        logger.error(f"Error loading scraper class for {scraper_id}: {e}")
        raise

def get_available_scrapers() -> List[Dict[str, Any]]:
    """
    Get list of available scrapers.
    
    Returns:
        List of scraper info dictionaries
    """
    return [
        {
            'id': scraper_id,
            'name': info['name'],
            'enabled': info['enabled'],
        }
        for scraper_id, info in config.SCRAPERS.items()
    ]

def run_scraper(scraper_id: str, **kwargs) -> Dict[str, Any]:
    """
    Run a scraper.
    
    Args:
        scraper_id: ID of the scraper
        **kwargs: Additional arguments to pass to the scraper
        
    Returns:
        Results dictionary
    """
    logger.info(f"Running scraper: {scraper_id}")
    
    try:
        # Get the scraper class
        scraper_class = get_scraper_class(scraper_id)
        
        # Create and run the scraper
        scraper = scraper_class(**kwargs)
        results = scraper.run()
        
        return results
    except Exception as e:
        logger.error(f"Error running scraper {scraper_id}: {e}")
        return {
            'scraper_name': scraper_id,
            'success': False,
            'error': str(e)
        }

def send_email_notification(results: Dict[str, Any]):
    """
    Send an email notification with scraper results.
    
    Args:
        results: Scraper results dictionary
    """
    if not config.EMAIL_CONFIG['enabled']:
        return
        
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = config.EMAIL_CONFIG['from_email']
        msg['To'] = config.EMAIL_CONFIG['to_email']
        msg['Subject'] = f"Scraper Results: {results['scraper_name']}"
        
        # Create message body
        success = results.get('success', False)
        added_count = results.get('added_count', 0)
        updated_count = results.get('updated_count', 0)
        duplicate_count = results.get('duplicate_count', 0)
        error_count = results.get('error_count', 0)
        
        body = f"""
        Scraper: {results['scraper_name']}
        Status: {'Success' if success else 'Failed'}
        
        Events Added: {added_count}
        Events Updated: {updated_count}
        Duplicates Skipped: {duplicate_count}
        Errors: {error_count}
        
        Run Time: {results.get('start_time', '')} to {results.get('end_time', '')}
        Duration: {results.get('duration_seconds', 0):.2f} seconds
        
        Log File: {results.get('log_file', 'Not available')}
        """
        
        # Add errors if any
        errors = results.get('errors', [])
        if errors:
            body += "\nErrors:\n"
            for error in errors[:10]:  # Limit to first 10 errors
                body += f"- {error}\n"
            
            if len(errors) > 10:
                body += f"... and {len(errors) - 10} more errors\n"
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to SMTP server and send
        smtp_server = config.EMAIL_CONFIG['smtp_server']
        smtp_port = config.EMAIL_CONFIG['smtp_port']
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            # If TLS is enabled, start TLS
            if config.EMAIL_CONFIG['use_tls']:
                server.starttls()
            
            # If SMTP auth is configured, log in
            if config.EMAIL_CONFIG['smtp_user'] and config.EMAIL_CONFIG['smtp_password']:
                server.login(config.EMAIL_CONFIG['smtp_user'], config.EMAIL_CONFIG['smtp_password'])
            
            # Send the email
            server.send_message(msg)
            
        logger.info(f"Notification email sent for {results['scraper_name']}")
        
    except Exception as e:
        logger.error(f"Error sending notification email: {e}")

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Run venue scrapers.')
    
    # Add arguments
    parser.add_argument('scrapers', nargs='*', help='Scrapers to run (default: all enabled)')
    parser.add_argument('--list', action='store_true', help='List available scrapers')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    parser.add_argument('--no-headless', action='store_true', help='Run with browser visible')
    parser.add_argument('--max-events', type=int, help='Maximum events to process per scraper')
    parser.add_argument('--notify', action='store_true', help='Send email notification')
    parser.add_argument('--env-file', help='Path to .env file to load')
    
    args = parser.parse_args()
    
    # Load environment variables from file if specified
    if args.env_file:
        try:
            import dotenv
            dotenv.load_dotenv(args.env_file)
            logger.info(f"Loaded environment variables from {args.env_file}")
        except ImportError:
            logger.warning("python-dotenv not installed, skipping env file loading")
        except Exception as e:
            logger.error(f"Error loading environment variables from {args.env_file}: {e}")
    
    # List scrapers
    if args.list:
        scrapers = get_available_scrapers()
        print(f"Available scrapers ({len(scrapers)}):")
        for scraper in scrapers:
            status = "Enabled" if scraper['enabled'] else "Disabled"
            print(f"  - {scraper['id']}: {scraper['name']} ({status})")
        return 0
    
    # Determine which scrapers to run
    available_scrapers = {s['id']: s for s in get_available_scrapers()}
    
    if args.scrapers:
        # Check if all specified scrapers exist
        invalid_scrapers = [s for s in args.scrapers if s not in available_scrapers]
        if invalid_scrapers:
            print(f"Error: Unknown scraper(s): {', '.join(invalid_scrapers)}")
            print("Run with --list to see available scrapers")
            return 1
            
        # Run specified scrapers
        scrapers_to_run = args.scrapers
    else:
        # Run all enabled scrapers
        scrapers_to_run = [s['id'] for s in get_available_scrapers() if s['enabled']]
    
    if not scrapers_to_run:
        print("No scrapers to run")
        return 0
    
    # Set up scraper parameters
    params = {}
    
    # Handle headless mode
    if args.headless:
        params['headless'] = True
    elif args.no_headless:
        params['headless'] = False
    
    # Handle max events
    if args.max_events is not None:
        params['max_events'] = args.max_events
    
    # Run scrapers
    results = []
    for scraper_id in scrapers_to_run:
        try:
            logger.info(f"Starting scraper: {scraper_id}")
            result = run_scraper(scraper_id, **params)
            results.append(result)
            
            # Send email notification if requested
            if args.notify:
                send_email_notification(result)
                
        except Exception as e:
            logger.error(f"Error running scraper {scraper_id}: {e}")
            results.append({
                'scraper_name': scraper_id,
                'success': False,
                'error': str(e)
            })
    
    # Print summary
    print("\nScraper Results:")
    for result in results:
        scraper_name = result.get('scraper_name', 'unknown')
        success = result.get('success', False)
        added = result.get('added_count', 0)
        updated = result.get('updated_count', 0)
        duplicates = result.get('duplicate_count', 0)
        errors = result.get('error_count', 0) if 'error_count' in result else len(result.get('errors', []))
        
        status = "Success" if success else "Failed"
        print(f"  - {scraper_name}: {status}, Added: {added}, Updated: {updated}, Duplicates: {duplicates}, Errors: {errors}")
    
    # Check if all scrapers were successful
    all_success = all(result.get('success', False) for result in results)
    return 0 if all_success else 1

if __name__ == "__main__":
    sys.exit(main())