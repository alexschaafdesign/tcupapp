import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Breadcrumbs, Link, CircularProgress, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Editor, EditorState, convertFromRaw, CompositeDecorator } from 'draft-js';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../../hooks/useAuth'; // Use your actual path to useAuth
import 'draft-js/dist/Draft.css';

// Create link decorator for rich text
const linkDecorator = new CompositeDecorator([
  {
    strategy: (contentBlock, callback, contentState) => {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'LINK'
          );
        },
        callback
      );
    },
    component: (props) => {
      const { url } = props.contentState.getEntity(props.entityKey).getData();
      return (
        <a href={url} style={{ color: '#9c27b0', textDecoration: 'underline' }}>
          {props.children}
        </a>
      );
    },
  },
]);

const UpdateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorState, setEditorState] = useState(null);
  const { isAdmin, userRoles } = useAuth(); // Use your auth hook

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/updates/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Update not found');
          }
          throw new Error('Failed to fetch update');
        }
        
        const data = await response.json();
        setUpdate(data);
        
        // Initialize editor state if rich content exists
        if (data.content_json) {
          try {
            const contentJson = JSON.parse(data.content_json);
            const contentState = convertFromRaw(contentJson);
            setEditorState(EditorState.createWithContent(contentState, linkDecorator));
          } catch (e) {
            console.error('Error parsing content JSON:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching update:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpdate();
  }, [id]);
  
  const handleNavigateToUpdates = (e) => {
    e.preventDefault();
    navigate('/updates');
  };

  // For debugging
  console.log('User roles:', userRoles);
  console.log('Is admin?', isAdmin);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link 
            color="inherit" 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            Home
          </Link>
          <Link 
            color="inherit" 
            href="/updates"
            onClick={handleNavigateToUpdates}
          >
            Updates
          </Link>
          <Typography color="text.primary">Error</Typography>
        </Breadcrumbs>
        
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            Error
          </Typography>
          <Typography>
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  if (!update) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      
      
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h2" sx={{ color: '#333' }}>
            {update.title}
          </Typography>
          
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/updates/edit/${id}`)}
              sx={{ 
                borderColor: '#9c27b0',
                color: '#9c27b0',
                '&:hover': {
                  borderColor: '#7b1fa2',
                  backgroundColor: 'rgba(156, 39, 176, 0.04)'
                }
              }}
            >
              Edit
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
            Posted by {update.author_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            •
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {format(new Date(update.created_at), 'MMMM d, yyyy')}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {update.image_url && (
          <Box sx={{ mb: 4 }}>
            <img 
              src={update.image_url} 
              alt={update.title}
              style={{ 
                maxWidth: '100%', 
                borderRadius: '4px'
              }} 
            />
          </Box>
        )}
        
        {/* Render rich text if available, otherwise fallback to plain text */}
        {editorState ? (
          <Box 
            sx={{ 
              mb: 2,
              '.public-DraftEditor-content': {
                minHeight: 'unset',
                '& .public-DraftStyleDefault-block': {
                  marginBottom: '1em',
                }
              }
            }}
          >
            <Editor 
              editorState={editorState} 
              readOnly={true}
              onChange={() => {}}
            />
          </Box>
        ) : (
          <Typography variant="body1" sx={{ color: '#333', mb: 2, whiteSpace: 'pre-wrap' }}>
            {update.content}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default UpdateDetail;