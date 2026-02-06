import React from 'react';

const XenForoEmbed = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="https://tcupboard.org" // Replace with your XenForo URL
        title="XenForo Forum"
        style={{
          width: '100%',
          height: '100%',
          border: 'none', // Removes the border around the iframe
        }}
        loading="lazy" // Improves performance
      ></iframe>
    </div>
  );
};

export default XenForoEmbed;