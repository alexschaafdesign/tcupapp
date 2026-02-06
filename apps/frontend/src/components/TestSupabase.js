// src/components/TestSupabase.js
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getSupabaseClient } from '../lib/supabaseClient';

const TestSupabase = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Get fresh Auth0 token
      const token = await getAccessTokenSilently();
      console.log('Fresh Auth0 token obtained');

      // Create Supabase client with token
      const supabase = getSupabaseClient(token);
      
      // Try a simple query
      const { data, error } = await supabase
        .from('test_messages')
        .select('content')
        .limit(5);

      console.log('Query response:', { data, error });

      if (error) {
        setTestResult(`Query error: ${error.message}`);
        return;
      }

      setTestResult(
        `Success! Retrieved ${data?.length || 0} messages:\n` +
        (data || []).map(msg => `- ${msg.content}`).join('\n')
      );
    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Supabase Connection Test</h2>
      <div>
        <strong>Auth Status:</strong> {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
      </div>
      <button 
        onClick={testConnection}
        disabled={!isAuthenticated || loading}
        style={{
          padding: '8px 16px',
          margin: '16px 0',
          backgroundColor: !isAuthenticated ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: !isAuthenticated ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      {testResult && (
        <pre style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default TestSupabase;