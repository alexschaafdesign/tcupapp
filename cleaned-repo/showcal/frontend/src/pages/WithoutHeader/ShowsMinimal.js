import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Checkbox, 
  Button,
  FormControlLabel, 
  Box, 
  TablePagination,
  Stack
} from '@mui/material';
import dayjs from 'dayjs';
import ShowsTableCoreMinimal from './ShowsTableCoreMinimal';
import DateRangeFilter from '../../components/DateRangeFilter';
import DynamicFilterComponentMinimal from './DynamicFilterComponentMinimal';
import { useNavigate } from 'react-router-dom';
import XenForoHeader from '../../components/XenforoHeader';

function ShowsTableMinimal() {
  const [showsData, setShowsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [showTCUPBandsOnly, setShowTCUPBandsOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;
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

  useEffect(() => {
    // This code runs when the component mounts
    const handleResize = () => {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ iframeHeight: height }, '*');
    };

    // Trigger the resize when the component is first rendered
    handleResize();

    // Optionally, if the content in the table dynamically changes, listen for updates
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []); // Empty dependency array ensures this only runs once

  

  const [startDate, endDate] = dateRange;

  // Add this handler
  const handleDateChange = (update) => {
    setDateRange(update);
  };


  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedVenue, showTCUPBandsOnly]);

  const filterEvents = () => {
    const today = dayjs().startOf('day');
  
    return showsData.filter((item) => {
      const eventDate = dayjs(item.start);
      const start = startDate ? dayjs(startDate).startOf('day') : null;
      const end = endDate ? dayjs(endDate).endOf('day') : null;

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

  const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleShowClick = (showId) => {
    if (showId) {
      navigate(`/shows/${showId}/minimal`);
    } else {
      console.error("No show ID found");
    }
  };

//Add a new show
  const handleAddShow = () => {
    navigate(`/shows/add/minimal`);
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
  //  {
  //    type: 'checkbox',
  //   label: 'Show TCUP bands only',
  //    value: showTCUPBandsOnly,
  //     onChange: (e) => setShowTCUPBandsOnly(e.target.checked),
  //  }
  ];

  return (
    <Box sx={{ paddingBottom: '150px', paddingTop: 1, overflowY: 'auto' }}>

      <XenForoHeader />

      <p>The <b>SHOW LIST</b> is a new offering from TCUP -- a largely automated list of EVERY SHOW on EVERY DAY in the twin cities.</p>
<p> It's still a work-in-progress, with more venues/shows to be added; so if you don't see yours listed, feel free to add it!</p>
      <DynamicFilterComponentMinimal 
        filters={filters}
        navigate={navigate} />

            {/* Total Show Count */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        <Typography variant="h3"> <b>{filteredData.length} SHOWS</b></Typography>
        <Typography variant="body1">
          At {filters[1].options.length} Venues
        </Typography>
      </Typography>
       

      <ShowsTableCoreMinimal
        data={filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
        onShowClick={(showId) => navigate(`/shows/${showId}/minimal`)}
      />

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(event, newPage) => {
          setPage(newPage);
          window.scrollTo(0, 0);
        }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Box>
  );
}

export default ShowsTableMinimal; 