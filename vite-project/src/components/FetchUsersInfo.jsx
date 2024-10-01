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
        setUserInfo(user);
      }

    const getCategories = async () => {
        const { data } = await supabase
        .from('category')
        .select('*')
      setCategories(data);
    }  


    return (

        <div>
            

        <div style={{ marginTop: '20px' }}>
        {userInfo ? <p>Logged in as: {userInfo.email}</p> : <p>Loading...</p>}
            
        </div>

        <Home2 categories={categories} userInfo={userInfo} />
       
      {/* Tulon lisääminen uuden sivun kautta*/}

        <Link to="/addTransaction" state={{userInfo, categories}}>
            <button className="add-button">
            +
            </button>
      </Link>

        </div>

        
    );

}
