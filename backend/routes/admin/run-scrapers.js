import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import authMiddleware from '../../middleware/auth.js';
import checkRole from '../../middleware/check-role.js';
import knex from 'knex';
import dbConfig from '../../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a require function
const require = createRequire(import.meta.url);

// Load knexfile configuration
const knexConfig = require('../../knexfile.cjs')[process.env.NODE_ENV || 'development'];
const db = knex(knexConfig);

// Make sure to use the development schema
db.raw('SET search_path TO development, public');

const router = express.Router();
const execPromise = promisify(exec);

// Get all available scrapers
const AVAILABLE_SCRAPERS = [
  { id: '331_club', name: '331 Club' },
  { id: 'aster_cafe', name: 'Aster Café' },
  { id: 'berlin_mpls', name: 'Berlin MPLS' },
  { id: 'first_avenue', name: 'First Avenue' },
  { id: 'icehouse', name: 'Icehouse' },
  { id: 'cedar', name: 'Cedar Cultural Center' },
  { id: 'pilllar', name: 'Pilllar Forum' },
  { id: 'zhora', name: 'Zhora Darling' },
  { id: 'mortimers', name: 'Mortimers' },
  { id: 'hookladder', name: 'Hook & Ladder' },
  { id: 'gr', name: 'Green Room' },
  { id: 'whitesquirrel', name: 'White Squirrel' },
  { id: 'palmers', name: 'Palmers' },
  { id: 'eagles', name: 'Eagles #34' },
  { id: 'resource', name: 'Resource' },
  { id: 'klash', name: 'Klash' }
];

async function runScraper(scraperName) {
  // Create absolute paths to the scrapers to avoid path issues
  const scrapeDir = path.join(__dirname, '../../scrapers');
  
  // Map scraper IDs to their actual filenames with absolute paths
  const scriptPathMap = {
    '331_club': path.join(scrapeDir, '331_club_scraper.py'),
    'berlin_mpls': path.join(scrapeDir, 'berlin_mpls_scraper.py'),
    'first_avenue': path.join(scrapeDir, 'first_avenue_scraper.py'),
    'aster_cafe': path.join(scrapeDir, 'aster.py'),
    'cedar': path.join(scrapeDir, 'cedar.py'),
    'pilllar': path.join(scrapeDir, 'pilllarscrape_todb.py'),
    'zhora': path.join(scrapeDir, 'zhorascrape_todb.py'),
    'mortimers': path.join(scrapeDir, 'mortimersscrape_todb.py'),
    'hookladder': path.join(scrapeDir, 'hookladder.py'),
    'gr': path.join(scrapeDir, 'grscrape_todb.py'),
    'whitesquirrel': path.join(scrapeDir, 'whitesquirrel.py'),
    'palmers': path.join(scrapeDir, 'palmers.py'),
    'eagles': path.join(scrapeDir, 'eagles.py'),
    'resource': path.join(scrapeDir, 'resource.py'),
    'klash': path.join(scrapeDir, 'klash.py'),
    'icehouse': path.join(scrapeDir, 'icehouse.py')
  };
  
  // Get the script path from the map or use default pattern with absolute path
  const scriptPath = scriptPathMap[scraperName] || path.join(scrapeDir, `${scraperName}.py`);
  
  try {
    // Add the correct Python path
    const pythonPath = '/Users/musicdaddy/Desktop/venues/myenv/bin/python';
    console.log(`Running: ${pythonPath} ${scriptPath}`);
    
    // Use spawn instead of exec to get real-time output
    const { spawn } = require('child_process');
    const pythonProcess = spawn(pythonPath, [scriptPath]);
    
    // Collect stdout and stderr
    let stdoutData = '';
    let stderrData = '';
    
    // Capture output in real-time
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutData += output;
      console.log(`${scraperName} stdout:`, output);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderrData += output;
      console.log(`${scraperName} stderr:`, output);
    });
    
    // Wait for the process to finish
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', resolve);
    });
    
    if (exitCode !== 0) {
      console.error(`${scraperName} exited with code ${exitCode}`);
    }
    
    console.log(`Scraper ${scraperName} completed with exit code: ${exitCode}`);
    console.log(`Scraper ${scraperName} stderr:`, stderrData);
    
    // Try to parse the output as JSON
    let result;
    try {
      // Trim potential leading/trailing whitespace from the captured output
      const trimmedOutput = stdoutData.trim();

      if (!trimmedOutput) {
           // Handle cases where the python script produced no output to stdout
           console.error(`Received empty stdout from ${scraperName}.`);
           // You might want to check stderrData here for errors from Python
           throw new Error(`Received empty stdout from ${scraperName}. Stderr: ${stderrData || 'empty'}`);
      }

      result = JSON.parse(trimmedOutput); // <--- Parse the WHOLE trimmed string

      // Optional: Add a success log after successful parsing
      console.log(`Successfully parsed JSON output for ${scraperName}.`);

    } catch (parseError) {
      console.error(`Failed to parse JSON output from ${scraperName}:`, parseError);
      // Log the actual data that caused the parsing failure
      console.error(`Data that failed parsing for ${scraperName}: >>>\n${stdoutData}\n<<<`); // Log the full stdout

      // If we can't parse the JSON, create a basic result object
      // Include the raw stdout and stderr for debugging purposes
      result = {
        scraper_name: scraperName,
        added_count: 0,
        duplicate_count: 0,
        skipped_count: 0,
        added_shows: [],
        errors: [`Failed to parse output: ${parseError.message}`],
        // Add raw captures to the result object itself if desired
        raw_stdout_capture: stdoutData,
        raw_stderr_capture: stderrData
      };
      // Add stderr content to the errors array for better context
      if (stderrData && !result.errors.some(e => e.includes('Stderr:'))) {
          result.errors.push(`Stderr: ${stderrData.trim()}`);
      }
    }
    
    // Store the log in the database with explicit schema reference
    const insertResult = await db('development.scraper_logs').insert({
      scraper_name: scraperName,
      run_at: new Date(),
      added_count: result.added_count || 0,
      duplicate_count: result.duplicate_count || 0,
      skipped_count: result.skipped_count || 0,
      added_shows: JSON.stringify(result.added_shows || []),
      errors: JSON.stringify(result.errors || []),
      raw_output: JSON.stringify(result)
    }).returning('id');
    
    const logId = insertResult[0].id;
    
    // If there are added shows, store them with details
    if (result.added_shows && result.added_shows.length > 0) {
      // Get details for all the added shows
      const showDetails = await db('development.shows')
        .select('shows.id', 'shows.bands as show_name', 'venues.venue as venue_name', 'shows.start as show_date')
        .join('venues', 'shows.venue_id', 'venues.id')
        .whereIn('shows.id', result.added_shows);
      
      // Insert entries for each added show
      const showAdditions = showDetails.map(show => ({
        scraper_log_id: logId,
        show_id: show.id,
        show_name: show.show_name,
        venue_name: show.venue_name,
        show_date: show.show_date
      }));
      
      if (showAdditions.length > 0) {
        await db('development.scraper_show_additions').insert(showAdditions);
      }
    }
    
    // Return the result with the database log ID
    return {
      ...result,
      log_id: logId
    };
  } catch (error) {
    console.error(`Error running scraper ${scraperName}:`, error);
    
    // Log the error to the database
    const insertResult = await db('development.scraper_logs').insert({
      scraper_name: scraperName,
      run_at: new Date(),
      added_count: 0,
      duplicate_count: 0,
      skipped_count: 0,
      added_shows: '[]',
      errors: JSON.stringify([`Error running ${scraperName}: ${error.message}`]),
      raw_output: JSON.stringify({ error: error.message })
    }).returning('id');
    
    const logId = insertResult[0].id;
    
    return {
      scraper_name: scraperName,
      added_count: 0,
      duplicate_count: 0,
      skipped_count: 0,
      added_shows: [],
      errors: [`Error running ${scraperName}: ${error.message}`],
      log_id: logId
    };
  }
}

// Run scrapers endpoint
router.post('/run-scrapers', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { scraper } = req.body;
  const tasks = [];
  
  try {
    // Valid scraper IDs
    const validScraperIds = AVAILABLE_SCRAPERS.map(s => s.id);
    
    if (scraper) {
      // Run a specific scraper
      if (validScraperIds.includes(scraper)) {
        tasks.push(runScraper(scraper));
      } else {
        return res.status(400).json({ error: 'Invalid scraper name' });
      }
    } else {
      // Run a subset of scrapers (for testing use just a few)
      tasks.push(runScraper('331_club'));
      tasks.push(runScraper('first_avenue'));
      tasks.push(runScraper('whitesquirrel'));
    }
    
    const logs = await Promise.all(tasks);
    res.json({ logs });
  } catch (err) {
    console.error('Error in /run-scrapers:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get scraper history endpoint
router.get('/scraper-history', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    // Get paginated logs with show count
    const logs = await db('development.scraper_logs')
      .select(
        'scraper_logs.*',
        db.raw('COUNT(DISTINCT scraper_show_additions.id) as shows_added_count')
      )
      .leftJoin('development.scraper_show_additions', 'scraper_logs.id', 'scraper_show_additions.scraper_log_id')
      .groupBy('scraper_logs.id')
      .orderBy('scraper_logs.run_at', 'desc')
      .limit(limit)
      .offset(offset);
      
    // Get total count for pagination
    const [{ count }] = await db('development.scraper_logs')
      .count('* as count');
      
    res.json({
      logs,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        pages: Math.ceil(parseInt(count) / limit)
      }
    });
  } catch (err) {
    console.error('Error in /scraper-history:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get scraper log details endpoint
router.get('/scraper-logs/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the log
    const log = await db('development.scraper_logs')
      .where('id', id)
      .first();
      
    if (!log) {
      return res.status(404).json({ error: 'Scraper log not found' });
    }
    
    // Get the added shows with details
    const shows = await db('development.scraper_show_additions')
      .select('scraper_show_additions.*', 'shows.bands', 'shows.start', 'venues.venue')
      .leftJoin('development.shows', 'scraper_show_additions.show_id', 'shows.id')
      .leftJoin('development.venues', 'shows.venue_id', 'venues.id')
      .where('scraper_log_id', id)
      .orderBy('shows.start', 'asc');
      
    res.json({
      log,
      shows
    });
  } catch (err) {
    console.error('Error in /scraper-logs/:id:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get available scrapers endpoint
router.get('/available-scrapers', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    res.json({ scrapers: AVAILABLE_SCRAPERS });
  } catch (err) {
    console.error('Error in /available-scrapers:', err);
    res.status(500).json({ error: err.toString() });
  }
});

export default router;