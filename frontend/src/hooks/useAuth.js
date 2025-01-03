// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setSupabaseToken } from '../lib/supabaseClient';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    getAccessTokenSilently 
  } = useAuth0();
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const updateToken = async () => {
        try {
          const token = await getAccessTokenSilently();
          console.log('Got Auth0 token:', token.slice(0, 20) + '...');
          
          const success = await setSupabaseToken(token);
          setSupabaseReady(success);
          
          if (!success) {
            console.error('Failed to establish Supabase session');
          }
        } catch (error) {
          console.error('Error updating token:', error);
          setSupabaseReady(false);
        }
      };

      updateToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return { 
    user, 
    isAuthenticated,
    supabaseReady,
    getAccessTokenSilently 
  };
};