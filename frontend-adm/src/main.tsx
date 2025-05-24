import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import './index.css';
import App from './App.tsx';

console.log("Supabase config:", {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  currentOrigin: window.location.origin
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SupabaseAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SupabaseAuthProvider>
  </React.StrictMode>
);
