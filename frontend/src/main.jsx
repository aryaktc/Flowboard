import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F1F5F9',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: {
                primary: '#22D3EE',
                secondary: '#1E293B',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#1E293B',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
