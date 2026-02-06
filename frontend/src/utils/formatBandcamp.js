// utils/formatBandcamp.js

export const extractBandcampEmbedSrc = (embedCode) => {
  const iframeRegex = /<iframe.*?src="([^"]+)".*?><\/iframe>/;
  const match = embedCode.match(iframeRegex);
  return match ? match[1] : null;
};

export const normalizeBandcampEmbedLink = (embedCode) => {
  // Check if the input contains an iframe and extract the src attribute
  const iframeSrcMatch = embedCode.match(/<iframe[^>]*src="([^"]+)"/);
  if (iframeSrcMatch) {
    return iframeSrcMatch[1]; // Return the src URL from the iframe
  }

  // If it's already a valid Bandcamp embed link (direct link), return as-is
  if (embedCode.includes("https://bandcamp.com/EmbeddedPlayer")) {
    return embedCode;
  }

  return null; // Invalid embed code
};