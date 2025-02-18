// src/hooks/useApi.js
import { useAuth0 } from '@auth0/auth0-react';
import * as Sentry from "@sentry/react";

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const callApi = async (url, options = {}) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
          scope: 'openid profile email'
        }
      });

      // Set up headers for the request
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      });

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(errorText || `HTTP error! status: ${response.status}`);
        
        // Capture API errors in Sentry
        Sentry.captureException(error, {
          extra: {
            url,
            options,
            status: response.status,
            responseText: errorText,
          }
        });

        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);

      // Capture unexpected errors (e.g., network issues, token errors)
      Sentry.captureException(error, {
        extra: {
          url,
          options,
        }
      });

      throw error; // Re-throw for UI error handling
    }
  };

  return { callApi };
};

export default useApi;