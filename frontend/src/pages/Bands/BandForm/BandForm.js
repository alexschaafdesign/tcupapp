import React, { useState, useEffect, useCallback } from "react";
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
import SaveIcon from '@mui/icons-material/Save';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import palette from "../../../styles/colors/palette";
import { useAuth } from "../../../hooks/useAuth";

// Step Components
import BandBasics from "./Steps/BandBasics";
import MembersInstruments from "./Steps/MembersInstruments";
import MusicReleases from "./Steps/MusicReleases";
import MerchContact from "./Steps/MerchContact";
import PerformanceInfo from "./Steps/PerformanceInfo";
import AdditionalMedia from "./Steps/AdditionalMedia";
import ProfileCustomization from "./Steps/ProfileCustomization";
import FinalReview from "./Steps/FinalReview";

// Separate the DraftSavingIndicator into its own component to fix hook rules
const DraftSavingIndicator = ({ saveAttempted, isSaving, lastSaved, errorMessage }) => {
  const [showIndicator, setShowIndicator] = useState(true);
  
  // Auto-hide the success message after 5 seconds
  useEffect(() => {
    let timeoutId;
    
    if (lastSaved && !isSaving && !errorMessage) {
      timeoutId = setTimeout(() => {
        setShowIndicator(false);
      }, 5000);
    } else {
      setShowIndicator(true);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastSaved, isSaving, errorMessage]);
  
  // Don't show if nothing important to show
  if (!showIndicator || (!saveAttempted && !isSaving && !lastSaved && !errorMessage)) {
    return null;
  }
  
  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        zIndex: 1000,
        bgcolor: 'background.paper',
        boxShadow: 3,
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: '220px',
        border: '1px solid',
        borderColor: errorMessage ? 'error.main' : (isSaving ? 'primary.main' : (lastSaved ? 'success.main' : 'warning.main'))
      }}
    >
      {errorMessage ? (
        <>
          <Box sx={{ color: 'error.main' }}>⚠️</Box>
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        </>
      ) : isSaving ? (
        <>
          <CircularProgress size={20} />
          <Typography variant="body2">Saving draft...</Typography>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
          <Typography variant="body2">
            Draft saved at {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Typography>
        </>
      ) : (
        <>
          <SaveIcon color="warning" sx={{ fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Draft not saved yet
          </Typography>
        </>
      )}
    </Box>
  );
};

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

// Debounce function to prevent too frequent saves
function debounce(func, wait) {
  let timeout;
  let lastArgs;
  
  const debounced = function(...args) {
    lastArgs = args;
    const later = () => {
      timeout = null;
      func(...lastArgs);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  debounced.flush = function() {
    clearTimeout(timeout);
    if (lastArgs) {
      func.apply(this, lastArgs);
    }
  };
  
  return debounced;
}

const BandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isAuthenticated, tokenReady, getAccessTokenSilently } = useAuth();

  
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
  
  // Define step keys for backend communication
  const stepKeys = [
    'bandBasics',
    'members', 
    'musicAndReleases', 
    'merchAndContact', 
    'performanceInfo', 
    'additionalMedia', 
    'profileCustomization', 
    'finalReview'
  ];
  
  const [existingSlugs, setExistingSlugs] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState(bandid || null);
  const [saveAttempted, setSaveAttempted] = useState(false); // Track if save was attempted
  
  const apiUrl = process.env.REACT_APP_API_URL;
  const bandDataFromState = location.state?.band;

  useEffect(() => {
    console.log('Authentication status:', { isAuthenticated, tokenReady });
  }, [isAuthenticated, tokenReady]);

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

  useEffect(() => {
    console.log('Current API URL configured as:', apiUrl);
    // Test if the API is available
    fetch(`${apiUrl}/ping`, { method: 'GET' })
      .then(res => {
        console.log('API ping response:', res.status, res.ok);
        return res.text();
      })
      .then(data => console.log('API responded with:', data))
      .catch(err => console.error('API not reachable:', err));
  }, [apiUrl]);

  // Create a saveProgress function using the useCallback hook
  const saveProgress = useCallback(
    debounce(async (currentFormData, currentStep) => {
      // Safety checks
      if (!currentFormData) {
        console.error('FormData is undefined in saveProgress');
        return;
      }
      
      // Only proceed if name exists or we're on step 0
      if (!currentFormData.name && currentStep !== 0) {
        console.log('No band name yet, not saving');
        return;
      }
      
      // Make sure we have authentication
      if (!isAuthenticated || !tokenReady) {
        console.error('Authentication not ready, cannot save');
        setErrorMessage('Please log in to save your progress');
        return;
      }
      
      try {
        console.log('Starting to save draft...');
        setIsSaving(true);
        setSaveAttempted(true);
        
        // Get a fresh token for each request
        const token = await getAccessTokenSilently();
        
        // Make sure apiUrl is correct
        const saveUrl = `${apiUrl}/bands/draft`;
        console.log('Save URL:', saveUrl);
        
        // Structure the request body
        const draftData = {
          id: draftId,
          formData: {
            bandBasics: {
              name: currentFormData.name || "",
              location: currentFormData.location || "",
              yearFormed: currentFormData.yearFormed || "",
              originStory: currentFormData.originStory || "",
              bio: currentFormData.bio || ""
            },
            // Include other form fields as needed
          },
          currentStep: stepKeys[currentStep] || 'bandBasics'
        };
        
        // Add a timeout to prevent excessive API calls
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('Sending authenticated request with token');
        
        const response = await fetch(saveUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the auth token here
          },
          credentials: 'include',
          body: JSON.stringify(draftData)
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          
          if (response.status === 401) {
            console.error('Authentication rejected by server. Status:', response.status, errorText);
            throw new Error('Authentication failed. Please try logging in again.');
          } else {
            throw new Error(`Server error (${response.status}): ${errorText || response.statusText}`);
          }
        }
        
        const data = await response.json();
        console.log('Draft saved successfully:', data);
        
        if (data.isNew && data.bandId) {
          setDraftId(data.bandId);
          navigate(`/bands/form/${data.bandId}`, { replace: true });
        }
        
        setLastSaved(new Date());
        setErrorMessage(""); // Clear any previous error
      } catch (error) {
        console.error('Error saving draft:', error);
        setErrorMessage(`Failed to save draft: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [draftId, apiUrl, navigate, stepKeys, isAuthenticated, tokenReady, getAccessTokenSilently]
  );

  // Auto-save when form data changes
  useEffect(() => {
    const shouldAutoSave = (formData.name || draftId) && isAuthenticated && tokenReady;
    
    if (shouldAutoSave && !isSaving) {
      console.log("Auto-save triggered");
      saveProgress(formData, activeStep);
    } else if (!isAuthenticated) {
      console.log("Not auto-saving - user not authenticated");
    } else if (!tokenReady) {
      console.log("Not auto-saving - token not ready");
    }
  }, [formData.name, draftId, activeStep, isSaving, isAuthenticated, tokenReady]);

  // Save before user leaves the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formData.name && !lastSaved) {
        // Force an immediate save without debounce
        console.log("Attempting to save before page unload");
        if (saveProgress.flush) {
          saveProgress.flush();
        }
        
        // Standard behavior for beforeunload event
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, lastSaved, saveProgress]);

  // Update completed steps
  useEffect(() => {
    const newCompleted = { ...completedSteps };
    
    // Check each step and update completed status
    for (let i = 0; i < steps.length; i++) {
      newCompleted[i] = isStepComplete(i);
    }
    
    setCompletedSteps(newCompleted);
  }, [formData, steps]);

  // Fetch existing slugs
  useEffect(() => {
    const fetchSlugs = async () => {
      try {
        const response = await fetch(`${apiUrl}/bands/slugs`, {
          credentials: 'include' // Important for auth
        });
        if (!response.ok) throw new Error('Failed to fetch slugs');
        const slugs = await response.json();
        setExistingSlugs(slugs);
      } catch (error) {
        console.error("Error fetching slugs:", error);
      }
    };
    fetchSlugs();
  }, [apiUrl]);

  // Fetch draft data if ID provided
  useEffect(() => {
    const fetchDraft = async () => {
      if (!draftId) return;
      
      try {
        const response = await fetch(`${apiUrl}/bands/draft/${draftId}`, {
          credentials: 'include' // Important for auth
        });
        if (!response.ok) throw new Error('Failed to fetch draft');
        
        const draftData = await response.json();
        
        // Map the draft data to your form structure
        setFormData({
          name: draftData.name || "",
          slug: draftData.slug || "",
          location: draftData.location || "",
          yearFormed: draftData.year_formed || "",
          originStory: draftData.origin_story || "",
          bio: draftData.bio || "",
          profile_image: draftData.profile_image || null,
          
          members: draftData.members?.length ? draftData.members : [{ name: "", role: "", bio: "" }],
          lookingForMembers: draftData.looking_for_members || false,
          openPositions: draftData.openPositions || [],
          
          genre: draftData.genres?.length ? draftData.genres : ["", "", ""],
          releases: draftData.releases?.length ? draftData.releases : [{ title: "", releaseDate: "", type: "", link: "" }],
          music_links: draftData.musicLinks || {
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            youtube: "",
          },
          
          hasMerch: draftData.hasMerch || false,
          merchUrl: draftData.merchUrl || "",
          merchTypes: draftData.merchTypes || [],
          bandemail: draftData.bandemail || "",
          social_links: draftData.socialLinks || {
            instagram: "",
            facebook: "",
            tiktok: "",
            twitter: "",
            website: "",
          },
          
          play_shows: draftData.playShows || "",
          group_size: draftData.groupSizes || [],
          performanceNotes: draftData.performanceNotes || "",
          
          other_images: draftData.additionalImages || [],
          
          customSlug: draftData.customSlug || "",
          profileTheme: draftData.profileTheme || "default",
          headerLayout: draftData.headerLayout || "classic",
          featuredContent: draftData.featuredContent || [],
          backgroundImage: draftData.backgroundImage || null,
          backgroundPattern: draftData.backgroundPattern || "none",
          profileBadges: draftData.profileBadges || [],
        });
        
        // Set completion status if available
        if (draftData.completionStatus) {
          const newCompletedSteps = {};
          // Convert API completion status format to your internal format
          Object.entries(draftData.completionStatus).forEach(([key, value]) => {
            const stepIndex = stepKeys.indexOf(key);
            if (stepIndex >= 0) {
              newCompletedSteps[stepIndex] = value;
            }
          });
          setCompletedSteps(newCompletedSteps);
        }
      } catch (error) {
        console.error('Error fetching draft:', error);
      }
    };
    
    fetchDraft();
  }, [draftId, apiUrl, stepKeys]);

  // Fetch band data if editing
  useEffect(() => {
    const fetchBand = async () => {
      if (!isEdit || draftId) return; // Skip if it's a draft
      
      try {
        const bandData = bandDataFromState || 
          await (await fetch(`${apiUrl}/bands/${bandid}/edit`, {
            credentials: 'include' // Important for auth
          })).json().data;

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
          customSlug: bandData.customSlug || "",
          profileTheme: bandData.profileTheme || "default",
          headerLayout: bandData.headerLayout || "classic",
          featuredContent: bandData.featuredContent || [],
          backgroundImage: bandData.backgroundImage || null,
          backgroundPattern: bandData.backgroundPattern || "none",
          profileBadges: bandData.profileBadges || [],
        });
      } catch (error) {
        console.error("Error fetching band data:", error);
      }
    };

    fetchBand();
  }, [isEdit, bandid, bandDataFromState, apiUrl, draftId]);

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  // Manual save handler
  const handleManualSave = async () => {
    console.log("Manual save triggered");
    
    if (!isAuthenticated || !tokenReady) {
      setErrorMessage("Please log in to save your band information");
      return;
    }
    
    if (!formData || !formData.name) {
      setErrorMessage("Please enter a band name before saving");
      return;
    }
    
    // Check if already saving
    if (isSaving) {
      console.log("Already saving, please wait");
      return;
    }
    
    try {
      // Clear previous errors
      setErrorMessage("");
      
      // Force immediate save
      if (saveProgress.flush) {
        saveProgress.flush();
      } else {
        saveProgress(formData, activeStep);
      }
    } catch (error) {
      console.error("Error during manual save:", error);
      setErrorMessage(`Save failed: ${error.message}`);
    }
  };
  
  // Add an auth warning component in your return if not authenticated
  const AuthWarning = () => {
    if (isAuthenticated && tokenReady) return null;
    
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">
          Authentication Required
        </Typography>
        <Typography variant="body2">
          You need to be logged in to save band information. Please log in first.
        </Typography>
      </Box>
    );
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
      if (draftId) {
        // It's a draft - publish it
        const response = await fetch(`${apiUrl}/bands/draft/${draftId}/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Important for auth
          body: JSON.stringify({
            slug: createSlug(formData.name, existingSlugs)
          }),
        });
        
        if (!response.ok) throw new Error("Failed to publish band draft");
        
        const result = await response.json();
        formData.slug = result.slug; // Update with the final slug
      } else {
        // Normal submission
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
          credentials: 'include', // Important for auth
          body: JSON.stringify(dataToSubmit),
        });
      
        if (!response.ok) throw new Error("Failed to submit band data");
      }
      
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
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          {/* Manual save button */}
          <Button
            variant="outlined"
            color="info"
            onClick={handleManualSave}
            disabled={isSaving || !formData.name}
            startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Save Draft
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowConfirmDialog(true)}
                endIcon={<CheckCircleIcon />}
                disabled={isSubmitting}
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
      
      {/* Render draft saving indicator - using the separate component */}
      <DraftSavingIndicator 
        saveAttempted={saveAttempted}
        isSaving={isSaving}
        lastSaved={lastSaved}
        errorMessage={errorMessage}
      />
      
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