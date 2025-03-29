import React from 'react';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { Box, CircularProgress } from '@mui/material';

const PullToRefreshIndicator = ({ pullDistance, refreshing }) => {
  // Calculate opacity based on pull distance (0-100)
  const opacity = Math.min(pullDistance / 60, 1);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        transform: refreshing ? 'translateY(16px)' : `translateY(${Math.min(pullDistance / 2, 30)}px)`,
        opacity: refreshing ? 1 : opacity,
        transition: refreshing ? 'none' : 'transform 0.2s, opacity 0.2s',
        pointerEvents: 'none',
      }}
    >
      {refreshing ? (
        <CircularProgress size={30} color="primary" />
      ) : (
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '2px solid #888',
            borderTopColor: 'primary.main',
            transform: `rotate(${pullDistance * 2.7}deg)`,
          }}
        />
      )}
    </Box>
  );
};

const PullToRefresh = ({ children, onRefresh }) => {
  const { refreshing, pullDistance } = usePullToRefresh(onRefresh);
  
  return (
    <>
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
      {children}
    </>
  );
};

export default PullToRefresh;