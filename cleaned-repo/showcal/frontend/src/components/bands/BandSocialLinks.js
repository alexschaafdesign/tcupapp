import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaSpotify,
  FaBandcamp,
  FaGlobe,
  FaSoundcloud,
  FaWikipediaW,
} from "react-icons/fa";

const parseInstagramFromText = (text) => {
  if (!text) return null;
  
  // Match direct Instagram URLs
  const urlMatch = text.match(/https:\/\/(?:www\.)?instagram\.com\/[^?\s]+/);
  if (urlMatch) return urlMatch[0];

  // Match Instagram handles
  const handleMatch = text.match(/@(\w+)(?:\s+on\s+instagram)/i);
  if (handleMatch) return `https://instagram.com/${handleMatch[1]}`;

  // Match usernames followed by "on Instagram"
  const usernameMatch = text.match(/(\w+)(?:\s+on\s+instagram)/i);
  if (usernameMatch) return `https://instagram.com/${usernameMatch[1]}`;

  return null;
};

const BandSocialLinks = ({ links, contactInfo }) => {
  const socialIconMap = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    youtube: FaYoutube,
    spotify: FaSpotify,
    bandcamp: FaBandcamp,
    website: FaGlobe,
    soundcloud: FaSoundcloud,
    wikipedia: FaWikipediaW,
  };

  const socialColorMap = {
    facebook: "#1877F2",
    twitter: "#1DA1F2",
    instagram: "#C13584",
    youtube: "#FF0000",
    spotify: "#1DB954",
    bandcamp: "#629AA9",
    website: "#000000",
    soundcloud: "#FF7700",
    wikipedia: "#000000",
  };

  if (!links || typeof links !== "object") {
    console.warn("Invalid or empty links passed:", links);
    return <p>No Links</p>;
  }

  const filteredLinks = Object.entries(links).filter(
    ([_, link]) => typeof link === "string" && link.trim() !== ""
  );

  const instagramLink = contactInfo ? parseInstagramFromText(contactInfo) : null;

  return (
    <div>
      {filteredLinks.map(([platform, link]) => {
        const IconComponent = socialIconMap[platform.toLowerCase()] || FaGlobe;
        const color = socialColorMap[platform.toLowerCase()] || "#000000";

        return (
          <a
            key={platform}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: "10px", textDecoration: "none", color: "inherit" }}
          >
            {React.createElement(IconComponent, {
              style: {
                color: color,
                fontSize: "20px",
                verticalAlign: "top",
                marginTop: "-1px",
              },
            })}
          </a>
        );
      })}

      {/* Add parsed Instagram link if found and not already in links */}
      {instagramLink && !links?.instagram && (
        <a
          href={instagramLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: "10px", textDecoration: "none", color: "inherit" }}
        >
          {React.createElement(FaInstagram, {
            style: {
              color: socialColorMap.instagram,
              fontSize: "20px",
              verticalAlign: "top",
              marginTop: "-1px",
            },
          })}
        </a>
      )}
    </div>
  );
};

export default BandSocialLinks;