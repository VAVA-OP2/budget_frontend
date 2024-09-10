import React, { useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Home from './components/Home';
import Statistics from './components/Statistics';
import Auth from './components/Auth';

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <App isAuthenticated={isAuthenticated} />, 
      children: [
        {
          path: '/',
          element: <Auth setIsAuthenticated={setIsAuthenticated} />,
          index: true, 
        },
        {
          path: 'home',
          element: isAuthenticated ? <Home /> : <Auth setIsAuthenticated={setIsAuthenticated} />,
        },
        {
          path: 'statistics',
          element: isAuthenticated ? <Statistics /> : <Auth setIsAuthenticated={setIsAuthenticated} />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
