#!/bin/bash
pg_dump -U aschaaf -h localhost -d venues -F c -b -v -f /Users/musicdaddy/Desktop/venues/your_database_$(date +\%Y-\%m-\%d).backup