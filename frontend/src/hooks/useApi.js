// Updated useApi.js
import { useAuth0 } from '@auth0/auth0-react';
import * as Sentry from "@sentry/react";

export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const callApi = async (url, options = {}) => {
    try {
      // Check authentication status
      if (!isAuthenticated) {
        console.warn("User is not authenticated");
        throw new Error("User not authenticated");
      }

      console.log("About to request token...");
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
          scope: 'openid profile email'
        }
      });
      
      console.log("Token retrieved:", !!token);

      // Create headers properly
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      console.log('Auth header present:', !!headers.Authorization);
      
      // Determine the full URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';
      const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
      console.log("Calling API at:", fullUrl);

      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error ${response.status}:`, errorText);
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