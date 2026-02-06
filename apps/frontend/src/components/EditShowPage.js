import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import ShowForm from '../pages/Shows/ShowForm';

const EditShowPage = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch show data');
        }
        const data = await response.json();
        
        // Handle bands data whether it comes as array or string
        const bandsArray = typeof data.bands === 'string'
        ? data.bands.split(/\s*,\s*/).map(band => ({ name: band })) // Removed trim()
        : Array.isArray(data.bands)
        ? data.bands.map(band => typeof band === 'string' ? { name: band } : band)
        : [];

        // Format the show data for the form
        const formattedShow = {
          ...data,
          bands: bandsArray,
          start: data.start ? new Date(data.start).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T') : ''
        };

        setShow(formattedShow);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching show:', err);
        setError('Failed to load show data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchShow();
  }, [id, apiUrl]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!show) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Show not found</Alert>
      </Box>
    );
  }

  return <ShowForm isEdit={true} initialData={show} />;
};

export default EditShowPage;