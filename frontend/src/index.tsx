import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'; // Import Navigate
import { initializeIcons } from '@fluentui/react';

import Chat from './pages/chat/Chat';
import Layout from './pages/layout/Layout';
import NoPage from './pages/NoPage';
import { AppStateProvider } from './state/AppProvider';

import './index.css'

initializeIcons();

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/chat" replace />} /> {/* Redirect to /chat */}
            <Route path="chat" element={<Chat />} /> {/* Chat screen at /chat */}
            <Route path="*" element={<NoPage />} /> {/* Catch-all route */}
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
