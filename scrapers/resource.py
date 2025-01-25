import re
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

DEFAULT_IMAGE = "https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876745/Resource_guyvdn.jpg"

def parse_event_datetime(section):
    p_tag = section.find('p', class_='svelte-glom7p')
    if not p_tag:
        return None
        
    texts = []
    for node in p_tag.children:
        if node.name == 'br':
            break
        if isinstance(node, str):
            texts.append(node.strip(' "'))
    
    content = ' '.join(texts)
    parts = [part.strip() for part in content.split('||')]
    if len(parts) != 2:
        return None
        
    date_str, time_str = parts
    
    try:
        date_parts = date_str.split()
        clean_date = date_parts[1] if len(date_parts) > 1 else date_str
            
        if 'TBD' in time_str.upper():
            return None
            
        if '-' in time_str:
            time_str = time_str.split('-')[0].strip()
            time_str = time_str + ":00 PM" if len(time_str) <= 2 else time_str + " PM"
            
        datetime_str = f"{clean_date} {time_str}"
        return datetime.strptime(datetime_str, '%m/%d/%y %I:%M %p')
    except ValueError:
        return None

def main():
    URL = 'https://www.resource-mpls.com/calendar'
    VENUE_ID = 39
    
    response = requests.get(URL)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    conn = connect_to_db()
    cursor = conn.cursor()
    
    added_count = 0
    duplicate_count = 0
    
    for section in soup.find_all('section', class_='svelte-glom7p'):
        try:
            band_name_elem = section.find('h4', class_='svelte-glom7p')
            if not band_name_elem:
                continue
            band_name = band_name_elem.text.strip()
            
            start = parse_event_datetime(section)
            if not start:
                print(f"Could not parse date/time for event: {band_name}")
                continue
            
            show_id, was_inserted = insert_show(
                conn, 
                cursor, 
                VENUE_ID,
                band_name,
                start,
                URL,
                DEFAULT_IMAGE  # Passed to flyer_image column
            )
            
            if was_inserted:
                added_count += 1
                print(f"Inserted event: {band_name} on {start}")
            else:
                duplicate_count += 1
                
        except Exception as e:
            print(f"Error processing event: {e}")
            conn.rollback()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}.")

if __name__ == "__main__":
    main()