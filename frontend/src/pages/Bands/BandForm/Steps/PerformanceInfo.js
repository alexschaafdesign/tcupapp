import React from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Divider,
  Fade,
  Alert,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import MicIcon from '@mui/icons-material/Mic';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
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

const PerformanceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${colorTokens.primary.light}10, ${colorTokens.background.paper})`,
  boxShadow: theme.shadows[3],
}));

const GroupSizeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: `radial-gradient(circle at top right, ${colorTokens.primary.light}15, transparent 70%)`,
    borderRadius: '0 0 0 100%',
  }
}));

const GroupSizeGrid = styled(Grid)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
}));

// Group size options
const groupSizeOptions = ["Solo", "Duo", "Trio", "4-piece", "5+ piece"];

const PerformanceInfo = ({ formData, updateFormData }) => {
  
  // Handle looking to play shows change
  const handlePlayShowsChange = (e) => {
    updateFormData({ play_shows: e.target.value });
  };
  
  // Handle group size change
  const handleGroupSizeChange = (size) => {
    const currentSizes = [...formData.group_size];
    const sizeIndex = currentSizes.indexOf(size);
    
    if (sizeIndex === -1) {
      // Add the size
      updateFormData({ group_size: [...currentSizes, size] });
    } else {
      // Remove the size
      currentSizes.splice(sizeIndex, 1);
      updateFormData({ group_size: currentSizes });
    }
  };
  
  // Handle performance notes change
  const handlePerformanceNotesChange = (e) => {
    updateFormData({ performanceNotes: e.target.value });
  };
  
  // Get chip color based on play_shows value
  const getPlayShowsChipColor = (value) => {
    switch(value) {
      case 'yes':
        return 'success';
      case 'maybe':
        return 'warning';
      case 'not right now':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Performance Information
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Let venues and promoters know about your performance setup and whether you're actively looking for shows.
          </Alert>
          
          <SectionTitle variant="h6">Booking Status</SectionTitle>
          
          <PerformanceCard>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="play-shows-label">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1 }} />
                    Looking to Play Shows?
                  </Box>
                </InputLabel>
                <Select
                  labelId="play-shows-label"
                  value={formData.play_shows}
                  onChange={handlePlayShowsChange}
                  label="Looking to Play Shows?"
                >
                  <MenuItem value="yes">Yes, actively seeking shows</MenuItem>
                  <MenuItem value="maybe">Maybe, depends on the opportunity</MenuItem>
                  <MenuItem value="not right now">Not looking for shows right now</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Current status:</Typography>
              {formData.play_shows ? (
                <Chip 
                  label={formData.play_shows === 'yes' 
                    ? 'Actively booking' 
                    : formData.play_shows === 'maybe'
                      ? 'Selectively booking'
                      : 'Not booking'
                  }
                  color={getPlayShowsChipColor(formData.play_shows)}
                  variant="outlined"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Not specified
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              This information helps venues and promoters know if you're currently looking for performance opportunities.
              You can change this status anytime as your availability changes.
            </Typography>
          </PerformanceCard>
          
          <Divider sx={{ my: 4 }} />
          
          <SectionTitle variant="h6">Group Size</SectionTitle>
          
          <GroupSizeCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                What size(s) does your group perform in?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                (Select all that apply)
              </Typography>
            </Box>
            
            <GroupSizeGrid container spacing={2}>
              {groupSizeOptions.map((size) => (
                <Grid item xs={6} sm={4} key={size}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.group_size.includes(size)}
                        onChange={() => handleGroupSizeChange(size)}
                        color="primary"
                      />
                    }
                    label={size}
                  />
                </Grid>
              ))}
            </GroupSizeGrid>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This helps venues know how much space you'll need and what kind of setup to prepare.
              Many artists can perform in different configurations depending on the venue.
            </Typography>
          </GroupSizeCard>
          
          <Divider sx={{ my: 4 }} />
          
          <SectionTitle variant="h6">Additional Performance Notes</SectionTitle>
          
          <TextField
            label="Performance Notes"
            value={formData.performanceNotes}
            onChange={handlePerformanceNotesChange}
            fullWidth
            multiline
            rows={4}
            placeholder="Details about your typical set length, technical requirements, stage setup, etc."
            InputProps={{
              startAdornment: (
                <MicIcon color="primary" sx={{ mr: 1, mt: 2, alignSelf: 'flex-start' }} />
              ),
            }}
            helperText="This information will help venues prepare for your performances. Consider mentioning your typical set length, special equipment needs, or unique performance elements."
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              What to include in your performance notes:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box component="ul" sx={{ mt: 0, pl: 2 }}>
                  <li>Typical set length (30 min, 45 min, etc.)</li>
                  <li>Special tech requirements</li>
                  <li>Stage plot information</li>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box component="ul" sx={{ mt: 0, pl: 2 }}>
                  <li>Unique performance elements</li>
                  <li>Venue size preferences</li>
                  <li>Any accessibility requirements</li>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Fade>
    </StepContainer>
  );
};

PerformanceInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default PerformanceInfo;