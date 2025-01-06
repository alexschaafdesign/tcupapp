import express from 'express';
import { listEvents } from '../calendar.js';
const router = express.Router();

// Define the route for fetching events
router.get('/', async (req, res) => {
  try {
    const events = await listEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router; // Export the router