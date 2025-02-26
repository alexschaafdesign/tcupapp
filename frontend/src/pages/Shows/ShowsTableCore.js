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
  const { user, userRoles, isAdmin, isModerator } = useAuth(); // Import useAuth
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Current user:', user);
  console.log('User roles:', userRoles);
  console.log('Is admin?', isAdmin);
  console.log('Is moderator?', isModerator);

  const filteredData = data.filter((item) => {
    if (!item.start) return false;
    const eventDate = new Date(item.start).setHours(0, 0, 0, 0);
    return eventDate >= today.getTime();
  });

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

  const groupedData = groupByDate(filteredData);
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  const handleEdit = (e, showId) => {
    e.stopPropagation(); // This prevents navigating to show profile
    navigate(`/shows/${showId}/edit`);
  };

  const handleRowClick = (showId) => {
    navigate(`/shows/${showId}`);
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
                No upcoming events found.
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
                      backgroundColor: 'grey.100',
                      borderBottom: '2px solid',
                      borderColor: 'grey.300'
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
                          color: 'text.primary'
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
                          color: 'text.secondary',
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
                        }
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
                                boxShadow: 1
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
                            <AuthWrapper
                              requiredRoles={['admin', 'moderator']}
                              renderContent={({ showAuth, openAuthModal }) => (
                                <Tooltip title="Edit Show">
                                  <IconButton 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (showAuth) {
                                        handleEdit(e, item.show_id);
                                      } else {
                                        openAuthModal();
                                      }
                                    }}
                                    sx={{
                                      color: 'action.active',
                                      bgcolor: 'background.paper',
                                      boxShadow: 1,
                                      '&:hover': {
                                        color: 'primary.main',
                                        bgcolor: 'background.paper'
                                      }
                                    }}
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            />
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'primary.main',
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
                                  color: band.id ? 'primary.main' : 'text.primary',
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
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
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
                        <AuthWrapper
                          requiredRoles={['admin', 'moderator']}
                          renderContent={({ showAuth, openAuthModal }) => (
                            <Tooltip title="Edit Show">
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (showAuth) {
                                    handleEdit(e, item.show_id);
                                  } else {
                                    openAuthModal();
                                  }
                                }}
                                // styling unchanged
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        />
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