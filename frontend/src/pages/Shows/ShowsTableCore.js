import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import AuthWrapper from '../../components/auth/AuthWrapper';
import { useAuth } from '../../hooks/useAuth';

const ShowsTableCore = ({ data }) => {
  const navigate = useNavigate();
  const { user = null, userRoles = [], isAdmin = false, isModerator = false } = useAuth() || {};
  const isAuthorized = user && (userRoles.includes('admin') || userRoles.includes('moderator'));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groupByDate = (events) => {
    const grouped = {};
    events.forEach((item) => {
      if (item.start) {
        const showDate = new Date(item.start).toLocaleDateString();
        if (!grouped[showDate]) {
          grouped[showDate] = [];
        }
        grouped[showDate].push(item);
      }
    });
    return grouped;
  };

  const groupedData = groupByDate(data);
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  const handleEdit = (e, showId) => {
    e.stopPropagation(); // This prevents navigating to show profile
    navigate(`/shows/${showId}/edit`);
  };

  const handleRowClick = (showId) => {
    navigate(`/shows/${showId}`);
  };

  // This function renders the edit button with proper auth wrapping
  const renderEditButton = (showId, size = "medium", sx = {}) => {
    if (isAuthorized) {
      return (
        <Tooltip title="Edit Show">
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(e, showId);
            }}
            sx={{
              color: 'action.active',
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'background.paper'
              },
              ...sx
            }}
            size={size}
          >
            <EditIcon fontSize={size === "small" ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      );
    } else {
      // If not authorized, render the button within an AuthWrapper.
      // Notice we don't call useAuth here; we're using the top-level values.
      return (
        <AuthWrapper
          requiredRoles={['admin', 'moderator']}
          mode="modal" // change mode here
          renderContent={({ openAuthModal, showAuth }) => (
            <Tooltip title="Edit Show">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  if (openAuthModal) {
                    openAuthModal();
                  } else {
                    alert("Authentication required");
                  }
                }}
                sx={{
                  color: 'action.disabled',
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  ...sx
                }}
                size={size}
              >
                <EditIcon fontSize={size === "small" ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          )}
        />
      );
    }
  };

  // Helper function to check if a date is in the past
  const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    return date < today;
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 2
      }}
    >
      <Table>
        <TableBody>
          {sortedDates.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={5} 
                sx={{ 
                  textAlign: 'center',
                  py: 4,
                  color: 'text.secondary'
                }}
              >
                No events found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            sortedDates.map((date) => (
              <React.Fragment key={date}>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{
                      py: 2,
                      px: 3,
                      backgroundColor: isDateInPast(date) ? 'grey.100' : 'primary.light',
                      borderBottom: '2px solid',
                      borderColor: isDateInPast(date) ? 'grey.300' : 'primary.main',
                      opacity: isDateInPast(date) ? 0.85 : 1,
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 900,
                          color: isDateInPast(date) ? 'text.secondary' : 'primary.dark'
                        }}
                      >
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Typography 
                        variant="subtitle2"
                        sx={{ 
                          color: isDateInPast(date) ? 'text.secondary' : 'primary.dark',
                          fontWeight: 500
                        }}
                      >
                        {groupedData[date].length} {groupedData[date].length === 1 ? "SHOW" : "SHOWS"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>

                {groupedData[date]
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((item) => (
                    <TableRow
                      key={item.show_id}
                      onClick={() => handleRowClick(item.show_id)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                          boxShadow: 1
                        },
                        opacity: isDateInPast(item.start) ? 0.8 : 1
                      }}
                    >
                      <TableCell sx={{ width: '120px', p: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          {item.flyer_image ? (
                            <Box
                              component="img"
                              src={item.flyer_image}
                              alt="Flyer"
                              sx={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: 1,
                                boxShadow: 1,
                                filter: isDateInPast(item.start) ? 'grayscale(30%)' : 'none'
                              }}
                            />
                          ) : (
                            <Box 
                              sx={{ 
                                width: '100px',
                                height: '100px',
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary'
                              }}
                            >
                              No Flyer
                            </Box>
                          )}
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              display: { xs: 'block', sm: 'none' }
                            }}
                          >
                            {renderEditButton(item.show_id, "small")}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: isDateInPast(item.start) ? 'text.secondary' : 'primary.main',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            mb: 0.5
                          }}
                        >
                          {item.venue_name || 'Unknown Venue'}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            color: 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          {new Date(item.start).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </Typography>
                        {isDateInPast(item.start) && (
                          <Chip 
                            label="PAST SHOW" 
                            size="small" 
                            sx={{ 
                              mt: 0.5, 
                              bgcolor: 'grey.300', 
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.625rem',
                            }} 
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {item.bands.map((band, index) => (
                            <Box
                              key={`${item.show_id}-${band.name}-${index}`}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: band.id 
                                    ? (isDateInPast(item.start) ? 'text.secondary' : 'primary.main')
                                    : (isDateInPast(item.start) ? 'text.secondary' : 'text.primary'),
                                  cursor: band.slug ? 'pointer' : 'default',
                                  '&:hover': band.slug ? { textDecoration: 'underline' } : {},
                                }}
                                onClick={(e) => {
                                  if (band.slug) {
                                    e.stopPropagation();
                                    navigate(`/bands/${band.slug}`);
                                  }
                                }}
                              >
                                {band.name}
                              </Typography>
                              {band.id && (
                                <Chip
                                  label="TCUP BAND"
                                  size="small"
                                  sx={{
                                    bgcolor: isDateInPast(item.start) ? 'grey.400' : 'primary.main',
                                    color: isDateInPast(item.start) ? 'text.primary' : 'primary.contrastText',
                                    fontWeight: 600,
                                    fontSize: '0.625rem',
                                  }}
                                />
                              )}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell 
                        align="right" 
                        sx={{ 
                          pr: 3,
                          display: { xs: 'none', sm: 'table-cell' }
                        }}
                      >
                        {renderEditButton(item.show_id)}
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ShowsTableCore;