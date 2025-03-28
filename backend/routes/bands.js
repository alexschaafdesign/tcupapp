import express from "express";
import fetchAllBandsMiddleware from "../middleware/fetchAllBands.js";
import fetchBandMiddleware from "../middleware/fetchBand.js";
import uploadAndParse from "../middleware/uploadAndParse.js";
import { 
  getAllBands, 
  getBandById, 
  updateBand 
} from "../controllers/bandController.js";
import pool from '../config/db.js';
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const schema = process.env.DB_SCHEMA || 'development';

// Fetch all band slugs (for validation)
router.get('/slugs', async (req, res) => {
  try {
    // Get slugs from both the slug and custom_slug fields
    const result = await pool.query(`
      SELECT slug FROM ${schema}.bands_new WHERE slug IS NOT NULL
      UNION
      SELECT custom_slug FROM ${schema}.bands_new WHERE custom_slug IS NOT NULL
    `);
    
    const slugs = result.rows.map(row => row.slug);
    res.json(slugs);
  } catch (error) {
    console.error('Error fetching slugs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all bands claimed by current user
router.get('/myclaims', authMiddleware, async (req, res) => {
  const userId = req.user.sub;
  console.log('Fetching claims for user:', userId);

  try {
    const result = await pool.query(
      `SELECT * FROM ${schema}.bands_new 
       WHERE claimed_by = $1 
       ORDER BY name`,
      [userId]
    );
      
    console.log('Found claimed bands:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching claimed bands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch all bands
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.name, b.slug, b.location, b.profile_image, 
             array_agg(DISTINCT bg.genre) FILTER (WHERE bg.genre IS NOT NULL) as genres
      FROM ${schema}.bands_new b
      LEFT JOIN ${schema}.band_genres bg ON b.id = bg.band_id
      GROUP BY b.id
      ORDER BY b.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all bands:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route: Fetch a specific band by slug
router.get("/:slug", async (req, res) => {
  try {
    // Fetch main band data
    const bandResult = await pool.query(
      `SELECT * FROM ${schema}.bands_new 
       WHERE slug = $1 OR custom_slug = $1`,
      [req.params.slug]
    );
    
    if (bandResult.rows.length === 0) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    const band = bandResult.rows[0];
    
    // Fetch related data
    const membersResult = await pool.query(
      `SELECT id, name, role, bio FROM ${schema}.band_members 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const genresResult = await pool.query(
      `SELECT genre FROM ${schema}.band_genres 
       WHERE band_id = $1`,
      [band.id]
    );
    
    // Other queries for related data...
    
    // Combine all data
    const bandData = {
      ...band,
      members: membersResult.rows,
      genres: genresResult.rows.map(row => row.genre),
      // Add other related data...
    };
    
    res.json(bandData);
  } catch (error) {
    console.error('Error fetching band:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route: Fetch data for edit form
router.get("/:slug/edit", authMiddleware, async (req, res) => {
  try {
    // Fetch main band data
    const bandResult = await pool.query(
      `SELECT * FROM ${schema}.bands_new 
       WHERE slug = $1 OR custom_slug = $1`,
      [req.params.slug]
    );
    
    if (bandResult.rows.length === 0) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    const band = bandResult.rows[0];
    
    // Check ownership if the band is claimed
    if (band.claimed_by && band.claimed_by !== req.user.sub) {
      return res.status(403).json({ error: 'Not authorized to edit this band' });
    }
    
    // Fetch all related data
    const membersResult = await pool.query(
      `SELECT id, name, role, bio FROM ${schema}.band_members 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const openPositionsResult = await pool.query(
      `SELECT position FROM ${schema}.band_open_positions 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const genresResult = await pool.query(
      `SELECT genre FROM ${schema}.band_genres 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const releasesResult = await pool.query(
      `SELECT id, title, release_date, type, link 
       FROM ${schema}.band_releases 
       WHERE band_id = $1 
       ORDER BY release_date DESC`,
      [band.id]
    );
    
    const merchTypesResult = await pool.query(
      `SELECT merch_type FROM ${schema}.band_merch_types 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const imagesResult = await pool.query(
      `SELECT id, image_url, caption 
       FROM ${schema}.band_images 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const featuredContentResult = await pool.query(
      `SELECT id, content_type, content_id, display_order 
       FROM ${schema}.band_featured_content 
       WHERE band_id = $1 
       ORDER BY display_order`,
      [band.id]
    );
    
    const profileBadgesResult = await pool.query(
      `SELECT badge_type FROM ${schema}.band_profile_badges 
       WHERE band_id = $1`,
      [band.id]
    );
    
    const groupSizesResult = await pool.query(
      `SELECT size_category FROM ${schema}.band_group_sizes 
       WHERE band_id = $1`,
      [band.id]
    );
    
    // Combine all data
    const bandData = {
      ...band,
      members: membersResult.rows,
      openPositions: openPositionsResult.rows.map(row => row.position),
      genre: genresResult.rows.map(row => row.genre),
      releases: releasesResult.rows.map(row => ({
        ...row,
        releaseDate: row.release_date,
        release_date: undefined
      })),
      merchTypes: merchTypesResult.rows.map(row => row.merch_type),
      other_images: imagesResult.rows,
      featuredContent: featuredContentResult.rows,
      profileBadges: profileBadgesResult.rows.map(row => row.badge_type),
      group_size: groupSizesResult.rows.map(row => row.size_category)
    };
    
    // Parse JSON fields if they're stored as strings
    if (typeof bandData.music_links === 'string') {
      bandData.music_links = JSON.parse(bandData.music_links);
    }
    
    if (typeof bandData.social_links === 'string') {
      bandData.social_links = JSON.parse(bandData.social_links);
    }
    
    res.json({ data: bandData });
  } catch (error) {
    console.error('Error fetching band for editing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new band
router.post('/add', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert main band data
    const { 
      name, slug, location, yearFormed, originStory, bio, profile_image,
      lookingForMembers, play_shows, performanceNotes, hasMerch, merchUrl,
      bandemail, customSlug, profileTheme, headerLayout, backgroundPattern,
      backgroundImage, music_links, social_links, members, openPositions,
      genre, releases, merchTypes, other_images, featuredContent, profileBadges,
      group_size
    } = req.body;
    
    // Insert main band record
    const bandInsert = await client.query(`
      INSERT INTO ${schema}.bands_new (
        name, slug, location, year_formed, origin_story, bio, profile_image,
        looking_for_members, play_shows, performance_notes, has_merch, merch_url,
        bandemail, custom_slug, profile_theme, header_layout, background_pattern,
        background_image, music_links, social_links, claimed_by, claimed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
              $16, $17, $18, $19, $20, $21, NOW())
      RETURNING id
    `, [
      name, slug, location, yearFormed, originStory, bio, profile_image,
      lookingForMembers, play_shows, performanceNotes, hasMerch, merchUrl,
      bandemail, customSlug, profileTheme, headerLayout, backgroundPattern,
      backgroundImage, JSON.stringify(music_links), JSON.stringify(social_links),
      req.user.sub // Auto-claim the band when created
    ]);
    
    const bandId = bandInsert.rows[0].id;
    
    // Insert members
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.name.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_members (band_id, name, role, bio)
            VALUES ($1, $2, $3, $4)
          `, [bandId, member.name, member.role, member.bio]);
        }
      }
    }
    
    // Insert open positions
    if (lookingForMembers && openPositions && openPositions.length > 0) {
      for (const position of openPositions) {
        if (position.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_open_positions (band_id, position)
            VALUES ($1, $2)
          `, [bandId, position]);
        }
      }
    }
    
    // Insert genres
    if (genre && genre.length > 0) {
      for (const g of genre) {
        if (g.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_genres (band_id, genre)
            VALUES ($1, $2)
          `, [bandId, g]);
        }
      }
    }
    
    // Insert releases
    if (releases && releases.length > 0) {
      for (const release of releases) {
        if (release.title.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_releases (band_id, title, release_date, type, link)
            VALUES ($1, $2, $3, $4, $5)
          `, [bandId, release.title, release.releaseDate, release.type, release.link]);
        }
      }
    }
    
    // Insert merch types
    if (hasMerch && merchTypes && merchTypes.length > 0) {
      for (const type of merchTypes) {
        if (type.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_merch_types (band_id, merch_type)
            VALUES ($1, $2)
          `, [bandId, type]);
        }
      }
    }
    
    // Insert additional images
    if (other_images && other_images.length > 0) {
      for (const image of other_images) {
        if (image.image_url) {
          await client.query(`
            INSERT INTO ${schema}.band_images (band_id, image_url, caption)
            VALUES ($1, $2, $3)
          `, [bandId, image.image_url, image.caption || null]);
        }
      }
    }
    
    // Insert featured content
    if (featuredContent && featuredContent.length > 0) {
      for (let i = 0; i < featuredContent.length; i++) {
        const content = featuredContent[i];
        await client.query(`
          INSERT INTO ${schema}.band_featured_content (band_id, content_type, content_id, display_order)
          VALUES ($1, $2, $3, $4)
        `, [bandId, content.content_type, content.content_id, i]);
      }
    }
    
    // Insert profile badges
    if (profileBadges && profileBadges.length > 0) {
      for (const badge of profileBadges) {
        await client.query(`
          INSERT INTO ${schema}.band_profile_badges (band_id, badge_type)
          VALUES ($1, $2)
        `, [bandId, badge]);
      }
    }
    
    // Insert group sizes
    if (group_size && group_size.length > 0) {
      for (const size of group_size) {
        await client.query(`
          INSERT INTO ${schema}.band_group_sizes (band_id, size_category)
          VALUES ($1, $2)
        `, [bandId, size]);
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Band created successfully',
      bandId,
      slug
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating band:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Update band
router.put("/:slug/edit", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find band by slug
    const bandResult = await client.query(
      `SELECT id, claimed_by FROM ${schema}.bands_new 
       WHERE slug = $1 OR custom_slug = $1`,
      [req.params.slug]
    );
    
    if (bandResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Band not found' });
    }
    
    const bandId = bandResult.rows[0].id;
    
    // Check ownership if the band is claimed
    if (bandResult.rows[0].claimed_by && bandResult.rows[0].claimed_by !== req.user.sub) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized to edit this band' });
    }
    
    // Update main band data
    const {
      name, location, yearFormed, originStory, bio, profile_image,
      lookingForMembers, play_shows, performanceNotes, hasMerch, merchUrl,
      bandemail, customSlug, profileTheme, headerLayout, backgroundPattern,
      backgroundImage, music_links, social_links
    } = req.body;
    
    await client.query(`
      UPDATE ${schema}.bands_new SET
        name = $1, location = $2, year_formed = $3, origin_story = $4, bio = $5,
        profile_image = $6, looking_for_members = $7, play_shows = $8, 
        performance_notes = $9, has_merch = $10, merch_url = $11, bandemail = $12,
        custom_slug = $13, profile_theme = $14, header_layout = $15,
        background_pattern = $16, background_image = $17, music_links = $18,
        social_links = $19, updated_at = NOW()
      WHERE id = $20
    `, [
      name, location, yearFormed, originStory, bio, profile_image,
      lookingForMembers, play_shows, performanceNotes, hasMerch, merchUrl,
      bandemail, customSlug, profileTheme, headerLayout, backgroundPattern,
      backgroundImage, JSON.stringify(music_links), JSON.stringify(social_links),
      bandId
    ]);
    
    // Delete existing related data
    await client.query(`DELETE FROM ${schema}.band_members WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_open_positions WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_genres WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_releases WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_merch_types WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_featured_content WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_profile_badges WHERE band_id = $1`, [bandId]);
    await client.query(`DELETE FROM ${schema}.band_group_sizes WHERE band_id = $1`, [bandId]);
    
    // Re-insert related data
    // Insert members
    if (req.body.members && req.body.members.length > 0) {
      for (const member of req.body.members) {
        if (member.name.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_members (band_id, name, role, bio)
            VALUES ($1, $2, $3, $4)
          `, [bandId, member.name, member.role, member.bio]);
        }
      }
    }
    
    // Insert open positions if looking for members
    if (lookingForMembers && req.body.openPositions && req.body.openPositions.length > 0) {
      for (const position of req.body.openPositions) {
        if (position.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_open_positions (band_id, position)
            VALUES ($1, $2)
          `, [bandId, position]);
        }
      }
    }
    
    // Insert genres
    if (req.body.genre && req.body.genre.length > 0) {
      for (const g of req.body.genre) {
        if (g.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_genres (band_id, genre)
            VALUES ($1, $2)
          `, [bandId, g]);
        }
      }
    }
    
    // Insert releases
    if (req.body.releases && req.body.releases.length > 0) {
      for (const release of req.body.releases) {
        if (release.title.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_releases (band_id, title, release_date, type, link)
            VALUES ($1, $2, $3, $4, $5)
          `, [bandId, release.title, release.releaseDate, release.type, release.link]);
        }
      }
    }
    
    // Insert merch types
    if (hasMerch && req.body.merchTypes && req.body.merchTypes.length > 0) {
      for (const type of req.body.merchTypes) {
        if (type.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_merch_types (band_id, merch_type)
            VALUES ($1, $2)
          `, [bandId, type]);
        }
      }
    }
    
    // Handle images (don't delete existing ones)
    // Add new additional images if provided
    if (req.body.new_images && req.body.new_images.length > 0) {
      for (const image of req.body.new_images) {
        if (image.image_url) {
          await client.query(`
            INSERT INTO ${schema}.band_images (band_id, image_url, caption)
            VALUES ($1, $2, $3)
          `, [bandId, image.image_url, image.caption || null]);
        }
      }
    }
    
    // Update or delete existing images if needed
    if (req.body.updated_images) {
      for (const image of req.body.updated_images) {
        if (image.deleted) {
          await client.query(`DELETE FROM ${schema}.band_images WHERE id = $1`, [image.id]);
        } else if (image.caption !== undefined) {
          await client.query(
            `UPDATE ${schema}.band_images SET caption = $1 WHERE id = $2`,
            [image.caption, image.id]
          );
        }
      }
    }
    
    // Insert featured content
    if (req.body.featuredContent && req.body.featuredContent.length > 0) {
      for (let i = 0; i < req.body.featuredContent.length; i++) {
        const content = req.body.featuredContent[i];
        await client.query(`
          INSERT INTO ${schema}.band_featured_content (band_id, content_type, content_id, display_order)
          VALUES ($1, $2, $3, $4)
        `, [bandId, content.content_type, content.content_id, i]);
      }
    }
    
    // Insert profile badges
    if (req.body.profileBadges && req.body.profileBadges.length > 0) {
      for (const badge of req.body.profileBadges) {
        await client.query(`
          INSERT INTO ${schema}.band_profile_badges (band_id, badge_type)
          VALUES ($1, $2)
        `, [bandId, badge]);
      }
    }
    
    // Insert group sizes
    if (req.body.group_size && req.body.group_size.length > 0) {
      for (const size of req.body.group_size) {
        await client.query(`
          INSERT INTO ${schema}.band_group_sizes (band_id, size_category)
          VALUES ($1, $2)
        `, [bandId, size]);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Band updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating band:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Claim a band
router.post('/:slug/claim', authMiddleware, async (req, res) => {
  const slug = req.params.slug;
  const userId = req.user.sub;

  try {
    // Check if band exists and isn't already claimed
    const result = await pool.query(
      `UPDATE ${schema}.bands_new 
       SET claimed_by = $1, claimed_at = NOW() 
       WHERE (slug = $2 OR custom_slug = $2) AND claimed_by IS NULL 
       RETURNING *`,
      [userId, slug]
    );

    if (result.rowCount === 0) {
      // Check if band exists but is claimed by someone else
      const band = await pool.query(
        `SELECT claimed_by FROM ${schema}.bands_new 
         WHERE slug = $1 OR custom_slug = $1`, 
        [slug]
      );
      
      if (band.rowCount === 0) {
        return res.status(404).json({ error: 'Band not found' });
      } else if (band.rows[0].claimed_by) {
        return res.status(403).json({ error: 'Band already claimed' });
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error claiming band:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Release a band claim
router.post('/:slug/release', authMiddleware, async (req, res) => {
  const slug = req.params.slug;
  const userId = req.user.sub;

  try {
    const result = await pool.query(
      `UPDATE ${schema}.bands_new 
       SET claimed_by = NULL, claimed_at = NULL 
       WHERE (slug = $2 OR custom_slug = $2) AND claimed_by = $1 
       RETURNING *`,
      [userId, slug]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Not authorized to release this band' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error releasing band:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user owns a band (utility endpoint)
router.get('/:slug/check-ownership', authMiddleware, async (req, res) => {
  const slug = req.params.slug;
  const userId = req.user.sub;

  try {
    const result = await pool.query(
      `SELECT claimed_by FROM ${schema}.bands_new 
       WHERE slug = $1 OR custom_slug = $1`,
      [slug]
    );
      
    const isOwner = result.rows[0]?.claimed_by === userId;
    res.json({ isOwner });
  } catch (error) {
    console.error('Error checking band ownership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch shows for a specific band
router.get("/:slug/shows", async (req, res) => {
  try {
    // Fetch the band's name using the slug
    const bandQuery = await pool.query(
      `SELECT id, name FROM ${schema}.bands_new WHERE slug = $1 OR custom_slug = $1`,
      [req.params.slug]
    );

    if (!bandQuery.rows[0]) {
      return res.status(404).json({ error: "Band not found" });
    }

    const bandName = bandQuery.rows[0].name;

    // Use your existing query to fetch shows
    const showsQuery = `
      SELECT 
        s.id AS show_id,
        s.start,
        s.flyer_image,
        s.event_link,
        s.venue_id,
        s.bands AS band_list,
        v.venue AS venue_name,
        v.location,
        array_agg(
          json_build_object(
            'id', b.id,
            'name', COALESCE(b.name, trim(unnest.band_name)),
            'slug', b.slug
          )
        ) AS bands
      FROM shows s
      LEFT JOIN venues v ON s.venue_id = v.id
      CROSS JOIN LATERAL unnest(string_to_array(s.bands, ',')) AS unnest(band_name)
      LEFT JOIN ${schema}.bands_new b ON trim(LOWER(unnest.band_name)) = trim(LOWER(b.name))
      WHERE EXISTS (
        SELECT 1
        FROM unnest(string_to_array(s.bands, ',')) AS sub_band(name)
        WHERE trim(LOWER(sub_band.name)) = trim(LOWER($1))
      )
      GROUP BY s.id, v.venue, v.location
      ORDER BY s.start ASC;
    `;

    const { rows } = await pool.query(showsQuery, [bandName]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching shows for band:", error);
    res.status(500).json({ error: "Failed to fetch shows" });
  }
});

// Get bands for the logged-in user (including drafts)
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const auth0Id = req.user.sub;
    
    // Get all bands where user is an admin/owner AND include drafts
    const query = `
      SELECT b.*, ba.role
      FROM ${schema}.bands_new b
      JOIN ${schema}.band_admins ba
      ON b.id = ba.band_id
      WHERE ba.auth0_id = $1
      ORDER BY b.updated_at DESC
    `;
    
    const result = await pool.query(query, [auth0Id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bands:', error);
    res.status(500).json({ error: 'Failed to fetch bands' });
  }
});

// Create/update band draft
router.post('/draft', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const auth0Id = req.user.sub;
    const { id, formData, completionStatus, currentStep } = req.body;
    
    let bandId = id;
    let isNew = false;
    
    // If no ID, create new draft
    if (!bandId) {
      const insertBandQuery = `
        INSERT INTO ${schema}.bands_new
        (name, location, is_draft, completion_status)
        VALUES ($1, $2, true, $3)
        RETURNING id
      `;
      
      const bandResult = await client.query(insertBandQuery, [
        formData.bandBasics?.name || 'New Band',
        formData.bandBasics?.location || '',
        JSON.stringify({ [currentStep]: true })
      ]);
      
      bandId = bandResult.rows[0].id;
      isNew = true;
      
      // Add user as band admin
      const adminQuery = `
        INSERT INTO ${schema}.band_admins
        (band_id, auth0_id, role)
        VALUES ($1, $2, 'owner')
      `;
      
      await client.query(adminQuery, [bandId, auth0Id]);
    } else {
      // Update existing draft
      const updateQuery = `
        UPDATE ${schema}.bands_new
        SET 
          name = $1,
          location = $2,
          completion_status = $3,
          updated_at = NOW()
        WHERE id = $4
      `;
      
      await client.query(updateQuery, [
        formData.bandBasics?.name || 'New Band',
        formData.bandBasics?.location || '',
        JSON.stringify(completionStatus),
        bandId
      ]);
    }
    
    // Process step-specific data
    if (currentStep === 'bandBasics' && formData.bandBasics) {
      const { yearFormed, originStory, bio } = formData.bandBasics;
      await client.query(`
        UPDATE ${schema}.bands_new
        SET 
          year_formed = $1,
          origin_story = $2,
          bio = $3
        WHERE id = $4
      `, [yearFormed || null, originStory || null, bio || null, bandId]);
    }
    else if (currentStep === 'members' && formData.members) {
      // Clear existing members
      await client.query(`DELETE FROM ${schema}.band_members WHERE band_id = $1`, [bandId]);
      
      // Add new members
      for (const member of formData.members) {
        if (member.name?.trim()) {
          await client.query(`
            INSERT INTO ${schema}.band_members (band_id, name, role, bio)
            VALUES ($1, $2, $3, $4)
          `, [bandId, member.name, member.role || null, member.bio || null]);
        }
      }
      
      // Handle instruments if present
      if (formData.instruments) {
        await client.query(`DELETE FROM ${schema}.band_member_instruments WHERE member_id IN 
          (SELECT id FROM ${schema}.band_members WHERE band_id = $1)`, [bandId]);
        
        // Add new instruments for each member
        const members = await client.query(
          `SELECT id, name FROM ${schema}.band_members WHERE band_id = $1`, [bandId]
        );
        
        for (const member of members.rows) {
          const memberInstruments = formData.instruments[member.name];
          if (memberInstruments?.length) {
            for (const instrument of memberInstruments) {
              await client.query(`
                INSERT INTO ${schema}.band_member_instruments (member_id, instrument)
                VALUES ($1, $2)
              `, [member.id, instrument]);
            }
          }
        }
      }
    }
    else if (currentStep === 'musicAndReleases') {
      // Update genres
      if (formData.genres) {
        await client.query(`DELETE FROM ${schema}.band_genres WHERE band_id = $1`, [bandId]);
        
        for (const genre of formData.genres) {
          if (genre?.trim()) {
            await client.query(`
              INSERT INTO ${schema}.band_genres (band_id, genre)
              VALUES ($1, $2)
            `, [bandId, genre]);
          }
        }
      }
      
      // Update releases
      if (formData.releases) {
        await client.query(`DELETE FROM ${schema}.band_releases WHERE band_id = $1`, [bandId]);
        
        for (const release of formData.releases) {
          if (release.title?.trim()) {
            await client.query(`
              INSERT INTO ${schema}.band_releases (band_id, title, release_date, type, link)
              VALUES ($1, $2, $3, $4, $5)
            `, [bandId, release.title, release.releaseDate || null, release.type || null, release.link || null]);
          }
        }
      }
      
      // Update music links
      if (formData.musicLinks) {
        await client.query(`
          UPDATE ${schema}.bands_new
          SET music_links = $1
          WHERE id = $2
        `, [JSON.stringify(formData.musicLinks), bandId]);
      }
    }
    else if (currentStep === 'merchAndContact') {
      // Update merch info
      const hasMerch = formData.hasMerch || false;
      const merchUrl = formData.merchUrl || null;
      const bandemail = formData.bandemail || null;
      
      await client.query(`
        UPDATE ${schema}.bands_new
        SET 
          has_merch = $1,
          merch_url = $2,
          bandemail = $3
        WHERE id = $4
      `, [hasMerch, merchUrl, bandemail, bandId]);
      
      // Update merch types
      if (hasMerch && formData.merchTypes) {
        await client.query(`DELETE FROM ${schema}.band_merch_types WHERE band_id = $1`, [bandId]);
        
        for (const merchType of formData.merchTypes) {
          if (merchType?.trim()) {
            await client.query(`
              INSERT INTO ${schema}.band_merch_types (band_id, merch_type)
              VALUES ($1, $2)
            `, [bandId, merchType]);
          }
        }
      }
      
      // Update social links
      if (formData.socialLinks) {
        await client.query(`
          UPDATE ${schema}.bands_new
          SET social_links = $1
          WHERE id = $2
        `, [JSON.stringify(formData.socialLinks), bandId]);
      }
    }
    else if (currentStep === 'performanceInfo') {
      // Update performance info
      const playShows = formData.playShows || null;
      const performanceNotes = formData.performanceNotes || null;
      const lookingForMembers = formData.lookingForMembers || false;
      
      await client.query(`
        UPDATE ${schema}.bands_new
        SET 
          play_shows = $1,
          performance_notes = $2,
          looking_for_members = $3
        WHERE id = $4
      `, [playShows, performanceNotes, lookingForMembers, bandId]);
      
      // Update open positions
      if (lookingForMembers && formData.openPositions) {
        await client.query(`DELETE FROM ${schema}.band_open_positions WHERE band_id = $1`, [bandId]);
        
        for (const position of formData.openPositions) {
          if (position?.trim()) {
            await client.query(`
              INSERT INTO ${schema}.band_open_positions (band_id, position)
              VALUES ($1, $2)
            `, [bandId, position]);
          }
        }
      }
      
      // Update group sizes
      if (formData.groupSizes) {
        await client.query(`DELETE FROM ${schema}.band_group_sizes WHERE band_id = $1`, [bandId]);
        
        for (const size of formData.groupSizes) {
          await client.query(`
            INSERT INTO ${schema}.band_group_sizes (band_id, size_category)
            VALUES ($1, $2)
          `, [bandId, size]);
        }
      }
    }
    else if (currentStep === 'additionalMedia') {
      // Update profile image
      if (formData.profileImage) {
        await client.query(`
          UPDATE ${schema}.bands_new
          SET profile_image = $1
          WHERE id = $2
        `, [formData.profileImage, bandId]);
      }
      
      // Add additional images
      if (formData.additionalImages && formData.additionalImages.length > 0) {
        for (const image of formData.additionalImages) {
          if (image.image_url) {
            await client.query(`
              INSERT INTO ${schema}.band_images (band_id, image_url, caption)
              VALUES ($1, $2, $3)
            `, [bandId, image.image_url, image.caption || null]);
          }
        }
      }
    }
    else if (currentStep === 'profileCustomization') {
      // Update profile customization
      const { customSlug, profileTheme, headerLayout, backgroundPattern, backgroundImage } = formData;
      
      await client.query(`
        UPDATE ${schema}.bands_new
        SET 
          custom_slug = $1,
          profile_theme = $2,
          header_layout = $3,
          background_pattern = $4,
          background_image = $5
        WHERE id = $6
      `, [
        customSlug || null, 
        profileTheme || 'default', 
        headerLayout || 'classic', 
        backgroundPattern || 'none',
        backgroundImage || null,
        bandId
      ]);
      
      // Update featured content
      if (formData.featuredContent) {
        await client.query(`DELETE FROM ${schema}.band_featured_content WHERE band_id = $1`, [bandId]);
        
        for (let i = 0; i < formData.featuredContent.length; i++) {
          const content = formData.featuredContent[i];
          await client.query(`
            INSERT INTO ${schema}.band_featured_content (band_id, content_type, content_id, display_order)
            VALUES ($1, $2, $3, $4)
          `, [bandId, content.content_type, content.content_id, i]);
        }
      }
      
      // Update profile badges
      if (formData.profileBadges) {
        await client.query(`DELETE FROM ${schema}.band_profile_badges WHERE band_id = $1`, [bandId]);
        
        for (const badge of formData.profileBadges) {
          await client.query(`
            INSERT INTO ${schema}.band_profile_badges (band_id, badge_type)
            VALUES ($1, $2)
          `, [bandId, badge]);
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      bandId,
      isNew,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving band draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  } finally {
    client.release();
  }
});

// Complete a draft (mark as published)
router.post('/draft/:id/publish', authMiddleware, async (req, res) => {
  const bandId = req.params.id;
  const auth0Id = req.user.sub;
  const { slug } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if the user has access to this draft
    const accessCheck = await client.query(`
      SELECT 1 FROM ${schema}.band_admins 
      WHERE band_id = $1 AND auth0_id = $2
    `, [bandId, auth0Id]);
    
    if (accessCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized to publish this band' });
    }
    
    // Generate slug if not provided
    let bandSlug = slug;
    if (!bandSlug) {
      const nameResult = await client.query(`
        SELECT name FROM ${schema}.bands_new WHERE id = $1
      `, [bandId]);
      
      if (nameResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Band not found' });
      }
      
      // Create slug from name
      bandSlug = nameResult.rows[0].name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
        
      // Check if slug exists
      let slugExists = true;
      let counter = 1;
      let testSlug = bandSlug;
      
      while (slugExists) {
        const slugCheck = await client.query(`
          SELECT 1 FROM ${schema}.bands_new 
          WHERE (slug = $1 OR custom_slug = $1) AND id != $2
        `, [testSlug, bandId]);
        
        if (slugCheck.rowCount === 0) {
          slugExists = false;
          bandSlug = testSlug;
        } else {
          testSlug = `${bandSlug}-${counter}`;
          counter++;
        }
      }
    }
    
    // Check if all required fields are filled before publishing
    const bandCheck = await client.query(`
      SELECT name, location FROM ${schema}.bands_new WHERE id = $1
    `, [bandId]);
    
    if (!bandCheck.rows[0].name || !bandCheck.rows[0].location) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Band name and location are required before publishing' 
      });
    }
    
    // Update the band to mark as published
    await client.query(`
      UPDATE ${schema}.bands_new
      SET is_draft = false, slug = $1
      WHERE id = $2
    `, [bandSlug, bandId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Band published successfully',
      slug: bandSlug
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error publishing band draft:', error);
    res.status(500).json({ error: 'Failed to publish band' });
  } finally {
    client.release();
  }
});

// Get a specific draft for editing
router.get('/draft/:id', authMiddleware, async (req, res) => {
  const bandId = req.params.id;
  const auth0Id = req.user.sub;
  
  try {
    // Check if user has access to this draft
    const accessCheck = await pool.query(`
      SELECT 1 FROM ${schema}.band_admins 
      WHERE band_id = $1 AND auth0_id = $2
    `, [bandId, auth0Id]);
    
    if (accessCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Not authorized to access this draft' });
    }
    
    // Get band data
    const bandResult = await pool.query(`SELECT * FROM ${schema}.bands_new WHERE id = $1`, [bandId]);
    
    if (bandResult.rowCount === 0) {
      return res.status(404).json({ error: 'Band draft not found' });
    }
    
    // Fetch related data
    const membersResult = await pool.query(
      `SELECT id, name, role, bio FROM ${schema}.band_members WHERE band_id = $1`,
      [bandId]
    );
    
    const instrumentsResult = await pool.query(`
      SELECT mi.member_id, mi.instrument
      FROM ${schema}.band_member_instruments mi
      JOIN ${schema}.band_members m ON mi.member_id = m.id
      WHERE m.band_id = $1
    `, [bandId]);
    
    const openPositionsResult = await pool.query(
      `SELECT position FROM ${schema}.band_open_positions WHERE band_id = $1`,
      [bandId]
    );
    
    const genresResult = await pool.query(
      `SELECT genre FROM ${schema}.band_genres WHERE band_id = $1`,
      [bandId]
    );
    
    const releasesResult = await pool.query(
      `SELECT id, title, release_date as "releaseDate", type, link 
       FROM ${schema}.band_releases WHERE band_id = $1 ORDER BY release_date DESC`,
      [bandId]
    );
    
    const merchTypesResult = await pool.query(
      `SELECT merch_type FROM ${schema}.band_merch_types WHERE band_id = $1`,
      [bandId]
    );
    
    const imagesResult = await pool.query(
      `SELECT id, image_url, caption FROM ${schema}.band_images WHERE band_id = $1`,
      [bandId]
    );
    
    const featuredContentResult = await pool.query(
      `SELECT id, content_type, content_id, display_order 
       FROM ${schema}.band_featured_content WHERE band_id = $1 ORDER BY display_order`,
      [bandId]
    );
    
    const profileBadgesResult = await pool.query(
      `SELECT badge_type FROM ${schema}.band_profile_badges WHERE band_id = $1`,
      [bandId]
    );
    
    const groupSizesResult = await pool.query(
      `SELECT size_category FROM ${schema}.band_group_sizes WHERE band_id = $1`,
      [bandId]
    );
    
    // Process instruments into a usable structure
    const instrumentsMap = {};
    for (const member of membersResult.rows) {
      instrumentsMap[member.name] = instrumentsResult.rows
        .filter(row => row.member_id === member.id)
        .map(row => row.instrument);
    }
    
    // Parse the completion status
    let completionStatus = {};
    try {
      if (bandResult.rows[0].completion_status) {
        completionStatus = typeof bandResult.rows[0].completion_status === 'string' 
          ? JSON.parse(bandResult.rows[0].completion_status) 
          : bandResult.rows[0].completion_status;
      }
    } catch (e) {
      console.error('Error parsing completion status:', e);
    }
    
    // Parse JSON fields
    let musicLinks = {};
    let socialLinks = {};
    
    try {
      if (bandResult.rows[0].music_links) {
        musicLinks = typeof bandResult.rows[0].music_links === 'string'
          ? JSON.parse(bandResult.rows[0].music_links)
          : bandResult.rows[0].music_links;
      }
      
      if (bandResult.rows[0].social_links) {
        socialLinks = typeof bandResult.rows[0].social_links === 'string'
          ? JSON.parse(bandResult.rows[0].social_links)
          : bandResult.rows[0].social_links;
      }
    } catch (e) {
      console.error('Error parsing JSON fields:', e);
    }
    
    // Return the combined data
    res.json({
      ...bandResult.rows[0],
      members: membersResult.rows,
      instruments: instrumentsMap,
      openPositions: openPositionsResult.rows.map(row => row.position),
      genres: genresResult.rows.map(row => row.genre),
      releases: releasesResult.rows,
      merchTypes: merchTypesResult.rows.map(row => row.merch_type),
      additionalImages: imagesResult.rows,
      featuredContent: featuredContentResult.rows,
      profileBadges: profileBadgesResult.rows.map(row => row.badge_type),
      groupSizes: groupSizesResult.rows.map(row => row.size_category),
      musicLinks,
      socialLinks,
      completionStatus
    });
  } catch (error) {
    console.error('Error fetching band draft:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

export default router;