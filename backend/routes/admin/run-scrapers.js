import express from 'express';
import { exec, spawn } from 'child_process';
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
  { id: '331', name: '331 Club' },
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
  // --- 1. Define Paths ---
  const scrapeDir = path.join(__dirname, '../../scrapers'); // Path to /scrapers directory
  const logsDir = path.join(scrapeDir, 'logs'); // Path to /scrapers/logs directory

  console.log(`[${scraperName}] Starting runScraper function.`);

  try {
    // --- 2. Determine Virtual Environment ---
    // Adjust baseDir logic if needed - this assumes venv is in the project root
    // If backend is '/var/www/tcup-production/backend' and venv is '/var/www/tcup-production/myenv'
    // then baseDir should be '/var/www/tcup-production'
    const projectRootDir = path.resolve(__dirname, '../../..'); // Example: Navigate up from backend/routes/admin
    const baseDir = process.env.APP_BASE_DIR || projectRootDir;
    const venvName = process.env.VENV_NAME || 'myenv'; // <<< CONFIRM 'myenv' is correct
    const venvPath = path.join(baseDir, venvName);
    // We still check for 'activate' as a sign the venv dir structure is likely correct
    const activateScript = path.join(venvPath, 'bin', 'activate');

    console.log(`[${scraperName}] Base directory used for venv check: ${baseDir}`);
    console.log(`[${scraperName}] Venv name used: ${venvName}`);
    console.log(`[${scraperName}] Checking for venv activation script at: ${activateScript}`);

    const venvExists = fs.existsSync(venvPath) && fs.existsSync(activateScript);
    console.log(`[${scraperName}] Virtual environment activation script exists: ${venvExists}`);

    let pythonExecutablePath; // Path to the python executable to use
    let processArgs;        // Arguments array for the python script

    // --- 3. Determine Python Executable and Arguments ---
    const scriptPath = path.join(scrapeDir, 'run_scraper.py');
    const envFilePath = path.join(scrapeDir, '.env'); // Assuming .env is inside /scrapers

    if (venvExists) {
      // *** NEW LOGIC: Use python executable directly from venv ***
      const venvPythonPath = path.join(venvPath, 'bin', 'python3');
      // Verify the python executable exists within the venv bin directory
      if (fs.existsSync(venvPythonPath)) {
        pythonExecutablePath = venvPythonPath;
        console.log(`[${scraperName}] Using virtual environment Python executable: ${pythonExecutablePath}`);
      } else {
        console.error(`[${scraperName}] Error: Python executable not found at ${venvPythonPath}! Falling back to system Python.`);
        pythonExecutablePath = process.env.PYTHON_PATH || 'python3'; // Fallback
        console.log(`[${scraperName}] Falling back to Python path: ${pythonExecutablePath}`);
      }
      // *** END NEW LOGIC ***
    } else {
      // Fallback if venv directory or activate script doesn't exist
      pythonExecutablePath = process.env.PYTHON_PATH || 'python3';
      console.log(`[${scraperName}] Venv not found or incomplete at ${venvPath}. Using Python path: ${pythonExecutablePath}`);
    }

    // Define the arguments array for the python process
    processArgs = [
      scriptPath,      // The script to run
      scraperName,     // The scraper ID (e.g., '331', 'firstave')
      '--env-file',    // Argument name for the env file
      envFilePath      // Path to the .env file
      // Add any other default arguments if needed, e.g.:
      // '--headless'
    ];

    // --- 4. Spawn the Python Process ---
    let pythonProcess;
    let stdoutData = '';
    let stderrData = ''; // Ensure stderrData is declared

    try {
      console.log(`[${scraperName}] Spawning process: ${pythonExecutablePath} ${processArgs.join(' ')}`);
      console.log(`[${scraperName}] Working directory: ${scrapeDir}`);

      // *** Use the determined executable and args array ***
      pythonProcess = spawn(pythonExecutablePath, processArgs, {
          cwd: scrapeDir,          // Set working directory to scrapers folder
          env: { ...process.env }  // Pass current environment variables
      });
      // *** END Use the determined executable and args array ***

    } catch (spawnError) {
        console.error(`[${scraperName}] FATAL: Error spawning Python process: ${spawnError}`);
        // Return an error structure immediately if spawn fails
         return { // Provide a default structure matching successful runs
            scraper_name: scraperName, success: false, errors: [`Node.js failed to spawn Python process: ${spawnError.message}`],
            added_count: 0, updated_count: 0, duplicate_count: 0, skipped_count: 0, error_count: 1,
            added_shows: [], updated_shows: [], log_id: null
        };
    }

    // --- 5. Capture Output (Add detailed stderr logging) ---
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutData += output;
      // Optional: Log stdout stream if needed
      // console.log(`[${scraperName} stdout STREAM]:`, output);
    });

    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderrData += output;
      // Log stderr immediately AS IT COMES IN
      console.error(`[${scraperName} stderr STREAM]:`, output); // <<< KEEP THIS LOG
    });

    // --- 6. Wait for Process Exit ---
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', (code) => resolve(code)); // Get exit code on close
      pythonProcess.on('error', (err) => {
            console.error(`[${scraperName}] Error during Python process execution: ${err}`);
            stderrData += `\nNode.js process error: ${err.message}`;
            resolve(err.code || 1); // Resolve with an error code
        });
    });

    console.log(`[${scraperName}] Python script completed with exit code: ${exitCode}`);

    // Log full output if exit code is non-zero
    if (exitCode !== 0) {
      console.error(`[${scraperName} exit code ${exitCode}] FULL STDERR:\n${stderrData}`); // <<< KEEP THIS LOG
      console.log(`[${scraperName} exit code ${exitCode}] FULL STDOUT:\n${stdoutData}`); // Log stdout for context on error
    }

    // --- 7. Process Results (Same as your original code) ---
    let result = null;
    // 7a. Try to parse results JSON file
    let resultFiles = [];
    if (fs.existsSync(logsDir)) {
      try {
        resultFiles = fs.readdirSync(logsDir)
          .filter(file => file.toLowerCase().includes(scraperName.toLowerCase()) && file.endsWith('_results.json'))
           .map(file => ({ name: file, mtime: fs.statSync(path.join(logsDir, file)).mtime }))
           .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      } catch (fsError) {
        console.error(`[${scraperName}] Error reading log directory ${logsDir}: ${fsError}`);
      }
    }

    if (resultFiles.length > 0) {
      const resultFilePath = path.join(logsDir, resultFiles[0].name);
       console.log(`[${scraperName}] Attempting to parse results from file: ${resultFiles[0].name}`);
      try {
        const resultData = fs.readFileSync(resultFilePath, 'utf8');
        result = JSON.parse(resultData);
        console.log(`[${scraperName}] Successfully parsed results from file.`);
         // Overwrite success if exit code was bad but old file was found
         if (exitCode !== 0) {
             result.success = false;
             if (!result.errors || result.errors.length === 0) {
                result.errors = [`Script exited with code ${exitCode}. Check stderr logs.`];
             }
         }
      } catch (parseError) {
        console.error(`[${scraperName}] Failed to parse results file ${resultFiles[0].name}: ${parseError}`);
        result = null;
      }
    }

    // 7b. If no file result, try parsing stdout (only if script likely succeeded)
    if (!result && exitCode === 0) {
        console.log(`[${scraperName}] Attempting to parse results from stdout.`);
      try {
        const trimmedOutput = stdoutData.trim();
        const jsonStart = trimmedOutput.indexOf('{');
        if (jsonStart >= 0) {
          const jsonString = trimmedOutput.substring(jsonStart);
          result = JSON.parse(jsonString);
          console.log(`[${scraperName}] Successfully parsed results from stdout.`);
        } else {
          throw new Error("No JSON object found in stdout output");
        }
      } catch (parseError) {
        console.error(`[${scraperName}] Failed to parse JSON output from stdout: ${parseError}`);
        result = null;
      }
    }

    // 7c. If still no result, create a basic one (especially for failures)
    if (!result) {
        console.log(`[${scraperName}] Creating basic result object due to lack of parsed data.`);
        result = {
            scraper_name: scraperName,
            success: exitCode === 0,
            added_count: 0, updated_count: 0, duplicate_count: 0, skipped_count: 0,
            error_count: exitCode === 0 ? 0 : 1,
            added_shows: [], updated_shows: [],
            // Include stderr in errors for context
            errors: exitCode === 0 ? [] : [`Script exited with code ${exitCode}. Stderr: ${stderrData.substring(0, 500)}${stderrData.length > 500 ? '...' : ''}`],
             // Include truncated stdout/stderr for context
            raw_stdout: stdoutData.substring(0, 500) + (stdoutData.length > 500 ? '...' : ''),
            raw_stderr: stderrData.substring(0, 500) + (stderrData.length > 500 ? '...' : '')
        };
    }

    // --- 8. Store Log in Database (Same as your original code) ---
    let logId = null;
     try {
        console.log(`[${scraperName}] Attempting to insert log into database.`);
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
            raw_output: JSON.stringify(result) // Store the processed result object
        }).returning('id');

        // Check if insertResult is valid and has an id
         if (insertResult && insertResult.length > 0 && insertResult[0] && insertResult[0].id) {
            logId = insertResult[0].id;
            console.log(`[${scraperName}] Successfully inserted log with ID: ${logId}`);
            result.log_id = logId; // Add log_id to the result object being returned
        } else {
            console.error(`[${scraperName}] Failed to insert log or get returning ID. Result from insert:`, insertResult);
            result.errors = [...(result.errors || []), "Failed to insert log into database or retrieve ID."];
        }

        // Store added show details (only if log insertion succeeded and shows were added)
        // Check result.success as well, maybe only store details if run succeeded
        if (logId && result.added_shows && result.added_shows.length > 0 /* && result.success */) {
             console.log(`[${scraperName}] Storing details for ${result.added_shows.length} added shows.`);
            try {
                // ... (your existing show detail storage logic) ...
                 const showDetails = await db('development.shows')
                  .select('shows.id', 'shows.bands as show_name', 'venues.venue as venue_name', 'shows.start as show_date')
                  .join('venues', 'shows.venue_id', 'venues.id')
                  .whereIn('shows.id', result.added_shows);

                if (showDetails.length > 0) {
                    const showAdditions = showDetails.map(show => ({
                        scraper_log_id: logId,
                        show_id: show.id,
                        show_name: show.show_name,
                        venue_name: show.venue_name,
                        show_date: show.show_date
                    }));
                    await db('development.scraper_show_additions').insert(showAdditions);
                    console.log(`[${scraperName}] Successfully stored added show details.`);
                } else {
                    console.warn(`[${scraperName}] Could not find details in 'shows' table for added show IDs: ${result.added_shows.join(', ')}`);
                }
            } catch (dbError) {
                 console.error(`[${scraperName}] Error retrieving or storing added show details: ${dbError}`);
                 result.errors = [...(result.errors || []), `Error storing added show details: ${dbError.message}`];
                 if(result.error_count !== undefined) result.error_count++; else result.error_count = 1;
            }
        }

    } catch (dbError) {
        console.error(`[${scraperName}] FATAL: Error logging scraper run to database: ${dbError}`);
        result.success = false;
        result.errors = [...(result.errors || []), `Error logging run to database: ${dbError.message}`];
        if(result.error_count !== undefined) result.error_count++; else result.error_count = 1;
        // Ensure result object exists even if DB fails early
        if (!result.scraper_name) result.scraper_name = scraperName;
    }

    // --- 9. Return Final Result ---
    console.log(`[${scraperName}] runScraper function finished. Returning results.`);
    // Ensure a default log_id if it wasn't set
    if (result.log_id === undefined) {
        result.log_id = null;
    }
    return result;

  } catch (error) {
    // Catch any unexpected errors in the overall runScraper function
    console.error(`[${scraperName}] UNEXPECTED ERROR in runScraper function: ${error}`);
    console.error(error.stack); // Log stack trace
    // Return a comprehensive error object
    return {
      scraper_name: scraperName,
      success: false,
      added_count: 0, updated_count: 0, duplicate_count: 0, skipped_count: 0, error_count: 1,
      added_shows: [], updated_shows: [],
      errors: [`Unexpected Node.js error in runScraper: ${error.message}`],
      log_id: null
    };
  }
}

// Run scrapers endpoint
// Inside router.post('/run-scrapers', ...)
router.post('/run-scrapers', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { scraper } = req.body;
  const tasks = [];
  const validScraperIds = AVAILABLE_SCRAPERS.map(s => s.id); // Make sure this is up-to-date

  // --- Debugging Logs ---
  console.log('--- Received /run-scrapers Request ---');
  console.log('Request Body:', req.body);
  console.log('Extracted scraper ID:', scraper);
  console.log('Type of scraper ID:', typeof scraper);
  console.log('Valid Scraper IDs:', validScraperIds);
  // --- End Debugging Logs ---

  try {
    if (scraper) {
      console.log(`Checking if valid IDs array includes '${scraper}'...`); // Log the check
      if (validScraperIds.includes(scraper)) {
        console.log('ID is valid. Adding task.'); // Log success
        tasks.push(runScraper(scraper));
      } else {
        console.error(`Validation Failed: Scraper ID '${scraper}' not found in valid IDs.`); // Log failure
        return res.status(400).json({ error: 'Invalid scraper name' });
      }
    } else {
      // Run default scrapers (check for the typo mentioned below)
      const defaultScrapers = ['berlin', '331', 'first_avenue']; // Corrected '331_club' to '331'
      console.log('Running default scrapers:', defaultScrapers);
      // ... (rest of default logic)
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