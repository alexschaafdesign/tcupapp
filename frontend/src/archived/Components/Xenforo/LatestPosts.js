import React, { useEffect, useState } from 'react';
import apiClient from '../../apiService';
import { 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button,
  Pagination,
  Box,
  Link,
  Divider,
  IconButton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const LatestPosts = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getLatestThreads(page);
        
        if (!data || !data.threads) {
          throw new Error('Invalid response format from server');
        }

        setThreads(data.threads);
        setError(null);
      } catch (error) {
        console.error('Latest posts error:', error);
        setError(error.message || 'Failed to load threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [page]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => setPage(1)}>
            Try Again
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          Latest Posts
        </Typography>

        {threads.map((thread, index) => (
          <React.Fragment key={thread.thread_id}>
            <Box py={2}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {thread.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posted by: {thread.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(thread.post_date)}
                  </Typography>
                </Box>

                {thread.view_url && (
                  <IconButton 
                    component="a"
                    href={thread.view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                )}
              </Box>

              {thread.preview_text && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {thread.preview_text}
                </Typography>
              )}
            </Box>
            {index < threads.length - 1 && <Divider />}
          </React.Fragment>
        ))}

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={10} // Replace with actual total pages
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LatestPosts;