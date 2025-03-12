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
  Divider
} from '@mui/material';

const ForumThreads = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getForumThreads(12, page);
        
        if (!data || !data.threads) {
          throw new Error('Invalid response format from server');
        }
        
        setThreads(data.threads);
        setError(null);
      } catch (err) {
        console.error('Forum threads error:', err);
        setError(err.message || 'Failed to fetch threads');
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
          Forum Threads
        </Typography>

        {threads.map((thread, index) => (
          <React.Fragment key={thread.thread_id}>
            <Box py={2}>
              <Typography variant="h6" component="h2" gutterBottom>
                <Link 
                  href={`/threads/${thread.thread_id}`}
                  color="primary"
                  underline="hover"
                >
                  {thread.title}
                </Link>
              </Typography>
              
              <Box display="flex" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Posted: {formatDate(thread.post_date)}
                </Typography>
                {thread.reply_count !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    Replies: {thread.reply_count}
                  </Typography>
                )}
              </Box>
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

export default ForumThreads;