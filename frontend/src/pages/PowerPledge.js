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
  const [pledgeImage, setPledgeImage] = useState(null);
  const [compositeImage, setCompositeImage] = useState(null);

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
    window.scrollTo(0, 0);
  }, []);

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

  const processImage = (imgData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const targetWidth = 1080;
        const targetHeight = 1440;
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
  
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const offsetX = (targetWidth - scaledWidth) / 2;
        const offsetY = (targetHeight - scaledHeight) / 2;
  
        tempCtx.fillStyle = 'black';
        tempCtx.fillRect(0, 0, targetWidth, targetHeight);
        tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        resolve(tempCanvas.toDataURL('image/jpeg'));
      };
      img.src = imgData;
    });
  };

  const takeSelfie = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0);
    
    const rawImage = canvas.toDataURL('image/jpeg');
    const processedImage = await processImage(rawImage);
    setImageData(processedImage);
    stopCamera();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
  
    try {
      const reader = new FileReader();
      const imageData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const processedImage = await processImage(imageData);
      setImageData(processedImage);
    } catch (err) {
      console.error('File reading error:', err);
      setError('Failed to read the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
  
      // Create form canvas (pledge card)
      const formCanvas = document.createElement('canvas');
      const formCtx = formCanvas.getContext('2d');
      formCanvas.width = 1000;
      formCanvas.height = 800;
  
      // Fill white background and add checkerboard border
      formCtx.fillStyle = 'white';
      formCtx.fillRect(0, 0, formCanvas.width, formCanvas.height);
  
      const squareSize = 20;
      const borderWidth = squareSize * 2;
      
      // Draw top and bottom borders
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

      // Draw left and right borders
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
  
      // Add text content
      formCtx.fillStyle = 'black';
      formCtx.font = 'bold 38px Arial';
      formCtx.textAlign = 'left';
      formCtx.fillText('TWIN CITIES UNITED PERFORMERS', 60, 100);
      formCtx.font = 'bold 52px Arial';
      formCtx.fillText('POWER PLEDGE', 60, 150);
  
      // Add pledge text
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
  
      // Form fields with new layout
      const date = new Date().toLocaleDateString();
      const fieldStartX = 60;
      const fieldValueStartX = 200;
      const fullWidthLineWidth = 880;
      const twoThirdsWidth = 580;
      const oneThirdWidth = 280;
      const fieldSpacing = 70;
      const underlineOffset = 8;
  
      // Name (full width)
      formCtx.fillText('Name:', fieldStartX, currentY);
      formCtx.fillText(formData.name, fieldValueStartX, currentY);
      formCtx.fillRect(fieldValueStartX, currentY + underlineOffset, 
        fullWidthLineWidth - (fieldValueStartX - fieldStartX), 1);
  
      // Signature (2/3) and Date (1/3)
      const signatureY = currentY + fieldSpacing;
      formCtx.fillText('Signature:', fieldStartX, signatureY);
      const dateX = fieldStartX + twoThirdsWidth;
      formCtx.fillText('Date:', dateX, signatureY);
      formCtx.fillText(date, dateX + 60, signatureY);
      formCtx.fillRect(dateX + 60, signatureY + underlineOffset, oneThirdWidth - 60, 1);
  
      // Draw signature
      const sigImg = new Image();
      await new Promise((resolve, reject) => {
        sigImg.onload = resolve;
        sigImg.onerror = reject;
        sigImg.src = signatureData;
      });
      formCtx.drawImage(sigImg, fieldValueStartX, signatureY - 30, twoThirdsWidth - 200, 80);
  
      // Performer(s) (full width)
      const performerY = signatureY + fieldSpacing;
      formCtx.fillText('Performer(s):', fieldStartX, performerY);
      formCtx.fillText(formData.bands, fieldValueStartX, performerY);
      formCtx.fillRect(fieldValueStartX, performerY + underlineOffset,
        fullWidthLineWidth - (fieldValueStartX - fieldStartX), 1);
  
      // Create final canvas with phone aspect ratio
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      const phoneWidth = 3024;
      const phoneHeight = 4032;
      finalCanvas.width = phoneWidth;
      finalCanvas.height = phoneHeight;
  
      // Fill with black background
      finalCtx.fillStyle = 'black';
      finalCtx.fillRect(0, 0, phoneWidth, phoneHeight);
  
      // Calculate scaling to fill frame while maintaining aspect ratio
      const scale = Math.max(phoneWidth / img.width, phoneHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (phoneWidth - scaledWidth) / 2;
      const offsetY = (phoneHeight - scaledHeight) / 2;
  
      // Draw scaled and centered image
      finalCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  
      // Calculate pledge card size and position
      const pledgeWidth = phoneWidth * 0.45; // 
      const pledgeHeight = (pledgeWidth / formCanvas.width) * formCanvas.height;
      const pledgeX = (phoneWidth - pledgeWidth) / -40;
      const pledgeY = phoneHeight - pledgeHeight - 40; // 40px from bottom
  
      // Draw pledge card
      finalCtx.drawImage(formCanvas, pledgeX, pledgeY, pledgeWidth, pledgeHeight);
  
      // Generate URLs
      const photoURL = imageData;
      const pledgeURL = formCanvas.toDataURL('image/jpeg');
      const compositeURL = finalCanvas.toDataURL('image/jpeg');
  
      setPledgeImage(pledgeURL);
      setCompositeImage(compositeURL);
      setFinalImage(compositeURL);
  
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
    // Upload all three images
    const photoBlob = dataURLtoBlob(imageData);
    const pledgeBlob = dataURLtoBlob(pledgeImage);
    const compositeBlob = dataURLtoBlob(compositeImage);

    const [photoUrl, pledgeUrl, compositeUrl] = await Promise.all([
      uploadToCloudinary(photoBlob),
      uploadToCloudinary(pledgeBlob),
      uploadToCloudinary(compositeBlob)
    ]);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/pledges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: formData.name,
        bands: formData.bands,
        signatureUrl: signatureData,
        photoUrl,
        pledgeUrl,
        compositeUrl,
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
   
              {/* Camera Preview Container */}
              <Box sx={{ 
                width: '100%',
                maxWidth: '360px',
                aspectRatio: '3/4',
                margin: '20px auto',
                backgroundColor: 'black',
                overflow: 'hidden',
                position: 'relative',
                display: isCameraActive ? 'block' : 'none'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Face Position Guide */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '33.333%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 2,
                  borderTop: '2px solid rgba(255, 255, 255, 0.5)'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      textAlign: 'center',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    Position your face in the upper two-thirds of the frame
                  </Typography>
                </Box>
                
                {/* Optional: Top guide line */}
                <Box sx={{
                  position: 'absolute',
                  top: '33.333%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.3)'
                }} />
              </Box>
                
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
                <Box sx={{ 
                  width: '100%',
                  maxWidth: '360px',
                  aspectRatio: '9/16',
                  margin: '20px auto',
                  backgroundColor: 'black',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={imageData}
                    alt="User Photo"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
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
   
            {/* Final Previews */}
            {finalImage && (
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Preview Your Pledge
                </Typography>
                <Grid container spacing={2}>
                  {/* Pledge Card */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Pledge Card
                    </Typography>
                    <Box sx={{ 
                      border: 1, 
                      borderColor: 'grey.300', 
                      mb: 2,
                      overflow: 'hidden'
                    }}>
                      <img
                        src={pledgeImage}
                        alt="Power Pledge Card"
                        style={{ width: '100%', display: 'block' }}
                      />
                    </Box>
                  </Grid>
                  {/* Composite Image */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Final Image
                    </Typography>
                    <Box sx={{ 
                      border: 1, 
                      borderColor: 'grey.300', 
                      mb: 2,
                      overflow: 'hidden'
                    }}>
                      <img
                        src={compositeImage}
                        alt="Final Power Pledge"
                        style={{ width: '100%', display: 'block' }}
                      />
                    </Box>
                  </Grid>
                </Grid>
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
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Your pledge card has been submitted!
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => {
              const link = document.createElement('a');
              link.href = pledgeImage;
              link.download = 'pledge-card.jpg';
              link.click();
            }}>
              Download Pledge Card
            </Button>
            <Button variant="contained" onClick={() => {
              const link = document.createElement('a');
              link.href = compositeImage;
              link.download = 'final-pledge.jpg';
              link.click();
            }}>
              Download Final Image
            </Button>
          </Box>
        </DialogContent>
              </Box>
    </Box>
   );
};

export default PowerPledgeForm;