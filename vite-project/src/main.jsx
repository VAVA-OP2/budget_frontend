import { useState } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Statistics from './components/Statistics';
import Auth from './components/Auth';
import AddTransaction from './components/AddTransaction';
import FetchUsersInfo from './components/FetchUsersInfo';
import SavingsPage from './components/SavingsPage';
import OpenAITest from './components/OpenAITest';
import HelloTest from './components/HelloTest';

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
          path="/home"
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
        <Route
          path="/savings"
          element={isAuthenticated ? <SavingsPage /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route
          path="/openai-test"
          element={isAuthenticated ? <OpenAITest /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
        />

<Route
          path="/hello-test"
          element={isAuthenticated ? <HelloTest /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
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
