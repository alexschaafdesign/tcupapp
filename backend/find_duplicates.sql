-- Find duplicate shows at Icehouse (same band, same date, different times)
-- This query identifies all duplicates and provides the SQL to clean them up

-- Make sure we're using the development schema
SET search_path TO development, public;

-- First, find the Icehouse venue ID
SELECT id FROM venues WHERE venue = 'Icehouse';

-- Replace the venue_id value in the next query with the ID from above

-- Find all duplicate shows (same band, same day, different times)
WITH duplicates AS (
    SELECT 
        bands, 
        start::date as show_date,
        array_agg(TO_CHAR(start, 'YYYY-MM-DD HH24:MI:SS')) as times,
        array_agg(id) as ids,
        COUNT(*) as count
    FROM shows
    WHERE venue_id = 89  -- Replace with actual Icehouse venue ID
    GROUP BY bands, start::date
    HAVING COUNT(*) > 1
    ORDER BY show_date DESC, bands
)
SELECT 
    bands,
    TO_CHAR(show_date, 'YYYY-MM-DD') as date, 
    times,
    ids,
    count,
    -- Generate SQL to delete all but the first entry for each duplicate set
    'DELETE FROM development.shows WHERE id IN (' || 
        (SELECT string_agg(ids[i]::text, ', ') 
         FROM generate_series(2, array_length(ids, 1)) AS i) || 
    ');' as cleanup_sql
FROM duplicates;

-- To clean up specific known issues

-- 1. Pop Wagner shows (keeping only 11 AM and deleting 4 PM)
DELETE FROM development.shows 
WHERE venue_id = 89  -- Replace with actual Icehouse venue ID
  AND bands LIKE '%Pop Wagner%' 
  AND start::date = '2025-04-12' 
  AND EXTRACT(HOUR FROM start) = 16;

-- 2. For any other specific duplicates, you can use:
-- DELETE FROM development.shows WHERE id IN (id1, id2, ...);