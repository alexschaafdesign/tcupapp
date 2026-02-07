-- Script to delete all Icehouse shows from the database
-- This will allow us to run the fixed scraper to cleanly recreate the shows

-- Make sure we're using the development schema
SET search_path TO development, public;

-- First, find the Icehouse venue ID
SELECT id FROM venues WHERE venue = 'Icehouse';

-- Delete all shows for Icehouse
-- Replace 89 with the actual venue ID from the query above
DELETE FROM development.shows WHERE venue_id = 89;