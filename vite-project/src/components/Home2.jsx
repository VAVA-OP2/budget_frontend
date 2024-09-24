import { useEffect, useState } from "react"
import { supabase } from '/supabaseClient';
import { useNavigate } from "react-router-dom";
import { resetIncome, resetExpense } from "./Reset";


export default function Home2() {

  // kirjautuneen käyttäjän tiedot
  const [user, setUser] = useState(null);

  // lasketut tulojen ja menojen yhteissummat
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // saldo
  const [balance, setBalance] = useState(0);

  // menot jaettuina kategorioiden mukaan
  const [expenseByCateory, setExpenseByCategory] = useState({});

  // react routerin navigate että uloskirjautuessa siirtyy takasin kirjautumissivulle
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (user) { // Jos userInfo on onnistuneesti haettu (käyttäjä on kirjautunut sisään), jatka tietojen käsittelyyn

        // await expensesByCategory();
        await getTotals();
        calculateBalance();
      }
    };
    fetchData();
  }, [user]); // use effect suoritetaan aina uudestaan kun userinfo muuttuja muuttuu


  const getTotals = () => {
    calculateTotalExpense();
    calculateTotalIncome();
  }

  // Lasketaan saldo tulojen ja menojen perusteella
  const calculateBalance = () => {
    const currentBalance = totalIncome - totalExpense;
    setBalance(currentBalance);
  };






  // laskee käyttäjän lisäämät tulot yhteen: hakee ensin taulusta kaikki "amount" tiedot, joissa user_id vastaa kirjautuneen käyttäjän id -tietoa
  const calculateTotalIncome = async () => {
    const { data: income, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', user.id)

    // "income" palauttaa amount -määrät JSON muodossa {amount: 1}
    // console.log(income);

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
      .eq('user_id', user.id)

    let total = 0;

    expense.forEach((a) => {
      // 'a' on {amount: 1}
      // 'a.amount' on 1
      total += parseFloat(a.amount);
    });

    setTotalExpense(total);
  }




  // expenses by category
  // tällä voi myöhemmin näyttää kategorioittan menot 
  // const expensesByCategory = async () => {
  //   // haetaan taas kaikki expense tiedot (määrä ja kategorian id)
  //   const { data: expenses, error } = await supabase
  //     .from('expense')
  //     .select('amount, categoryid')
  //     .eq('user_id', user.id)

  //   // apuobjekti, johon tallennetaan id ja yhteissumma
  //   const grouped = {};

  //   // käydään kaikki aiemmin noudetut expenses -taulukon objektit läpi
  //   expenses.forEach((expense) => {
  //     const categoryId = expense.categoryid;

  //     // tarkistetaan onko grouped -objektissa jo kyseistä kategorian id:tä olemassa
  //     if (!grouped[categoryId]) {

  //       // jos ei, alustetaan sen arvoksi (summaksi) 0
  //       grouped[categoryId] = 0;
  //     }

  //     // lisätään aiempaan kategoria id:n summaan uusi käsiteltävä summa
  //     grouped[categoryId] += parseFloat(expense.amount);
  //   });

  //   // asetetaan apuobjekti useStaten arvoksi
  //   // console.log(grouped);

  //   setExpenseByCategory(grouped);

  // }
 

  // const renderExpensesByCategory = () => {
  //   if (categories.length > 0) {
  //     return (
  //       <ul>
  //         {categories.map((category) => (
  //           <li key={category.categoryid}>
  //             {category.categoryname}: {expenseByCateory[category.categoryid] || 0} € {/* jos undefined niin arvo 0 */}
  //           </li>
  //         ))}
  //       </ul>
  //     );
  //   } else {
  //     return <p>No expenses by category</p>;
  //   }
  // };

  // const renderRemainingMoneyByCategory = () => {
  //   if (categories.length > 0) {
  //     return (
  //       <ul>
  //         {categories.map((category) => {
  //           const spent = expenseByCateory[category.categoryid] || 0; // käytetyt rahat, jos undefined niin arvo 0
  //           const remaining = category.categoryLimit - spent; // jäljellä oleva raha
  //           return (
  //             <li key={category.categoryid}>
  //               {category.categoryname}: Remaining {remaining} €
  //             </li>
  //           );
  //         })}
  //       </ul>
  //     );
  //   } else {
  //     return <p>No categories available</p>;
  //   }
  // };

    // reset suoritetaan, kun tarkistetaan, että userInfo on olemassa
    const handleResetIncome = () => {
      if (user) {
        resetIncome(user);
      } else{
        alert("Log in to reset.")
      }
    };

    const handleResetExpense = () => {
      if (user) {
        resetExpense(user);
      } else{
        alert("Log in to reset.")
      }
    };

    

  // käyttäjän uloskirjautuminen
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTotalExpense(0);
    setTotalIncome(0);
    setBalance(0);

    // https://reactrouter.com/en/main/hooks/use-navigate
    navigate('/');
  };



  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>

      <h1>Welcome to the Home Page</h1>

      

      {/* Menon lisääminen */}
      <div style={{ marginTop: '20px' }}>
        
      </div>


      <div style={{ marginTop: '20px' }}>
        <h3>Total Income: {totalIncome} €</h3>

        <button onClick={handleResetIncome}>Reset Income</button>

        <h3>Total Expense: {totalExpense} €</h3>

        <button onClick={handleResetExpense}>Reset Expense</button>

        <h3>Balance: {balance} </h3>

        {/* <h3>Your Expenses by Category</h3>
        {renderExpensesByCategory()}

        <h3>Your remaining money for each category: </h3>
        {renderRemainingMoneyByCategory()}  */}

        
      </div>

      

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Log Out
      </button>
    </div>
  );
};