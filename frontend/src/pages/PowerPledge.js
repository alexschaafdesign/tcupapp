import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Box, 
  Button, 
  TextField, 
  Card, 
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // If you're using React Router
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import '@fontsource/arimo';

/** Helper to convert a base64 dataURL to a Blob */
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/** Upload function only called in submitPledge */
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "power-pledges");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');

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
}

const PowerPledgeForm = () => {
  const navigate = useNavigate(); // If you use React Router

  const [formData, setFormData] = useState({ name: '', bands: '' });
  const [imageData, setImageData] = useState(null);       // base64 user photo
  const [signatureData, setSignatureData] = useState(null); // base64 signature
  const [finalImage, setFinalImage] = useState(null);     // base64 final pledge preview

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // NEW: State to control our success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const signatureRef = useRef();
  const videoRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  /********************************************************
   * CAMERA HANDLING
   ********************************************************/
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError(err.message || 'Failed to start camera');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const takeSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0);
    setImageData(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  /********************************************************
   * FILE UPLOAD (LOCAL BASE64 ONLY)
   ********************************************************/
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result); // base64 data
      setIsUploading(false);
    };
    reader.onerror = (err) => {
      console.error('File reading error:', err);
      setError('Failed to read the file. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  /********************************************************
   * SIGNATURE HANDLING
   ********************************************************/
  const handleEndSignature = () => {
    if (signatureRef.current) {
      setSignatureData(signatureRef.current.toDataURL());
    }
  };

  useEffect(() => {
    if (signatureRef.current && signatureData) {
      signatureRef.current.fromDataURL(signatureData);
    }
  }, [signatureData]);

  const redrawSignature = () => {
    if (signatureRef.current && signatureData) {
      signatureRef.current.fromDataURL(signatureData);
    }
  };
  useEffect(() => {
    document.addEventListener('touchend', redrawSignature);
    return () => document.removeEventListener('touchend', redrawSignature);
  }, [redrawSignature]);

  const clearSignature = () => {
    signatureRef.current.clear();
    setSignatureData(null);
  };

  /********************************************************
   * HELPER: WRAP TEXT IN CANVAS
   ********************************************************/
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
  
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    return y;
  }

  /********************************************************
   * GENERATE FINAL IMAGE (LOCAL PREVIEW, NO UPLOAD)
   ********************************************************/
  const generateFinalImage = async () => {
    if (!imageData || !signatureData) {
      alert("Please upload/capture a photo and sign the pledge first.");
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData; // base64 user photo
      });

      // Canvas for text, border, etc.
      const formCanvas = document.createElement('canvas');
      const formCtx = formCanvas.getContext('2d');
      formCanvas.width = 1000;
      formCanvas.height = 800;

      // 1) White background
      formCtx.fillStyle = 'white';
      formCtx.fillRect(0, 0, formCanvas.width, formCanvas.height);

      // 2) Checkerboard border
      const squareSize = 20;
      const borderWidth = squareSize * 2;
      for (let x = 0; x < formCanvas.width; x += squareSize) {
        for (let y = 0; y < borderWidth; y += squareSize) {
          if ((x + y) / squareSize % 2 === 0) {
            formCtx.fillStyle = 'black';
            formCtx.fillRect(x, y, squareSize, squareSize);
            formCtx.fillRect(
              x, 
              formCanvas.height - borderWidth + y, 
              squareSize, 
              squareSize
            );
          }
        }
      }
      for (let y = 0; y < formCanvas.height; y += squareSize) {
        for (let x = 0; x < borderWidth; x += squareSize) {
          if ((x + y) / squareSize % 2 === 0) {
            formCtx.fillStyle = 'black';
            formCtx.fillRect(x, y, squareSize, squareSize);
            formCtx.fillRect(
              formCanvas.width - borderWidth + x, 
              y, 
              squareSize, 
              squareSize
            );
          }
        }
      }

      // 3) Title & Pledge text
      formCtx.fillStyle = 'black';
      formCtx.font = 'bold 38px Arimo';
      formCtx.textAlign = 'left';
      formCtx.fillText('TWIN CITIES UNITED PERFORMERS', 60, 100);

      formCtx.font = 'bold 52px Arimo';
      formCtx.fillText('POWER PLEDGE', 60, 150);

      formCtx.font = '24px Arimo';
      const paragraph1 = 
        "I pledge to build solidarity with my fellow musicians. " +
        "I will adhere to a shared set of communication standards between musicians " +
        "and venues, by using the TCUP advance when booking my shows. This includes " +
        "using intentional language to confirm details around compensation, amenities " +
        "and hospitality, and performance logistics.";

      const paragraph2 = 
        "I commit to building power for myself and fellow artists by " +
        "demanding fair compensation and transparency, rejecting the 'starving artist' " +
        "narrative. I will embrace collective action, working with my peers to raise " +
        "industry standards and ensure our work is valued. Together, we will build a " +
        "stronger, more respected artistic community.";

      let currentY = 200;
      currentY = wrapText(formCtx, paragraph1, 60, currentY, 880, 30);
      currentY += 40;
      currentY = wrapText(formCtx, paragraph2, 60, currentY, 880, 30);
      currentY += 60; // extra spacing

      // 4) Name / Date / Band(s)
      const date = new Date().toLocaleDateString();
      const fieldStartX = 60;
      const fieldValueStartX = 200;
      const fieldDateStartX = 500;
      const fieldLineWidth = 300;
      const fieldSpacing = 70;
      const underlineOffset = 8;
      const startY = currentY; // place fields under the paragraphs

      formCtx.fillText('Name:', fieldStartX, startY);
      formCtx.fillText(formData.name, fieldValueStartX, startY);
      formCtx.fillRect(fieldValueStartX, startY + underlineOffset, fieldLineWidth, 1);

      formCtx.fillText('Date:', fieldDateStartX, startY);
      formCtx.fillText(date, fieldDateStartX + 50, startY);
      formCtx.fillRect(fieldDateStartX + 50, startY + underlineOffset, 150, 1);

      const bandY = startY + fieldSpacing;
      formCtx.fillText('Band(s):', fieldStartX, bandY);
      formCtx.fillText(formData.bands, fieldValueStartX, bandY);
      formCtx.fillRect(fieldValueStartX, bandY + underlineOffset, fieldLineWidth, 1);

      // 5) Signature
      const signatureY = bandY + fieldSpacing;
      formCtx.fillText('Signature:', fieldStartX, signatureY);

      const sigImg = new Image();
      const signatureImage = signatureData; // already base64
      await new Promise((resolve, reject) => {
        sigImg.onload = resolve;
        sigImg.onerror = reject;
        sigImg.src = signatureImage;
      });
      formCtx.drawImage(sigImg, fieldValueStartX, signatureY - 30, 300, 80);

      // 6) Combine photo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = formCanvas.width;
      canvas.height = formCanvas.height;
      ctx.drawImage(formCanvas, 0, 0);

      // Scale & draw user photo in bottom-right
      const maxPhotoWidth = 300;
      const maxPhotoHeight = 200;
      const aspectRatio = img.width / img.height;
      let photoWidth, photoHeight;

      if (aspectRatio > maxPhotoWidth / maxPhotoHeight) {
        photoWidth = maxPhotoWidth;
        photoHeight = photoWidth / aspectRatio;
      } else {
        photoHeight = maxPhotoHeight;
        photoWidth = photoHeight * aspectRatio;
      }

      const photoX = canvas.width - photoWidth - 60;
      const photoY = canvas.height - photoHeight - 60;
      ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);

      // Convert to base64 for local preview
      const previewDataURL = canvas.toDataURL('image/jpeg');
      setFinalImage(previewDataURL);

    } catch (err) {
      console.error('Error generating final image:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /********************************************************
   * SUBMIT PLEDGE
   ********************************************************/
  const submitPledge = async () => {
    if (!finalImage) {
      alert("Please generate the pledge first!");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // 1) Upload the original photo
      let photoUrl = null;
      if (imageData) {
        const photoBlob = dataURLtoBlob(imageData);
        photoUrl = await uploadToCloudinary(photoBlob);
      }

      // 2) Upload the final composite
      let finalImageUrl = null;
      if (finalImage) {
        const finalBlob = dataURLtoBlob(finalImage);
        finalImageUrl = await uploadToCloudinary(finalBlob);
      }

      // 3) POST to your API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/pledges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          bands: formData.bands,
          signatureUrl: signatureData,
          photoUrl,
          finalImageUrl,
          contactName: formData.contactName || '',
          contactEmail: formData.contactEmail || '',
          contactPhone: formData.contactPhone || ''
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save pledge');
      
      // Instead of alert, show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(`Failed to submit pledge: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /********************************************************
   * MODAL: SUCCESS
   ********************************************************/
  // Close the modal => go back to homepage
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/'); // or window.location.href = '/';
  };

  // Download the final pledge composite
  const handleDownloadImage = () => {
    if (!finalImage) return;
    // Download the finalImage (base64)
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = 'pledge.jpg';
    link.click();
  };

  /********************************************************
   * FIELD HANDLERS
   ********************************************************/
  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };
  const handleBandChange = (e) => {
    setFormData({ ...formData, bands: e.target.value });
  };

  return (
    <>
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
      
          {/* Title & Pledge Text */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ width: '100%' }}>
              TCUP Power Pledge
            </Typography>
            
            <Typography variant="body2" gutterBottom sx={{ width: '100%' }}>
              Join the hundreds of Twin Cities performers who have already signed the pledge, by filling out the form below!  You will fill out the fields, digitally sign your name, preview the image, and then finally submit.  
              <p>We ask for a photo (live selfie or an uploaded image) because the rest of the pledge signings
              have been in person, and we take a photo of the person holding the pledge, which we will then use as part of our final document, to visually demonstrate how many performers have signed on to this.</p>
            </Typography>

            <hr />


            <Typography variant="body1" paragraph sx={{ width: '100%' }}>
              <strong>
                I pledge to build solidarity with my fellow musicians. I will adhere to a shared set 
                of communication standards between musicians and venues, by using the TCUP advance 
                when booking my shows. This includes using intentional language to confirm details 
                around compensation, amenities and hospitality, and performance logistics.
              </strong>
            </Typography>

            <Typography variant="body1" paragraph sx={{ width: '100%' }}>
              <strong>
                I commit to building power for myself and fellow artists by demanding fair compensation 
                and transparency, rejecting the 'starving artist' narrative. I will embrace collective 
                action, working with my peers to raise industry standards and ensure our work is valued. 
                Together, we will build a stronger, more respected artistic community.
              </strong>
            </Typography>
          </Box>

          {/* Name & Band Fields */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Your Name"
              value={formData.name}
              onChange={handleNameChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Band(s)"
              value={formData.bands}
              onChange={handleBandChange}
              required
            />
          </Box>

          {/* Signature */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Signature* - draw with your mouse or finger
            </Typography>
            <Box sx={{ border: 1, borderColor: 'grey.300', mb: 1 }}>
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  style: { 
                    width: '100%', 
                    height: '200px',
                    touchAction: 'none'  
                  }
                }}
                dotSize={2}
                minWidth={2}
                maxWidth={4}
                throttle={16}
                onEnd={handleEndSignature}
                required
              />
            </Box>
            <Button
              variant="outlined"
              onClick={clearSignature}
              startIcon={<DeleteIcon />}
            >
              Clear
            </Button>
          </Paper>

          {/* Photo Section */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h3" gutterBottom>
            Photo*
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
            If you click the 'take selfie' button, a photo section will appear below the buttons. 
            </Typography>

            {/* If no photo, user can take or upload */}
            {!isCameraActive && !imageData && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={startCamera}
                  startIcon={<PhotoCameraIcon />}
                >
                  Take Selfie
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current.click()}
                  startIcon={<FileUploadIcon />}
                >
                  Upload Photo
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </Box>
            )}

            {/* Camera Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%',
                maxHeight: '480px',
                backgroundColor: '#000',
                display: isCameraActive ? 'block' : 'none'
              }}
            />

            {/* Camera Controls */}
            {isCameraActive && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={takeSelfie}
                  disabled={isUploading}
                >
                  {isUploading ? 'Processing...' : 'Capture'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={stopCamera} 
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            )}

            {/* Show selected/captured image */}
            {imageData && !isCameraActive && (
              <Box>
                <Box 
                  sx={{ 
                    border: 1, 
                    borderColor: 'grey.300', 
                    mb: 1,
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={imageData}
                    alt="User Photo"
                    style={{ width: '100%', display: 'block' }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => setImageData(null)}
                  startIcon={<DeleteIcon />}
                >
                  Remove Photo
                </Button>
              </Box>
            )}
          </Paper>

          {/* Optional Contact Info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" gutterBottom>
              Contact Info
            </Typography>
            <Typography variant="body1" gutterBottom>
              If you'd like to stay informed on TCUP's work, please fill out the fields below (both optional)!
            </Typography>
            <TextField
              fullWidth
              label="Your Email"
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Your Phone"
              type="tel"
              value={formData.contactPhone || ''}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </Box>

          {/* Generate local preview */}
          <Button
            variant="contained"
            fullWidth
            onClick={generateFinalImage}
            disabled={!imageData || !signatureData || !formData.name || isUploading}
            sx={{ mb: 2 }}
          >
            {isUploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <span>Generating...</span>
              </Box>
            ) : (
              'Preview Power Pledge'
            )}
          </Button>

          {/* Final Preview (removed "View Full Size" button) */}
          {finalImage && (
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your Power Pledge
              </Typography>
              <Box 
                sx={{ 
                  border: 1, 
                  borderColor: 'grey.300', 
                  mb: 2,
                  overflow: 'hidden'
                }}
              >
                <img
                  src={finalImage}
                  alt="Final Power Pledge"
                  style={{ width: '100%', display: 'block' }}
                />
              </Box>
            </Paper>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={submitPledge}
            disabled={!finalImage || isUploading || isSubmitting}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <span>Submitting...</span>
              </Box>
            ) : (
              'Submit Pledge'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* SUCCESS MODAL */}
      <Dialog 
        open={showSuccessModal} 
        onClose={handleCloseModal}
        // If you want to close on outside click, 
        // MUI does it by default with "backdropClick"
      >
        <DialogTitle>Success!</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Your pledge card has been submitted!
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleDownloadImage}>
              Download Image
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PowerPledgeForm;