import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';

const AuthWrapper = ({ children, renderContent, requiredRoles = [] }) => {
  const { user, isAuthenticated, isAdmin, isModerator, hasRole, userRoles } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Debug logging
  console.log('AuthWrapper required roles:', requiredRoles);
  console.log('User has roles:', userRoles);
  console.log('isAdmin:', isAdmin, 'isModerator:', isModerator);
  
  // Check if user has required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'moderator') return isModerator;
      return hasRole(role);
    });

  // User has permission if authenticated and has required roles
  const hasPermission = isAuthenticated && hasRequiredRole;
  console.log('Has permission:', hasPermission);

  // Auth message based on authentication state
  const authMessage = isAuthenticated
    ? "You need administrator or moderator privileges to perform this action."
    : "You must be logged in with appropriate privileges to perform this action.";

  if (children) {
    return hasPermission ? children : null;
  }

  if (renderContent && hasPermission) {
    return renderContent({ 
      showAuth: true, 
      openAuthModal: () => setAuthModalOpen(true) 
    });
  }
  
  // Don't render anything if user doesn't have permission
  return null;
};

export default AuthWrapper;