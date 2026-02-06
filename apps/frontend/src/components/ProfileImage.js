import React from "react";

const applyCloudinaryTransformations = (url, width, height) => {
  if (!url || !url.includes("cloudinary.com")) return url;

  const dpr = window.devicePixelRatio || 1; // Ensure sharp rendering on retina displays
  const transformedWidth = Math.ceil(width * dpr);
  const transformedHeight = Math.ceil(height * dpr);

  return url.replace(
    "/upload/",
    `/upload/c_fill,w_${transformedWidth},h_${transformedHeight},q_auto,f_auto/`
  );
};

const ProfileImage = ({ src, alt, shape = "circle", size = 400 }) => {
  const optimizedSrc = applyCloudinaryTransformations(src, size, size);

  const styles = {
    width: size,
    height: size,
    objectFit: "cover",
    borderRadius: shape === "circle" ? "50%" : "8px",
    border: "2px solid #ccc",
  };

  return <img src={optimizedSrc} alt={alt} style={styles} />;
};

export default ProfileImage;