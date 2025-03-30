import { useState, useEffect } from 'react';

function usePullToRefresh(refreshFunction) {
  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  useEffect(() => {
    const handleTouchStart = (e) => {
      // Only trigger pull-to-refresh at the top of the page
      if (window.scrollY <= 0) {
        const { pageY } = e.touches[0];
        setStartY(pageY);
      }
    };
    
    const handleTouchMove = (e) => {
      if (window.scrollY <= 0 && startY > 0 && !refreshing) {
        const { pageY } = e.touches[0];
        const distance = pageY - startY;
        
        // Only handle downward pulls
        if (distance > 0) {
          setPullDistance(Math.min(distance, 100)); // Limit pull distance
          // Prevent the default scrolling behavior
          if (distance > 10) {
            e.preventDefault();
          }
        }
      }
    };
    
    const handleTouchEnd = async () => {
      if (pullDistance > 60 && !refreshing) { // Threshold to trigger refresh
        setRefreshing(true);
        
        // If refreshFunction is provided, call it
        if (refreshFunction) {
          try {
            await refreshFunction();
          } catch (error) {
            console.error('Error refreshing data:', error);
          }
        } else {
          // Default refresh behavior - add pull_to_refresh parameter and reload
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('pull_to_refresh', 'true');
          window.location.href = currentUrl.href;
        }
        
        setRefreshing(false);
      }
      
      // Reset values
      setStartY(0);
      setPullDistance(0);
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, refreshing, refreshFunction]);
  
  return { refreshing, pullDistance };
}

export default usePullToRefresh;