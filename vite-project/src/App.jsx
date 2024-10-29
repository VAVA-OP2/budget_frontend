import { Link, Outlet } from 'react-router-dom';
import './styles.css';

function App({ isAuthenticated }) {
  return (
    <div className='App'>
      
      {isAuthenticated && (
        <>
          <div className="header-container">
            <Link to="/home">
            <img 
              src="./vava-favicon-color.png" 
              alt="Vava Logo" 
              className="logo"
            />
            </Link>
            <h1 className="header">Vava Budget</h1>
          </div>
        </>
      )}
      
      <Outlet />
    </div>
  );
}

export default App;
