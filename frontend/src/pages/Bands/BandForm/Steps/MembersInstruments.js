import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  Chip,
  Fade,
  Alert,
  Collapse,
  Autocomplete
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
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

const MemberCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const PositionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  backgroundColor: `${colorTokens.primary.light}30`,
  borderColor: colorTokens.primary.light,
  '& .MuiChip-deleteIcon': {
    color: colorTokens.primary.main,
    '&:hover': {
      color: colorTokens.primary.dark,
    }
  }
}));

// Common instrument/position options
const commonPositions = [
  "Vocalist", "Lead Guitarist", "Rhythm Guitarist", "Bassist", 
  "Drummer", "Keyboardist", "Synth Player", "Violinist",
  "Saxophonist", "Trumpeter", "DJ", "Producer"
];

const MembersInstruments = ({ formData, updateFormData }) => {
  const [newPosition, setNewPosition] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Add a new member
  const handleAddMember = () => {
    const updatedMembers = [
      ...formData.members,
      { name: "", role: "", bio: "" }
    ];
    updateFormData({ members: updatedMembers });
  };

  // Remove a member
  const handleRemoveMember = (index) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    updateFormData({ members: updatedMembers });
  };

  // Update a member's information
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    updateFormData({ members: updatedMembers });
  };

  // Toggle looking for members switch
  const handleLookingForMembersToggle = (event) => {
    updateFormData({ lookingForMembers: event.target.checked });
  };

  // Add a position
  const handleAddPosition = (position) => {
    if (!formData.openPositions.includes(position) && position.trim() !== "") {
      updateFormData({ 
        openPositions: [...formData.openPositions, position] 
      });
      setNewPosition("");
    }
  };

  // Remove a position
  const handleRemovePosition = (positionToRemove) => {
    const updatedPositions = formData.openPositions.filter(
      position => position !== positionToRemove
    );
    updateFormData({ openPositions: updatedPositions });
  };

  // Suggest a common position
  const handleSuggestPosition = (position) => {
    handleAddPosition(position);
    setShowSuggestions(false);
  };

  return (
    <StepContainer>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Band Members & Instruments
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Let fans know who makes up your band and what instruments each member plays.
            This helps with networking and helps fans connect with individual members.
          </Alert>
          
          <SectionTitle variant="h6">Current Members</SectionTitle>
          
          {formData.members.map((member, index) => (
            <Fade in={true} key={index} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
              <MemberCard elevation={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Member Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                      fullWidth
                      required={index === 0}
                      margin="normal"
                      InputProps={{
                        startAdornment: <PersonIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Role/Instrument"
                      value={member.role}
                      onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                      fullWidth
                      required={index === 0}
                      margin="normal"
                      InputProps={{
                        startAdornment: <MusicNoteIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Short Bio (Optional)"
                      value={member.bio}
                      onChange={(e) => handleMemberChange(index, "bio", e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      margin="normal"
                      placeholder="Background, influences, fun facts..."
                      helperText={`${member.bio.length}/300 characters`}
                      inputProps={{ maxLength: 300 }}
                    />
                  </Grid>
                </Grid>
                
                {formData.members.length > 1 && (
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      color: colorTokens.error.main,
                      '&:hover': { backgroundColor: `${colorTokens.error.light}20` }
                    }}
                    onClick={() => handleRemoveMember(index)}
                    aria-label="Remove member"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </MemberCard>
            </Fade>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMember}
            sx={{ mb: 4 }}
          >
            Add Another Member
          </Button>
          
          <Divider sx={{ my: 4 }} />
          
          <SectionTitle variant="h6">Looking for New Members?</SectionTitle>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.lookingForMembers}
                  onChange={handleLookingForMembersToggle}
                  color="primary"
                />
              }
              label="We're currently looking for new members"
            />
          </Box>
          
          <Collapse in={formData.lookingForMembers}>
            <Box sx={{ 
              backgroundColor: `${colorTokens.primary.light}10`, 
              p: 3, 
              borderRadius: 2,
              mb: 3
            }}>
              <Typography variant="body1" gutterBottom>
                What positions are you looking to fill?
              </Typography>
              
              <Box sx={{ mt: 2, mb: 3 }}>
                {formData.openPositions.map((position, index) => (
                  <PositionChip
                    key={index}
                    label={position}
                    variant="outlined"
                    onDelete={() => handleRemovePosition(position)}
                  />
                ))}
                
                {formData.openPositions.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    No positions added yet. Add some below.
                  </Typography>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Add Position"
                    value={newPosition}
                    onChange={(e) => {
                      setNewPosition(e.target.value);
                      setShowSuggestions(true);
                    }}
                    fullWidth
                    placeholder="e.g. Drummer, Vocalist, etc."
                    InputProps={{
                      endAdornment: (
                        <Button
                          onClick={() => handleAddPosition(newPosition)}
                          disabled={!newPosition.trim()}
                          size="small"
                        >
                          Add
                        </Button>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              
              {showSuggestions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Suggestions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {commonPositions
                      .filter(pos => !formData.openPositions.includes(pos))
                      .slice(0, 8)
                      .map((position, index) => (
                        <Chip
                          key={index}
                          label={position}
                          onClick={() => handleSuggestPosition(position)}
                          sx={{ m: 0.5, cursor: 'pointer' }}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                  </Box>
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                This information will be displayed on your band profile, helping potential members
                find you. Musicians browsing the platform can filter by bands looking for specific positions.
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </Fade>
    </StepContainer>
  );
};

MembersInstruments.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired
};

export default MembersInstruments;