import React from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Checkbox,
  Fade,
  Alert,
  Paper,
  Divider,
  InputAdornment,
  Collapse,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import EmailIcon from '@mui/icons-material/Email';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StoreIcon from '@mui/icons-material/Store';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import colorTokens from "../../../../styles/colors/palette";

// Styled components
const StepContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: colorTokens.primary.dark,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: colorTokens.primary.main,
    borderRadius: 2,
  }
}));

const ContactCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${colorTokens.background.default}, ${colorTokens.background.paper})`,
  boxShadow: theme.shadows[3],
}));

const MerchSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${colorTokens.secondary.light}10, ${colorTokens.background.paper})`,
  boxShadow: theme.shadows[3],
}));

const MerchTypeGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const MerchTypeBox = styled(Box)(({ theme, checked }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  border: `1px solid ${checked ? colorTokens.secondary.main : theme.palette.divider}`,
  backgroundColor: checked ? `${colorTokens.secondary.main}10` : 'transparent',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    borderColor: colorTokens.secondary.main,
    backgroundColor: `${colorTokens.secondary.main}05`,
  }
}));

// Available merch types
const merchTypes = [
  "T-Shirts", "Hoodies", "Vinyl Records", "CDs", "Cassettes", 
  "Posters", "Stickers", "Tote Bags", "Pins/Badges", "Hats/Beanies",
  "Digital Downloads"
];

// Social media platforms
const socialPlatforms = [
  { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "https://instagram.com/yourbandname" },
  { key: "facebook", label: "Facebook", icon: FacebookIcon, placeholder: "https://facebook.com/yourbandname" },
  { key: "tiktok", label: "TikTok", icon: null, placeholder: "https://tiktok.com/@yourbandname" },
  { key: "twitter", label: "Twitter/X", icon: null, placeholder: "https://twitter.com/yourbandname" },
  { key: "website", label: "Website", icon: LanguageIcon, placeholder: "https://yourbandname.com" }
];

const MerchContact = ({ formData, updateFormData }) => {
  
  // Handle merch toggle
  const handleMerchToggle = (event) => {
    updateFormData({ hasMerch: event.target.checked });
  };
  
  // Handle merch URL change
  const handleMerchUrlChange = (e) => {
    updateFormData({ merchUrl: e.target.value });
  };
  
  // Handle merch type selection
  const handleMerchTypeToggle = (type) => {
    const currentTypes = [...formData.merchTypes];
    const typeIndex = currentTypes.indexOf(type);
    
    if (typeIndex === -1) {
      // Add the type
      updateFormData({ merchTypes: [...currentTypes, type] });
    } else {
      // Remove the type
      currentTypes.splice(typeIndex, 1);
      updateFormData({ merchTypes: currentTypes });
    }
  };
  
  // Handle email change
  const handleEmailChange = (e) => {
    updateFormData({ bandemail: e.target.value });
  };
  
  // Handle social link change
  const handleSocialChange = (platform, value) => {
    updateFormData({
      social_links: {
        ...formData.social_links,
        [platform]: value
      }
    });
  };
  
  // Check if URL is valid
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true; // Empty is fine
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Check if email is valid
  const isValidEmail = (email) => {
    if (!email || email.trim() === '') return true; // Empty is fine
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Function to get the appropriate icon for social platforms
  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon />;
      case 'facebook':
        return <FacebookIcon />;
      case 'tiktok':
        return <img 
          src="/icons/tiktok.svg" 
          alt="TikTok" 
          style={{ width: 20, height: 20 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />;
      case 'twitter':
        return <img 
          src="/icons/twitter.svg" 
          alt="Twitter" 
          style={{ width: 20, height: 20 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />;
      case 'website':
        return <LanguageIcon />;
      default:
        return <LanguageIcon />;
    }
  };

  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Merchandise & Contact Info
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Let fans know where to buy your merch and how to get in touch with you for bookings or collaboration opportunities.
          </Alert>
          
          <SectionTitle variant="h6">Merchandise</SectionTitle>
          
          <MerchSection>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.hasMerch}
                  onChange={handleMerchToggle}
                  color="secondary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingBagIcon sx={{ mr: 1, color: colorTokens.secondary.main }} />
                  <Typography variant="body1">We have merchandise available</Typography>
                </Box>
              }
            />
            
            <Collapse in={formData.hasMerch}>
              <Box sx={{ mt: 3 }}>
                <TextField
                  label="Merch Store URL"
                  value={formData.merchUrl}
                  onChange={handleMerchUrlChange}
                  fullWidth
                  placeholder="https://your-store.com or Bandcamp/Etsy shop URL"
                  error={!isValidUrl(formData.merchUrl)}
                  helperText={!isValidUrl(formData.merchUrl) ? "Please enter a valid URL" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StoreIcon color="secondary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="body1" gutterBottom>
                  What types of merchandise do you offer?
                </Typography>
                
                <MerchTypeGrid container spacing={2}>
                  {merchTypes.map((type) => (
                    <Grid item xs={6} sm={4} key={type}>
                      <MerchTypeBox 
                        checked={formData.merchTypes.includes(type)}
                        onClick={() => handleMerchTypeToggle(type)}
                      >
                        <Checkbox
                          checked={formData.merchTypes.includes(type)}
                          onChange={() => handleMerchTypeToggle(type)}
                          color="secondary"
                          icon={
                            <Box 
                              sx={{ 
                                width: 18, 
                                height: 18, 
                                border: `1px solid ${colorTokens.secondary.main}`, 
                                borderRadius: '4px',
                                opacity: 0.6
                              }}
                            />
                          }
                          checkedIcon={
                            <Box 
                              sx={{ 
                                width: 18, 
                                height: 18, 
                                backgroundColor: colorTokens.secondary.main,
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <CheckIcon sx={{ color: 'white', fontSize: 14 }} />
                            </Box>
                          }
                        />
                        <Typography variant="body2">{type}</Typography>
                      </MerchTypeBox>
                    </Grid>
                  ))}
                </MerchTypeGrid>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  This information helps fans discover what merchandise you have available.
                  Your merch store link will be prominently displayed on your profile.
                </Typography>
              </Box>
            </Collapse>
          </MerchSection>
          
          <Divider sx={{ my: 4 }} />
          
          <SectionTitle variant="h6">Contact Information</SectionTitle>
          
          <ContactCard>
            <TextField
              label="Band Email"
              value={formData.bandemail}
              onChange={handleEmailChange}
              fullWidth
              placeholder="your.band@example.com"
              error={!isValidEmail(formData.bandemail)}
              helperText={!isValidEmail(formData.bandemail) ? "Please enter a valid email address" : "This email will be used for booking inquiries and fan messages"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="body1" gutterBottom>
              Social Media Profiles
            </Typography>
            
            <Grid container spacing={3}>
              {socialPlatforms.map((platform) => (
                <Grid item xs={12} sm={6} key={platform.key}>
                  <TextField
                    label={platform.label}
                    value={formData.social_links[platform.key] || ""}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    fullWidth
                    placeholder={platform.placeholder}
                    error={!isValidUrl(formData.social_links[platform.key])}
                    helperText={!isValidUrl(formData.social_links[platform.key]) ? "Please enter a valid URL" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {getSocialIcon(platform.key)}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              ))}
            </Grid>
            
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                These links will be displayed on your profile as clickable icons, making it easy for fans to connect with you across platforms.
              </Typography>
            </Alert>
          </ContactCard>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Privacy note:</strong> Your email address will not be publicly visible without your consent. 
            Fans will contact you through a form on the platform that forwards messages to your email.
          </Typography>
        </Box>
      </Fade>
    </StepContainer>
  );
};

MerchContact.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default MerchContact;