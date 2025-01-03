import { useState } from 'react';

const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file, preset) => {
    if (!file) return null;
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    try {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return { uploadImage, uploading, uploadProgress };
};

export default useCloudinaryUpload;