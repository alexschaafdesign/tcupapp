import React, { useEffect, useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { EventNote, AccessTime, LocationOn } from '@mui/icons-material';

const CalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}/tcupgcal`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiUrl]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Upcoming Events
      </Typography>
      
      {events.length === 0 ? (
        <Alert severity="info">No upcoming events found.</Alert>
      ) : (
        <Stack spacing={2}>
          {events.map((event) => (
            <Card key={event.id} sx={{ 
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h3" component="h2" gutterBottom>
                    {event.summary}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventNote color="primary" fontSize="small" />
                    <Typography variant="body1">
                      {formatDate(event.start.dateTime || event.start.date)}
                    </Typography>
                  </Stack>

                  {event.start.dateTime && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime color="primary" fontSize="small" />
                      <Typography variant="body1">
                        {formatTime(event.start.dateTime)}
                      </Typography>
                    </Stack>
                  )}

                  {event.location && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn color="primary" fontSize="small" />
                      <Typography variant="body1">{event.location}</Typography>
                    </Stack>
                  )}

                  {event.description && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </>
                  )}

                  {event.type && (
                    <Box mt={1}>
                      <Chip 
                        label={event.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default CalendarEvents;