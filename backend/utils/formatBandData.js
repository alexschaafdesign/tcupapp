const formatBandData = (band) => {
  return {
    ...band,
    profile_image: band.profile_image || null,
    other_images: Array.isArray(band.other_images)
      ? band.other_images
      : band.other_images && typeof band.other_images === "string"
      ? band.other_images
          .replace(/{|}/g, "")
          .split(",")
          .map((img) => img.trim().replace(/^"|"$/g, ""))
      : [],
  };
};

export default formatBandData;