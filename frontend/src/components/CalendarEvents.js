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
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  EventNote, 
  AccessTime, 
  LocationOn, 
  ViewList, 
  CalendarMonth 
} from '@mui/icons-material';

const EventList = ({ events }) => (
  <Stack spacing={2}>
    {events.length === 0 ? (
      <Alert severity="info">No upcoming events found.</Alert>
    ) : (
      events.map((event) => (
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
      ))
    )}
  </Stack>
);

const EventCalendar = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.start.dateTime || event.start.date);
    const dateKey = date.toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const days = [];
  
  const firstDayOfWeek = firstDay.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 1,
      bgcolor: 'background.paper',
      p: 2,
      borderRadius: 1,
      border: 1,
      borderColor: 'divider'
    }}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 'bold' }}>
          {day}
        </Box>
      ))}
      {days.map((day, i) => (
        <Box 
          key={i}
          sx={{
            p: 1,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            minHeight: 100,
            bgcolor: day ? 'background.paper' : 'background.default',
            '&:hover': day ? {
              bgcolor: 'action.hover',
            } : {}
          }}
        >
          {day && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {day.getDate()}
              </Typography>
              <Stack spacing={0.5}>
                {eventsByDate[day.toISOString().split('T')[0]]?.map(event => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 0.5,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                    title={event.summary}
                  >
                    {event.summary}
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
};

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

const CalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Upcoming Events
        </Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
          aria-label="view mode"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="calendar" aria-label="calendar view">
            <CalendarMonth />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'list' ? (
        <EventList events={events} />
      ) : (
        <EventCalendar events={events} />
      )}
    </Container>
  );
};

export default CalendarEvents;