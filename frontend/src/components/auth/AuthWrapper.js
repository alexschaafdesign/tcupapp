import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';

const AuthWrapper = ({ 
  children, 
  renderContent, 
  requiredRoles = [],
  mode = 'block',  // 'block', 'view-only', 'modal'
  viewOnlyContent = null,
  authMessage = "Please log in to continue"
}) => {
  const { user, isAuthenticated, isAdmin, isModerator, hasRole, userRoles } = useAuth();
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
  
  // Create role-specific message if needed
  const roleMessage = requiredRoles.length > 0 && isAuthenticated
    ? "You need additional permissions to access this feature."
    : authMessage;

  // If user has permission, render normally
  if (hasPermission) {
    return renderContent 
      ? renderContent({ showAuth: true }) 
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
      e.stopPropagation();
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
          message={roleMessage}
        />
      </>
    );
  }

  // For block mode with static modal, return a permanently visible auth modal
  if (mode === 'block' && !isAuthenticated) {
    return (
      <AuthModal 
        open={true}
        onClose={() => {}} // Empty function as we don't want to close
        message={authMessage}
      />
    );
  }

  // For other block mode cases (e.g., logged in but wrong role)
  return null;
};

export default AuthWrapper;