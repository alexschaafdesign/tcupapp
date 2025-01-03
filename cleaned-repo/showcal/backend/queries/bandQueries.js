// Get all bands
export const getAllBandsQuery = `
  SELECT id, name, slug, genre, bandemail, play_shows, group_size, social_links, music_links, created_at, profile_image, other_images, location, bio
  FROM tcupbands;
`;

// Get band by slug
export const getBandBySlugQuery = `
  SELECT id, name, slug, genre, bandemail, play_shows, group_size, social_links, music_links, created_at, profile_image, other_images, location, bio
  FROM tcupbands
  WHERE slug = $1;
`;

export const updateBandQuery = `
  UPDATE tcupbands
  SET 
    name = $1, 
    slug = $2,
    genre = $3, 
    bandemail = $4, 
    play_shows = $5, 
    group_size = $6, 
    social_links = $7, 
    music_links = $8, 
    profile_image = $9,
    other_images = $10,
    location = $11,
    bio = $12
  WHERE id = $13
  RETURNING *;
`;

// Insert a new band
export const addBandQuery = `
  INSERT INTO tcupbands (name, slug, genre, bandemail, play_shows, group_size, social_links, music_links, profile_image, other_images, location, bio)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  RETURNING *;
`;