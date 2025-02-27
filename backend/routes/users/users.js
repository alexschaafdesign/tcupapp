// routes/users.js
import express from 'express';
import pool from '../../config/db.js';
import authMiddleware from '../../middleware/auth.js';
import cloudinary from '../../config/cloudinary.js';
import axios from 'axios';

const router = express.Router();

// Get a user
router.get('/profile', authMiddleware, async (req, res) => {
  console.log('GET /profile hit'); // Debug endpoint hit
  console.log('Auth0 ID:', req.user.sub); // Debug auth ID
  try {
      const auth0Id = req.user.sub;
      
      const user = await pool.query(
          'SELECT * FROM users WHERE auth0_id = $1',
          [auth0Id]
      );

      if (user.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json(user.rows[0]);
  } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT auth0_id, username, email FROM users ORDER BY username');
      console.log('Users fetched:', rows);
      res.json(rows);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
  }
});

// Get or create user profile
router.post('/profile', async (req, res) => {
  try {
    const { sub: auth0Id, email, name } = req.body; // Auth0 user info
    
    // Check if user exists
    let user = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0Id]
    );

    if (user.rows.length === 0) {
      // Create new user
      user = await pool.query(
        'INSERT INTO users (auth0_id, email, username) VALUES ($1, $2, $3) RETURNING *',
        [auth0Id, email, name]
      );
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get user's bands
router.get('/bands', authMiddleware, async (req, res) => {
  try {
    const auth0Id = req.user.sub;

    const result = await pool.query(
      `SELECT b.*, ub.relationship_type 
       FROM tcupbands b 
       JOIN user_tcupbands ub ON b.id = ub.tcupband_id 
       JOIN users u ON u.id = ub.user_id 
       WHERE u.auth0_id = $1`,
      [auth0Id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get user's saved shows
router.get('/shows', authMiddleware, async (req, res) => {
  try {
    const auth0Id = req.user.sub;

    const result = await pool.query(
      `SELECT s.* 
       FROM shows s 
       JOIN user_shows us ON s.id = us.show_id 
       JOIN users u ON u.id = us.user_id 
       WHERE u.auth0_id = $1`,
      [auth0Id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update user's avatars
// In your users.js route file
router.put('/avatar', authMiddleware, async (req, res) => {
  const { avatarUrl } = req.body;
  const userId = req.user.sub;
  
  console.log('\n=== Avatar Update Request ===');
  console.log('User ID:', userId);
  console.log('Avatar URL:', avatarUrl);
  
  try {
    const result = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE auth0_id = $2 RETURNING *',
      [avatarUrl, userId]
    );

    console.log('\nDatabase Result:', result.rows[0]);
    console.log('=== End Avatar Update ===\n');

    if (result.rows.length === 0) {
      console.log('No user found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('\nError updating avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Expects query parameters: publicId and zoom (and optionally x, y for cropping)
router.get('/transformed-avatar', (req, res) => {
  const { publicId, zoom } = req.query;
  
  // You can add more transformation options as needed:
  const transformedUrl = cloudinary.url(publicId, {
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'center', zoom: Number(zoom) }
    ]
  });
  
  res.json({ url: transformedUrl });
});

// Add this to routes/users.js
router.put('/username', authMiddleware, async (req, res) => {
  const { username } = req.body;
  const userId = req.user.sub;

  console.log('Updating username for user:', userId);
  console.log('New username:', username);
  
  try {
    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE auth0_id = $2 RETURNING *',
      [username, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ 
      error: 'Failed to update username',
      details: error.message 
    });
  }
});

// routes/users.js or where you have your routes
// In users.js routes
router.get('/test-auth', authMiddleware, (req, res) => {
    console.log('Test auth endpoint hit');
    console.log('User:', req.user);
    try {
      if (!req.user) {
        throw new Error('No user information available');
      }
  
      res.json({ 
        message: 'Authentication working!', 
        userId: req.user.sub,
        timestamp: new Date(),
        userInfo: req.user  // Include the full user info in response
      });
    } catch (err) {
      console.error('Error in test-auth:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });

  router.put('/password', authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const auth0Id = req.user.sub;
  
      // Get Management API token
      const tokenResponse = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: "https://dev-1s71soupcjy6t33y.us.auth0.com/api/v2/",
          grant_type: 'client_credentials'
        }
      );
  
      console.log('Token response:', tokenResponse.data);
  
      // Update password directly
      await axios.patch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0Id}`,
        {
          password: newPassword,
          connection: "Username-Password-Authentication"
        },
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.log('Full error details:', error.response?.data);
      console.log('Auth0 request config:', error.config);
      console.log('Response headers:', error.response?.headers);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  router.put('/email', authMiddleware, async (req, res) => {
    try {
      const { email } = req.body;
      const auth0Id = req.user.sub;
  
      // Get Management API token
      const tokenResponse = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: "https://dev-1s71soupcjy6t33y.us.auth0.com/api/v2/",
          grant_type: 'client_credentials'
        }
      );
  
      // Update email in Auth0
      await axios.patch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${auth0Id}`,
        {
          email: email,
          connection: "Username-Password-Authentication"
        },
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Update email in PostgreSQL
      const result = await pool.query(
        'UPDATE users SET email = $1 WHERE auth0_id = $2 RETURNING *',
        [email, auth0Id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // Update user title
router.put('/title', authMiddleware, async (req, res) => {
  try {
      const { title } = req.body;
      const auth0Id = req.user.sub; // Extract Auth0 ID from request

      // Validate title length
      if (!title || title.length > 16) {
          return res.status(400).json({ error: 'Title must be between 1 and 16 characters.' });
      }

      // Update title in PostgreSQL
      const result = await pool.query(
          'UPDATE users SET title = $1 WHERE auth0_id = $2 RETURNING title',
          [title, auth0Id]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, title: result.rows[0].title });
  } catch (error) {
      console.error('Error updating title:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;