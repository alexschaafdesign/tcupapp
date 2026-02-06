import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider
} from '@mui/material';
import BandSocialLinks from '../../components/bands/BandSocialLinks';
import parseSocialLinks from '../../utils/parseSocialLinks';

const SessionMusicianProfile = () => {
  const [musician, setMusician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMusician = async () => {
      try {
        const response = await fetch(`${apiUrl}/sessionmusicians/${id}`);
        if (!response.ok) throw new Error('Failed to fetch musician');
        const data = await response.json();
        setMusician(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMusician();
  }, [id, apiUrl]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!musician) return <Typography>Musician not found</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button 
        onClick={() => navigate('/sessionmusicians')}
        variant="contained"
        sx={{ mb: 3, bgcolor: '#8B2626', '&:hover': { bgcolor: '#6B1C1C' } }}
      >
        Back to Musicians
      </Button>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{musician.name}</Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Primary Instrument</Typography>
            <Typography>{musician.first_instrument}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Other Instruments</Typography>
            <Typography>
              {[musician.second_instrument, musician.third_instrument]
                .filter(Boolean)
                .join(', ') || 'None'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Styles/Genres</Typography>
            <Typography>{musician.primary_styles}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Location</Typography>
            <Typography>{musician.location}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Contact</Typography>
            <Typography>{musician.contact_info}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Website</Typography>
            <Typography>{musician.website_samples}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Social Links</Typography>
            <BandSocialLinks 
              links={parseSocialLinks(musician.website_samples)}
              contactInfo={musician.contact_info}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SessionMusicianProfile;