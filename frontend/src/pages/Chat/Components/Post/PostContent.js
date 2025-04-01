import React from 'react';
import { Box } from '@mui/material';
import ImageAttachmentsGrid from './ImageAttachmentsGrid';

const PostContent = ({ post, renderContent }) => {
  const hasImages = post.images && Array.isArray(post.images) && post.images.length > 0;
  
  return (
    <Box sx={{ 
      width: '100%', 
      wordBreak: 'break-word', 
      overflowWrap: 'anywhere',
      '& p': { 
        margin: 0,
        marginBottom: 0
      },
      '& br': { display: 'block', content: '""', marginTop: '0.3em' }
    }}>
      {renderContent && renderContent(post.content)}
      {hasImages && <ImageAttachmentsGrid images={post.images} />}
    </Box>
  );
};

export default PostContent;