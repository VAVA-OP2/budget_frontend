import React, { useState, useEffect } from 'react';
import { supabase } from '/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState(''); // Tulojen määrä
  const [expenseAmount, setExpenseAmount] = useState(''); // Menojen määrä
  const [totalIncome, setTotalIncome] = useState(0); // Tulojen summa
  const [totalExpense, setTotalExpense] = useState(0); // Menojen summa
  const [balance, setBalance] = useState(0); // Tulojen ja menojen erotus
  const [expensesByCategory, setExpensesByCategory] = useState({}); // Menot kategorioittain
  const [categories, setCategories] = useState([]); // Kategoriat dropdownille, tallennettu pari kategoriaa valmiiks supaan.
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // Valittu kategoria menolle
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        fetchTotals(data.session.user.id); // Hae käyttäjän tulojen ja menojen yhteissummat
        fetchCategories(); // Haekee kategoriat eli siel nyt valmiiks food ja shopping
      } else {
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);
0
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('category').select('*');
      if (error) throw error;
      setCategories(data); // Tallenna kategoriat tilaan
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  const fetchTotals = async (userId) => {
    try {
      // Hae käyttäjän tulot
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('amount')
        .eq('user_id', userId);

      if (incomeError) throw incomeError;

      const totalIncome = incomeData.reduce((acc, income) => acc + parseFloat(income.amount), 0);
      setTotalIncome(totalIncome);

      // Hae käyttäjän menot ja niihin liittyvät kategoriat
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense')
        .select(`
          amount,
          category:categoryid (categoryname)  -- Hae menot ja kategoriat yhdistämällä categoryid viittaukseen
        `)
        .eq('user_id', userId);

      if (expenseError) throw expenseError;

      // Ryhmittele menot kategorioittain ja laske yhteissummat
      const groupedExpenses = expenseData.reduce((acc, expense) => {
        const categoryName = expense.category ? expense.category.categoryname : 'No Category';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += parseFloat(expense.amount);
        return acc;
      }, {});

      setExpensesByCategory(groupedExpenses);

      // Laske kokonaismenot
      const totalExpense = Object.values(groupedExpenses).reduce((acc, amount) => acc + amount, 0);
      setTotalExpense(totalExpense);

      // tulojen ja menojen erotus
      setBalance(totalIncome - totalExpense);

    } catch (error) {
      console.error('Error fetching totals:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  // Funktio tulojen tallentamiseen Supabaseen
  const addIncome = async () => {
    if (incomeAmount === '' || isNaN(incomeAmount)) {
      alert('Please enter a valid income amount');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('income')
        .insert([{ 
          amount: parseFloat(incomeAmount), 
          user_id: user.id, // Tallennetaan kirjautuneen käyttäjän ID
        }]);

      if (error) throw error;

      alert('Income added successfully!');
      setIncomeAmount(''); // Tyhjennä kenttä tallennuksen jälkeen
      fetchTotals(user.id); // Päivitä yhteissummat lisäyksen jälkeen
    } catch (error) {
      console.error('Error adding income:', error.message);
      alert('Error adding income');
    }
  };

  // Funktio menojen tallentamiseen Supabaseen
  const addExpense = async () => {
    if (expenseAmount === '' || isNaN(expenseAmount) || selectedCategoryId === '') {
      alert('Please enter a valid expense amount and select a category');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expense')
        .insert([{ 
          amount: parseFloat(expenseAmount), 
          user_id: user.id, // Tallennetaan kirjautuneen käyttäjän ID
          categoryid: selectedCategoryId // Tallennetaan valittu kategoria
        }]);

      if (error) throw error;

      alert('Expense added successfully!');
      setExpenseAmount(''); // Tyhjennä kenttä tallennuksen jälkeen
      setSelectedCategoryId(''); // Tyhjennä kategoriavalinta
      fetchTotals(user.id); // Päivitä yhteissummat lisäyksen jälkeen
    } catch (error) {
      console.error('Error adding expense:', error.message);
      alert('Error adding expense');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome to Home Page</h1>
      {user ? <p>Logged in as: {user.email}</p> : <p>Loading...</p>}

      <div style={{ marginTop: '20px' }}>
        <h3>Add Income</h3>
        <input
          type="text"
          placeholder="Enter your income amount"
          value={incomeAmount}
          onChange={(e) => setIncomeAmount(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        />
        <button onClick={addIncome} style={{ padding: '10px', width: '100%' }}>
          Add Income
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Add Expense</h3>
        <input
          type="text"
          placeholder="Enter your expense amount"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        />

        {/* Dropdown kategorioille */}
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.categoryid} value={category.categoryid}>
              {category.categoryname}
            </option>
          ))}
        </select>

        <button onClick={addExpense} style={{ padding: '10px', width: '100%' }}>
          Add Expense
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Total Income: {totalIncome} €</h3>
        <h3>Total Expense: {totalExpense} €</h3>
        <h3>Balance: {balance} €</h3>

        <h3>Your Expenses by Category</h3>
        <ul>
          {Object.entries(expensesByCategory).map(([categoryName, totalAmount], index) => (
            <li key={index}>
              {categoryName}: {totalAmount} €
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Log Out
      </button>
    </div>
  );
};

export default Home;
