import { useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Statistics from './components/Statistics';
import Auth from './components/Auth';
import AddTransaction from './components/AddTransaction';
import Home2 from './components/Home2';
import FetchUsersInfo from './components/FetchUsersInfo';

const AppWrapper = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <App isAuthenticated={isAuthenticated} />
      <Routes>
        {/* Määritellään reititykset HashRouterissa */}
        <Route
          path="/"
          element={<Auth setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/home2"
          element={isAuthenticated ? <FetchUsersInfo /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/statistics"
          element={isAuthenticated ? <Statistics /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/addTransaction"
          element={isAuthenticated ? <AddTransaction /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
