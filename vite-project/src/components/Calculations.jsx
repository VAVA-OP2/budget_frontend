import { useEffect, useState } from "react"
import { supabase } from '/supabaseClient';
import { useNavigate } from "react-router-dom";
import { resetIncome, resetExpense, resetDataByDates } from "./Reset";
import '../styles.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Calculations(props) {

  // lasketut tulojen ja menojen yhteissummat
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // saldo
  const [balance, setBalance] = useState(0);

  // menot jaettuina kategorioiden mukaan
  const [expenseByCategory, setExpenseByCategory] = useState({});
  const [expenseByCategoryWithDate, setExpenseByCategoryWithDate] = useState({});

  const [incomeByCategory, setIncomeByCategory] = useState({});
  const [incomeByCategoryWithDate, setIncomeByCategoryWithDate] = useState({});
  

  // react routerin navigate että uloskirjautuessa siirtyy takasin kirjautumissivulle
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [searchByDate, setSearchByDate] = useState(false);

  // jos haetaan päivämäärien perusteella tietoja, tallennetaan ne näihin tilamuuttujiin
  const [incomeByDate, setIncomeByDate] = useState(0);
  const [expensesByDate, setExpensesByDate] = useState(0);


  useEffect(() => {
       const getData = async () => {
        calculateBalance();
        expensesByCategory();
        getIncomeByCategories();
       }
      getTotals();
      getData();

      }, [props.userInfo, totalIncome, totalExpense, incomeByDate, expensesByDate, searchByDate]); // use effect suoritetaan aina uudestaan kun userinfo muuttuja muuttuu


  const getTotals = () => {
    calculateTotalExpense();
    calculateTotalIncome();
  }

  // Lasketaan saldo tulojen ja menojen perusteella
  const calculateBalance = () => {
    if (!searchByDate) {
      const currentBalance = totalIncome - totalExpense;
      setBalance(currentBalance);
    } else {
      const currentBalance = incomeByDate - expensesByDate;
      setBalance(currentBalance);
    }
  };

  // laskee käyttäjän lisäämät tulot yhteen: hakee ensin taulusta kaikki "amount" tiedot, joissa user_id vastaa kirjautuneen käyttäjän id -tietoa
  const calculateTotalIncome = async () => {
    const { data: income, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', props.userInfo.id)

    // lasketaan määrät yhteen
    let total = 0;

    income.forEach((a) => {
      // 'a' on {amount: 1}
      // 'a.amount' on '1'
      total += parseFloat(a.amount);
    });

    setTotalIncome(total);

  }



  // lasketaan menot yhteen
  // sama idea kuin tulojen yhteenlaskemisessa
  const calculateTotalExpense = async () => {
    const { data: expense, error } = await supabase
      .from('expense')
      .select('amount')
      .eq('user_id', props.userInfo.id)

    let total = 0;

    expense.forEach((a) => {
      // 'a' on {amount: 1}
      // 'a.amount' on 1
      total += parseFloat(a.amount);
    });

    setTotalExpense(total);
  }

  // getIncomeByCategories
  const getIncomeByCategories = async () => {
    const { data: income, error } = await supabase
      .from('income')
      .select('amount, categoryid')
      .eq('user_id', props.userInfo.id)

      const grouped = {};

      income.forEach((income) => {
        const categoryId = income.categoryid;

        if (!grouped[categoryId]) {
          grouped[categoryId] = 0;
        }

        grouped[categoryId] += parseFloat(income.amount);
      }); 
      setIncomeByCategory(grouped);
  }

  // getIncomeByCategoriesByDate
  const getIncomeByCategoriesByDate = async () => {
    const { data: income, error } = await supabase
      .from('income')
      .select('amount, categoryid')
      .eq('user_id', props.userInfo.id)
      .gte('date_added', startDate.toISOString())
      .lte('date_added', endDate.toISOString())

    const grouped = {};

    income.forEach((income) => {
      const categoryId = income.categoryid;
      if (!grouped[categoryId]) {
        grouped[categoryId] = 0;
      }
      grouped[categoryId] += parseFloat(income.amount);
    });
    setIncomeByCategoryWithDate(grouped);
  }
 


  const expensesByCategory = async () => {
      const { data: expenses, error } = await supabase
      .from('expense')
      .select('amount, categoryid')
      .eq('user_id', props.userInfo.id)

    const grouped = {};

    expenses.forEach((expense) => {
      const categoryId = expense.categoryid;


      if (!grouped[categoryId]) {

        grouped[categoryId] = 0;
      }

      grouped[categoryId] += parseFloat(expense.amount);
    });
    console.log(grouped);

    setExpenseByCategory(grouped);
  }


  // jos haetaan päivämäärien perusteella
  const getExpensesByCategoryWithDate = async () => {
    const { data: expenses, error } = await supabase
      .from('expense')
      .select('amount, categoryid')
      .eq('user_id', props.userInfo.id)
      .gte('date_added', startDate.toISOString())
      .lte('date_added', endDate.toISOString())

    const grouped = {};

    expenses.forEach((expense) => {
      const categoryId = expense.categoryid;
      if (!grouped[categoryId]) {
        grouped[categoryId] = 0;
      }
      grouped[categoryId] += parseFloat(expense.amount);
    });
    setExpenseByCategoryWithDate(grouped);
  }
 


  const renderExpensesByCategory = () => {
    if (!searchByDate) {
      if (props.expenseCategories.length > 0) {
        return (
          <ul>
            {props.expenseCategories.map((category) => (
              <li key={category.categoryid}>
                {category.categoryname}: {expenseByCategory[category.categoryid] || 0} € {/* jos undefined niin arvo 0 */}
              </li>
            ))}
          </ul>
        );
      } else {
        return <p>No expenses by category</p>;
      }
    } else {
      if (props.expenseCategories.length > 0) {
        return (
          <ul>
            {props.expenseCategories.map((category) => (
              <li key={category.categoryid}>
                {category.categoryname}: {expenseByCategoryWithDate[category.categoryid] || 0} € {/* jos undefined niin arvo 0 */}
              </li>
            ))}
          </ul>
        );
      } else {
        return <p>No expenses by category</p>;
      }
    }
  };

  const renderIncomeDataByCategory = () => {
    if (!searchByDate) {
      if (props.incomeCategories.length > 0) {
        return (
          <div>
          <ul>
            {props.incomeCategories.map((category) => (
              <li key={category.categoryid}>
                {category.categoryname}: {incomeByCategory[category.categoryid] || 0} € {/* jos undefined niin arvo 0 */}
              </li>
            ))}
          </ul>
          </div>
        );
      } else {

        return <p>No income by category</p>;
      }
    } else {
      if (props.incomeCategories.length > 0) {
        return (
          <ul>
            {props.incomeCategories.map((category) => (
              <li key={category.categoryid}>
                {category.categoryname}: {incomeByCategoryWithDate[category.categoryid] || 0} € {/* jos undefined niin arvo 0 */}
              </li>
            ))}
          </ul>
        );
      } else {
        return <p>No income by category</p>;
      }
    }
  };

  const renderRemainingMoneyByCategory = () => {
    if (props.expenseCategories.length > 0) {
      return (
        <ul>
          {props.expenseCategories.map((category) => {
            const spent = expenseByCategory[category.categoryid] || 0; // käytetyt rahat, jos undefined niin arvo 0
            const remaining = category.categoryLimit - spent; // jäljellä oleva raha
            return (
              <li key={category.categoryid}>
                {category.categoryname}: Remaining {remaining} €
              </li>
            );
          })}
        </ul>
      );
    } else {
      return <p>No categories available</p>;
    }
  };

    // reset suoritetaan, kun tarkistetaan, että userInfo on olemassa
    const handleResetIncome = () => {
      if (props.userInfo) {
        resetIncome(props.userInfo);
      } else{
        alert("Log in to reset.")
      }
    };

    

    const handleResetExpense = () => {
      if (props.userInfo) {
        resetExpense(props.userInfo);
      } else{
        alert("Log in to reset.")
      }
    };

    const handleResetByDate = () => {
      if (props.userInfo) {
        resetDataByDates(props.userInfo, startDate.toISOString(), endDate.toISOString());
      } else {
        alert("Error");
      }
    }

  // käyttäjän uloskirjautuminen
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // setUser(null);
    setTotalExpense(0);
    setTotalIncome(0);
    setBalance(0);

    // https://reactrouter.com/en/main/hooks/use-navigate
    navigate('/');
  };

  // haetaan tulotiedot annettujen päivämäärien perusteella
  const getIncomeByDate = async () => {  
    setSearchByDate(true);

    const { data: income, error } = await supabase
    .from('income')
    .select('amount')
    .eq('user_id', props.userInfo.id)
    .gte('date_added', startDate.toISOString())
    .lte('date_added', endDate.toISOString())
    
  // console.log(startDate.toISOString());
  // lasketaan määrät yhteen
  let total = 0;

  
  // console.log(income);

  income.forEach((a) => {
    // 'a' on {amount: 1}
    // 'a.amount' on '1'
    total += parseFloat(a.amount);
  });

  setIncomeByDate(total);

}

const getExpensesByDate = async () => {
  const { data: expense, error } = await supabase

    .from('expense')
    .select('amount')
    .eq('user_id', props.userInfo.id)
    .gte('date_added', startDate.toISOString())
    .lte('date_added', endDate.toISOString())

    let total = 0;

    expense.forEach((a) => {
    // 'a' on {amount: 1}
    // 'a.amount' on 1
    total += parseFloat(a.amount);
  });

  setExpensesByDate(total); 
}



  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>

      <p className="dates-paragraph">Search for transactions based on date</p>
      <div className="dates-container">

        <p className="dates-paragraph">Start Date</p>
        <DatePicker showIcon selected={startDate} onChange={(date) => {

          // asettaa päivämäärän alkamaan keskiyöstä, muuten päivämäärän kellonaika sama kuin käyttäjän
          const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));


          setStartDate(newDate);
          }}  
          className="dates-picker-input" 
        />


        {/* End Daten kalenterinäkymän päivämäärän kanssa ongelmia */}
        {/* Päivämäärän toiminnallisuus ei toimi jos kalenterinäkymässä ei ole -1 */}
        {/*  */}
        <p className="dates-paragraph">End Date</p>
        <DatePicker 
          showIcon 
          selected={new Date(endDate).setDate(new Date(endDate.getDate() - 1))} 
          onChange={(date) => {

          const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 0));

          // console.log('newDate: ' + newDate.toISOString()); 
          // käyttäjä valitsee päivämääräksi 15.10.2024 -> newDate 15.10.2024 klo 23.59.59

            setEndDate(newDate);
          }}
          className="dates-picker-input"
        />
        </div>

        <div className="dates-buttons-container">
        <button className="dates-button"
          onClick={() => {
          getIncomeByDate();
          getExpensesByDate();
          getExpensesByCategoryWithDate();
          getIncomeByCategoriesByDate();
        }}>Search</button>
      

      <button className="dates-button"
          onClick={() => {
          setSearchByDate(false);
          setStartDate(new Date());
          setEndDate(new Date());
        }}>Reset Dates</button>
        </div>


      <div style={{ marginTop: '20px' }}>

        {!searchByDate ? (
          <div>
            <h3>Total Income: {totalIncome} €</h3> 
            <h3>Total Expense: {totalExpense} €</h3>
          </div>
          ) : (
          <div>
            <h3>Total Income (by date): {incomeByDate} €</h3>
            <h3>Total Expense (by date): {expensesByDate} €</h3>
          </div>)}

       

       

        <h3>Balance: {balance} €</h3>

        {!searchByDate ? (
          <div>
            
              <h3>Your income by category</h3>
              <p>{renderIncomeDataByCategory()}</p>

            
              <h3>Your expenses by category:</h3> 
              <p>{renderExpensesByCategory()}</p>

          </div>
          ) : (
         <div>
         
            <h3>Your income by category (by date):</h3>
            <p>{renderIncomeDataByCategory()}</p>

            <h3>Your expenses by category (by date):</h3> 
            <p>{renderExpensesByCategory()}</p>
         
         </div>
          )}


        <h3>Your remaining money for each expense category: </h3>
        {renderRemainingMoneyByCategory()} 
      </div>

      {/* income ja expense datan poistonapit */}
      <div className="warning-button-container">

        <button className="warning-button" onClick={handleResetIncome}>Delete income data</button>
        <button className="warning-button" onClick={handleResetExpense}>Delete expense data </button>

        {/* näytä tämä nappi jos päivämäärähakua on käytetty */}
        {searchByDate ? (
                  <button className="warning-button" onClick={handleResetByDate}>Delete data from date range</button>
                ):(
                <div></div>)}
      </div>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Log Out
      </button>
    </div>
  )
};