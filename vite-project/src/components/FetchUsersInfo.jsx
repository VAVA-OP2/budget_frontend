import { supabase } from '/supabaseClient';
import { useState, useEffect } from 'react';
import Home2 from './Home2';
import { Link } from 'react-router-dom';

export default function FetchUsersInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getUser();
    getCategories();
  }, []);

  const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser(); 
  console.log("Fetched user:", user);
  setUserInfo(user);
}

  const getCategories = async () => {
  const { data } = await supabase
    .from('category')
    .select('*');
  console.log("Fetched categories:", data); // Debuggaus
  setCategories(data);
}


  // Tarkistetaan, että userInfo ja categories ovat ladattu ennen komponenttien renderöintiä
  if (!userInfo || categories.length === 0) {
    return <p>Loading user info and categories...</p>;
  }

  return (
    <div>
      <div style={{ marginTop: '20px' }}>
        {userInfo ? <p>Logged in as: {userInfo.email}</p> : <p>Loading...</p>}
      </div>

      {/* Varmistetaan, että userInfo ja categories välitetään oikein */}
      <Home2 categories={categories} userInfo={userInfo} />
      
      
      {/* Tulon lisääminen uuden sivun kautta */}
      <Link to="/addTransaction" state={{ userInfo, categories }}>
        <button style={{
          padding: '5px 15px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '24px',
          cursor: 'pointer'
        }}>
          +
        </button>

        
      </Link>

    <Link to="/statistics" state={{ userInfo, categories }}>
        <button style={{
          padding: '5px 15px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '24px',
          cursor: 'pointer'
        }}>
          Statistics
        </button>

        
      </Link> 
      
      
    </div>
  );
}
