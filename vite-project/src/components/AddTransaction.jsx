import { useLocation } from "react-router-dom";
import { supabase } from "/supabaseClient";
import { useState } from "react";

export default function AddTransaction() {
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customLimit, setCustomLimit] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

    const today = new Date();
    const formattedToday = today.toISOString();

   

  let { state } = useLocation();
  // toimii vähän kuin props mutta <Link to=""> -komponentin kanssa

  const addIncome = async () => {
    // tarkistus vain numeroille syöttökenttään
    if (isNaN(incomeAmount) || incomeAmount.trim() === "") {
      alert("Please enter a valid number for income.");
      return;
    }

    const { data, error } = await supabase
    .from("income")
    .insert([{
        amount: parseFloat(incomeAmount),
        user_id: state.userInfo.id,
        date_added: formattedToday,
      }])
    if (error) {
      console.error(error);
      alert("Error adding income. Please try again.");
    } else {
      alert("Income added successfully!");
      setIncomeAmount(""); // Tyhjennetään syöttökenttä
    }
  };


  const addExpense = async () => {
    if (isNaN(expenseAmount) || expenseAmount.trim() === "") {
      alert("Please enter a valid number for expense.");
      return;
    }

    let finalCategoryId = selectedCategoryId;

    if (selectedCategoryId === "custom") {
      if (customCategory.trim() === "" || customLimit.trim() === "") {
        alert("Please enter a custom category and limit");
        return;
      }

      // Lisää uuden kategorian ja varmista, että se onnistuu
      const { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .insert([
          {
            categoryname: customCategory,
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
      setCustomCategory("");
      setShowCustomCategory(false);
    }
  }

  // Tekstikenttä tulee näkyviin jos valitaan "other"
  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCategoryId(selectedValue);

    if (selectedValue === "custom") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
    }
  };

  return (
    <div>
      <h3>Add Income</h3>

      <input
        type="text"
        placeholder="Enter your income amount"
        value={incomeAmount}
        onChange={(e) => setIncomeAmount(e.target.value)}
        className="input-field"
      />

      <button onClick={addIncome} style={{ padding: "10px", width: "100%" }}>
        Add Income
      </button>

      <div>
        <h3>Add Expense</h3>

        <input
          type="text"
          placeholder="Enter your expense amount"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          className="input-field"
        />
        <select
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          className="input-field"
        >
          <option value="">Select Category</option>
          {state.categories.map((category) => (
            <option key={category.categoryid} value={category.categoryid}>
              {category.categoryname} (Limit: {category.categoryLimit} €)
            </option>
          ))}
          <option value="custom">Other</option>
        </select>

        {showCustomCategory && ( // Näytetään tekstikenttä, jos "other" on valittu
          <div>
            <label>Add your category:</label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter your category"
              className="input-field"
            />

            <input
              type="text"
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              placeholder="Enter category limit"
              className="input-field"
            />
          </div>
        )}

        <button onClick={addExpense} style={{ padding: "10px", width: "100%" }}>
          Add Expense
        </button>
      </div>
    </div>
  );
}
