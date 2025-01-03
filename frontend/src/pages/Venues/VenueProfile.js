  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import {
    Typography,
    Box,
  } from '@mui/material';
import ShowsTableCore from '../Shows/ShowsTableCore';

  const VenueProfile = () => {
    const { id } = useParams(); // Get the venue ID from the URL
    const [venue, setVenue] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

    useEffect(() => {
      console.log("Venue ID:", id); // Check if ID is correct
      const fetchVenue = async () => {
        try {
          // Check if apiUrl is set correctly
          console.log(`Fetching venue from ${apiUrl}/venues/${id}`);
          const venueResponse = await fetch(`${apiUrl}/venues/${id}`);
          
          if (!venueResponse.ok) {
            throw new Error("Venue Not Found");
          }
          
          const venueData = await venueResponse.json();
          console.log("Fetched venue data:", venueData);
          setVenue(venueData.data);
        } catch (error) {
          console.error("Error fetching venue:", error);
          setError(error.message || "An error occurred while fetching the venue.");
        } finally {
          setLoading(false);
        }
      };
    
      const fetchShows = async () => {
        try {
          // Check if apiUrl is correct
          console.log(`Fetching shows from ${apiUrl}/shows?venue=${id}`);
          const showsResponse = await fetch(`${apiUrl}/shows?venue=${id}`);
          
          if (!showsResponse.ok) {
            throw new Error("Failed to fetch shows");
          }
          
          const showsData = await showsResponse.json();
          console.log("Fetched shows data:", showsData);
      
          // Filter shows data by venue id
          const filteredShows = showsData.filter(show => show.venue_id === parseInt(id));  // Ensure venue_id matches the venue id type
          setShows(filteredShows);
        } catch (error) {
          console.error("Error fetching shows:", error);
          setError(error.message || "An error occurred while fetching the shows.");
        }
      };
    
      // Only run the API calls if the apiUrl and id are valid
      if (id && apiUrl) {
        fetchVenue();
        fetchShows();
      } else {
        console.error("Invalid id or apiUrl.");
        setError("Invalid id or apiUrl.");
        setLoading(false);
      }
    }, [id, apiUrl]);

    const handleBandClick = (bandId) => {
      console.log('Band ID clicked:', bandId); // Check if bandId is correct
      if (!bandId) {
        console.error('Invalid band ID:', bandId);
        return;
      }
      navigate(`/bands/${encodeURIComponent(bandId)}/view`);
    };

    const handleVenueClick = () => {
      console.log('Venue clicked'); // You can add specific logic for venue click if needed
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
      <Box sx={{ padding: 3 }}>
        {/* Venue Title */}
        <Typography variant="h4" gutterBottom>
        {venue && venue.venue} {/* This ensures the 'venue' is available */}
        </Typography>

        {/* Display the venue cover image */}
        {venue.cover_image && (
          <Box sx={{ mb: 3 }}>
            <img
              src={venue.cover_image} // Use the full Cloudinary URL directly
              alt={`${venue.venue} cover`}
              style={{
                width: '50%', // Responsive to container width
                height: 'auto', // Maintains aspect ratio
                objectFit: 'contain', // Avoids distortion
              }}
            />
          </Box>
        )}

        {/* Display other venue details */}
        <Typography variant="body1" gutterBottom>
          <strong>Location:</strong> {venue.location}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Capacity:</strong> {venue.capacity}
        </Typography>

        {/* Display shows associated with the venue */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Upcoming Shows
          </Typography>
          <ShowsTableCore
            data={shows} // Pass the filtered shows data
            onBandClick={handleBandClick} // Reuse the band click handler
            onVenueClick={handleVenueClick} // Optional venue click handler
          />
        </Box>
      </Box>
    );
  };

  export default VenueProfile;