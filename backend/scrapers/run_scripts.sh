#!/bin/bash

# Initialize the scrapers as a list of name-command pairs
scrapers=(
    "First_Avenue python3 firstavescrape_todb.py"
    "Green_Room python3 grscrape_todb.py"
    "White_Squirrel python3 whitesquirrel.py"
    "331_Club python3 331scrape_todb.py"
    "Icehouse python3 icehouse.py"
    "The_Cedar_Cultural_Center python3 cedar.py"
    "Pilllar Forum python3 pilllarscrape_todb.py"
    "Zhora Darling python3 zhorascrape_todb.py"
    "Mortimer's python3 mortimersscrape_todb.py"
    "Hook & Ladder python3 hookladder.py"
)

log_file="scraper_run_$(date +'%Y-%m-%d_%H-%M-%S').log"

echo "Starting scrapers..." | tee -a "$log_file"

# Loop through the scrapers
for scraper_entry in "${scrapers[@]}"; do
    # Extract the name and command
    scraper_name=$(echo "$scraper_entry" | cut -d' ' -f1)
    scraper_command=$(echo "$scraper_entry" | cut -d' ' -f2-)

    echo "Running scraper for $scraper_name..." | tee -a "$log_file"

    # Execute the scraper and capture its output
    output=$($scraper_command 2>&1)

    # Check the exit status
    if [ $? -eq 0 ]; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] $scraper_name scraper completed successfully." | tee -a "$log_file"
        summary+="✔ ${scraper_name//_/ }: Completed successfully.\n"
    else
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] $scraper_name scraper failed with output:\n$output" | tee -a "$log_file"
        summary+="❌ ${scraper_name//_/ }: Failed.\n"
    fi
done

# Display macOS notification with the summary
osascript -e "display notification \"$(echo -e "$summary" | tr '\n' ' ')\" with title \"Scraper Summary\""

# Output detailed summary and log file location
echo -e "$summary"
echo "All scripts have completed. See details in $log_file."