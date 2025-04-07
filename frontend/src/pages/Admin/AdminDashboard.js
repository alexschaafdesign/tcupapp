import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PeopleIcon from '@mui/icons-material/People';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Now conditionally render based on isAdmin
  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6">Access Denied</Typography>
      </Box>
    );
  }



  // Example action handlers for other tiles
  const handleCreateUpdate = () => {
    navigate('/admin/updates/create');
  };

  const handleViewUsers = () => {
    navigate('/admin/users');
  };
  
  const handleGoToScrapers = () => {
    navigate('/admin/scrapers');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6px',
            height: '100%',
            background: 'linear-gradient(180deg, #9c27b0, #f50057)',
          },
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            position: 'relative',
            display: 'inline-block',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '60px',
              height: '3px',
              background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
            },
          }}
        >
          Admin Dashboard
        </Typography>

        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 4 }}>
          Welcome! Use the tools below to manage site content and data.
        </Typography>

        <Grid container spacing={3}>
          {/* CREATE UPDATE */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              onClick={() => window.open('https://tcupboard.org/admin/updates', '_blank')}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Create Update
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Post a new front-page update or announcement.
                </Typography>
              </Box>
                          </Paper>
          </Grid>

          {/* RUN SHOW SCRAPERS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              onClick={() => window.open('https://tcupboard.org/admin/scrapers', '_blank')}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Venue Scraper Admin
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Run scrapers, view logs, and manage scraping settings.
                </Typography>
              </Box>
             
            </Paper>
          </Grid>

          {/* VIEW USERS 
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  View Users
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Review and manage registered users & roles.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Tooltip title="View user list" placement="top">
                  <IconButton
                    onClick={handleViewUsers}
                    sx={{
                      bgcolor: 'action.hover',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <PeopleIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>*/}

          {/* LINK TO ORIGINAL CUPBOARD */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              onClick={() => window.open('https://tcupboard.org/originalcupboard', '_blank')}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Original Cupboard Forum
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  A static, read-only archive of the old Cupboard forum. Useful for searching or browsing past posts.
                </Typography>
              </Box>
              
            </Paper>
          </Grid>

        </Grid>

      </Paper>
    </Container>
  );
};

export default AdminDashboard;