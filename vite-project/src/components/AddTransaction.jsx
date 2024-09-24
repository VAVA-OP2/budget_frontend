import { useLocation } from 'react-router-dom';
import { supabase } from '/supabaseClient';
import { useState } from 'react';



export default function AddTransaction() {

    const [incomeAmount, setIncomeAmount] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    let { state } = useLocation();
    // toimii vähän kuin props mutta <Link> -komponentin kanssa

    const addIncome = async () => {
        const { data, error } = await supabase
        .from('income')
        .insert([{
            amount: parseFloat(incomeAmount),
            user_id: state.userInfo.id
            // vähän kuin props.userInfo.id
        }])
        setIncomeAmount('');
        if (error) {
        console.error(error);
        }

    // lasketaan lisäämisen jälkeen kaikki taulun tulot yhteen 
    // calculateTotalIncome();

  }


  const addExpense = async () => {
    const { data, error } = await supabase
      .from('expense')
      .insert([{
        amount: parseFloat(expenseAmount),
        categoryid: parseFloat(selectedCategoryId),
        user_id: state.userInfo.id
      }])
    setExpenseAmount('');
    if (error) {
      console.error(error);
    }

    // lasketaan lisäämisen jälkeen menot yhteen 
    // calculateTotalExpense();
    // await expensesByCategory();

  }

    return (
        <div>


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


            <div>
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
                {state.categories.map((category) => (
                    <option key={category.categoryid} value={category.categoryid}>
                    {category.categoryname} (Limit: {category.categoryLimit} €)
                    </option>
                ))}
                </select>

                <button onClick={addExpense} style={{ padding: '10px', width: '100%' }}>
                Add Expense
                </button>
</div>  
        </div>
    );
}