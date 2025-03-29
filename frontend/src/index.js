import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.js';
import theme from './styles/theme.js';
import * as Sentry from "@sentry/react";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';



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
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.5,
  tracePropagationTargets: ["localhost", /^https:\/\/tcupboard\.org\/api/, /^https:\/\/tcupmn\.org\/api/],
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
});

// Determine environment
let currentEnv = process.env.REACT_APP_APP_ENV || process.env.NODE_ENV;
console.log('Current environment:', currentEnv);

// Get the current origin
const currentOrigin = window.location.origin;
console.log('Current origin:', currentOrigin);

// Set URLs based on actual origin when possible
let redirectUri = `${currentOrigin}/callback`;
let logoutReturnTo = currentOrigin;

// Override with environment-specific values if needed
if (currentEnv === 'staging') {
  redirectUri = 'https://staging.tcupboard.org/callback';
  logoutReturnTo = 'https://staging.tcupboard.org';
} else if (currentEnv === 'production') {
  redirectUri = 'https://tcupboard.org/callback';
  logoutReturnTo = 'https://tcupboard.org';
}

console.log('Redirect URI:', redirectUri);
console.log('Logout Return To:', logoutReturnTo);
console.log('Auth0 Domain:', process.env.REACT_APP_AUTH0_DOMAIN);
console.log('Auth0 Client ID:', process.env.REACT_APP_AUTH0_CLIENT_ID);

const root = ReactDOM.createRoot(document.getElementById('root'));

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
      returnTo: logoutReturnTo
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

serviceWorkerRegistration.register({
  swSrc: 'custom-service-worker.js'
});
localStorage.removeItem('new_pwa_notice_shown');


