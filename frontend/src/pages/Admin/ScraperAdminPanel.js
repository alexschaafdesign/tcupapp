import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent, Chip,
  IconButton, Pagination, Select, MenuItem, FormControl, InputLabel,
  Alert, AlertTitle, Tooltip, Container
} from '@mui/material';
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
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../hooks/useAuth';

// Updated helper to safely parse errors data
const parseErrors = (errorsData) => {
  if (typeof errorsData === 'string') {
    if (errorsData.trim() === '') {
      return [];
    }
    try {
      const parsed = JSON.parse(errorsData);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("Error parsing errors string:", e);
      return [];
    }
  }
  if (Array.isArray(errorsData)) {
    return errorsData;
  }
  return errorsData ? [errorsData] : [];
};

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
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
  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapers, setScrapers] = useState([]);
  const [history, setHistory] = useState({ logs: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [logDetailsOpen, setLogDetailsOpen] = useState(false);
  const [logDetails, setLogDetails] = useState({ log: {}, shows: [] });
  const [logDetailsLoading, setLogDetailsLoading] = useState(false);
  const [liveLogMessages, setLiveLogMessages] = useState([]);
  const [streamActive, setStreamActive] = useState(false);
  const [currentScraper, setCurrentScraper] = useState(null);
  const [scraperStats, setScraperStats] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const { isAdmin } = useAuth();
  const { getAccessTokenSilently } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Helper to format dates
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getScraperName = (scraperId) => {
    if (!scraperId) return 'All Default Scrapers';
    const scraper = scrapers.find(s => s.id === scraperId);
    return scraper ? scraper.name : scraperId;
  };

  // Fetch scraper history
  const fetchScraperHistory = async (page = historyPage, limit = historyLimit) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${apiUrl}/scrapers/scraper-history?page=${page}&limit=${limit}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch scraper history');
      const data = await response.json();
      setHistory(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scraper history:', err);
      setError('Failed to load scraper history');
      setLoading(false);
    }
  };

  // Update scraper statistics
  const updateScraperStats = async () => {
    try {
      const token = await getAccessTokenSilently();
      const historyResponse = await fetch(
        `${apiUrl}/scrapers/scraper-history?page=1&limit=100`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!historyResponse.ok) throw new Error('Failed to fetch scraper history for stats');
      const historyData = await historyResponse.json();

      if (!Array.isArray(scrapers) || scrapers.length === 0) {
        const scrapersResponse = await fetch(`${apiUrl}/scrapers/available-scrapers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!scrapersResponse.ok) throw new Error('Failed to fetch available scrapers');
        const scrapersData = await scrapersResponse.json();
        setScrapers(scrapersData.scrapers);
      }

      const availableScrapers = Array.isArray(scrapers) && scrapers.length > 0 ? scrapers : [];

      const stats = availableScrapers.map(scraper => {
        const scraperLogs = historyData.logs.filter(log => log.scraper_name === scraper.id);
        const lastRun = scraperLogs.length > 0 ? scraperLogs[0] : null;
        const totalAdded = scraperLogs.reduce((sum, log) => sum + (log.added_count || 0), 0);
        let hasError = false;
        let lastError = '';
        if (lastRun && lastRun.errors) {
          const errors = parseErrors(lastRun.errors);
          hasError = errors.length > 0;
          lastError = hasError ? errors[0] : '';
        }
        const daysSinceLastRun = lastRun 
          ? Math.round((new Date() - new Date(lastRun.run_at)) / (1000 * 60 * 60 * 24))
          : null;
        let status = 'unknown';
        if (!lastRun) status = 'never_run';
        else if (hasError) status = 'error';
        else if (daysSinceLastRun > 7) status = 'warning';
        else status = 'success';
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
      
      const statusPriority = { error: 0, warning: 1, never_run: 2, success: 3 };
      stats.sort((a, b) => {
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        return a.name.localeCompare(b.name);
      });
      
      setScraperStats(stats);
    } catch (err) {
      console.error('Error updating scraper stats:', err);
    }
  };

  // View log details dialog
  const viewLogDetails = async (logId) => {
    try {
      setLogDetailsLoading(true);
      setLogDetailsOpen(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/scrapers/scraper-logs/${logId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch log details');
      const data = await response.json();
      setLogDetails(data);
      setLogDetailsLoading(false);
    } catch (err) {
      console.error('Error fetching log details:', err);
      setError('Failed to load log details');
      setLogDetailsLoading(false);
    }
  };

  // Run scraper with simulated live logging
  const runScraper = async (scraper = null) => {
    setLoading(true);
    setError('');
    setLiveLogMessages([]);
    setStreamActive(true);
    setCurrentScraper(scraper);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/scrapers/run-scrapers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scraper })
      });
      if (!response.ok) throw new Error('Error running scrapers');
      setLiveLogMessages(prev => [
        ...prev, 
        { type: 'complete', message: 'Scraper run completed!', timestamp: new Date().toISOString() }
      ]);
      await fetchScraperHistory(1, historyLimit);
      setStreamActive(false);
      setLoading(false);
      setCurrentScraper(null);
      setTabValue(0);
    } catch (err) {
      setError(err.message);
      setStreamActive(false);
      setLoading(false);
      setCurrentScraper(null);
    }
  };

  // Initial data load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const scrapersResponse = await fetch(`${apiUrl}/scrapers/available-scrapers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!scrapersResponse.ok) throw new Error('Failed to fetch scrapers');
        const scrapersData = await scrapersResponse.json();
        setScrapers(scrapersData.scrapers);
        console.log("Loaded scrapers:", scrapersData.scrapers);
        await fetchScraperHistory(1, historyLimit);
        await updateScraperStats();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [getAccessTokenSilently, apiUrl, historyLimit]);

  useEffect(() => {
    if (tabValue === 1) updateScraperStats();
    else if (tabValue === 2) fetchScraperHistory(historyPage, historyLimit);
  }, [tabValue, historyPage, historyLimit]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5">Access Denied</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>You do not have permission to access this page.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          Venue Scraper Admin
        </Typography>
        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="scraper admin tabs">
            <Tab icon={<RunIcon />} label="Run Scrapers" id="scraper-tab-0" />
            <Tab icon={<DashboardIcon />} label="Scraper Status" id="scraper-tab-1" />
            <Tab icon={<HistoryIcon />} label="Complete History" id="scraper-tab-2" />
          </Tabs>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Run Venue Scrapers</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => runScraper()}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                sx={{ minWidth: 240 }}
              >
                {loading ? 'Running Default Scrapers...' : 'Run All Default Scrapers'}
              </Button>
              <Box sx={{ flex: 1, border: '1px dashed rgba(0,0,0,0.12)', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Individual Venue Scrapers:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {scrapers.length > 0 ? (
                    scrapers.map(scraper => (
                      <Button
                        key={scraper.id}
                        variant={currentScraper === scraper.id ? 'contained' : 'outlined'}
                        onClick={() => runScraper(scraper.id)}
                        disabled={loading}
                      >
                        {currentScraper === scraper.id ? `Running: ${scraper.name}...` : scraper.name}
                      </Button>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">Loading scrapers...</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          {streamActive && (
            <Box sx={{
              mt: 4, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1,
              border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'monospace', fontSize: '0.875rem',
              height: '300px', overflowY: 'auto'
            }}>
              {liveLogMessages.map((msg, idx) => (
                <Box key={idx} sx={{ mb: 1, color: msg.type === 'error' ? 'error.main' : msg.type === 'status' ? 'info.main' : 'success.main' }}>
                  [{new Date(msg.timestamp).toLocaleTimeString()}] {msg.message}
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
                  <CircularProgress size={14} sx={{ mr: 1 }} /> Processing...
                </Box>
              )}
            </Box>
          )}
          {(!loading && history.logs.length > 0) && (
            <Box sx={{ mt: 4, mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Latest Run Results</Typography>
              <Grid container spacing={3}>
                {history.logs.slice(0, 5).map(log => (
                  <Grid item xs={12} md={6} lg={4} key={log.id}>
                    <Card variant="outlined" sx={{
                      borderColor: log.errors && parseErrors(log.errors).length > 0 ? 'error.light' : 'success.light',
                      borderWidth: 1
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">{getScraperName(log.scraper_name)}</Typography>
                          {log.errors && parseErrors(log.errors).length > 0 ? (
                            <ErrorIcon color="error" />
                          ) : (
                            <CheckCircleIcon color="success" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Run at: {formatDate(log.run_at)}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Added: <strong>{log.added_count}</strong></Typography>
                          <Typography variant="body2">Duplicates: <strong>{log.duplicate_count}</strong></Typography>
                          <Typography variant="body2">Skipped: <strong>{log.skipped_count || 0}</strong></Typography>
                        </Box>
                        {log.added_shows && log.added_shows.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">Added Show IDs:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                              {log.added_shows.map(id => (
                                <Chip key={id} label={id} size="small" variant="outlined" color="primary" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        {log.log_id && (
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button size="small" variant="text" onClick={() => viewLogDetails(log.log_id)} startIcon={<InfoIcon />}>
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
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Scraper Status Dashboard</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
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
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={updateScraperStats} disabled={loading}>
                Refresh Status
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Dashboard shows the status of all venue scrapers. Green indicates recent successful runs, yellow means not run in over a week, and red indicates errors.
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  {['success', 'warning', 'error', 'never_run'].map(status => {
                    const statusLabels = { success: 'Healthy', warning: 'Needs Update', error: 'Errors', never_run: 'Never Run' };
                    const statusColors = { success: 'success', warning: 'warning', error: 'error', never_run: 'neutral' };
                    const statusIcons = { 
                      success: <CheckCircleIcon fontSize="small" />, 
                      warning: <WarningIcon fontSize="small" />, 
                      error: <ErrorIcon fontSize="small" />, 
                      never_run: <AssessmentIcon fontSize="small" /> 
                    };
                    const count = statusFilter === 'all'
                      ? scraperStats.filter(s => s.status === status).length
                      : scraperStats.filter(s => s.status === status && statusFilter === status).length;
                    return (
                      <Grid key={status} item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, borderColor: palette[statusColors[status]]?.light || palette.text.secondary, borderWidth: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {statusIcons[status]}
                            <Box sx={{ ml: 1 }}>
                              <Typography variant="h6">{count}</Typography>
                              <Typography variant="body2" color="text.secondary">{statusLabels[status]}</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
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
                        <TableCell colSpan={6} align="center">No scraper data found</TableCell>
                      </TableRow>
                    ) : (
                      scraperStats.filter(s => statusFilter === 'all' || s.status === statusFilter)
                        .map(scraper => (
                          <TableRow key={scraper.id} hover>
                            <TableCell><Typography variant="body2" fontWeight={500}>{scraper.name}</Typography></TableCell>
                            <TableCell>
                              <Chip
                                icon={scraper.status === 'success' ? <CheckCircleIcon fontSize="small" /> : scraper.status === 'warning' ? <WarningIcon fontSize="small" /> : scraper.status === 'error' ? <ErrorIcon fontSize="small" /> : <AssessmentIcon fontSize="small" />}
                                label={scraper.status === 'success' ? 'Healthy' : scraper.status === 'warning' ? 'Needs Update' : scraper.status === 'error' ? 'Error' : 'Never Run'}
                                color={scraper.status === 'success' ? 'success' : scraper.status === 'warning' ? 'warning' : scraper.status === 'error' ? 'error' : 'default'}
                                size="small"
                                variant={scraper.status === 'never_run' ? 'outlined' : 'filled'}
                              />
                              {scraper.hasError && (
                                <Typography variant="caption" color="error" display="block">
                                  {scraper.lastError?.substring(0, 60)}{scraper.lastError?.length > 60 ? '...' : ''}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {scraper.lastRun ? (
                                <Box>
                                  <Typography variant="body2">{formatDate(scraper.lastRun)}</Typography>
                                  <Typography variant="caption" color="text.secondary">{scraper.daysSinceLastRun} days ago</Typography>
                                </Box>
                              ) : (
                                'Never'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {scraper.lastRun ? (
                                <Chip label={scraper.lastAdded} size="small" color={scraper.lastAdded > 0 ? 'success' : 'default'} variant={scraper.lastAdded > 0 ? 'filled' : 'outlined'} />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={scraper.totalAdded > 0 ? 500 : 400} color={scraper.totalAdded > 0 ? 'text.primary' : 'text.secondary'}>
                                {scraper.totalAdded || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Tooltip title="Run Scraper">
                                  <IconButton size="small" color="primary" onClick={() => { runScraper(scraper.id); setTabValue(0); }}>
                                    <RunIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {scraper.lastRun && (
                                  <Tooltip title="View Last Run Details">
                                    <IconButton size="small" color="info" onClick={() => {
                                      const recentLog = history.logs.find(log => log.scraper_name === scraper.id);
                                      if (recentLog) {
                                        viewLogDetails(recentLog.id);
                                      }
                                    }}>
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Scraper Run History</Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchScraperHistory} disabled={loading}>
              Refresh
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="history-limit-label">Rows</InputLabel>
              <Select
                labelId="history-limit-label"
                value={historyLimit}
                onChange={(e) => { setHistoryLimit(e.target.value); setHistoryPage(1); }}
                label="Rows"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <Pagination count={history.pagination.pages} page={historyPage} onChange={(e, page) => setHistoryPage(page)} color="primary" disabled={loading} />
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
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
                    <TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell>
                  </TableRow>
                ) : history.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No scraper history found</TableCell>
                  </TableRow>
                ) : (
                  history.logs.map(log => {
                    const errors = parseErrors(log.errors);
                    const hasErrors = errors.length > 0;
                    return (
                      <TableRow key={log.id} hover>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{getScraperName(log.scraper_name)}</TableCell>
                        <TableCell>{formatDate(log.run_at)}</TableCell>
                        <TableCell align="center">
                          <Chip label={log.added_count} size="small" color={log.added_count > 0 ? 'success' : 'default'} variant={log.added_count > 0 ? 'filled' : 'outlined'} />
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
                          <IconButton size="small" onClick={() => viewLogDetails(log.id)} color="primary">
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
        <Dialog open={logDetailsOpen} onClose={() => setLogDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Scraper Log Details {logDetailsLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
          </DialogTitle>
          <DialogContent dividers>
            {logDetailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <>
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
                {logDetails.log?.errors && (() => {
                  const parsedErrors = parseErrors(logDetails.log.errors);
                  if (parsedErrors.length === 0) return null;
                  return (
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: 'error.light', bgcolor: 'error.lightest' }}>
                      <Typography variant="subtitle1" color="error" sx={{ mb: 1 }}>
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
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
                {logDetails.shows && logDetails.shows.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Show ID</TableCell>
                          <TableCell>Bands</TableCell>
                          <TableCell>Venue</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {logDetails.shows.map(show => (
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
      </Paper>
    </Container>
  );
};

export default ScraperAdminPanel;