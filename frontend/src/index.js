import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.js';
import theme from './styles/theme.js';
import * as Sentry from "@sentry/react";

// Disable React's default error overlay in development mode
if (process.env.NODE_ENV === "development") {
  window.addEventListener("error", (event) => {
    event.preventDefault();
  });
}


// Initialize Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Adjust tracing and session replay for better debugging
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.5,
  tracePropagationTargets: ["localhost", /^https:\/\/portal\.tcupboard\.org\/api/, /^https:\/\/tcupmn\.org\/api/],
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
});

const redirectUri = {
  development: 'http://localhost:3003/callback',
  staging: 'https://staging.tcupboard.org/callback',
  production: 'https://portal.tcupboard.org/callback'
}[process.env.REACT_APP_APP_ENV || process.env.NODE_ENV];

console.log('Environment:', process.env.REACT_APP_APP_ENV || process.env.NODE_ENV);


const root = ReactDOM.createRoot(document.getElementById('root'));

console.log('Domain:', process.env.REACT_APP_AUTH0_DOMAIN);
console.log('Client ID:', process.env.REACT_APP_AUTH0_CLIENT_ID);

root.render(
  <Auth0Provider
  domain={process.env.REACT_APP_AUTH0_DOMAIN}
  clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: redirectUri,
    audience: process.env.REACT_APP_AUTH0_API_IDENTIFIER,
    scope: 'openid profile email offline_access'
  }}
  logoutParams={{
    returnTo: window.location.origin
  }}
  cacheLocation="localstorage"
  useRefreshTokens={true}
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