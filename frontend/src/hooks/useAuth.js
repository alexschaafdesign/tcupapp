// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getSupabaseClient } from '../lib/supabaseClient';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    getAccessTokenSilently 
  } = useAuth0();
  const [supabaseReady, setSupabaseReady] = useState(false);

    // Add debugging logs here
    console.log('Auth0 user object:', user);
    console.log('Roles namespace check:', user?.['https://tcupboard.org/roles']);
  
  // Role utilities
  const userRoles = user?.['https://tcupboard.org/roles'] || [];
  console.log('Extracted roles:', userRoles);

  const isAdmin = userRoles.includes('admin');
  const isModerator = userRoles.includes('moderator');
  const isContributor = userRoles.includes('contributor');
  const hasRole = (role) => userRoles.includes(role);

  useEffect(() => {
    if (isAuthenticated) {
      const updateToken = async () => {
        try {
          const token = await getAccessTokenSilently();
          console.log('Got Auth0 token:', token.slice(0, 20) + '...');
          
          // Use getSupabaseClient instead of setSupabaseToken
          const client = getSupabaseClient(token);
          // Test connection to verify it works
          const { data, error } = await client.from('forum_messages').select('id').limit(1);
          
          setSupabaseReady(!error);
          
          if (error) {
            console.error('Failed to establish Supabase session:', error);
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
    getAccessTokenSilently,
    // Add role-related properties
    userRoles,
    isAdmin,
    isModerator,
    isContributor,
    hasRole
  };
};