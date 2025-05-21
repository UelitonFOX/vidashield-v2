import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.tsx';

// Configurações Auth0
const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-uhfy4gh2szxayskh.us.auth0.com';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'FrJXkUPH1eWy2wwhesfn61PgEj0WmERH';
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'http://localhost:5000/api';
const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin + '/auth-callback';

// Handler melhorado para redirecionamento após login bem-sucedido
const onRedirectCallback = (appState: any) => {
  console.log("Auth0 redirect callback executado", appState);
  const targetUrl = appState?.returnTo || '/dashboard';
  window.location.href = targetUrl;
};

console.log("Auth0 config:", {
  domain,
  clientId,
  audience,
  redirectUri,
  currentOrigin: window.location.origin
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: "openid profile email"
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      skipRedirectCallback={window.location.pathname === '/logout'}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
