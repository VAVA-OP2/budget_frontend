import React, { useState, useEffect } from 'react';
import { supabase } from '/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        fetchTotals(data.session.user.id);
        fetchCategories();
      } else {
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);
  0
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('category').select('categoryid, categoryname, categoryLimit');
      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  const fetchTotals = async (userId) => {
    try {
      // Fetch income data and calculate total income using forEach
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('amount')
        .eq('user_id', userId);

      if (incomeError) throw incomeError;

      let totalIncome = 0;
      incomeData.forEach((income) => {
        totalIncome += parseFloat(income.amount);
      });
      setTotalIncome(totalIncome);

      // Fetch expense data and group them by category using forEach
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense')
        .select(`
          amount,
          category:categoryid (categoryname)
        `)
        .eq('user_id', userId);

      if (expenseError) throw expenseError;

      const groupedExpenses = {};
      expenseData.forEach((expense) => {
        const categoryName = expense.category ? expense.category.categoryname : 'No Category';
        if (!groupedExpenses[categoryName]) {
          groupedExpenses[categoryName] = 0;
        }
        groupedExpenses[categoryName] += parseFloat(expense.amount);
      });

      setExpensesByCategory(groupedExpenses);

      // Calculate total expenses
      let totalExpense = 0;
      Object.values(groupedExpenses).forEach((amount) => {
        totalExpense += amount;
      });
      setTotalExpense(totalExpense);

      // Calculate balance
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
          user_id: user.id,
        }]);

      if (error) throw error;

      alert('Income added successfully!');
      setIncomeAmount('');
      fetchTotals(user.id);
    } catch (error) {
      console.error('Error adding income:', error.message);
      alert('Error adding income');
    }
  };

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
          user_id: user.id,
          categoryid: selectedCategoryId
        }]);

      if (error) throw error;

      alert('Expense added successfully!');
      setExpenseAmount('');
      setSelectedCategoryId('');
      fetchTotals(user.id);
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

        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.categoryid} value={category.categoryid}>
              {category.categoryname} (Limit: {category.categoryLimit} €)
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

        <h3>Category Limits</h3>
        <ul>
          {categories.map((category) => (
            <li key={category.categoryid}>
              {category.categoryname}: {category.categoryLimit} €
            </li>
          ))}

        </ul>

        <h3>Remaining Budget Limit</h3>
        <ul>
          {categories.map((category) => {
            const totalSpent = expensesByCategory[category.categoryname]
            const remainingBudget = category.categoryLimit - totalSpent; 

            return (
              <li key={category.categoryid}>
                {category.categoryname}:  {remainingBudget} €
              </li>
            );
          })}
        </ul>

      </div>

      <Link to="/addTransaction">
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

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Log Out
      </button>

    </div>

  );
};

export default Home;
