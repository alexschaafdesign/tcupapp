// routes/users.js
import express from 'express';
import pool from '../../config/db.js';
import authMiddleware from '../../middleware/auth.js';
import cloudinary from '../../config/cloudinary.js';
import axios from 'axios';
import sgMail from '@sendgrid/mail';


const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Get a user
// create user profile
router.post('/profile', async (req, res) => {
  try {
    console.log('==== User Profile Creation ====');
    console.log('Incoming Auth0 data:', JSON.stringify(req.body, null, 2));
    
    const { sub: auth0Id, email } = req.body; // Auth0 user info
    
    // Extract username with clear priority order
    const namespace = 'https://tcupboard.org/';
    let username;
    let source = "unknown";
    
    // 1. First priority: Custom namespace claim
    if (req.body[`${namespace}username`]) {
      username = req.body[`${namespace}username`];
      source = "custom claim";
    } 
    // 2. Second priority: nickname
    else if (req.body.nickname) {
      username = req.body.nickname;
      source = "nickname";
    }
    // 3. Third priority: name
    else if (req.body.name) {
      username = req.body.name;
      source = "name";
    }
    // 4. More fallbacks
    else if (req.body.preferred_username) {
      username = req.body.preferred_username;
      source = "preferred_username";
    }
    else if (email) {
      username = email.split('@')[0];
      source = "email username";
    }
    else {
      // Last resort fallback with random string
      const randomId = Math.random().toString(36).substring(2, 10);
      username = `user_${randomId}`;
      source = "random fallback";
    }
    
    console.log(`Selected username "${username}" from source: ${source}`);
    
    // Check if user exists
    let user = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0Id]
    );

    if (user.rows.length === 0) {
      console.log('Creating new user with username:', username);
      // Create new user with extracted username
      user = await pool.query(
        'INSERT INTO users (auth0_id, email, username) VALUES ($1, $2, $3) RETURNING *',
        [auth0Id, email, username]
      );
    } else {
      console.log('User already exists:', user.rows[0]);
      
      // ONLY update email if needed - leave username alone
      if (user.rows[0].email !== email) {
        console.log('Updating user email from', user.rows[0].email, 'to', email);
        user = await pool.query(
          'UPDATE users SET email = $1 WHERE auth0_id = $2 RETURNING *',
          [email, auth0Id]
        );
      }
      // Do NOT update username for existing users
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error('Error in profile creation:', err);
    res.status(500).send('Server error');
  }
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT auth0_id, username, email FROM users ORDER BY username');
    //  console.log('Users fetched:', rows);
      res.json(rows);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message });
  }
});

// In your users.js file, add or update the route to handle profile/:auth0Id
router.get('/profile/:auth0Id', authMiddleware, async (req, res) => {
  try {
    const { auth0Id } = req.params;
    const requesterId = req.user.sub;
    
    console.log('Profile request:');
    console.log('- Requested profile:', auth0Id);
    console.log('- Requester ID:', requesterId);
    
    const query = 'SELECT id, auth0_id, username, bio, avatar_url, tagline, created_at FROM users WHERE auth0_id = $1';
    const result = await pool.query(query, [auth0Id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If looking at own profile, include email and other sensitive fields
    if (auth0Id === requesterId) {
      const ownProfileQuery = 'SELECT * FROM users WHERE auth0_id = $1';
      const ownResult = await pool.query(ownProfileQuery, [auth0Id]);
      return res.json({
        ...ownResult.rows[0],
        isOwnProfile: true
      });
    }
    
    // For other users' profiles, only return limited information
    return res.json({
      ...result.rows[0],
      isOwnProfile: false
    });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
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

// Update user's bio
router.put('/bio', authMiddleware, async (req, res) => {
  try {
    const { bio } = req.body;
    const auth0Id = req.user.sub;

    const result = await pool.query(
      'UPDATE users SET bio = $1 WHERE auth0_id = $2 RETURNING bio',
      [bio, auth0Id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, bio: result.rows[0].bio });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
  
  try {
    console.log('Updating username for user:', userId);
    
    // Get Management API token
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials'
      }
    );
    
    // Update Auth0 user (setting both fields to ensure consistency)
    await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      {
        nickname: username,
        user_metadata: { preferred_username: username }
      },
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update PostgreSQL
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
    console.error('Auth0 response:', error.response?.data);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// routes/users.js or where you have your routes
// In users.js routes
router.get('/test-auth', authMiddleware, (req, res) => {
  console.log('Test auth endpoint hit');
  console.log('Full user object:', JSON.stringify(req.user, null, 2));
  
  // Check for custom username claim
  const namespace = 'https://tcupboard.org/';
  const customUsername = req.user[`${namespace}username`];
  console.log('Custom username from token:', customUsername);
  
  try {
    if (!req.user) {
      throw new Error('No user information available');
    }

    res.json({ 
      message: 'Authentication working!', 
      userId: req.user.sub,
      timestamp: new Date(),
      userInfo: req.user,
      customClaims: {
        username: customUsername
      }
    });
  } catch (err) {
    console.error('Error in test-auth:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.get('/auth-test', (req, res) => {
  // No auth middleware - should always work
  res.json({ message: 'Public endpoint working' });
});

router.get('/token-debug', authMiddleware, (req, res) => {
  // Will test if auth middleware passes
  res.json({
    message: 'Token validated successfully',
    user: {
      sub: req.user.sub,
      roles: req.user.roles
    },
    headers: {
      authorization: req.headers.authorization ? 'Present (not shown)' : 'Missing'
    }
  });
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
    console.log("EMAIL ROUTE DEBUG:");
    console.log("Current NODE_ENV:", process.env.NODE_ENV);
    console.log("AUTH0_DOMAIN:", process.env.AUTH0_DOMAIN);
    console.log("AUTH0_CLIENT_ID:", process.env.AUTH0_CLIENT_ID);
    console.log("AUTH0_CLIENT_SECRET:", process.env.AUTH0_CLIENT_SECRET ? "[PRESENT]" : "[MISSING]");
    
    try {
      const { email } = req.body;
      // Fix #1: Check both locations for the auth0 ID
      const auth0Id = req.auth?.payload?.sub || req.user?.sub;
      
      if (!auth0Id) {
        console.error("No auth0Id found in request", {req: {auth: req.auth, user: req.user}});
        return res.status(401).json({ error: "User ID not found in token" });
      }
  
      console.log("Using auth0Id:", auth0Id);
      
      // Get Management API token
      const tokenResponse = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          // Fix #2: Use the dynamic Auth0 domain
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: 'client_credentials'
        }
      );
  
      console.log("Got management token");
      
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
  
      console.log("Updated email in Auth0");
      
      // Update email in PostgreSQL
      const result = await pool.query(
        'UPDATE users SET email = $1 WHERE auth0_id = $2 RETURNING *',
        [email, auth0Id]
      );
  
      console.log("Updated email in PostgreSQL");
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating email:', error);
      console.error('Auth0 response:', error.response?.data);
      console.error('Full error:', JSON.stringify(error, null, 2));
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // Update user tagline
router.put('/tagline', authMiddleware, async (req, res) => {
  try {
      const { tagline } = req.body;
      const auth0Id = req.user.sub; // Extract Auth0 ID from request

      // Validate tagline length
      if (!tagline || tagline.length > 16) {
          return res.status(400).json({ error: 'Tagline must be between 1 and 16 characters.' });
      }

      // Update tagline in PostgreSQL
      const result = await pool.query(
          'UPDATE users SET tagline = $1 WHERE auth0_id = $2 RETURNING tagline',
          [tagline, auth0Id]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, tagline: result.rows[0].tagline });
  } catch (error) {
      console.error('Error updating tagline:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;