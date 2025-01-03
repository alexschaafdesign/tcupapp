import re
import csv

# Your SQL insert string (you can add more entries as needed)
sql_insert_statement = """
INSERT INTO `xf_user` VALUES 
(1,'alexschaaf',1721665828,1721665828,'alex.schaaf@gmail.com','Yellow Ostrich, etc.',1,1,'America/Chicago',1,1,2,_binary '3,4,5,6',6,24,237,0,0,1712624952,1733076257,NULL,43,0,0,1720406484,384,384,1,'','valid','',1,1,0,200,0,0,1,_binary 'PhV6wDIYE64hX9tAvG5UwbW2RGTdR9YR',0,0,0,1,0,1,12,1,0,_binary '{\"1\":1732579878}',NULL,NULL,_binary '{\"1\":1730343026}','',0,17,1732579878),
(2,'PETER M',0,0,'wearethewillows@gmail.com','',1,0,'America/Chicago',1,1,2,_binary '5,6',6,37,102,0,0,1713913193,1733029783,NULL,43,0,0,1718214771,384,384,1,'','valid','',0,1,0,129,0,0,0,_binary 'l_i5OTWx2wVHKkaZ2FhZ5tveJvL9oRpI',1713913193,1713913193,1,10,27298,0,5,1,0,_binary '{\"1\":1732571406}',NULL,NULL,_binary '{\"1\":1730343789}','',0,12,1732571406),
(4,'Test New non-member user',1727381313,1727381313,'humanheatusa@gmail.com','',1,0,'America/Chicago',1,1,2,'',2,7,0,0,0,1715293705,1727712598,NULL,1,0,0,0,0,0,0,'','valid','',0,0,0,0,0,0,0,_binary 'cEsAdUaJwuEAurXUuzwtTmewA8SrN_vP',1715293705,1715293705,0,0,0,0,0,1,0,NULL,NULL,NULL,NULL,'',0,0,-1)
"""

# Regular expression to extract values between parentheses
pattern = r"\(([^)]+)\)"

matches = re.findall(pattern, sql_insert_statement)

# Writing the extracted values into a CSV file
csv_file = 'xf_user_data.csv'

# Opening the CSV file in write mode
with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    
    # Writing the header (column names from the table)
    header = [
        'user_id', 'username', 'registration_date', 'last_activity', 'email', 'preferences', 'timezone', 
        'language', 'location', 'admin', 'valid', 'status', 'group_ids', 'permissions', 'user_group', 
        'user_permissions', 'creation_timestamp', 'last_login', 'salt', 'profile_fields', 'password', 
        'hash', 'status_code', 'display_name', 'valid_status', 'other_info', 'social_links'
    ]
    writer.writerow(header)
    
    # Loop through each match (row data) and write to the CSV
    for match in matches:
        # Split each row by commas, but keep the _binary and JSON items together
        row = re.split(r",(_binary '[^']*'|'{[^}]*}')", match)
        
        # Clean up the row (strip leading/trailing spaces and empty strings)
        row = [value.strip() for value in row if value.strip()]
        
        # Special case handling for _binary and JSON (remove unwanted quotes)
        row = [re.sub(r"^_binary '(.*)'$", r"_binary \1", value) for value in row]  # Handling _binary fields
        row = [re.sub(r"^{(.*)}$", r"{\1}", value) for value in row]  # Handling JSON-like data
        row = [value.replace("','", ",").replace("','", "") for value in row]  # Removing extra quotes that may appear
        
        writer.writerow(row)

print(f"Data has been written to {csv_file}")