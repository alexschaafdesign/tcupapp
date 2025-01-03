import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';

// XenforoAuth.js beginning
console.log('XENFORO_URL:', process.env.REACT_APP_XENFORO_URL);
console.log('CLIENT_ID:', process.env.REACT_APP_XENFORO_CLIENT_ID);

const XENFORO_URL = process.env.REACT_APP_XENFORO_URL;
const CLIENT_ID = process.env.REACT_APP_XENFORO_CLIENT_ID;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://portal.tcupboard.org/callback'
  : 'http://localhost:3002/callback';



  export const useXenforoAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      checkAuth();
    }, []);
  
    const checkAuth = async () => {
      const token = localStorage.getItem('xf_token');
      if (token) {
        try {
          const response = await fetch(`${XENFORO_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('xf_token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    const login = () => {
        const authUrl = `${XENFORO_URL}/index.php?oauth2/authorize` +
          `?client_id=${CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
          '&response_type=code' 
        
        window.location.href = authUrl;
      };
  
    const handleCallback = async (code) => {
        console.log('Callback received with code:', code);
        try {
          const response = await fetch('/index.php?api/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
          });
          console.log('Token response:', response);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Token data:', data);
            localStorage.setItem('xf_token', data.access_token);
            await checkAuth();
          }
        } catch (error) {
          console.error('Token exchange error:', error);
        }
      };
  
    const logout = () => {
      localStorage.removeItem('xf_token');
      setUser(null);
    };
  
    return { user, loading, login, logout, handleCallback };
  };
  
  // Protected Route Component
  export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useXenforoAuth();
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (!user) {
      return <Navigate to="/login" />;
    }
  
    return children;
  };
  

// Login Component Example
export const Login = () => {
    const { login } = useXenforoAuth();
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        p: 2
      }}>
        <h2>Login to TCupboard</h2>
        <button 
          onClick={login}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '16px'
          }}
        >
          Login with TCupboard
        </button>
      </Box>
    );
  };
