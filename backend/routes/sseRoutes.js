// sseRoutes.js (or add to your existing scrapers route)
import express from 'express';
import { spawn } from 'child_process';

const sseRouter = express.Router();

sseRouter.get('/run-scrapers-stream', async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Allow the request to finish only when we explicitly close it
  req.socket.setTimeout(0);

  // For example, let's run just one scraper to demonstrate streaming logs:
  const pythonPath = '/Users/musicdaddy/Desktop/venues/myenv/bin/python';
  const scriptPath = '/path/to/your_scraper.py';

  const child = spawn(pythonPath, [scriptPath]);

  // When Python prints to stdout, immediately forward it as an SSE message
  child.stdout.on('data', (data) => {
    // data is a Buffer, so convert to string
    const msg = data.toString();
    console.log('SCRAPER STDOUT:', msg);

    // Send an SSE message
    // The SSE format requires "data: " prefix and a blank line at the end
    res.write(`data: ${JSON.stringify({ type: 'stdout', message: msg })}\n\n`);
  });

  // Same for stderr
  child.stderr.on('data', (data) => {
    const msg = data.toString();
    console.error('SCRAPER STDERR:', msg);

    res.write(`data: ${JSON.stringify({ type: 'stderr', message: msg })}\n\n`);
  });

  // When the script finishes
  child.on('close', (code) => {
    console.log(`Scraper process exited with code ${code}`);

    // Send a final SSE message to indicate completion
    res.write(`data: ${JSON.stringify({ type: 'complete', code })}\n\n`);
    // Close the SSE stream
    res.end();
  });
});

export default sseRouter;