import { supabase } from "/supabaseClient";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calculations from "./Calculations";

export default function FetchUsersInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [savings, setSavings] = useState({
    current_savings: 0,
    goal_amount: 0,
  });
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
    // console.log("Fetched user:", user);
    setUserInfo(user);
  };

  const getCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userInfo.id}`)
    // console.log("Fetched categories:", data);
    setCategories(data);
  };

  const getCurrentSavingsAndSavedGoal = async () => {
    const { data } = await supabase
      .from("savings")
      .select("*")
      .eq("user_id", userInfo.id); // Käyttäjän ID suodatus

    if (data && data.length > 0) {
      const { current_savings, goal_amount } = data[0];
      setSavings({ current_savings, goal_amount });
      // console.log("Fetched savings: ", data);
    }
  };

  const calculateTotalAddedSavings = async () => {
    const { data: logData, error } = await supabase
      .from("savings_log")
      .select("amount")
      .eq("user_id", userInfo.id);

    if (error) {
      console.error("Error fetching savings log:", error);
    } else if (logData) {
      const total = logData.reduce((sum, entry) => sum + entry.amount, 0);
      setTotalAddedSavings(total); // Set the total added amount
    }
  };

  // Tarkistetaan, että userInfo ja categories ovat ladattu ennen komponenttien renderöintiä
  if (!userInfo || categories.length === 0) {
    return <p className="home_content-aligned_left">Loading user info and categories...</p>;
  }

  // käyttäjän uloskirjautuminen
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // setUser(null);
    setTotalExpense(0);
    setTotalIncome(0);
    setBalance(0);

    // https://reactrouter.com/en/main/hooks/use-navigate
    navigate("/");
  };

  return (
    <div>
      <div className="loggedin_aligned">
        {userInfo ? <p>Logged in as: {userInfo.email}</p> : <p>Loading...</p>}
        <button onClick={handleLogout} className="logout_button_align">
        Log Out
      </button>
      </div>

      <Calculations categories={categories} userInfo={userInfo} />

      
      <div className="home_content-aligned_left">
        <h2>Savings Information</h2>
        <p>Current Savings: {totalAddedSavings} €</p>
        <p>Savings Goal: {savings.goal_amount} €</p>
        {/* Uusi Savings-painike, joka ohjaa SavingsPage-sivulle */}
        <Link to="/savings" state={{ userInfo }}>
          <button className="savings-button">Go to savings</button>
        </Link>
      </div>

      {/* Tulon lisääminen uuden sivun kautta */}
      <Link to="/addTransaction" state={{ userInfo, categories }}>
        <button className="add-button">+</button>
      </Link>

      <Link to="/statistics" state={{ userInfo, categories }}>
        <button className="statistics-button">Statistics</button>
      </Link>

      
    </div>
  );
}
