import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import AuthModal from './AuthModal';

const AuthWrapper = ({ children, message, renderContent, showModalOnMount = false }) => {
  const [showModal, setShowModal] = useState(showModalOnMount);
  const { isAuthenticated } = useAuth0(); // Add this

  if (renderContent) {
    return (
      <>
        {renderContent({ 
          showAuth: isAuthenticated,
          openAuthModal: () => setShowModal(true)
        })}
        <AuthModal 
          open={showModal}
          onClose={() => setShowModal(false)}
          message={message}
        />
      </>
    );
  }

  return (
    <>
      {children}
      <AuthModal 
        open={showModal}
        onClose={() => setShowModal(false)}
        message={message}
      />
    </>
  );
};

export default AuthWrapper;