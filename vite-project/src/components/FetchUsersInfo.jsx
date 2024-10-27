import { supabase } from '/supabaseClient';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Calculations from './Calculations';

export default function FetchUsersInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [savings, setSavings] = useState({ current_savings: 0, goal_amount: 0 });
  const [totalAddedSavings, setTotalAddedSavings] = useState(0); // New: total of all added amounts
  

  //Kaksi peräkkäistä useEffectiä, haetaan ensin userInfo ja sen jälkeen kategoriat.
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (userInfo) {
      getCategories();
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      getCurrentSavingsAndSavedGoal();
      calculateTotalAddedSavings(); // Fetch and calculate all added amounts
    }
  }, [userInfo]);

  // Käyttäjän ja tietojen haku
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("Fetched user:", user);
    setUserInfo(user);
  };

  const getCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*');
    console.log("Fetched categories:", data);
    setCategories(data);
  };

  const getCurrentSavingsAndSavedGoal = async () => {
    const { data } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userInfo.id); // Käyttäjän ID suodatus

    if (data && data.length > 0) {
      const { current_savings, goal_amount } = data[0];
      setSavings({ current_savings, goal_amount });
      console.log("Fetched savings: ", data);
    }
  };

  // New: Calculate the total of all added savings amounts
  const calculateTotalAddedSavings = async () => {
    const { data: logData, error } = await supabase
        .from('savings_log')
        .select('amount')
        .eq('user_id', userInfo.id);

    if (error) {
        console.error('Error fetching savings log:', error);
    } else if (logData) {
        const total = logData.reduce((sum, entry) => sum + entry.amount, 0);
        setTotalAddedSavings(total); // Set the total added amount
    }
};

  // Tarkistetaan, että userInfo ja categories ovat ladattu ennen komponenttien renderöintiä
  if (!userInfo || categories.length === 0) {
    return <p>Loading user info and categories...</p>;
  }

  return (
    <div>
      <div style={{ marginTop: '20px', float: 'right' }}>
        {userInfo ? <p>Logged in as: {userInfo.email}</p> : <p>Loading...</p>}
      </div>

      <Calculations categories={categories} userInfo={userInfo} />

      
      <div>
        <h2>Savings Information</h2>
        <p>Current Savings: {totalAddedSavings} €</p> {/* Updated to show the sum of all added amounts */}
        <p>Savings Goal: {savings.goal_amount} €</p>
      </div>

      {/* Tulon lisääminen uuden sivun kautta */}
      <Link to="/addTransaction" state={{ userInfo, categories }}>
        <button className="add-button">+</button>
      </Link>

      <Link to="/statistics" state={{ userInfo, categories }}>
        <button className="statistics-button">Statistics</button>
      </Link>

      {/* Uusi Savings-painike, joka ohjaa SavingsPage-sivulle */}
      <Link to="/savings" state={{ userInfo }}>
        <button className="savings-button">Go to savings</button>
      </Link>
    </div>
  );
}
