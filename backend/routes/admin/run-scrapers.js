import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import authMiddleware from '../../middleware/auth.js';
import checkRole from '../../middleware/check-role.js';

const router = express.Router();
const execPromise = promisify(exec);

async function runScraper(scraperName) {
    const scriptPath = `./scrapers/${scraperName}_scraper.py`;
      try {
    const { stdout } = await execPromise(`python ${scriptPath}`);
    return JSON.parse(stdout);
  } catch (error) {
    return {
      scraper_name: scraperName,
      added_count: 0,
      duplicate_count: 0,
      added_shows: [],
      errors: [`Error running ${scraperName}: ${error.message}`],
    };
  }
}

router.post('/run-scrapers', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { scraper } = req.body;
  const tasks = [];
  try {
    if (scraper) {
      if (['331_club', 'aster_cafe', 'berlin_mpls'].includes(scraper)) {
        tasks.push(runScraper(scraper));
      } else {
        return res.status(400).json({ error: 'Invalid scraper name' });
      }
    } else {
      tasks.push(runScraper('331_club'));
      tasks.push(runScraper('aster_cafe'));
      tasks.push(runScraper('berlin_mpls'));
    }
    const logs = await Promise.all(tasks);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

export default router;