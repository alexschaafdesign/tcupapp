import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Fade,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Button,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupIcon from '@mui/icons-material/Group';
import AlbumIcon from '@mui/icons-material/Album';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import EventIcon from '@mui/icons-material/Event';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import colorTokens from "../../../styles/colors/palette";

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

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: `linear-gradient(to right, ${colorTokens.primary.main}, ${colorTokens.secondary.main})`,
  }
}));

const SectionAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(2)} 0`,
  }
}));

const ImageGallery = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ImageThumbnail = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingTop: '100%', // 1:1 aspect ratio
  position: 'relative',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
}));

const ThumbnailImage = styled('img')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const EditButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  minWidth: 0,
  padding: theme.spacing(0.5),
  zIndex: 1,
}));

const StatusChip = styled(Chip)(({ theme, statustype }) => ({
  backgroundColor: statustype === 'complete' 
    ? `${colorTokens.success.light}20` 
    : `${colorTokens.error.light}20`,
  color: statustype === 'complete' 
    ? colorTokens.success.dark 
    : colorTokens.error.dark,
  fontWeight: 500
}));

const FinalReview = ({ formData }) => {
  // Helper to check if a section is complete
  const isSectionComplete = (section) => {
    switch(section) {
      case 'basics':
        return formData.name && formData.location;
      case 'members':
        return formData.members.length > 0 && formData.members[0].name && formData.members[0].role;
      case 'music':
        return formData.genre.some(g => g);
      case 'contact':
        return formData.bandemail || Object.values(formData.social_links).some(link => link);
      case 'performance':
        return formData.play_shows || formData.group_size.length > 0;
      case 'media':
        return formData.profile_image || formData.other_images.length > 0;
      default:
        return false;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  // Get platform icon based on URL
  const getPlatformIcon = (url) => {
    if (!url) return null;
    if (url.includes('instagram')) return '/icons/instagram.svg';
    if (url.includes('facebook')) return '/icons/facebook.svg';
    if (url.includes('twitter')) return '/icons/twitter.svg';
    if (url.includes('tiktok')) return '/icons/tiktok.svg';
    if (url.includes('spotify')) return '/icons/spotify.svg';
    if (url.includes('bandcamp')) return '/icons/bandcamp.svg';
    if (url.includes('soundcloud')) return '/icons/soundcloud.svg';
    if (url.includes('youtube')) return '/icons/youtube.svg';
    return '/icons/link.svg';
  };

  // Get domain name from URL
  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0];
    } catch {
      return url;
    }
  };

  // Helper to get readable play shows status
  const getPlayShowsText = (status) => {
    switch(status) {
      case 'yes':
        return 'Actively seeking shows';
      case 'maybe':
        return 'Selectively booking';
      case 'not right now':
        return 'Not currently booking';
      default:
        return 'Not specified';
    }
  };

  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Review Your Band Profile
          </Typography>
          
          <Typography variant="body1" paragraph>
            Please review all the information you've provided before submitting. 
            You can go back to any section to make changes if needed.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Band Basics Section */}
              <ProfilePaper elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <StatusChip 
                    label={isSectionComplete('basics') ? "Complete" : "Incomplete"} 
                    size="small"
                    statustype={isSectionComplete('basics') ? "complete" : "incomplete"}
                    icon={isSectionComplete('basics') ? <CheckIcon /> : <ErrorIcon />}
                  />
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {}}
                  >
                    Edit Basics
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  {formData.profile_image ? (
                    <Avatar 
                      src={formData.profile_image} 
                      alt={formData.name}
                      sx={{ width: 100, height: 100, mr: 3 }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        mr: 3, 
                        bgcolor: colorTokens.primary.light,
                        fontSize: '2rem'
                      }}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : "B"}
                    </Avatar>
                  )}
                  
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {formData.name || "Your Band Name"}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body1" color="text.secondary">
                        {formData.location || "Location"}
                      </Typography>
                      
                      {formData.yearFormed && (
                        <>
                          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 16 }} />
                          <Typography variant="body1" color="text.secondary">
                            Est. {formData.yearFormed}
                          </Typography>
                        </>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      {formData.genre.filter(g => g).map((genre, index) => (
                        <Chip 
                          key={index} 
                          label={genre} 
                          size="small" 
                          sx={{ 
                            mr: 0.5, 
                            mb: 0.5,
                            backgroundColor: `${colorTokens.secondary.light}20`
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
                
                {formData.originStory && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{formData.originStory}"
                    </Typography>
                  </Box>
                )}
                
                {formData.bio && (
                  <Typography variant="body1">
                    {formData.bio}
                  </Typography>
                )}
              </ProfilePaper>
              
              {/* Sections Accordion */}
              <SectionAccordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GroupIcon sx={{ mr: 1, color: colorTokens.primary.main }} />
                      <Typography variant="h6">Band Members</Typography>
                    </Box>
                    <StatusChip 
                      label={isSectionComplete('members') ? "Complete" : "Incomplete"} 
                      size="small"
                      statustype={isSectionComplete('members') ? "complete" : "incomplete"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.members.length > 0 ? (
                    <List>
                      {formData.members.map((member, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: `${colorTokens.primary.main}40` }}>
                              {member.name ? member.name.charAt(0).toUpperCase() : "M"}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={member.name || "Member name"}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {member.role || "Role/Instrument"}
                                </Typography>
                                {member.bio && (
                                  <>
                                    <br />
                                    {member.bio}
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No members added yet.
                    </Typography>
                  )}
                  
                  {formData.lookingForMembers && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">
                        Looking for new members:
                      </Typography>
                      {formData.openPositions.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {formData.openPositions.map((position, index) => (
                            <Chip key={index} label={position} size="small" />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No specific positions specified.
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {}} 
                    sx={{ mt: 2 }}
                  >
                    Edit Members
                  </Button>
                </AccordionDetails>
              </SectionAccordion>
              
              <SectionAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MusicNoteIcon sx={{ mr: 1, color: colorTokens.secondary.main }} />
                      <Typography variant="h6">Music & Releases</Typography>
                    </Box>
                    <StatusChip 
                      label={isSectionComplete('music') ? "Complete" : "Incomplete"} 
                      size="small"
                      statustype={isSectionComplete('music') ? "complete" : "incomplete"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.releases.some(release => release.title) ? (
                    <List>
                      {formData.releases.filter(release => release.title).map((release, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <ListItemIcon>
                            <AlbumIcon sx={{ color: colorTokens.secondary.main }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={release.title}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {release.type ? release.type.charAt(0).toUpperCase() + release.type.slice(1) : "Release"}
                                  {release.releaseDate && ` • ${formatDate(release.releaseDate)}`}
                                </Typography>
                                {release.link && (
                                  <Box sx={{ mt: 0.5 }}>
                                    <Link 
                                      href={release.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      underline="hover"
                                    >
                                      Listen on {getDomainFromUrl(release.link)}
                                    </Link>
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No releases added yet.
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      Music Platform Links:
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {Object.entries(formData.music_links).map(([platform, url]) => (
                        url && (
                          <Grid item key={platform}>
                            <Link 
                              href={url} 
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Chip
                                avatar={
                                  <Avatar 
                                    src={getPlatformIcon(url)} 
                                    alt={platform}
                                    sx={{ bgcolor: 'transparent', p: 0.5 }}
                                  />
                                }
                                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                clickable
                              />
                            </Link>
                          </Grid>
                        )
                      ))}
                      {!Object.values(formData.music_links).some(link => link) && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            No music platform links added.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {}} 
                    sx={{ mt: 2 }}
                  >
                    Edit Music
                  </Button>
                </AccordionDetails>
              </SectionAccordion>
              
              <SectionAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StoreIcon sx={{ mr: 1, color: colorTokens.secondary.main }} />
                      <Typography variant="h6">Merch & Contact</Typography>
                    </Box>
                    <StatusChip 
                      label={isSectionComplete('contact') ? "Complete" : "Incomplete"} 
                      size="small"
                      statustype={isSectionComplete('contact') ? "complete" : "incomplete"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.hasMerch && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Merchandise:
                      </Typography>
                      
                      {formData.merchUrl && (
                        <Link 
                          href={formData.merchUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <StoreIcon sx={{ mr: 1, fontSize: 18 }} />
                          {getDomainFromUrl(formData.merchUrl)}
                        </Link>
                      )}
                      
                      {formData.merchTypes.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">Available merchandise:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {formData.merchTypes.map((type, index) => (
                              <Chip key={index} label={type} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Information:
                    </Typography>
                    
                    {formData.bandemail && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmailIcon sx={{ mr: 1, color: colorTokens.primary.main }} />
                        <Typography variant="body1">
                          {formData.bandemail}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Social Media:
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {Object.entries(formData.social_links).map(([platform, url]) => (
                        url && (
                          <Grid item key={platform}>
                            <Link 
                              href={url} 
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Chip
                                avatar={
                                  <Avatar 
                                    src={getPlatformIcon(url)} 
                                    alt={platform}
                                    sx={{ bgcolor: 'transparent', p: 0.5 }}
                                  />
                                }
                                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                clickable
                              />
                            </Link>
                          </Grid>
                        )
                      ))}
                      {!Object.values(formData.social_links).some(link => link) && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            No social media links added.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {}} 
                    sx={{ mt: 2 }}
                  >
                    Edit Contact
                  </Button>
                </AccordionDetails>
              </SectionAccordion>
              
              <SectionAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1, color: colorTokens.primary.main }} />
                      <Typography variant="h6">Performance Info</Typography>
                    </Box>
                    <StatusChip 
                      label={isSectionComplete('performance') ? "Complete" : "Incomplete"} 
                      size="small"
                      statustype={isSectionComplete('performance') ? "complete" : "incomplete"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Booking Status:
                      </Typography>
                      {formData.play_shows ? (
                        <Chip 
                          label={getPlayShowsText(formData.play_shows)}
                          color={
                            formData.play_shows === 'yes' 
                              ? 'success' 
                              : formData.play_shows === 'maybe' 
                                ? 'warning' 
                                : 'error'
                          }
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not specified
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Group Size:
                      </Typography>
                      {formData.group_size.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {formData.group_size.map((size, index) => (
                            <Chip key={index} label={size} size="small" />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not specified
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  
                  {formData.performanceNotes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Performance Notes:
                      </Typography>
                      <Typography variant="body2">
                        {formData.performanceNotes}
                      </Typography>
                    </Box>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {}} 
                    sx={{ mt: 2 }}
                  >
                    Edit Performance Info
                  </Button>
                </AccordionDetails>
              </SectionAccordion>
              
              <SectionAccordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ImageIcon sx={{ mr: 1, color: colorTokens.secondary.main }} />
                      <Typography variant="h6">Band Images</Typography>
                    </Box>
                    <StatusChip 
                      label={isSectionComplete('media') ? "Complete" : "Incomplete"} 
                      size="small"
                      statustype={isSectionComplete('media') ? "complete" : "incomplete"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.other_images.length > 0 ? (
                    <ImageGallery container spacing={2}>
                      {formData.other_images.map((imageUrl, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <ImageThumbnail>
                            <ThumbnailImage src={imageUrl} alt={`Band image ${index + 1}`} />
                          </ImageThumbnail>
                        </Grid>
                      ))}
                    </ImageGallery>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No additional images uploaded.
                    </Typography>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {}} 
                    sx={{ mt: 2 }}
                  >
                    Edit Images
                  </Button>
                </AccordionDetails>
              </SectionAccordion>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 16 }}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <SectionTitle variant="h6">Profile Completion</SectionTitle>
                  
                  <List>
                    {[
                      { name: 'Band Basics', section: 'basics', step: 0 },
                      { name: 'Members & Instruments', section: 'members', step: 1 },
                      { name: 'Music & Releases', section: 'music', step: 2 },
                      { name: 'Merch & Contact', section: 'contact', step: 3 },
                      { name: 'Performance Info', section: 'performance', step: 4 },
                      { name: 'Band Images', section: 'media', step: 5 }
                    ].map((item) => (
                      <ListItem key={item.name} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {isSectionComplete(item.section) ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <ErrorIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.name} 
                          secondary={isSectionComplete(item.section) ? "Complete" : "Incomplete"}
                        />
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => {}}
                        >
                          Edit
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography align="center" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {Object.keys(formData).length === 0 
                      ? "Start adding your band information to complete your profile."
                      : "Review your information above and make any necessary changes before submitting."}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </StepContainer>
  );
};

FinalReview.propTypes = {
  formData: PropTypes.object.isRequired
};

export default FinalReview;