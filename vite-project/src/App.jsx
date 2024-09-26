import { Link, Outlet } from 'react-router-dom';


function App({ isAuthenticated }) {
  return (
    <div className='App'>
      
      {isAuthenticated && (
        <>
          <h1>Vava Budget</h1>
          <nav>
            <button>
              <Link to="/home2" style={{ color: 'black' }}>Home</Link>
            </button>{" "}
            <button>
              <Link to="/statistics" style={{ color: 'black' }}>Statistics</Link>
            </button>{" "}
          </nav>
        </>
      )}
      
      <Outlet />
    </div>
  );
}

export default App;
