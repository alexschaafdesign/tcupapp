const uploadAndParse = (req, res, next) => {
  try {
    console.log("Upload and parse middleware triggered");

    // Log incoming request body
    console.log("Request body:", req.body);

    // Parse necessary fields from the request body
    const parsedData = {
      name: req.body.name || "",
      slug: req.body.slug || "",
      genre: Array.isArray(req.body.genre) ? req.body.genre : [],
      bandemail: req.body.bandemail || "",
      play_shows: req.body.play_shows || "no",
      group_size: Array.isArray(req.body.group_size) ? req.body.group_size : [],
      social_links: req.body.social_links || {},
      music_links: req.body.music_links || {},
      profile_image: req.body.profile_image || null, // Cloudinary URL
      other_images: Array.isArray(req.body.other_images) ? req.body.other_images : [], // Cloudinary URLs
      location: req.body.location || "",
      bio: req.body.bio || "",
    };

    // Log the parsed data for debugging
    console.log("Parsed data:", parsedData);

    // Attach parsed data to the request object
    req.bandData = parsedData;

    next();
  } catch (error) {
    console.error("Error parsing request data:", error);
    res.status(400).json({ error: "Invalid form data." });
  }
};

export default uploadAndParse;