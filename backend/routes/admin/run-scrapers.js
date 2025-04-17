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
import fs from 'fs';

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
  { id: 'berlin', name: 'Berlin' },
  { id: '331_club', name: '331 Club' },
  { id: 'aster_cafe', name: 'Aster Café' },
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
  // Create absolute paths to the scrapers directory
  const scrapeDir = path.join(__dirname, '../../scrapers');
  
  try {
    // Prepare environment variables needed by the Python script
    const env = { ...process.env };
    
    // Use the new run_scraper.py script
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    console.log(`Running: ${pythonPath} ${path.join(scrapeDir, 'run_scraper.py')} --env-file ${path.join(scrapeDir, '.env')} ${scraperName}`);
    
    const { spawn } = require('child_process');
    const pythonProcess = spawn(pythonPath, [
      path.join(scrapeDir, 'run_scraper.py'),
      '--env-file', 
      path.join(scrapeDir, '.env'),
      scraperName // This is the venue scraper ID
    ], { env });
    
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
    
    // Find the results file
    const logsDir = path.join(scrapeDir, 'logs');
    
    // Try to find the most recent results JSON file for this scraper
    let resultFiles = [];
    
    try {
      // Check if logs directory exists
      if (fs.existsSync(logsDir)) {
        // List all files in the logs directory
        resultFiles = fs.readdirSync(logsDir)
          .filter(file => file.includes(scraperName.toLowerCase()) && file.endsWith('_results.json'))
          .sort((a, b) => {
            const statA = fs.statSync(path.join(logsDir, a));
            const statB = fs.statSync(path.join(logsDir, b));
            return statB.mtime.getTime() - statA.mtime.getTime();
          });
      }
    } catch (fsError) {
      console.error(`Error reading log directory: ${fsError}`);
    }
    
    let result;
    
    // Try to parse the results file first
    if (resultFiles.length > 0) {
      // Read the most recent results file
      try {
        const resultFilePath = path.join(logsDir, resultFiles[0]);
        const resultData = fs.readFileSync(resultFilePath, 'utf8');
        result = JSON.parse(resultData);
        console.log(`Parsed results from file: ${resultFiles[0]}`);
      } catch (parseError) {
        console.error(`Failed to parse results file: ${parseError}`);
        // Fall back to parsing stdout
        result = null;
      }
    }
    
    // If we couldn't get results from file, try to parse stdout
    if (!result) {
      try {
        // Try to find a valid JSON object in the stdout output
        const trimmedOutput = stdoutData.trim();
        const jsonStart = trimmedOutput.indexOf('{');
        if (jsonStart >= 0) {
          const jsonString = trimmedOutput.substring(jsonStart);
          result = JSON.parse(jsonString);
          console.log(`Parsed results from stdout`);
        } else {
          throw new Error("No JSON object found in output");
        }
      } catch (parseError) {
        console.error(`Failed to parse JSON output from ${scraperName}:`, parseError);
        // If we can't parse anything, create a basic result object
        result = {
          scraper_name: scraperName,
          success: exitCode === 0,
          added_count: 0,
          updated_count: 0,
          duplicate_count: 0,
          error_count: exitCode === 0 ? 0 : 1,
          errors: exitCode === 0 ? [] : [`Scraper exited with code ${exitCode}`],
          raw_stdout: stdoutData,
          raw_stderr: stderrData
        };
      }
    }
    
    // Store the log in the database with explicit schema reference
    const insertResult = await db('development.scraper_logs').insert({
      scraper_name: scraperName,
      run_at: new Date(),
      added_count: result.added_count || 0,
      updated_count: result.updated_count || 0,
      duplicate_count: result.duplicate_count || 0,
      skipped_count: result.skipped_count || 0,
      added_shows: JSON.stringify(result.added_shows || []),
      updated_shows: JSON.stringify(result.updated_shows || []),
      errors: JSON.stringify(result.errors || []),
      raw_output: JSON.stringify(result)
    }).returning('id');
    
    const logId = insertResult[0].id;
    
    // If there are added shows, store them with details
    if (result.added_shows && result.added_shows.length > 0) {
      try {
        // Get details for all the added shows
        const showDetails = await db('development.shows')
          .select('shows.id', 'shows.bands as show_name', 'venues.venue as venue_name', 'shows.start as show_date')
          .join('venues', 'shows.venue_id', 'venues.id')
          .whereIn('shows.id', result.added_shows);
        
        // Insert entries for each added show
        if (showDetails.length > 0) {
          const showAdditions = showDetails.map(show => ({
            scraper_log_id: logId,
            show_id: show.id,
            show_name: show.show_name,
            venue_name: show.venue_name,
            show_date: show.show_date
          }));
          
          await db('development.scraper_show_additions').insert(showAdditions);
        }
      } catch (dbError) {
        console.error(`Error retrieving or storing show details: ${dbError}`);
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
    try {
      const insertResult = await db('development.scraper_logs').insert({
        scraper_name: scraperName,
        run_at: new Date(),
        added_count: 0,
        updated_count: 0,
        duplicate_count: 0,
        skipped_count: 0,
        added_shows: '[]',
        updated_shows: '[]',
        errors: JSON.stringify([`Error running ${scraperName}: ${error.message}`]),
        raw_output: JSON.stringify({ error: error.message })
      }).returning('id');
      
      const logId = insertResult[0].id;
      
      return {
        scraper_name: scraperName,
        success: false,
        added_count: 0,
        updated_count: 0,
        duplicate_count: 0,
        skipped_count: 0,
        added_shows: [],
        updated_shows: [],
        errors: [`Error running ${scraperName}: ${error.message}`],
        log_id: logId
      };
    } catch (dbError) {
      console.error(`Error logging scraper failure to database: ${dbError}`);
      return {
        scraper_name: scraperName,
        success: false,
        added_count: 0,
        updated_count: 0,
        duplicate_count: 0,
        skipped_count: 0,
        added_shows: [],
        updated_shows: [],
        errors: [`Error running ${scraperName}: ${error.message}`, `Error logging to database: ${dbError.message}`],
      };
    }
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
      // If no specific scraper provided, run a few default ones
      const defaultScrapers = ['berlin', '331_club', 'first_avenue'];
      
      for (const scraperToRun of defaultScrapers) {
        if (validScraperIds.includes(scraperToRun)) {
          tasks.push(runScraper(scraperToRun));
        }
      }
    }
    
    const logs = await Promise.all(tasks);
    res.json({ logs });
  } catch (err) {
    console.error('Error in /run-scrapers:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get available scrapers endpoint - optionally make it dynamic
router.get('/available-scrapers', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    // Option: Use dynamic scraper list from config.py
    // Uncomment this to dynamically get the scraper list
    /*
    const scrapeDir = path.join(__dirname, '../../scrapers');
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    
    try {
      const { stdout } = await execPromise(
        `${pythonPath} ${path.join(scrapeDir, 'run_scraper.py')} --list --env-file ${path.join(scrapeDir, '.env')}`
      );
      
      const scraperLines = stdout.split('\n').filter(line => line.includes('Available scrapers') || line.trim().startsWith('-'));
      let scrapers = [];
      
      if (scraperLines.length > 1) {
        // Extract scraper info from lines like "- berlin: Berlin (Enabled)"
        scrapers = scraperLines.slice(1).map(line => {
          const match = line.match(/^\s*-\s+(\w+):\s+(.+?)\s+\((\w+)\)/);
          if (match) {
            return {
              id: match[1],
              name: match[2],
              enabled: match[3] === 'Enabled'
            };
          }
          return null;
        }).filter(Boolean);
        
        return res.json({ scrapers });
      }
    } catch (err) {
      console.error('Error getting dynamic scraper list:', err);
    }
    */
    
    // Fall back to hardcoded list
    res.json({ scrapers: AVAILABLE_SCRAPERS });
  } catch (err) {
    console.error('Error in /available-scrapers:', err);
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

export default router;