import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';

const ActiveTags = ({ tags, limit, showTooltip = true }) => {
  if (!tags || tags.length === 0) return null; // Don't render if no tags exist

  const visibleTags = tags.slice(0, limit);
  const moreTagsCount = tags.length > limit ? tags.length - limit : 0;

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
      {visibleTags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          size="small"
          sx={{
            bgcolor: 'primary.light',
            color: 'primary.text',
            '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
          }}
        />
      ))}

      {/* Show a tooltip inside ActiveTags ONLY if showTooltip is true */}
      {showTooltip && moreTagsCount > 0 && (
        <Tooltip title={tags.slice(limit).map(tag => tag.name).join(', ')}>
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'grey.300',
              borderRadius: 12,
              px: 1,
              fontSize: '0.75rem',
              height: 20,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            +{moreTagsCount}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActiveTags;