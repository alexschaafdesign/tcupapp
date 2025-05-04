import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    TablePagination,
    ToggleButtonGroup,
    ToggleButton,
    Alert, // Import Alert
    AlertTitle // Optional: Import AlertTitle for better structure
} from '@mui/material';
import dayjs from 'dayjs';
import ShowsTableCore from './ShowsTableCore';
import DynamicFilterComponent from './Components/DynamicFilterComponent';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
// Remove DateRangeFilter import if not used directly here
// import DateRangeFilter from './Components/DateRangeFilter';


function ShowsTable() {
    console.log("✅ ShowsTable is being rendered");

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // --- State Initialization (remains the same) ---
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
    const [timeFilter, setTimeFilter] = useState(searchParams.get('timeFilter') || 'upcoming');

    const apiUrl = process.env.REACT_APP_API_URL;
    // Determine if the message should show based on the environment variable
    const isShowsListEnabled = process.env.REACT_APP_ENABLE_SHOWS_LIST === 'true';


    // --- useEffect Hooks (remain the same) ---
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
        if (timeFilter !== 'upcoming') params.set('timeFilter', timeFilter);
        setSearchParams(params);
    }, [searchTerm, selectedVenue, showTCUPBandsOnly, page, rowsPerPage, dateRange, timeFilter, setSearchParams]);

    // Fetch shows data
    useEffect(() => {
        const fetchShows = async () => {
            try {
                console.log('About to fetch shows');
                const response = await fetch(`${apiUrl}/shows`, {
                    headers: { 'Accept': 'application/json' }
                });
                console.log('Shows API response:', response.status);
                if (!response.ok) throw new Error('Failed to fetch shows');
                const result = await response.json();
                setShowsData(result);
            } catch (err) {
                console.error('Error fetching shows:', err);
                setShowsData([]);
            }
        };
        fetchShows();
    }, [apiUrl]);

    // Reset page when certain filters change
    useEffect(() => {
        setPage(0);
    }, [searchTerm, selectedVenue, showTCUPBandsOnly, timeFilter, dateRange]); // Added timeFilter and dateRange


    // --- Handler Functions (remain the same) ---
     const handleDateChange = (update) => {
        setDateRange(update);
        // setPage(0); // Page reset is now handled in the useEffect above
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

     const handleTimeFilterChange = (event, newValue) => {
        if (newValue !== null) {
            setTimeFilter(newValue);
            // URL update is handled by the useEffect hook
            // Page reset is handled by the useEffect hook
        }
    };


    // --- Filtering Logic (remains the same) ---
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
                ? item.bands?.some(band => band.id) // Assuming band.id indicates a TCUP band
                : true;

            const matchesDateRange = (!start || eventDate.isAfter(start) || eventDate.isSame(start, 'day')) &&
                (!end || eventDate.isBefore(end) || eventDate.isSame(end, 'day'));

            let isTimeFilterMatch;
            if (timeFilter === 'upcoming') {
                isTimeFilterMatch = !eventDate.isBefore(today); // Includes today
            } else if (timeFilter === 'past') {
                isTimeFilterMatch = eventDate.isBefore(today);
            } else { // 'all'
                isTimeFilterMatch = true;
            }

            return matchesSearch && matchesVenue && matchesTCUP && isTimeFilterMatch && matchesDateRange;
        });
    };

    const filteredData = filterEvents();

    // --- Filter Definitions (remain the same) ---
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
                    label: venue.charAt(0).toUpperCase() + venue.slice(1), // Capitalize first letter
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
        // Main container Box
        <Box sx={{ paddingBottom: '150px', /* overflowY: 'auto' - might not be needed here */ }}>

            {/* ===== MOVED AND STYLED ALERT MESSAGE ===== */}
            {!isShowsListEnabled && (
                <Alert
                    severity="warning" // Changed from "info" to "warning"
                    variant="filled"    // Added variant="filled"
                    // elevation={2}    // Optional: Uncomment to add a slight shadow
                    sx={{ mb: 3 }}      // Keep margin for spacing
                >
                    <AlertTitle>Heads Up!</AlertTitle>
                    Upgraded SHOW LIST coming soon... We're makin this shit better!
                </Alert>
            )}
            {/* ========================================= */}


            {/* --- Time Period Toggle --- */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Show Time Period</Typography>
                <ToggleButtonGroup
                    value={timeFilter}
                    exclusive
                    onChange={handleTimeFilterChange}
                    aria-label="time filter"
                    size="small"
                    sx={{ mb: 2 }} // Added margin bottom here
                >
                    <ToggleButton value="upcoming" aria-label="upcoming shows">
                        Upcoming Shows
                    </ToggleButton>
                    <ToggleButton value="past" aria-label="past shows">
                        Past Shows
                    </ToggleButton>
                    <ToggleButton value="all" aria-label="all shows">
                        All Shows
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* --- REMOVED the duplicate/unconditional message block --- */}


            {/* --- Dynamic Filters --- */}
            <DynamicFilterComponent
                filters={filters}
                navigate={navigate} />


            {/* --- Show Count and Top Pagination --- */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2
            }}>
                <Box>
                    <Typography variant="h3" component="h2"> {/* Use h2 for semantics */}
                        <b>{filteredData.length} SHOWS</b>
                    </Typography>
                    <Typography variant="body1">
                        {/* Check if options exist before accessing length */}
                        At {filters[1].options ? filters[1].options.length : 0} Venues
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
                     // Add accessibility labels if possible
                    // labelRowsPerPage="Shows per page:"
                />
            </Box>

            {/* --- Shows Table Core --- */}
            <ShowsTableCore
                data={filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
                onShowClick={(showId) => {
                    const currentParams = searchParams.toString();
                    navigate(`/shows/${showId}/edit?returnFilters=${encodeURIComponent(currentParams)}`);
                }}
            />

            {/* --- Bottom Pagination --- */}
            <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50]}
                 // Add accessibility labels if possible
                // labelRowsPerPage="Shows per page:"
            />

             {/* The conditional alert message is now at the top, so the second instance is removed */}

        </Box> // End of Main container Box
    );
}

export default ShowsTable;