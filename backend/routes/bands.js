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

export default router;