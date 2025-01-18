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
  Paper
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import '@fontsource/arimo';

const PowerPledgeForm = () => {
  const [formData, setFormData] = useState({ name: '', bands: '' });
  const [imageData, setImageData] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
  
      // Wait for video element to be ready
      await new Promise((resolve) => {
        const checkVideoRef = () => {
          if (videoRef.current) {
            resolve();
          } else {
            setTimeout(checkVideoRef, 100);
          }
        };
        checkVideoRef();
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
    return y;  // Return the final y position
  }
  
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "power-pledges");
  
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');
  
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };
  
      return new Promise((resolve, reject) => {
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
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleBandChange = (e) => {
    setFormData({ ...formData, bands: e.target.value });
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  const takeSelfie = async () => {
    if (!videoRef.current) return;
  
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      try {
        const imageUrl = await uploadToCloudinary(blob);
        setImageData(imageUrl);
        stopCamera();
      } catch (err) {
        setError('Failed to upload photo');
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setImageData(imageUrl);
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const generateFinalImage = async () => {
    if (!imageData || !signatureRef.current) return;

    setIsUploading(true);
    setError(null);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        const formCanvas = document.createElement('canvas');
        const formCtx = formCanvas.getContext('2d');
        formCanvas.width = 1000;
        formCanvas.height = 800;

        // Draw white background and checkerboard border
        formCtx.fillStyle = 'white';
        formCtx.fillRect(0, 0, formCanvas.width, formCanvas.height);
        const squareSize = 20;
        const borderWidth = squareSize * 2;
        
        for (let x = 0; x < formCanvas.width; x += squareSize) {
          for (let y = 0; y < borderWidth; y += squareSize) {
            if ((x + y) / squareSize % 2 === 0) {
              formCtx.fillStyle = 'black';
              formCtx.fillRect(x, y, squareSize, squareSize);
              formCtx.fillRect(x, formCanvas.height - borderWidth + y, squareSize, squareSize);
            }
          }
        }
        for (let y = 0; y < formCanvas.height; y += squareSize) {
          for (let x = 0; x < borderWidth; x += squareSize) {
            if ((x + y) / squareSize % 2 === 0) {
              formCtx.fillStyle = 'black';
              formCtx.fillRect(x, y, squareSize, squareSize);
              formCtx.fillRect(formCanvas.width - borderWidth + x, y, squareSize, squareSize);
            }
          }
        }

        // Draw title and pledge text
        formCtx.fillStyle = 'black';
        formCtx.font = 'bold 38px Arimo';
        formCtx.textAlign = 'left';
        formCtx.fillText('TWIN CITIES UNITED PERFORMERS', 60, 100);
        formCtx.font = 'bold 52px Arimo';
        formCtx.fillText('POWER PLEDGE', 60, 150);

        formCtx.font = '24px Arimo';
        const paragraph1 = "I pledge to build solidarity with my fellow musicians. " +
        "I will adhere to a shared set of communication standards between musicians " +
        "and venues, by using the TCUP advance when booking my shows. This includes " +
        "using intentional language to confirm details around compensation, amenities " +
        "and hospitality, and performance logistics.";

        const paragraph2 = "I commit to building power for myself and fellow artists by " +
        "demanding fair compensation and transparency, rejecting the 'starving artist' " +
        "narrative. I will embrace collective action, working with my peers to raise " +
        "industry standards and ensure our work is valued. Together, we will build a " +
        "stronger, more respected artistic community.";

        const lineHeight = 24;
        const paragraphSpacing = 40;

        let currentY = 200;
        currentY = wrapText(formCtx, paragraph1, 60, currentY, 880, lineHeight);
        currentY += paragraphSpacing;
        currentY = wrapText(formCtx, paragraph2, 60, currentY, 880, lineHeight);

        const date = new Date().toLocaleDateString();

        const fieldStartX = 60;
        const fieldValueStartX = 200;
        const fieldDateStartX = 500;
        const fieldLineWidth = 300;
        const fieldSpacing = 70;
        const underlineOffset = 8;
        const startY = 500;

        // Name and Date field
        formCtx.fillText('Name:', fieldStartX, startY);
        formCtx.fillText(formData.name, fieldValueStartX, startY);
        formCtx.fillRect(fieldValueStartX, startY + underlineOffset, fieldLineWidth, 1);

        formCtx.fillText('Date:', fieldDateStartX, startY);
        formCtx.fillText(date, fieldDateStartX + 50, startY);
        formCtx.fillRect(fieldDateStartX + 50, startY + underlineOffset, 150, 1);

        // Band(s) field
        const bandY = startY + fieldSpacing;
        formCtx.fillText('Band(s):', fieldStartX, bandY);
        formCtx.fillText(formData.bands, fieldValueStartX, bandY);
        formCtx.fillRect(fieldValueStartX, bandY + underlineOffset, fieldLineWidth, 1);

        // Signature field
        const signatureImage = signatureRef.current.toDataURL('image/png', 1.0);  // Maximum quality
        const sigImg = new Image();
        sigImg.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          sigImg.onload = resolve;
          sigImg.onerror = reject;
          sigImg.src = signatureImage;
        });
        const signatureY = startY + fieldSpacing * 2 + 10;
        formCtx.drawImage(sigImg, fieldValueStartX, signatureY, 300, 80);

        // Create final composite
        canvas.width = formCanvas.width;
        canvas.height = formCanvas.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw form first
        ctx.drawImage(formCanvas, 0, 0);

        // Calculate photo dimensions and position
        const maxPhotoWidth = 300;
        const maxPhotoHeight = 200;
        const aspectRatio = img.width / img.height;
        let photoWidth, photoHeight;

        if (aspectRatio > maxPhotoWidth/maxPhotoHeight) {
          photoWidth = maxPhotoWidth;
          photoHeight = photoWidth / aspectRatio;
        } else {
          photoHeight = maxPhotoHeight;
          photoWidth = photoHeight * aspectRatio;
        }

        const photoX = canvas.width - photoWidth - 60;
        const photoY = canvas.height - photoHeight - 60;

        // Draw photo
        ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);

        // Upload final image and save pledge
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const finalImageUrl = await uploadToCloudinary(blob);
        setFinalImage(finalImageUrl);

        const pledgeData = {
          name: formData.name,
          bands: formData.bands,
          signatureUrl: signatureRef.current.toDataURL(),
          photoUrl: imageData,
          finalImageUrl
        };

        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/pledges`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(pledgeData)
          });
          
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to save pledge');
          
        } catch (err) {
          console.error('Save error:', err);
          setError(`Failed to save pledge: ${err.message}`);
          throw err;
        }
        
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsUploading(false);
      }
    };

    img.src = imageData;
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
   
        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ width: '100%' }}>
            TCUP Power Pledge
          </Typography>

          <Typography variant="body1" paragraph sx={{ width: '100%' }}>
            <strong>I pledge to build solidarity with my fellow musicians. I will adhere to a shared set of communication standards between musicians and venues, by using the TCUP advance when booking my shows. This includes using intentional language to confirm details around compensation, amenities and hospitality, and performance logistics.</strong>
          </Typography>

          <Typography variant="body1" paragraph sx={{ width: '100%' }}>
            <strong>I commit to building power for myself and fellow artists by demanding fair compensation and transparency, rejecting the 'starving artist' narrative. I will embrace collective action, working with my peers to raise industry standards and ensure our work is valued. Together, we will build a stronger, more respected artistic community.</strong>
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Your Name"
            value={formData.name}
            onChange={handleNameChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Band(s)"
            value={formData.bands}
            onChange={handleBandChange}
          />
        </Box>

        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Signature
          </Typography>
          <Box sx={{ border: 1, borderColor: 'grey.300', mb: 1 }}>
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              style: { 
                width: '100%', 
                height: '200px',
                touchAction: 'none'  // Prevent scrolling while signing
              },
              className: 'signature-canvas'  // For potential CSS targeting
            }}
            dotSize={2}  // Adjust based on screen density
            minWidth={2}
            maxWidth={4}
            throttle={16}  // For smoother drawing
            onEnd={() => {
              // Force canvas redraw after signature
              const canvas = signatureRef.current;
              if (canvas) {
                const data = canvas.toData();
                canvas.clear();
                canvas.fromData(data);
              }
            }}
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

        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Photo
          </Typography>
          
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
                variant="contained"
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
                    {isUploading ? 'Uploading...' : 'Capture'}
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
                border: 1, 
                borderColor: 'grey.300', 
                mb: 1,
                overflow: 'hidden'
              }}>
                <img
                  src={imageData}
                  alt="Captured"
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

        <Button
          variant="contained"
          fullWidth
          onClick={generateFinalImage}
          disabled={!imageData || !formData.name || isUploading}
          sx={{ mb: 2 }}
        >
          {isUploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <span>Generating...</span>
            </Box>
          ) : (
            'Generate Power Pledge'
          )}
        </Button>

        {finalImage && (
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Power Pledge
            </Typography>
            <Box sx={{ 
              border: 1, 
              borderColor: 'grey.300', 
              mb: 2,
              overflow: 'hidden'
            }}>
              <img
                src={finalImage}
                alt="Final Power Pledge"
                style={{ width: '100%', display: 'block' }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={() => window.open(finalImage, '_blank')}
            >
              View Full Size
            </Button>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default PowerPledgeForm;