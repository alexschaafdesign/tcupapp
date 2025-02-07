import React, { useState, useRef, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
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
  DialogActions,
  Container,
  Grid
} from '@mui/material';
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
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Form state
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', bands: '' });
  const [imageData, setImageData] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  const signatureRef = useRef();
  const videoRef = useRef();
  const fileInputRef = useRef();

  // Infinite scroll detection
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Fetch background images
  const fetchImages = useCallback(async (cursor = null) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        perPage: '100',
        ...(cursor && { nextCursor: cursor }),
      });
   
      const response = await fetch(`${apiUrl}/images/pledge-photos?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      const repeatedImages = [...data.images, ...data.images];
      
      setGalleryImages(repeatedImages);
      setHasMore(false);
      setTotalImages(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
   }, [apiUrl]);

  // Initial load of background images
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Load more images when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchImages(nextCursor);
    }
  }, [inView, hasMore, loading, fetchImages, nextCursor]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
      setIsUploading(false);
    };
    reader.onerror = (err) => {
      console.error('File reading error:', err);
      setError('Failed to read the file. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

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
        img.src = imageData;
      });

      const formCanvas = document.createElement('canvas');
      const formCtx = formCanvas.getContext('2d');
      formCanvas.width = 1000;
      formCanvas.height = 800;

      formCtx.fillStyle = 'white';
      formCtx.fillRect(0, 0, formCanvas.width, formCanvas.height);

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

      formCtx.fillStyle = 'black';
      formCtx.font = 'bold 38px Arial';
      formCtx.textAlign = 'left';
      formCtx.fillText('TWIN CITIES UNITED PERFORMERS', 60, 100);

      formCtx.font = 'bold 52px Arial';
      formCtx.fillText('POWER PLEDGE', 60, 150);

      formCtx.font = '24px Arial';
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
      currentY += 60;

      const date = new Date().toLocaleDateString();
      const fieldStartX = 60;
      const fieldValueStartX = 200;
      const fieldDateStartX = 500;
      const fieldLineWidth = 300;
      const fieldSpacing = 70;
      const underlineOffset = 8;
      const startY = currentY;

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

      const signatureY = bandY + fieldSpacing;
      formCtx.fillText('Signature:', fieldStartX, signatureY);

      const sigImg = new Image();
      await new Promise((resolve, reject) => {
        sigImg.onload = resolve;
        sigImg.onerror = reject;
        sigImg.src = signatureData;
      });
      formCtx.drawImage(sigImg, fieldValueStartX, signatureY - 30, 300, 80);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = formCanvas.width;
      canvas.height = formCanvas.height;
      ctx.drawImage(formCanvas, 0, 0);

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

      const previewDataURL = canvas.toDataURL('image/jpeg');
      setFinalImage(previewDataURL);

    } catch (err) {
      console.error('Error generating final image:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const submitPledge = async () => {
    if (!finalImage) {
      alert("Please generate the pledge first!");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      let photoUrl = null;
      if (imageData) {
        const photoBlob = dataURLtoBlob(imageData);
        photoUrl = await uploadToCloudinary(photoBlob);
      }

      let finalImageUrl = null;
      if (finalImage) {
        const finalBlob = dataURLtoBlob(finalImage);
        finalImageUrl = await uploadToCloudinary(finalBlob);
      }

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
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(`Failed to submit pledge: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const handleDownloadImage = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = 'pledge.jpg';
    link.click();
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleBandChange = (e) => {
    setFormData({ ...formData, bands: e.target.value });
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Gallery */}
      <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden' // Changed from 'auto' to 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute',
            inset: 0,
            bgcolor: 'background.paper',
            opacity: 0.9
          }} />
          <Container maxWidth="xl" sx={{ height: '100%' }}> {/* Removed overflowY: 'auto' */}
            <Grid container spacing={1} sx={{ opacity: 0.15 }}> {/* Removed pb: 4 */}
              {galleryImages.map((image, index) => (
                <Grid item xs={3} sm={2} md={2} lg={1} key={image.id}>
                  <Box sx={{ 
                    position: 'relative',
                    paddingTop: '100%',
                    overflow: 'hidden'
                  }}>
                    <Box
                      component="img"
                      src={image.url}
                      alt={image.alt}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
   
      {/* Form Content */}
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1,
        bgcolor: 'transparent'
      }}>
        {/* TCUP Advance Modal */}
        <Dialog
          open={showAdvanceModal}
          onClose={() => setShowAdvanceModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              height: '90vh',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle>See the TCUP Advance</DialogTitle>
          <DialogContent sx={{ p: 0, overflow: 'auto' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 2
            }}>
              <img 
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738884304/tcup-pledge-1_kqablv.png" 
                alt="TCUP Advance Page 1"
                style={{ width: '100%', height: 'auto', maxWidth: '800px' }}
              />
              <img 
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1738884304/tcup-pledge-2_nkoz1n.png" 
                alt="TCUP Advance Page 2"
                style={{ width: '100%', height: 'auto', maxWidth: '800px' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAdvanceModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>
   
        <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
          <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mb: 2
          }}>
            <Box
              component="img"
              src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1735343525/LOGO_512_3x_t11sld.png"
              alt="TCUP Logo"
              sx={{ 
                height: 200,
                width: 'auto'
              }}
            />
          </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
        
            {/* Title & Pledge Text */}
            <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h1" gutterBottom>
                  TCUP POWER PLEDGE
                </Typography>
                
              </Box>
            
               <Typography variant="body" gutterBottom sx={{ width: '100%' }}>
               One of the first steps that TCUP is taking to improve the relationship between venues and performers is to help establish a consistent standard of communication, in the form of our TCUP Advance. 

              <p>The pledge is a way that we can organize collectively and relationally to hold each other up as performers. We trust that you will use this advance in the best way you see fit, understanding that not all situations are the same, and that you will have different needs for every show/performance. Copy + paste what you need from this advance to your email!</p>
              </Typography>
              <Typography 
                variant="h4" 
                align="center" 
                sx={{ 
                  my: 4,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #FF4081 30%, #7C4DFF 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' }
                  },
                  animation: 'pulse 3s 2'
                }}
              >
                We are building towards <span style={{ fontSize: '120%' }}>real collective power</span> and it takes all of us!
              </Typography>       

              <Box sx={{ textAlign: 'center', mb: 4, mt: 4 }}>
              <Button 
                variant="contained"
                onClick={() => setShowAdvanceModal(true)}
                sx={{ 
                  mt: 0,
                  fontSize: '1rem',
                  bgcolor: '#7C4DFF',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#6930FF',
                    transform: 'scale(1.00)',
                    transition: 'transform 0.2s'
                  }
                }}
                >
                View the TCUP Advance →
                </Button>
              </Box>
   
   
              <Paper elevation={6} sx={{ 
                p: 3, 
                mb: 1,
                bgcolor: 'background.default',
                borderRadius: 2
                }}>
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
                </Paper>
            </Box>
   
            {/* Name & Band Fields */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Your name"
                value={formData.name}
                onChange={handleNameChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Performer name(s) you are associated with"
                value={formData.bands}
                onChange={handleBandChange}
                required
              />
            </Box>
   
            {/* Signature */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your signature* (draw with your mouse or finger)
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
              <Typography variant="h4" gutterBottom>
                Photo*
              </Typography>
              
              <Typography variant="body" gutterBottom>
              An important part of this campaign is being able to demonstrate visually the number of performers that are organizing together. We will display your photo in a banner as a part of a public announcement alongside 500 other pledge signers!
              </Typography>
   
          
              {!isCameraActive && !imageData && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
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

              <Typography variant="subtitle2" gutterBottom>
              If you click the 'take selfie' button, a photo section will appear below the buttons.              
              </Typography>
   
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
                Your contact info
              </Typography>
              
              <TextField
                fullWidth
                label="Email address*"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone number*"
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </Box>
   
            {/* Generate Preview Button */}
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
   
            {/* Final Preview */}
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
   
        {/* Success Modal */}
        <Dialog 
          open={showSuccessModal} 
          onClose={handleCloseModal}
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
      </Box>
    </Box>
   );
};

export default PowerPledgeForm;