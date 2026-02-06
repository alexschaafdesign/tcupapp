const formatBandData = (band = {}) => {
  return {
    ...band,
    images: Array.isArray(band.images)
      ? band.images
      : typeof band.images === "string" && band.images.trim()
      ? band.images
          .replace(/{|}/g, "") // Remove curly braces
          .split(",") // Split into an array
          .map((img) => img.trim().replace(/^"|"$/g, "")) // Remove extra quotes and trim
          .filter((img) => img !== "") // Remove empty strings
      : [], // Default to an empty array if `images` is null or invalid
  };
};

export default formatBandData;