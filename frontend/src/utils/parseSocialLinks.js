
const parseSocialLinks = (websiteText) => {
  if (!websiteText) return {};
  
  const links = {};
  
  // Check for common social media URLs
  if (websiteText.includes('instagram.com')) links.instagram = websiteText;
  if (websiteText.includes('facebook.com')) links.facebook = websiteText;
  if (websiteText.includes('youtube.com')) links.youtube = websiteText;
  if (websiteText.includes('youtu.be.com')) links.youtube = websiteText;
  if (websiteText.includes('spotify.com')) links.spotify = websiteText;
  if (websiteText.includes('soundcloud.com')) links.soundcloud = websiteText;
  
  // If no social media links found but URL exists, treat as website
  if (Object.keys(links).length === 0 && websiteText.includes('http')) {
    links.website = websiteText;
  }
  
  return links;
};

export default parseSocialLinks;