import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

function LogoutButton() {
  const { logout, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <button onClick={() => logout()}>
        Log Out
      </button>
    );
  }
  return null;
}

export default LogoutButton;