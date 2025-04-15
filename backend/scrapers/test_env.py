# test_env.py
import os
from dotenv import load_dotenv

# Print current directory
print(f"Current directory: {os.getcwd()}")

# Try to load .env file
load_dotenv()
print(f"DB_USER from env: {os.getenv('DB_USER')}")

# List all environment variables
print("All environment variables:")
for key, value in os.environ.items():
    if 'DB_' in key:
        print(f"{key}: {value}")