import React, { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import palette from "../../../styles/colors/palette";

// Step Components
import BandBasics from "./Steps/BandBasics";
import MembersInstruments from "./Steps/MembersInstruments";
import MusicReleases from "./Steps/MusicReleases";
import MerchContact from "./Steps/MerchContact";
import PerformanceInfo from "./Steps/PerformanceInfo";
import AdditionalMedia from "./Steps/AdditionalMedia";
import ProfileCustomization from "./Steps/ProfileCustomization";
import FinalReview from "./Steps/FinalReview";

// Helper function to create a slug
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

const BandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [existingSlugs, setExistingSlugs] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const apiUrl = process.env.REACT_APP_API_URL;
  const bandDataFromState = location.state?.band;

  // Initial form data state
  const [formData, setFormData] = useState({
    // Basic Info
    name: bandDataFromState?.name || "",
    slug: bandDataFromState?.slug || "",
    location: bandDataFromState?.location || "",
    yearFormed: bandDataFromState?.yearFormed || "",
    originStory: bandDataFromState?.originStory || "",
    bio: bandDataFromState?.bio || "",
    profile_image: bandDataFromState?.profile_image || null,
    
    // Members & Instruments
    members: bandDataFromState?.members || [{ name: "", role: "", bio: "" }],
    lookingForMembers: bandDataFromState?.lookingForMembers || false,
    openPositions: bandDataFromState?.openPositions || [],
    
    // Music & Releases
    genre: bandDataFromState?.genre || ["", "", ""],
    releases: bandDataFromState?.releases || [{ title: "", releaseDate: "", type: "", link: "" }],
    music_links: bandDataFromState?.music_links || {
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      youtube: "",
    },
    
    // Merch & Contact
    hasMerch: bandDataFromState?.hasMerch || false,
    merchUrl: bandDataFromState?.merchUrl || "",
    merchTypes: bandDataFromState?.merchTypes || [],
    bandemail: bandDataFromState?.bandemail || "",
    social_links: bandDataFromState?.social_links || {
      instagram: "",
      facebook: "",
      tiktok: "",
      twitter: "",
      website: "",
    },
    
    // Performance Info
    play_shows: bandDataFromState?.play_shows || "",
    group_size: bandDataFromState?.group_size || [],
    performanceNotes: bandDataFromState?.performanceNotes || "",
    
    // Additional Media
    other_images: bandDataFromState?.other_images || [],
    
    // Profile Customization
    customSlug: bandDataFromState?.customSlug || "",
    profileTheme: bandDataFromState?.profileTheme || "default",
    headerLayout: bandDataFromState?.headerLayout || "classic",
    featuredContent: bandDataFromState?.featuredContent || [],
    backgroundImage: bandDataFromState?.backgroundImage || null,
    backgroundPattern: bandDataFromState?.backgroundPattern || "none",
    profileBadges: bandDataFromState?.profileBadges || [],
  });

  // Define the steps
  const steps = [
    "Band Basics",
    "Members & Instruments",
    "Music & Releases",
    "Merch & Contact",
    "Performance Info",
    "Additional Media",
    "Customize",
    "Review"
  ];

  // Check if step is completed
  const isStepComplete = (step) => {
    if (step === 0) {
      return formData.name.trim() !== "" && formData.location.trim() !== "";
    } else if (step === 1) {
      return formData.members.length > 0 && 
             formData.members[0].name.trim() !== "" && 
             formData.members[0].role.trim() !== "";
    } else if (step === 2) {
      return formData.genre.some(g => g.trim() !== "");
    }
    
    return completedSteps[step] || false;
  };

  // Update completed steps
  useEffect(() => {
    const newCompleted = { ...completedSteps };
    
    // Check each step and update completed status
    for (let i = 0; i < steps.length; i++) {
      newCompleted[i] = isStepComplete(i);
    }
    
    setCompletedSteps(newCompleted);
  }, [formData]);

  // Fetch existing slugs
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

  // Fetch band data if editing
  useEffect(() => {
    const fetchBand = async () => {
      if (!isEdit) return;
      
      try {
        const bandData = bandDataFromState || 
          await (await fetch(`${apiUrl}/bands/${bandid}/edit`)).json().data;

        setFormData({
          // Map band data to form fields
          name: bandData.name || "",
          slug: bandData.slug || "",
          location: bandData.location || "",
          yearFormed: bandData.yearFormed || "",
          originStory: bandData.originStory || "",
          bio: bandData.bio || "",
          profile_image: bandData.profile_image,
          
          members: bandData.members || [{ name: "", role: "", bio: "" }],
          lookingForMembers: bandData.lookingForMembers || false,
          openPositions: bandData.openPositions || [],
          
          genre: bandData.genre || ["", "", ""],
          releases: bandData.releases || [{ title: "", releaseDate: "", type: "", link: "" }],
          music_links: bandData.music_links || {
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            youtube: "",
          },
          
          hasMerch: bandData.hasMerch || false,
          merchUrl: bandData.merchUrl || "",
          merchTypes: bandData.merchTypes || [],
          bandemail: bandData.bandemail || "",
          social_links: bandData.social_links || {
            instagram: "",
            facebook: "",
            tiktok: "",
            twitter: "",
            website: "",
          },
          
          play_shows: bandData.play_shows || "",
          group_size: bandData.group_size || [],
          performanceNotes: bandData.performanceNotes || "",
          
          other_images: bandData.other_images || [],
        });
      } catch (error) {
        console.error("Error fetching band data:", error);
      }
    };

    fetchBand();
  }, [isEdit, bandid, bandDataFromState, apiUrl]);

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  // Function to update form data
  const updateFormData = (sectionData) => {
    setFormData(prevData => ({
      ...prevData,
      ...sectionData
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const dataToSubmit = {
        ...formData,
        slug: createSlug(formData.name, existingSlugs)
      };
    
      const endpointURL = isEdit
        ? `${apiUrl}/bands/${formData.slug}/edit`
        : `${apiUrl}/bands/add`;
    
      const response = await fetch(endpointURL, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });
    
      if (!response.ok) throw new Error("Failed to submit band data");
    
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Error submitting band data:", err);
      setErrorMessage("Failed to submit band data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get appropriate component for current step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BandBasics formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <MembersInstruments formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <MusicReleases formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <MerchContact formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PerformanceInfo formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <AdditionalMedia formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <ProfileCustomization formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <FinalReview formData={formData} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          my: 4,
          borderRadius: 2,
          background: `linear-gradient(to bottom, ${palette.primary.light}10, ${palette.background.default})` 
        }}
      >
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
          {isEdit ? "Edit Your Band" : "Add Your Band"}
        </Typography>
        
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? "vertical" : "horizontal"}
          sx={{ mb: 4 }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={completedSteps[index]}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 4, minHeight: '50vh' }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowConfirmDialog(true)}
                endIcon={<CheckCircleIcon />}
                disabled={isSubmitting}
                sx={{ ml: 1 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : (isEdit ? "Update Band" : "Submit Band")}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
        
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {isEdit ? "update" : "submit"} your band information?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowConfirmDialog(false);
              handleSubmit();
            }} 
            color="primary" 
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogTitle>{isEdit ? "Band Updated!" : "Band Added!"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your band information has been successfully {isEdit ? "updated" : "added"}!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowSuccessDialog(false);
              navigate(`/bands/${formData.slug}`);
            }} 
            color="primary" 
            variant="contained"
          >
            View Band Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BandForm;