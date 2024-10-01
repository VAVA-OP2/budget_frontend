import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';

function App({ isAuthenticated }) {
    const [userInfo, setUserInfo] = useState(null);
    const [categories, setCategories] = useState([]);

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
                            <Link to="/statistics" state={{ userInfo, categories }}  style={{ color: 'black' }}>Statistics</Link>
                        </button>{" "}
                    </nav>
                </>
            )}
            <Outlet context={{ setUserInfo, setCategories }} />
        </div>
    );
}

export default App;
