import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { ShopProvider } from './pages/ShopHomePage/ShopContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppConfigProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AppConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
