// src/utils/cloudinary.js
import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = 'dsll3ms2c'; // Replace with your Cloudinary cloud name

const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName,
  },
});

export { cld, cloudName }; // Export both Cloudinary instance and cloudName