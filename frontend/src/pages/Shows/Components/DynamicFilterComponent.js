import React, { useState } from 'react';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  FormControlLabel,
  Checkbox,
  Paper,
  InputLabel,
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import DateRangeFilter from './DateRangeFilter';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../../hooks/useAuth';

function DynamicFilterComponent({ filters, navigate }) {
  const { isAuthenticated, isAdmin, isModerator } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const canAddShow = isAuthenticated && (isAdmin || isModerator);

  // Handler for the Add a show button
  const handleAddShowClick = () => {
    if (canAddShow) {
      navigate('/shows/add');
    } else {
      setAuthDialogOpen(true);
    }
  };

  // Handler to toggle the expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Find filters for easy access
  const checkboxFilter = filters.find(filter => filter.type === 'checkbox');
  const textFilter = filters.find(filter => filter.type === 'text');
  const dropdownFilter = filters.find(filter => filter.type === 'dropdown');
  const dateRangeFilter = filters.find(filter => filter.type === 'dateRange');

  return (
    <Paper 
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden' // Prevents content from breaking the border radius
      }}
    >
      {/* Simplified header with title and action buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 1,
        height: 60, // Fixed height for consistency
      }}>
        {/* Title */}
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'normal',
            lineHeight: 1.2,
            "& b": {
              fontWeight: 700,
              ml: 1
            }
          }}
        >
          the <b> Lalala</b>
        </Typography>
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center'
        }}>
          {/* Search Filters Button */}
          <Button 
            onClick={toggleExpanded}
            color="primary"
            size="medium"
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ 
              borderRadius: 30,
              height: 44,
              px: 2
            }}
          >
            Search
          </Button>

          {/* Add Show Button - Always Visible */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleAddShowClick}
            sx={{ 
              textTransform: "none",
              flexShrink: 0,
              borderRadius: 30,
              height: 44,
              px: 2,

            }}
          >
            Add a show
          </Button>
        </Box>
      </Box>

      {/* All Filters - Only Visible When Expanded */}
      <Collapse in={expanded} timeout={350}>
        <Box sx={{ 
          mt: 2, 
          pt: 3, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {/* First Row: Text Search and Venue Dropdown */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {/* Text Search */}
            {textFilter && (
              <TextField
                label={textFilter.label || 'Search by venue or band name'}
                type="text"
                value={textFilter.value}
                onChange={textFilter.onChange}
                variant="outlined"
                fullWidth
                sx={{
                  flex: { xs: '1 1 100%', md: '1 1 400px' },
                }}
              />
            )}

            {/* Venue Select */}
            {dropdownFilter && (
              <FormControl
                sx={{
                  flex: { xs: '1 1 100%', md: '1 1 300px' },
                }}
              >
                <InputLabel>{dropdownFilter.label}</InputLabel>
                <Select
                  value={dropdownFilter.value}
                  onChange={dropdownFilter.onChange}
                  displayEmpty
                  label={dropdownFilter.label}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        boxShadow: 3
                      }
                    }
                  }}
                >
                  <MenuItem value="">{dropdownFilter.placeholder || 'Select an option'}</MenuItem>
                  {dropdownFilter.options?.map((option, idx) => (
                    <MenuItem key={idx} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Second Row: Date Range */}
          {dateRangeFilter && (
            <Box>
              <DateRangeFilter
                startDate={dateRangeFilter.value[0]}
                endDate={dateRangeFilter.value[1]}
                onChange={dateRangeFilter.onChange}
              />
            </Box>
          )}
          
          {/* Third Row: Checkbox */}
          {checkboxFilter && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxFilter.value}
                    onChange={checkboxFilter.onChange}
                  />
                }
                label={checkboxFilter.label || ''}
              />
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Authentication Dialog */}
      <Dialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)}
      >
        <DialogTitle>Permission Required</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            {isAuthenticated 
              ? "You need administrator or moderator privileges to add shows."
              : "You must be logged in with administrator or moderator privileges to add shows."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialogOpen(false)}>Close</Button>
          {!isAuthenticated && (
            <Button 
              color="primary" 
              variant="contained"
              onClick={() => {
                setAuthDialogOpen(false);
                navigate('/login');
              }}
            >
              Log In
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default DynamicFilterComponent;