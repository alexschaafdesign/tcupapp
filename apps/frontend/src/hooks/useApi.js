import { useAuth0 } from '@auth0/auth0-react';
import * as Sentry from "@sentry/react";
import { useState } from 'react';

export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const callApi = async (url, options = {}) => {
    try {
      // Check authentication status
      if (!isAuthenticated) {
        console.warn("User is not authenticated");
        throw new Error("User not authenticated");
      }

      console.log("About to request token...");
      let token;
      try {
        token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
            scope: 'openid profile email'
          },
          detailedResponse: false,
          timeoutInSeconds: 60
        });
      } catch (tokenError) {
        console.error("Error getting access token:", tokenError);
        
        // Handle specific token errors
        if (!isRedirecting && (tokenError.message.includes("invalid refresh token") || 
            tokenError.error === 'login_required')) {
          console.log("Token error detected, redirecting to login...");
          // Prevent multiple redirects
          setIsRedirecting(true);
          // Force a new login
          loginWithRedirect({
            appState: { returnTo: window.location.pathname }
          });
          throw new Error("Authentication error - redirecting to login");
        }
        
        throw tokenError;
      }
      
      console.log("Token retrieved:", !!token);

      // Rest of your code remains the same...
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };
      
      // Determine the full URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
      const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
      
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      Sentry.captureException(error, {
        extra: { url, options }
      });
      throw error;
    }
  };

  return { callApi };
};

export default useApi;