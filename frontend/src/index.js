import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.js';
import theme from './styles/theme.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

console.log('Domain:', process.env.REACT_APP_AUTH0_DOMAIN);
console.log('Client ID:', process.env.REACT_APP_AUTH0_CLIENT_ID);

root.render(
<Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: `${window.location.origin}/callback`,
      audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
      scope: 'openid profile email offline_access'
    }}
    cacheLocation="localstorage"  // Add this
    useRefreshTokens={true}       // Add this
    onRedirectCallback={(appState) => {
      window.history.replaceState(
        {},
        document.title,
        appState?.returnTo || window.location.pathname
      );
    }}
>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </Auth0Provider>
);


