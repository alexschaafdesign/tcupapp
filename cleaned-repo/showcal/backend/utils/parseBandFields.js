// parseBandFields.js
export default function parseBandFields(body, files) {
  // Here we only handle basic conversions.
  // For arrays like genre or group_size, we trust they are already JSON strings from the frontend.
  // For social_links, music_links, do NOT parse them here. Just leave them as they are.

  // Example:
  const {
    name,
    genre,          // still a JSON string from frontend
    bandemail,
    play_shows,
    group_size,      // still a JSON string from frontend
    social_links,    // still a JSON string
    music_links,     // still a JSON string
  } = body;

  // For images, just extract filenames.
  let profile_image = null;
  if (files && files.profile_image && files.profile_image.length > 0) {
    profile_image = files.profile_image[0].filename;
  }

  let other_images = [];
  if (files && files.other_images && files.other_images.length > 0) {
    other_images = files.other_images.map(file => file.filename);
  }

  // Return all fields as-is. Do not parse them into objects here.
  return {
    name,
    genre,
    bandemail,
    play_shows,
    group_size,
    social_links,  // still a string like '{"instagram":""...}'
    music_links,   // still a string
    profile_image,
    other_images
  };
}