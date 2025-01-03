import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton
} from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AppBreadcrumbs from "../../components/Breadcrumbs";
import { LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import colorTokens from "../../styles/colors/colortokens";
import { auto } from "@cloudinary/url-gen/actions/resize";
import EditIcon from '@mui/icons-material/Edit';
import ProfileImageAdjuster from "../../components/ProfileImageAdjuster";

const createSlug = (name, existingSlugs = []) => {
  let slug = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  if (existingSlugs.includes(slug)) {
    let counter = 2;
    while (existingSlugs.includes(`${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }
  return slug;
};

const TCUPBandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [existingSlugs, setExistingSlugs] = useState([]);


  const bandDataFromState = location.state?.band;

  const [formData, setFormData] = useState({
    name: bandDataFromState?.name || "",
    slug: bandDataFromState?.slug || "",  // Add this line
    genre: bandDataFromState?.genre || ["", "", ""],
    bandemail: bandDataFromState?.bandemail || "",
    play_shows: bandDataFromState?.play_shows || "",
    group_size: bandDataFromState?.group_size || [],
    social_links: bandDataFromState?.social_links || {
      instagram: "",
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      website: "",
    },
    music_links: bandDataFromState?.music_links || {
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      youtube: "",
    },
    profile_image: bandDataFromState?.profile_image || null,
    other_images: bandDataFromState?.other_images || [],
    location: bandDataFromState?.location || "",
    bio: bandDataFromState?.bio || "",
  });

  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [previouslyUploadedImages, setPreviouslyUploadedImages] = useState([]);
  const endpoint = "http://localhost:3001/api";
  const apiUrl = process.env.REACT_APP_API_URL;

  const [profileUploadProgress, setProfileUploadProgress] = useState({});
  const [otherUploadProgress, setOtherUploadProgress] = useState({});
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [isOtherUploading, setIsOtherUploading] = useState(false);

  formData.genre = formData.genre || ["","",""];

  useEffect(() => {
    const canSubmit = formData.name.trim() !== "";
    setIsReadyToSubmit(canSubmit);
  }, [formData]);

  const handleGenreChange = (index, value) => {
    const updatedGenres = [...formData.genre];
    updatedGenres[index] = value;
    setFormData((prev) => ({ ...prev, genre: updatedGenres }));
  };

  useEffect(() => {
    const fetchSlugs = async () => {
      try {
        const response = await fetch(`${apiUrl}/bands/slugs`);
        if (!response.ok) throw new Error('Failed to fetch slugs');
        const slugs = await response.json();
        setExistingSlugs(slugs);
      } catch (error) {
        console.error("Error fetching slugs:", error);
      }
    };
    fetchSlugs();
  }, [apiUrl]);

  // Upload to Cloudinary with progress tracking
  const uploadToCloudinary = async (file, preset, isProfile = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload');

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          if (isProfile) {
            setProfileUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
          } else {
            setOtherUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          }
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
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  const handleTransformedImageSave = (transformedUrl, transformInfo) => {
    setFormData((prev) => ({
      ...prev,
      profile_image: transformedUrl,
      profile_image_transform: transformInfo,
    }));
  };


  // Handle file selection and upload
  const handleImageChange = async (files, isProfileImage = false) => {
    if (!files || files.length === 0) return;
      
    if (isProfileImage) {
      setIsProfileUploading(true);
    } else {
      setIsOtherUploading(true);
    }
    const preset = isProfileImage ? "band_profile_image_upload" : "band_other_images_upload";
  
    try {
      const initialProgress = {};
      Array.from(files).forEach(file => {
        initialProgress[file.name] = 0;
      });
      if (isProfileImage) {
        setIsProfileUploading(true);
        const uploadedUrl = await uploadToCloudinary(files[0], "band_profile_image_upload", true);
        if (uploadedUrl) {
          setFormData(prev => ({
            ...prev,
            profile_image: uploadedUrl,
            profile_image_transform: { zoom: 1, x: 0, y: 0 } // Initialize transform info
          }));
        }
        setIsProfileUploading(false);
        setProfileUploadProgress({});
      } else {
        // Other images logic stays the same
        if (formData.other_images.length >= 10) {
          alert("You can upload a maximum of 10 other images.");
          return;
        }
  
        setOtherUploadProgress(initialProgress);
        const remainingSlots = 10 - formData.other_images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);
  
        const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file, preset, false));
        const uploadedUrls = await Promise.all(uploadPromises);
        
        const successfulUrls = uploadedUrls.filter(url => url !== null);
        
        if (successfulUrls.length > 0) {
          setFormData(prev => ({
            ...prev,
            other_images: [...prev.other_images, ...successfulUrls]
          }));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      if (isProfileImage) {
        setIsProfileUploading(false);
        setProfileUploadProgress({});
      } else {
        setIsOtherUploading(false);
        setOtherUploadProgress({});
      }
    }
  };


  // Remove an image (profile or other)
  const handleRemoveImage = (index, isProfileImage = false) => {
    if (isProfileImage) {
      setFormData((prev) => ({ ...prev, profile_image: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        other_images: prev.other_images.filter((_, i) => i !== index),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updates = { [name]: value };
      if (name === 'name') {
        updates.slug = createSlug(value, existingSlugs);
      }
      return { ...prev, ...updates };
    });
  };

  useEffect(() => {
    const fetchBand = async () => {
      if (!isEdit) return;
      try {
        let bandData;
  
        // Check if bandData is coming from state or fetch it from the API
        if (bandDataFromState) {
          bandData = bandDataFromState;
        } else {
          const response = await fetch(`${apiUrl}/bands/${formData.slug}/edit`);
          const data = await response.json();
          bandData = data.data;
        }
  
        console.log("Fetched Band Data:", bandData);
  
        // Directly use Cloudinary URLs returned from the backend
        const profileImageUrl = bandData.profile_image || null; // Full Cloudinary URL
        const otherImageUrls = Array.isArray(bandData.other_images)
          ? bandData.other_images
          : []; // Array of Cloudinary URLs
  
        // Update the form data
        setFormData({
          name: bandData.name || "",
          slug: bandData.slug || "",
          genre: bandData.genre || ["", "", ""],
          bandemail: bandData.bandemail || "",
          play_shows: bandData.play_shows || "",
          group_size: bandData.group_size || [],
          social_links: bandData.social_links || {
            instagram: "",
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            website: "",
          },
          music_links: bandData.music_links || {
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            youtube: "",
          },
          profile_image: profileImageUrl, // Use Cloudinary URL directly
          other_images: otherImageUrls,   // Use Cloudinary URLs directly
          location: bandData.location || "",
          bio: bandData.bio || "",
        });
  
        // Set previously uploaded images
        setPreviouslyUploadedImages(otherImageUrls);
      } catch (error) {
        console.error("Error fetching band data:", error);
      }
    };
  
    fetchBand();
  }, [isEdit, bandid, bandDataFromState, apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isReadyToSubmit) {
      console.log("Form not ready for submission.");
      return;
    }

    const slug = createSlug(formData.name, existingSlugs);

  
    const dataToSubmit = {
      name: formData.name,
      slug: formData.slug,
      genre: formData.genre,
      bandemail: formData.bandemail,
      play_shows: formData.play_shows,
      group_size: formData.group_size,
      social_links: formData.social_links,
      music_links: formData.music_links,
      profile_image: formData.profile_image, // Include transformed URL
      profile_image_transform: formData.profile_image_transform, // Include transform data
      other_images: formData.other_images,
      location: formData.location,
      bio: formData.bio,
    };
  
    try {
      const endpointURL = isEdit
      ? `${endpoint}/bands/${formData.slug}/edit`
      : `${endpoint}/bands/add`;
  
      const response = await fetch(endpointURL, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit band data");
      }
  
      const result = await response.json();
      console.log("Response from backend:", result);
      navigate(`/bands/${formData.slug}`); // Instead of bandid
    } catch (err) {
      console.error("Error submitting band data:", err);
      setErrorMessage("Failed to submit band data.");
    }
  };



return (
  <Box sx={{ paddingTop: 2, paddingBottom: 10, paddingX: 4 }}>
    <AppBreadcrumbs />
    <Typography variant="h1" gutterBottom textAlign={"center"}>
      {isEdit ? "Edit Your Band" : "Add Your Band"}
    </Typography>

    {errorMessage && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorMessage}
      </Alert>
    )}

    {/* Profile Image Upload */}
    <Box sx={{ 
        mb: 4,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <ProfileImageAdjuster
          initialImage={formData.profile_image}
          onSave={async (file) => {
            try {
              setIsProfileUploading(true);
              const uploadedUrl = await uploadToCloudinary(file, "band_profile_image_upload", true);
              if (uploadedUrl) {
                setFormData((prev) => ({
                  ...prev,
                  profile_image: uploadedUrl,
                }));
              }
            } catch (error) {
              console.error('Upload error:', error);
              alert('Failed to upload image. Please try again.');
            } finally {
              setIsProfileUploading(false);
              setProfileUploadProgress({});
            }
          }}
          onDelete={() => handleRemoveImage(null, true)}
          isUploading={isProfileUploading}
          uploadProgress={Object.values(profileUploadProgress)[0] || 0}
          onTransformSave={handleTransformedImageSave}
        />
      </Box>

      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <TextField
          label="Band Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
        />
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Genre/Style
        </Typography>
        {[0, 1, 2].map((index) => (
          <TextField
            key={index}
            label={`Genre ${index + 1}`}
            value={formData.genre[index] || ""}
            onChange={(e) => handleGenreChange(index, e.target.value)}
            fullWidth
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
        <TextField
          label="Band Email"
          name="bandemail"
          value={formData.bandemail}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Add Spotify, Bandcamp, YouTube link fields */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Profile Links (to your overall artist profiles, not a specific album or song)
        </Typography>
        <TextField
          label="Instagram"
          name="instagram"
          value={formData.social_links.instagram}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                instagram: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Spotify Artist Profile Link"
          name="spotify"
          value={formData.social_links.spotify}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                spotify: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bandcamp Profile Link"
          name="bandcamp"
          value={formData.social_links.bandcamp || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                bandcamp: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="YouTube Profile Link"
          name="youtube"
          value={formData.social_links.youtube || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                youtube: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mb: 2 }}>
        Music Links (post the share link for an album or song!)
        </Typography>
        <TextField
          label="Spotify Album/Single Link"
          name="spotify"
          value={formData.music_links.spotify || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              music_links: {
                ...prev.music_links,
                spotify: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
                <TextField
          label="YouTube Music Video Link"
          name="youtube"
          value={formData.music_links.youtube || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              music_links: {
                ...prev.music_links,
                youtube: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bandcamp Music Embed"
          name="bandcamp"
          value={formData.music_links.bandcamp || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              music_links: {
                ...prev.music_links,
                bandcamp: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Looking to Play Shows?</InputLabel>
          <Select
            name="play_shows"
            value={formData.play_shows}
            onChange={handleChange}
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="maybe">Maybe</MenuItem>
            <MenuItem value="not right now">Not Right Now</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mb: 2 }}>
          <Typography>Group Size</Typography>
          {["Solo", "Duo", "Trio", "4-piece", "5+ piece"].map((size) => (
            <FormControlLabel
              key={size}
              control={
                <Checkbox
                  checked={formData.group_size.includes(size)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      group_size: prev.group_size.includes(value)
                        ? prev.group_size.filter((s) => s !== value)
                        : [...prev.group_size, value],
                    }));
                  }}
                  value={size}
                />
              }
              label={size}
            />
          ))}
        </Box>


       {/* Other Images Upload */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Other Images (Max 10)
      </Typography>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleImageChange(e.target.files, false)}
        disabled={formData.other_images.length >= 10 || isOtherUploading}
        aria-label="Upload additional images"
      />

      {/* Upload Progress Indicators */}
      {isOtherUploading && (
        <Box sx={{ mt: 2 }}>
           {Object.entries(otherUploadProgress).map(([fileName, progress]) => (
            <Box key={fileName} sx={{ mb: 1 }}>
              <Typography variant="body2">{fileName}</Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {formData.other_images.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {formData.other_images.map((url, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <img
                src={url}
                alt={`Other Image ${index + 1}`}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "2px solid #ccc",
                }}
              />
              <IconButton
                onClick={() => handleRemoveImage(index, false)}
                sx={{ 
                  position: "absolute", 
                  top: 0, 
                  right: 0,
                  color: colorTokens.error.light,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'grey.100'
                  }
                }}
              >
                <DeleteIcon /> {/* or <DeleteIcon /> */}
              </IconButton>
            </Box>
          ))}
        </Box>
      )}



        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
          disabled={!isReadyToSubmit}
        >
          {isEdit ? "Update Band" : "Add Band"}
        </Button>
      </form>
    </Box>
  );
};

export default TCUPBandForm;