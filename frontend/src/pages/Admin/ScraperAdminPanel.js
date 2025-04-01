import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
  Tooltip,
  Container
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as RunIcon,
  History as HistoryIcon,
  ErrorOutline as WarningIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import palette from '../../styles/colors/palette';
import colors from '../../styles/colors/colors';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scraper-tabpanel-${index}`}
      aria-labelledby={`scraper-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ScraperAdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [scrapers, setScrapers] = useState([]);
  const [history, setHistory] = useState({ logs: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetailsOpen, setLogDetailsOpen] = useState(false);
  const [logDetails, setLogDetails] = useState({ log: {}, shows: [] });
  const [logDetailsLoading, setLogDetailsLoading] = useState(false);
  
  // Live logging state
  const [liveLogMessages, setLiveLogMessages] = useState([]);
  const [streamActive, setStreamActive] = useState(false);
  const [streamResults, setStreamResults] = useState([]);
  const [currentScraper, setCurrentScraper] = useState(null);
  
  // Scraper status tracking
  const [scraperStats, setScraperStats] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Use the auth hook to get admin status
  const { isAdmin } = useAuth();
  
  // Get access to Auth0 functions to retrieve the token
  const { getAccessTokenSilently } = useAuth0();
  // Get the API URL from environment variables
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch available scrapers and recent history on load
  // Function to update scraper statistics
  const updateScraperStats = async () => {
    try {
      const token = await getAccessTokenSilently();
      
      // Get a history with a larger limit to analyze patterns
      const historyResponse = await fetch(
        `${apiUrl}/scrapers/scraper-history?page=1&limit=100`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!historyResponse.ok) {
        throw new Error('Failed to fetch scraper history for stats');
      }
      
      const historyData = await historyResponse.json();
      
      // Fetch all available venue scrapers if we don't have them
      if (!Array.isArray(scrapers) || scrapers.length === 0) {
        const scrapersResponse = await fetch(`${apiUrl}/scrapers/available-scrapers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!scrapersResponse.ok) {
          throw new Error('Failed to fetch available scrapers');
        }
        
        const scrapersData = await scrapersResponse.json();
        setScrapers(scrapersData.scrapers);
      }
      
      // Make sure all available scrapers are included, even if never run
      const availableScrapers = Array.isArray(scrapers) && scrapers.length > 0 
        ? scrapers 
        : [];

      // Process scrapers with their history
      if (availableScrapers.length > 0) {
        const stats = availableScrapers.map(scraper => {
          // Find logs for this scraper
          const scraperLogs = historyData.logs.filter(log => 
            log.scraper_name === scraper.id
          );
          
          // Get the most recent log
          const lastRun = scraperLogs.length > 0 ? scraperLogs[0] : null;
          
          // Calculate total shows added
          const totalAdded = scraperLogs.reduce((sum, log) => sum + (log.added_count || 0), 0);
          
          // Check if there are errors in the last run
          let hasError = false;
          let lastError = '';
          
          if (lastRun && lastRun.errors) {
            try {
              const errors = typeof lastRun.errors === 'string' 
                ? JSON.parse(lastRun.errors) 
                : lastRun.errors;
              
              hasError = Array.isArray(errors) && errors.length > 0;
              lastError = hasError ? errors[0] : '';
            } catch (e) {
              console.error('Error parsing errors:', e);
            }
          }
          
          // Calculate days since last run
          const daysSinceLastRun = lastRun 
            ? Math.round((new Date() - new Date(lastRun.run_at)) / (1000 * 60 * 60 * 24)) 
            : null;
          
          // Determine status
          let status = 'unknown';
          if (!lastRun) {
            status = 'never_run';
          } else if (hasError) {
            status = 'error';
          } else if (daysSinceLastRun > 7) {
            status = 'warning';
          } else {
            status = 'success';
          }
          
          return {
            id: scraper.id,
            name: scraper.name,
            lastRun: lastRun ? lastRun.run_at : null,
            status,
            lastAdded: lastRun ? lastRun.added_count : 0,
            totalAdded,
            daysSinceLastRun,
            hasError,
            lastError,
            runCount: scraperLogs.length
          };
        });
        
        // Sort the stats by status (error, warning, never_run, success) then by name
        stats.sort((a, b) => {
          const statusPriority = {
            'error': 0,
            'warning': 1,
            'never_run': 2,
            'success': 3
          };
          
          if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
          }
          
          return a.name.localeCompare(b.name);
        });
        
        setScraperStats(stats);
      }
    } catch (err) {
      console.error('Error updating scraper stats:', err);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        
        // Fetch available scrapers
        const scrapersResponse = await fetch(`${apiUrl}/scrapers/available-scrapers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!scrapersResponse.ok) {
          throw new Error('Failed to fetch scrapers');
        }
        
        const scrapersData = await scrapersResponse.json();
        setScrapers(scrapersData.scrapers);
        console.log("Loaded scrapers:", scrapersData.scrapers);
        
        // Also fetch recent history for the dashboard
        await fetchScraperHistory(1, 10);
        
        // Update scraper statistics
        await updateScraperStats();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [getAccessTokenSilently, apiUrl]);
  
  // Make sure appropriate data is loaded when tab changes
  useEffect(() => {
    if (tabValue === 1) {
      // Update scraper statistics
      updateScraperStats();
    } else if (tabValue === 2) {
      // Load history data
      fetchScraperHistory(historyPage, historyLimit);
    }
  }, [tabValue, historyPage, historyLimit]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Fetch scraper history
  const fetchScraperHistory = async (page = historyPage, limit = historyLimit) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${apiUrl}/scrapers/scraper-history?page=${page}&limit=${limit}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch scraper history');
      }
      const data = await response.json();
      setHistory(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scraper history:', err);
      setError('Failed to load scraper history');
      setLoading(false);
    }
  };
  
  // View log details
  const viewLogDetails = async (logId) => {
    try {
      setLogDetailsLoading(true);
      setLogDetailsOpen(true);
      
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/scrapers/scraper-logs/${logId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch log details');
      }
      
      const data = await response.json();
      setLogDetails(data);
      setLogDetailsLoading(false);
    } catch (err) {
      console.error('Error fetching log details:', err);
      setError('Failed to load log details');
      setLogDetailsLoading(false);
    }
  };
  
  // Run a scraper with streaming updates
  const runScraper = async (scraper = null) => {
    setLoading(true);
    setError('');
    setLogs([]);
    setLiveLogMessages([]);
    setStreamResults([]);
    setStreamActive(true);
    setCurrentScraper(scraper);
    
    try {
      // Retrieve a valid access token from Auth0
      const token = await getAccessTokenSilently();
      
      // Make a regular POST request instead of EventSource
      // since we've had issues with the real-time streaming
      const response = await fetch(`${apiUrl}/scrapers/run-scrapers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scraper })
      });
      
      if (!response.ok) {
        throw new Error('Error running scrapers');
      }
      
      // Simulate progress updates while waiting
      const timer = setInterval(() => {
        setLiveLogMessages(prev => [
          ...prev, 
          { 
            type: 'status', 
            message: `Processing ${scraper || 'all scrapers'}...`, 
            timestamp: new Date().toISOString()
          }
        ]);
      }, 2000);
      
      // Fetch data on a regular basis to show progress
      const checkInterval = setInterval(async () => {
        try {
          const historyResponse = await fetch(
            `${apiUrl}/scrapers/scraper-history?page=1&limit=5`, 
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          const data = await historyResponse.json();
          setHistory(data);
        } catch (err) {
          console.error('Error checking progress:', err);
        }
      }, 5000);
      
      // Get the data when done
      const data = await response.json();
      
      // Clear intervals
      clearInterval(timer);
      clearInterval(checkInterval);
      
      // Update logs
      setLogs(data.logs);
      setLiveLogMessages(prev => [
        ...prev, 
        { 
          type: 'complete', 
          message: 'All scrapers completed successfully!', 
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Refresh the history after completion
      fetchScraperHistory(1, 10);
      setStreamActive(false);
      setLoading(false);
      setCurrentScraper(null);
      
      // Switch to the first tab to show results
      setTabValue(0);
    } catch (err) {
      setError(err.message);
      setStreamActive(false);
      setLoading(false);
      setCurrentScraper(null);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  // Get scraper name from ID
  const getScraperName = (scraperId) => {
    if (!scraperId) return 'All Default Scrapers';
    const scraper = scrapers.find(s => s.id === scraperId);
    return scraper ? scraper.name : scraperId;
  };
  
  // Check for admin status
  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
            You do not have permission to access this page.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" 
          sx={{
            fontWeight: 'bold',
            mb: 3,
            background: `linear-gradient(45deg, ${palette.primary.main} 30%, ${palette.primary.light} 90%)`,
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
              background: `linear-gradient(45deg, ${palette.primary.main} 30%, ${palette.primary.light} 90%)`,
            },
          }}
        >
          Venue Scraper Admin
        </Typography>
        
        <Box sx={{ width: '100%' }}>
          {/* Tabs for different sections */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Get the latest show data from venue websites
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Choose a specific venue scraper or run all default scrapers at once. Results will be logged in the history section below.
            </Typography>
          </Box>
          
          <Box sx={{ mt: 1, position: 'relative', zIndex: 1 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                position: 'relative',
                borderBottom: `1px solid ${palette.neutral.gray}`,
                backgroundColor: 'transparent'
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="scraper admin tabs"
                sx={{ 
                  minHeight: '48px',
                  '& .MuiTab-root': { 
                    color: palette.text.secondary,
                    fontWeight: 500,
                    backgroundColor: palette.neutral.light,
                    marginRight: '2px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    minHeight: '48px',
                    marginBottom: '-1px'
                  },
                  '& .Mui-selected': { 
                    color: palette.primary.dark,
                    backgroundColor: palette.neutral.white,
                    border: `1px solid ${palette.neutral.gray}`,
                    borderBottom: `1px solid ${palette.neutral.white}`,
                    fontWeight: 700,
                    '& .MuiSvgIcon-root': {
                      color: palette.primary.main
                    }
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none' // Hide default indicator as we're using custom styling
                  }
                }}
              >
                <Tab 
                  icon={<RunIcon />} 
                  iconPosition="start" 
                  label="Run Scrapers" 
                  id="scraper-tab-0"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: tabValue === 0 ? palette.primary.main : palette.text.secondary
                    }
                  }}
                />
                <Tab 
                  icon={<DashboardIcon />} 
                  iconPosition="start" 
                  label="Scraper Status" 
                  id="scraper-tab-1"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: tabValue === 1 ? palette.primary.main : palette.text.secondary
                    }
                  }}
                />
                <Tab 
                  icon={<HistoryIcon />} 
                  iconPosition="start" 
                  label="Complete History" 
                  id="scraper-tab-2"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      color: tabValue === 2 ? palette.primary.main : palette.text.secondary
                    }
                  }}
                />
              </Tabs>
            </Paper>
          </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {/* Run Scrapers Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Run Venue Scrapers
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => runScraper()}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
              sx={{ minWidth: 240 }}
            >
              {loading ? 'Running Default Scrapers...' : 'Run All Default Scrapers'}
            </Button>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              flex: 1,
              border: '1px dashed rgba(0, 0, 0, 0.12)', 
              borderRadius: 1,
              p: 2
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Individual Venue Scrapers:</Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.isArray(scrapers) && scrapers.length > 0 ? (
                  scrapers.map((scraper) => (
                    <Button
                      key={scraper.id}
                      variant={currentScraper === scraper.id ? "contained" : "outlined"}
                      color={currentScraper === scraper.id ? "primary" : "default"}
                      size="small"
                      onClick={() => runScraper(scraper.id)}
                      disabled={loading}
                      sx={{ mb: 0.5 }}
                    >
                      {currentScraper === scraper.id ? `Running: ${scraper.name}...` : scraper.name}
                    </Button>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Loading scrapers...
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Live Logs section */}
        {streamActive && (
          <Box sx={{ mt: 4, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Live Scraper Logs
              {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
            </Typography>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
              Currently Running: {getScraperName(currentScraper)}
            </Typography>
            
            <Box 
              sx={{ 
                height: '300px', 
                overflowY: 'auto', 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {liveLogMessages.map((msg, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 1,
                    color: msg.type === 'error' ? 'error.main' : 
                          msg.type === 'status' ? 'info.main' : 
                          msg.type === 'complete' ? 'success.main' : 
                          'text.primary'
                  }}
                >
                  [{new Date(msg.timestamp).toLocaleTimeString()}] 
                  {msg.scraper && <strong> [{msg.scraper}]</strong>} {msg.message}
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
                  <CircularProgress size={14} sx={{ mr: 1 }} />
                  Processing... please wait
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {/* Results section */}
        {logs.length > 0 && (
          <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Latest Run Results</Typography>
            
            <Grid container spacing={3}>
              {logs.map((log, idx) => (
                <Grid item xs={12} md={6} lg={4} key={idx}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderColor: log.errors && log.errors.length > 0 ? 'error.light' : 'success.light',
                      borderWidth: 1
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">
                          {getScraperName(log.scraper_name)}
                        </Typography>
                        {log.errors && log.errors.length > 0 ? (
                          <ErrorIcon color="error" />
                        ) : (
                          <CheckCircleIcon color="success" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Run at: {new Date(log.run_at || new Date()).toLocaleString()}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Added: <strong>{log.added_count}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Duplicates: <strong>{log.duplicate_count}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Skipped: <strong>{log.skipped_count || 0}</strong>
                        </Typography>
                      </Box>
                      
                      {log.added_shows && log.added_shows.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Added Show IDs:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {log.added_shows.map((id) => (
                              <Chip 
                                key={id} 
                                label={id} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {log.errors && log.errors.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="error">
                            Errors:
                          </Typography>
                          <Box sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                            {log.errors.map((err, i) => (
                              <Typography key={i} variant="caption" display="block" color="error">
                                • {err}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {log.log_id && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            variant="text"
                            onClick={() => viewLogDetails(log.log_id)}
                            startIcon={<InfoIcon />}
                          >
                            Details
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Recent History Section */}
        <Box sx={{ mt: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Scraper History
            </Typography>
            
            <Button 
              variant="outlined"
              size="small"
              onClick={() => {
                setTabValue(2);
                fetchScraperHistory(1, historyLimit);
              }}
            >
              View All History
            </Button>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Scraper</TableCell>
                  <TableCell>Run At</TableCell>
                  <TableCell align="center">Added</TableCell>
                  <TableCell align="center">Duplicates</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : history.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No scraper history found
                    </TableCell>
                  </TableRow>
                ) : (
                  history.logs.slice(0, 5).map((log) => {
                    // Parse the errors array from JSON string if needed
                    let errors = [];
                    try {
                      if (log.errors) {
                        errors = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors;
                        // If parsed result is not an array, handle it
                        if (!Array.isArray(errors)) {
                          errors = errors ? [String(errors)] : [];
                        }
                      }
                    } catch (e) {
                      console.error('Error parsing errors:', e);
                      errors = [];
                    }
                    
                    const hasErrors = errors && errors.length > 0;
                    
                    return (
                      <TableRow key={log.id} hover>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{getScraperName(log.scraper_name)}</TableCell>
                        <TableCell>{formatDate(log.run_at)}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={log.added_count} 
                            size="small" 
                            color={log.added_count > 0 ? 'success' : 'default'}
                            variant={log.added_count > 0 ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">{log.duplicate_count}</TableCell>
                        <TableCell align="center">
                          {hasErrors ? (
                            <Tooltip title={`${errors.length} errors`}>
                              <ErrorIcon color="error" fontSize="small" />
                            </Tooltip>
                          ) : (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            onClick={() => viewLogDetails(log.id)}
                            color="primary"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>
      
      {/* Scraper Status Dashboard Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Scraper Status Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Scrapers</MenuItem>
                <MenuItem value="success">Healthy</MenuItem>
                <MenuItem value="warning">Needs Update</MenuItem>
                <MenuItem value="error">Errors</MenuItem>
                <MenuItem value="never_run">Never Run</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={updateScraperStats}
              disabled={loading}
            >
              Refresh Status
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This dashboard shows the status of all venue scrapers. Green indicates recently run with no errors, 
          yellow means it hasn't been run in over a week, and red indicates errors in the last run.
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Status Summary */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ p: 2, borderColor: palette.success.light, borderWidth: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6">
                          {(statusFilter === 'all' || statusFilter === 'success') 
                            ? scraperStats.filter(s => s.status === 'success').length 
                            : 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Healthy
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ p: 2, borderColor: palette.warning.light, borderWidth: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon color="warning" sx={{ mr: 1, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6">
                          {(statusFilter === 'all' || statusFilter === 'warning') 
                            ? scraperStats.filter(s => s.status === 'warning').length 
                            : 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Needs Update
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ p: 2, borderColor: palette.error.light, borderWidth: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ErrorIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6">
                          {(statusFilter === 'all' || statusFilter === 'error') 
                            ? scraperStats.filter(s => s.status === 'error').length 
                            : 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Errors
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ p: 2, borderColor: palette.neutral.gray, borderWidth: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssessmentIcon color="disabled" sx={{ mr: 1, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6">
                          {(statusFilter === 'all' || statusFilter === 'never_run') 
                            ? scraperStats.filter(s => s.status === 'never_run').length 
                            : 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Never Run
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            {/* Scrapers Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>Venue</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell align="center">Last Added</TableCell>
                    <TableCell align="center">Total Added</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scraperStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No scraper data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const filteredScrapers = scraperStats.filter(scraper => 
                        statusFilter === 'all' || scraper.status === statusFilter
                      );
                      
                      if (filteredScrapers.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              No scrapers match the selected filter
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      // Status mappings
                      const statusColors = {
                        success: 'success',
                        warning: 'warning',
                        error: 'error',
                        never_run: 'default'
                      };
                      
                      const statusLabels = {
                        success: 'Healthy',
                        warning: 'Needs Update',
                        error: 'Error',
                        never_run: 'Never Run'
                      };
                      
                      const statusIcons = {
                        success: <CheckCircleIcon fontSize="small" />,
                        warning: <WarningIcon fontSize="small" />,
                        error: <ErrorIcon fontSize="small" />,
                        never_run: <AssessmentIcon fontSize="small" />
                      };
                      
                      return filteredScrapers.map((scraper) => (
                        <TableRow 
                          key={scraper.id} 
                          hover
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: scraper.status === 'error' 
                                ? `${colors.red[90]}30`
                                : scraper.status === 'warning'
                                  ? `${colors.yellow[70]}30`
                                  : undefined 
                            } 
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {scraper.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusIcons[scraper.status]}
                              label={statusLabels[scraper.status]}
                              color={statusColors[scraper.status]}
                              size="small"
                              variant={scraper.status === 'never_run' ? 'outlined' : 'filled'}
                            />
                            {scraper.hasError && (
                              <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                                {scraper.lastError?.substring(0, 60)}
                                {scraper.lastError?.length > 60 ? '...' : ''}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {scraper.lastRun ? (
                              <Box>
                                <Typography variant="body2">
                                  {formatDate(scraper.lastRun)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {scraper.daysSinceLastRun} days ago
                                </Typography>
                              </Box>
                            ) : (
                              'Never'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {scraper.lastRun ? (
                              <Chip 
                                label={scraper.lastAdded} 
                                size="small" 
                                color={scraper.lastAdded > 0 ? 'success' : 'default'}
                                variant={scraper.lastAdded > 0 ? 'filled' : 'outlined'}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              fontWeight={scraper.totalAdded > 0 ? 500 : 400}
                              color={scraper.totalAdded > 0 ? 'text.primary' : 'text.secondary'}
                            >
                              {scraper.totalAdded || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Tooltip title="Run Scraper">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => {
                                    runScraper(scraper.id);
                                    setTabValue(0); // Switch to the Run Scrapers tab
                                  }}
                                  disabled={loading}
                                  sx={{ mr: 1 }}
                                >
                                  <RunIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {scraper.lastRun && (
                                <Tooltip title="View Last Run Details">
                                  <IconButton 
                                    size="small" 
                                    color="info"
                                    onClick={() => {
                                      // Find the most recent log for this scraper
                                      const recentLog = history.logs.find(log => log.scraper_name === scraper.id);
                                      if (recentLog) {
                                        viewLogDetails(recentLog.id);
                                      }
                                    }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ));
                    })()
                  )}
                
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </TabPanel>
      
      {/* Scraper History Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Scraper Run History
          </Typography>
          
          <Button 
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchScraperHistory}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        {/* Pagination controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="history-limit-label">Rows</InputLabel>
            <Select
              labelId="history-limit-label"
              id="history-limit"
              value={historyLimit}
              onChange={(e) => {
                setHistoryLimit(e.target.value);
                setHistoryPage(1); // Reset to first page when changing limit
              }}
              label="Rows"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          
          <Pagination 
            count={history.pagination.pages} 
            page={historyPage}
            onChange={(e, page) => setHistoryPage(page)}
            color="primary"
            disabled={loading}
          />
        </Box>
        
        {/* History table */}
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>ID</TableCell>
                <TableCell>Scraper</TableCell>
                <TableCell>Run At</TableCell>
                <TableCell align="center">Added</TableCell>
                <TableCell align="center">Duplicates</TableCell>
                <TableCell align="center">Skipped</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : history.logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    No scraper history found
                  </TableCell>
                </TableRow>
              ) : (
                history.logs.map((log) => {
                  // Parse the errors array from JSON string if needed
                  let errors = [];
                  try {
                    if (log.errors) {
                      errors = typeof log.errors === 'string' ? JSON.parse(log.errors) : log.errors;
                      // If parsed result is not an array, handle it
                      if (!Array.isArray(errors)) {
                        errors = errors ? [String(errors)] : [];
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing errors:', e);
                    // If parsing fails, set an empty array
                    errors = [];
                  }
                  
                  const hasErrors = errors && errors.length > 0;
                  
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{getScraperName(log.scraper_name)}</TableCell>
                      <TableCell>{formatDate(log.run_at)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={log.added_count} 
                          size="small" 
                          color={log.added_count > 0 ? 'success' : 'default'}
                          variant={log.added_count > 0 ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">{log.duplicate_count}</TableCell>
                      <TableCell align="center">{log.skipped_count}</TableCell>
                      <TableCell align="center">
                        {hasErrors ? (
                          <Tooltip title={`${errors.length} errors`}>
                            <ErrorIcon color="error" fontSize="small" />
                          </Tooltip>
                        ) : (
                          <CheckCircleIcon color="success" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => viewLogDetails(log.id)}
                          color="primary"
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      
      {/* Log details dialog */}
      <Dialog
        open={logDetailsOpen}
        onClose={() => setLogDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Scraper Log Details
          {logDetailsLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent dividers>
          {logDetailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Log summary */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Scraper:</Typography>
                    <Typography variant="body1">{getScraperName(logDetails.log?.scraper_name || '')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Run At:</Typography>
                    <Typography variant="body1">{formatDate(logDetails.log?.run_at || '')}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Added:</Typography>
                    <Typography variant="body1" color="success.main">{logDetails.log?.added_count || 0}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Duplicates:</Typography>
                    <Typography variant="body1">{logDetails.log?.duplicate_count || 0}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Skipped:</Typography>
                    <Typography variant="body1">{logDetails.log?.skipped_count || 0}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Errors section */}
              {logDetails.log?.errors && (() => {
                // Safely parse errors
                let parsedErrors = [];
                try {
                  // Handle empty string or null
                  if (!logDetails.log.errors || logDetails.log.errors === '[]') return null;
                  
                  parsedErrors = JSON.parse(logDetails.log.errors);
                  if (!Array.isArray(parsedErrors) || parsedErrors.length === 0) return null;
                } catch (e) {
                  console.error("Error parsing errors:", e);
                  return null;
                }
                
                return (
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: 'error.light', bgcolor: 'error.lightest' }}>
                    <Typography variant="subtitle1" color="error" sx={{ mb: 1 }}>
                      <WarningIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Errors
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                      {parsedErrors.map((err, i) => (
                        <Typography key={i} variant="body2" color="error.dark" sx={{ mb: 0.5 }}>
                          {i + 1}. {err}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                );
              })()}
              
              {/* Added shows table */}
              {logDetails.shows && logDetails.shows.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell>Show ID</TableCell>
                        <TableCell>Bands</TableCell>
                        <TableCell>Venue</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logDetails.shows.map((show) => (
                        <TableRow key={show.id} hover>
                          <TableCell>{show.show_id}</TableCell>
                          <TableCell>{show.show_name}</TableCell>
                          <TableCell>{show.venue_name}</TableCell>
                          <TableCell>{formatDate(show.show_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No shows were added in this run.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Paper>
    </Container>
  );
};

export default ScraperAdminPanel;