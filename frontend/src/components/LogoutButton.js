import { useAuth0 } from '@auth0/auth0-react';

function LogoutButton() {
  const { logout, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <button onClick={() => logout({ 
        logoutParams: {
          returnTo: window.location.origin
        }
      })}>
        Log Out
      </button>
    );
  }
  return null;
}

export default LogoutButton;