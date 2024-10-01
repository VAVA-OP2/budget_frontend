import { Link, Outlet } from 'react-router-dom';
import './styles.css';

function App({ isAuthenticated }) {
    

    return (
        <div className='App'>
            {isAuthenticated && (
                <>
                    <h1 className="header">Vava Budget</h1>
                    <nav>
                        <button style={{ marginRight: '16px' }}>
                            <Link to="/home2" style={{ color: 'black' }}>Home</Link>
                        </button>{" "}
                        
                    </nav>
                </>
            )}
            <Outlet />
        </div>
    );
}

export default App;
