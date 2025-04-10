import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  TablePagination,
} from '@mui/material';
import dayjs from 'dayjs';
import ShowsTableCoreMinimal from './ShowsTableCoreMinimal';
import DynamicFilterComponent from '../../components/DynamicFilterComponent';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import DateRangeFilter from '../Shows/Components/DateRangeFilter';

function ShowsTableMinimal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state from URL parameters
  const [showsData, setShowsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedVenue, setSelectedVenue] = useState(searchParams.get('venue') || '');
  const [showTCUPBandsOnly, setShowTCUPBandsOnly] = useState(searchParams.get('tcupOnly') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 0);
  const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('rowsPerPage')) || 20);
  const [dateRange, setDateRange] = useState([
    searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : null,
    searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : null
  ]);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedVenue) params.set('venue', selectedVenue);
    if (showTCUPBandsOnly) params.set('tcupOnly', 'true');
    if (page > 0) params.set('page', page.toString());
    if (rowsPerPage !== 20) params.set('rowsPerPage', rowsPerPage.toString());
    if (dateRange[0]) params.set('startDate', dateRange[0].toISOString());
    if (dateRange[1]) params.set('endDate', dateRange[1].toISOString());
    
    setSearchParams(params);
  }, [searchTerm, selectedVenue, showTCUPBandsOnly, page, rowsPerPage, dateRange]);

  // Fetch shows data
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows`);
        if (!response.ok) throw new Error('Failed to fetch shows');
        const result = await response.json();
        setShowsData(result);
      } catch (err) {
        console.error('Error fetching shows:', err);
        setShowsData([]);
      }
    };

    fetchShows();
  }, []);

  const handleDateChange = (update) => {
    setDateRange(update);
    setPage(0);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedVenue, showTCUPBandsOnly]);

  // Filter logic remains the same
  const filterEvents = () => {
    const today = dayjs().startOf('day');
  
    return showsData.filter((item) => {
      const eventDate = dayjs(item.start);
      const start = dateRange[0] ? dayjs(dateRange[0]).startOf('day') : null;
      const end = dateRange[1] ? dayjs(dateRange[1]).endOf('day') : null;

      const matchesSearch = searchTerm
        ? item.venue_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.bands?.some(band => band.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
  
      const matchesVenue = selectedVenue
        ? item.venue_name?.toLowerCase() === selectedVenue.toLowerCase()
        : true;
  
      const matchesTCUP = showTCUPBandsOnly
        ? item.bands?.some(band => band.id)
        : true;

      const matchesDateRange = (!start || eventDate.isAfter(start) || eventDate.isSame(start, 'day')) && 
                             (!end || eventDate.isBefore(end) || eventDate.isSame(end, 'day'));
  
      const isUpcomingEvent = eventDate.isAfter(today) || eventDate.isSame(today, 'day');
  
      return matchesSearch && matchesVenue && matchesTCUP && isUpcomingEvent && matchesDateRange;
    });
  };

  const filteredData = filterEvents();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filters = [
    {
      type: 'text',
      label: 'Search by venue or band name',
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value.toLowerCase()),
    },
    {
      type: 'dropdown',
      placeholder: 'Select Venue',
      value: selectedVenue,
      onChange: (e) => setSelectedVenue(e.target.value),
      options: [...new Set(showsData.map(item => item.venue_name?.trim()).filter(Boolean))]
        .sort()
        .map(venue => ({
          label: venue.charAt(0).toUpperCase() + venue.slice(1),
          value: venue,
        })),
    },
    {
      type: 'dateRange',
      value: dateRange,
      onChange: handleDateChange,
    },
    {
      type: 'checkbox',
      label: 'Show TCUP bands only',
      value: showTCUPBandsOnly,
      onChange: (e) => setShowTCUPBandsOnly(e.target.checked),
    }
  ];

  return (
    <Box sx={{ paddingBottom: '150px', paddingTop: 1, overflowY: 'auto' }}>
      <DynamicFilterComponent 
        filters={filters}
        navigate={navigate} />
       
       <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 2 
        }}>
          <Box>
            <Typography variant="h3">
              <b>{filteredData.length} SHOWS</b>
            </Typography>
            <Typography variant="body1">
              At {filters[1].options.length} Venues
            </Typography>
          </Box>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </Box>

      <ShowsTableCoreMinimal
        data={filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
        onShowClick={(showId) => {
          // Get current search params
          const currentParams = searchParams.toString();
          // Navigate to show with return filters
          navigate(`/shows/${showId}/edit?returnFilters=${encodeURIComponent(currentParams)}/minimal`);
        }}
      />

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Box>
  );
}

export default ShowsTableMinimal;