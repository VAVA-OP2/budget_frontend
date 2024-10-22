import { supabase } from '/supabaseClient';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Calculations from './Calculations';


export default function FetchUsersInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (userInfo) {
    getCategories();
    }
  }, [userInfo]);

  const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser(); 
  console.log("Fetched user:", user);
  setUserInfo(user);
}

  const getCategories = async () => {
  const { data } = await supabase
    .from('category')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userInfo.id}`)
      
    console.log(data);
    setCategories(data);
}


  // Tarkistetaan, että userInfo ja categories ovat ladattu ennen komponenttien renderöintiä
  if (!userInfo || categories.length === 0) {
    return <p>Loading user info and categories...</p>;
  }

  return (
    <div>

{/* <h1>Welcome to the Home Page</h1> */}
      <div style={{ marginTop: '20px', float: 'right' }}>
        {userInfo ? <p>Logged in as: {userInfo.email}</p> : <p>Loading...</p>}
      </div>

        <Calculations categories={categories} userInfo={userInfo} />
       
      {/* Tulon lisääminen uuden sivun kautta*/}

        <Link to="/addTransaction" state={{userInfo, categories}}>
            <button className="add-button">
            +
            </button>
      </Link>

    <Link to="/statistics" state={{ userInfo, categories }}>
        <button className="statistics-button">
          Statistics
        </button>

        
      </Link> 
      
      
    </div>
  );
}
