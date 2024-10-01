import { Link, Outlet } from 'react-router-dom';
import './styles.css';

function App({ isAuthenticated }) {
  return (
    <div className='App'>
      
      {isAuthenticated && (
        <>
          <div className="header-container">
            <img 
              src="./vava-favicon-color.png" 
              alt="Vava Logo" 
              className="logo"
            />
            <h1 className="header">Vava Budget</h1>
          </div>
          <nav>
            <button style={{ marginRight: '16px' }}>
              <Link to="/home" style={{ color: 'black' }}>Home</Link>
            </button>{" "}
            
          </nav>
        </>
      )}
      
      <Outlet />
    </div>
  );
}

export default App;
