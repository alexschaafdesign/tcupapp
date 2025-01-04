import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '../../lib/supabaseClient';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    CircularProgress,
    IconButton,
    Card,
    CardContent
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL;

const ThreadDetail = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const getInitials = (email) => {
        return email
            .split('@')[0]
            .split('.')
            .map(part => part[0].toUpperCase())
            .join('');
    };

    const fetchThreadData = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${apiUrl}/messages/thread/${threadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setThread(data.thread);
            setReplies(data.replies);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching thread:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreadData();

        // Set up real-time subscription for replies
        const channel = supabase
            .channel('public:forum_messages')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'forum_messages',
                    filter: `parent_id=eq.${threadId}`
                },
                (payload) => {
                    console.log('Real-time update received:', payload);
                    fetchThreadData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [threadId]);

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!newReply.trim() || submitting) return;

        setSubmitting(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${apiUrl}/messages/thread/${threadId}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    content: newReply,
                    author: user?.name || user?.email 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to post reply');
            }

            setNewReply('');
            await fetchThreadData();
        } catch (error) {
            console.error('Error posting reply:', error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" m={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, color: 'error.main' }}>
                <Typography>Error: {error}</Typography>
            </Box>
        );
    }

    if (!thread) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Thread not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
                <IconButton 
                    onClick={() => navigate(-1)}
                    sx={{ mr: 1 }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(-1)}
                >
                    Back to threads
                </Typography>
            </Box>

            {/* Thread Content */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar 
                            src={thread.avatar_url || null}
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            {!thread.avatar_url && getInitials(thread.author || 'Anonymous')}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                {thread.title}
                            </Typography>
                            <Typography color="textSecondary">
                                Posted by {thread.author} {formatDistanceToNow(new Date(thread.created_at))} ago
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body1" paragraph>
                        {thread.content}
                    </Typography>
                </CardContent>
            </Card>

            {/* Reply Form */}
            {isAuthenticated && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <form onSubmit={handleSubmitReply}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write a reply..."
                            sx={{ mb: 2 }}
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={!newReply.trim() || submitting}
                        >
                            {submitting ? 'Posting...' : 'Post Reply'}
                        </Button>
                    </form>
                </Paper>
            )}

            {/* Replies */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </Typography>

            {replies.map((reply, index) => (
                <Paper 
                    key={reply.id} 
                    sx={{ 
                        p: 2, 
                        mb: 2,
                        backgroundColor: index % 2 === 0 ? 'background.paper' : 'rgba(0, 0, 0, 0.02)'
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar 
                            src={reply.avatar_url || null}
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            {!reply.avatar_url && getInitials(reply.author || 'Anonymous')}
                        </Avatar>
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2">
                                    {reply.author}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {formatDistanceToNow(new Date(reply.created_at))} ago
                                </Typography>
                            </Box>
                            <Typography variant="body1">
                                {reply.content}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

export default ThreadDetail;