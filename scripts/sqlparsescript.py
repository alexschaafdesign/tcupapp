import re
import pandas as pd

def extract_inserts(sql_file):
    with open(sql_file, 'r', encoding='ISO-8859-1') as file:
        content = file.read()

    # Debugging step: Print out the content of the file
    print("Content of the SQL file:")
    print(content[:500])  # Print the first 500 characters for inspection

    # Regex to capture the entire INSERT INTO statement and all rows within the VALUES clause
    pattern = r"INSERT INTO `[^`]+` VALUES (.*?);"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("No INSERT INTO statement found.")
        return [], []

    # Extract the values inside the parentheses
    values = match.group(1)

    # Debugging step: Print out the extracted values
    print("\nExtracted Values:")
    print(values[:500])  # Print the first 500 characters for inspection

    # Split the values into individual rows using a closing parentheses followed by a comma
    # Improved regex to handle multiple rows within the parentheses
    value_rows = re.findall(r"$begin:math:text$(.*?)$end:math:text$", values)

    if not value_rows:
        print("No rows found in the INSERT INTO statement.")
        return [], []

    # Specify column names from the xf_user table (customize if needed)
    columns = [
        'user_id', 'username', 'registration_date', 'last_activity', 'email', 'custom_title', 'language_id',
        'style_id', 'timezone', 'visible', 'activity_visible', 'user_group_id', 'secondary_group_ids',
        'display_style_group_id', 'permission_combination_id', 'message_count', 'question_solution_count',
        'conversations_unread', 'register_date', 'last_activity', 'last_summary_email_date', 'trophy_points',
        'alerts_unviewed', 'alerts_unread', 'avatar_date', 'avatar_width', 'avatar_height', 'avatar_highdpi',
        'gravatar', 'user_state', 'security_lock', 'is_moderator', 'is_admin', 'is_banned', 'reaction_score',
        'vote_score', 'warning_points', 'is_staff', 'secret_key', 'privacy_policy_accepted', 'terms_accepted',
        'xfmg_album_count', 'xfmg_media_count', 'xfmg_media_quota', 'xfrm_resource_count', 'xcu_event_post_count',
        'siropu_chat_room_id', 'siropu_chat_conv_id', 'siropu_chat_rooms', 'siropu_chat_conversations',
        'siropu_chat_settings', 'siropu_chat_room_join_time', 'siropu_chat_status', 'siropu_chat_is_sanctioned',
        'siropu_chat_message_count', 'siropu_chat_last_activity'
    ]
    
    # Prepare the data list
    data = []
    for row in value_rows:
        # Clean the row values: remove _binary fields, handle quotes, etc.
        row = re.sub(r"_binary '.*?'", "NULL", row)  # Handle _binary fields
        row = row.replace("'NULL'", "NULL")  # Fix NULL representation
        row = row.replace(r"\'", "'")  # Fix escaped single quotes
        row = row.replace("NULL,", "NULL")  # Fix cases where NULL has a trailing comma
        row = row.strip()

        # Split the cleaned row values by commas and add them to the data list
        data.append([value.strip().strip("'") for value in row.split(",")])

    return columns, data

def sql_to_csv(sql_file, csv_file):
    columns, data = extract_inserts(sql_file)

    # If columns or data are empty, handle it gracefully
    if not columns or not data:
        print("No data found or invalid format.")
        return

    # Create a DataFrame and write to CSV
    df = pd.DataFrame(data, columns=columns)
    df.to_csv(csv_file, index=False)

    print(f"Data has been written to {csv_file}")

# Specify the paths to your .sql and output .csv
sql_to_csv('/Users/musicdaddy/Desktop/venues/xenforo_user_dump.sql', '/Users/musicdaddy/Desktop/venues/xenforo_db_psql.csv')