import { useLocation } from "react-router-dom";
import { supabase } from "/supabaseClient";
import { useState } from "react";

export default function AddTransaction() {
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [selectedExpenseCategoryId, setSelectedExpenseCategoryId] = useState("");
  const [selectedIncomeCategoryId, setSelectedIncomeCategoryId] = useState();

  const [customExpenseCategory, setCustomExpenseCategory] = useState("");
  const [customIncomeCategory, setCustomIncomeCategory] = useState("");
  
  const [customLimit, setCustomLimit] = useState("");
  
  const [showCustomCategory, setShowCustomExpenseCategory] = useState(false);
  const [showCustomIncomeCategory, setShowCustomIncomeCategory] = useState(false);

  const today = new Date();
  const formattedToday = today.toISOString();

   

  let { state } = useLocation();
  // toimii vähän kuin props mutta <Link to=""> -komponentin kanssa

  const addIncome = async () => {
    if (isNaN(incomeAmount) || incomeAmount.trim() === "") {
      alert("Please enter a valid number for income.");
      return;
    }

    let finalCategoryId = selectedIncomeCategoryId;
    console.log("Final alussa: ", finalCategoryId);

    if (selectedIncomeCategoryId === "customIncome") {
      if (customIncomeCategory.trim() === "") {
        alert("Please enter a custom category.");
        return;
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('incomeCategory')
        .insert([
          {
            categoryname: customIncomeCategory,
            user_id: state.userInfo.id,
          },
        ])
        .select();

        if (categoryError) {
          console.error(categoryError);
          alert('Error adding new category. Please try again.');
          return;
        }

        if (categoryData && categoryData.length > 0) {
          finalCategoryId = categoryData[0].categoryid;
          console.log("Final id lopussa: ", finalCategoryId);
        } else {
          alert("Error adding new category Id.");
          return;
        }
    }
    console.log("Final id tuloa lisätessä: ", finalCategoryId);
    const { data: incomeData, error } = await supabase
    .from("income")
    .insert([{
        amount: parseFloat(incomeAmount),
        categoryid: finalCategoryId,
        user_id: state.userInfo.id,
        date_added: formattedToday,
      }])
    if (error) {
      console.error(error);
      alert("Error adding income. Please try again.");
    } else {
      alert("Income added successfully!");
      setIncomeAmount(""); // Tyhjennetään syöttökenttä
      setCustomIncomeCategory("");
      setShowCustomIncomeCategory(false);
    }
  };


  const addExpense = async () => {
    if (isNaN(expenseAmount) || expenseAmount.trim() === "") {
      alert("Please enter a valid number for expense.");
      return;
    }

    let finalCategoryId = selectedExpenseCategoryId;

    if (selectedExpenseCategoryId === "custom") {
      if (customExpenseCategory.trim() === "" || customLimit.trim() === "") {
        alert("Please enter a custom category and limit");
        return;
      }

      // Lisää uuden kategorian ja varmista, että se onnistuu
      const { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .insert([
          {
            categoryname: customExpenseCategory,
            categoryLimit: parseFloat(customLimit),
            user_id: state.userInfo.id,
          },
        ])
        .select();

      if (categoryError) {
        console.error(categoryError);
        alert("Error adding new category. Please try again.");
        return;
      }

      if (categoryData && categoryData.length > 0) {
        finalCategoryId = categoryData[0].categoryid;

      } else {
        alert("Error add new category ID.");
        return;
      }
    }

    // Lisää menon expense tauluun uudella categoryid:llä
    const { data: expenseData, error: expenseError } = await supabase
      .from("expense")
      .insert([
        {
          amount: parseFloat(expenseAmount),
          categoryid: finalCategoryId,
          user_id: state.userInfo.id,
          date_added: formattedToday,
        },
      ]);

    if (expenseError) {
      console.error(expenseError);
      alert("Error adding expense. Please try again.");
    } else {
      alert("Expense added successfully!");
      setExpenseAmount("");
      setCustomExpenseCategory("");
      setShowCustomExpenseCategory(false);
    }
  }

  // Tekstikenttä tulee näkyviin jos valitaan "other"
  const handleExpenseCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedExpenseCategoryId(selectedValue);
    if (selectedValue === "custom") {
      setShowCustomExpenseCategory(true);
    } else {
      setShowCustomExpenseCategory(false);
    }
  };

  const handleIncomeCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedIncomeCategoryId(selectedValue);
    if (selectedValue === "customIncome") {
      setShowCustomIncomeCategory(true);
    } else {
      setShowCustomIncomeCategory(false);
    }
  };


  return (
    <div className="add-transa-container">
      <h3>Add Income</h3>

      <input
          type="text"
          placeholder="Enter your income amount"
          value={incomeAmount}
          onChange={(e) => setIncomeAmount(e.target.value)}
          className="input-field-add"
        />
        <select
          value={selectedIncomeCategoryId}
          onChange={handleIncomeCategoryChange}
          className="input-field-add"
        >
          <option value="">Select Category</option>
          {state.incomeCategories.map((category) => (
            <option key={category.categoryid} value={category.categoryid}>
              {category.categoryname}
            </option>
          ))}
          <option value="customIncome">Other</option>
        </select>

      {showCustomIncomeCategory && ( // Näytetään tekstikenttä, jos "other" on valittu
          <div className="add-transa-container">
            <label>Add your category:</label>
            <input
              type="text"
              value={customIncomeCategory}
              onChange={(e) => setCustomIncomeCategory(e.target.value)}
              placeholder="Enter your category"
              className="input-field-add"
            />
          </div>
        )}

      <button onClick={addIncome} className="add-transa-button">
        Add Income
      </button>

      <div className="add-transa-container">
        <h3>Add  Expense</h3>

        <input
          type="text"
          placeholder="Enter your expense amount"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          className="input-field-add"
        />
        <select
          value={selectedExpenseCategoryId}
          onChange={handleExpenseCategoryChange}
          className="input-field-add"
        >
          <option value="">Select Category</option>
          {state.expenseCategories.map((category) => (
            <option key={category.categoryid} value={category.categoryid}>
              {category.categoryname} (Limit: {category.categoryLimit} €)
            </option>
          ))}
          <option value="custom">Other</option>
        </select>

        {showCustomCategory && ( // Näytetään tekstikenttä, jos "other" on valittu
          <div className="add-transa-container">
            <label>Add your category:</label>
            <input
              type="text"
              value={customExpenseCategory}
              onChange={(e) => setCustomExpenseCategory(e.target.value)}
              placeholder="Enter your category"
              className="input-field-add"
            />

            <input
              type="text"
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              placeholder="Enter category limit"
              className="input-field-add"
            />
          </div>
        )}

        <button onClick={addExpense} className="add-transa-button">
          Add Expense
        </button>
      </div>
    </div>
  );
}
