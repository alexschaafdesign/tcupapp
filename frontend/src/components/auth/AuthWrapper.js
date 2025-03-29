import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';

const AuthWrapper = ({ 
  children, 
  renderContent, 
  requiredRoles = [],
  mode = 'block',  // 'block', 'view-only', 'modal'
  viewOnlyContent = null,
  authMessage = null
}) => {
  const { user, isAuthenticated, isAdmin, isModerator, hasRole, userRoles, loginWithRedirect } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check if user has required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'moderator') return isModerator;
      return hasRole(role);
    });

  // User has permission if authenticated and has required roles
  const hasPermission = isAuthenticated && hasRequiredRole;
  
  // Determine appropriate auth message
  const defaultAuthMessage = isAuthenticated
    ? "You need administrator or moderator privileges to perform this action."
    : "You must be logged in with appropriate privileges to perform this action.";
  
  const finalAuthMessage = authMessage || defaultAuthMessage;

  // If user has permission, render normally
  if (hasPermission) {
    return renderContent 
      ? renderContent({ showAuth: true, openAuthModal: () => setAuthModalOpen(true) }) 
      : children;
  }

  // Handle view-only mode - show content without auth
  if (mode === 'view-only') {
    return viewOnlyContent || children;
  }

  // Handle modal mode - show view-only content but open modal on interaction
  if (mode === 'modal') {
    const handleAuthRequired = (e) => {
      e.preventDefault();
      setAuthModalOpen(true);
    };

    return (
      <>
        <div onClick={handleAuthRequired} style={{ cursor: 'pointer' }}>
          {viewOnlyContent || children}
        </div>
        <AuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          message={finalAuthMessage}
          loginWithRedirect={loginWithRedirect}
        />
      </>
    );
  }

  // Handle case where content should be completely hidden (block mode)
  if (requiredRoles.length > 0 && !isAuthenticated) {
    // Only show login modal if user is not authenticated at all
    return (
      <AuthModal 
        open={true}
        static={true}
        message={finalAuthMessage}
        loginWithRedirect={loginWithRedirect}
      />
    );
  }

  // If user is authenticated but lacks roles, or in block mode without required roles
  return null;
};

export default AuthWrapper;