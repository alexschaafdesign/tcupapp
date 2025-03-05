import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
    Button, 
    Card, 
    CardContent, 
    TextField, 
    Typography, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    CircularProgress,
    Divider,
    Avatar,
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL;
const categories = ['General', 'Help', 'TCUP'];

// NewThreadDialog component (unchanged)
const NewThreadDialog = ({ open, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        onSubmit({ title, content });
        setTitle('');
        setContent('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Content"
                    fullWidth
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Create Thread
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ThreadList = ({ category: initialCategory }) => {
    const navigate = useNavigate();
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(initialCategory || 'General');
    const [error, setError] = useState(null);

    const getInitials = (email) => {
        return email
            .split('@')[0]
            .split('.')
            .map(part => part[0].toUpperCase())
            .join('');
    };

    const fetchThreads = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${apiUrl}/messages/threads/${currentCategory}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Fetch avatars for replies in a separate call
            const threadsData = await response.json();
            
            // Debug log to see what we're getting from the backend
            console.log('Thread data received:', JSON.stringify(threadsData, null, 2));
            
            // Get unique user IDs from all replies
            const replyUserIds = new Set();
            threadsData.forEach(thread => {
                if (thread.recent_replies) {
                    thread.recent_replies.forEach(reply => {
                        if (reply.auth0_id) replyUserIds.add(reply.auth0_id);
                    });
                }
            });
            
            // Fetch avatars for reply authors
            const avatarsResponse = await fetch(`${apiUrl}/messages/users/avatars`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userIds: Array.from(replyUserIds)
                })
            });
            
            if (!avatarsResponse.ok) {
                throw new Error('Failed to fetch avatars');
            }
            
            const avatarsData = await avatarsResponse.json();
            
            // Merge avatar data with replies
            const threadsWithAvatars = threadsData.map(thread => ({
                ...thread,
                recent_replies: thread.recent_replies?.map(reply => ({
                    ...reply,
                    avatar_url: avatarsData[reply.auth0_id]?.avatar_url
                }))
            }));
            
            setThreads(threadsWithAvatars);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching threads:', error);
            setError(error.message);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchThreads();

        // Set up real-time subscription
        const channel = supabase
            .channel('public:forum_messages')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'forum_messages',
                    filter: `category=eq.${currentCategory}`
                }, 
                (payload) => {
                    console.log('Real-time update received:', payload);
                    fetchThreads();
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentCategory]);

    const handleNewThread = async (threadData) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${apiUrl}/messages/thread`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    ...threadData, 
                    category: currentCategory,
                    author: user?.name || user?.email
                })
            });

            if (response.ok) {
                setDialogOpen(false);
                fetchThreads();
            }
        } catch (error) {
            console.error('Error creating thread:', error);
            setError(error.message);
        }
    };

    const handleThreadClick = (threadId) => {
        navigate(`/thread/${threadId}`);
    };

    const handleCategoryChange = (event, newValue) => {
        setCurrentCategory(newValue);
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

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* Category Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={currentCategory}
                    onChange={handleCategoryChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#8167E6',
                            height: 2
                        }
                    }}
                >
                    {categories.map((cat) => (
                        <Tab 
                            key={cat} 
                            value={cat} 
                            label={cat}
                            sx={{
                                textTransform: 'none',
                                color: '#666666',
                                fontSize: '1rem',
                                '&.Mui-selected': {
                                    color: '#8167E6',
                                    fontWeight: 500
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(129, 103, 230, 0.04)'
                                },
                                borderBottom: '1px solid #E0E0E0',
                                '&.Mui-selected + .MuiTab-root': {
                                    borderLeft: '1px solid #E0E0E0'
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* New Thread Button */}
            {isAuthenticated && (
                <Box mb={2} display="flex" justifyContent="flex-end">
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => setDialogOpen(true)}
                    >
                        New Thread
                    </Button>
                </Box>
            )}

            {/* Thread List */}
            {threads.map(thread => (
                <Card 
                    key={thread.id} 
                    sx={{ 
                        mb: 2, 
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                    onClick={() => handleThreadClick(thread.id)}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Avatar 
                                src={thread.avatar_url || null}
                                sx={{ bgcolor: 'primary.main' }}
                            >
                                {!thread.avatar_url && getInitials(thread.author || 'Anonymous')}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">
                                    {thread.title}
                                </Typography>
                                <Typography color="textSecondary">
                                    Posted by {thread.author} {formatDistanceToNow(new Date(thread.created_at))} ago
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            {thread.content}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
                            {thread.last_reply_at && ` • Last reply ${formatDistanceToNow(new Date(thread.last_reply_at))} ago`}
                        </Typography>

                        {/* Recent replies section */}
                        {thread.recent_replies && thread.recent_replies.length > 0 && (
                            <Box mt={2} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Recent Replies
                                </Typography>
                                {thread.recent_replies.map((reply, index) => (
                                    <Box key={reply.id}>
                                        <Box sx={{ display: 'flex', gap: 2, ml: 1 }}>
                                            <Avatar 
                                                src={reply.avatar_url || null}
                                                sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
                                            >
                                                {!reply.avatar_url && getInitials(reply.author || 'Anonymous')}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    {reply.author} • {formatDistanceToNow(new Date(reply.created_at))} ago
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {reply.content}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {index < thread.recent_replies.length - 1 && (
                                            <Divider sx={{ my: 1 }} />
                                        )}
                                    </Box>
                                ))}
                                {thread.reply_count > thread.recent_replies.length && (
                                    <Typography 
                                        variant="body2" 
                                        color="primary" 
                                        sx={{ mt: 1, fontWeight: 500 }}
                                    >
                                        View {thread.reply_count - thread.recent_replies.length} more replies...
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            ))}

            <NewThreadDialog 
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleNewThread}
            />
        </Box>
    );
};

export default ThreadList;