// src/hooks/useApi.js
import { useAuth0 } from '@auth0/auth0-react';

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
      
      // Create a new headers object instead of spreading existing headers
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
        const error = await response.text();
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return { callApi };
};

export default useApi;