import { useEffect, useState } from "react"
import { supabase } from '/supabaseClient';
import { Link, useNavigate } from "react-router-dom";
import { resetIncome, resetExpense } from "./Reset";


export default function Home2() {

  // kirjautuneen käyttäjän tiedot
  const [userInfo, setUserInfo] = useState(null);

  // haetut kategoriatiedot
  const [categories, setCategories] = useState([]);

  // etusivun inputkenttien useStatet
  const [incomeAmount, setIncomeAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // valitun expense -kategorian id
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // lasketut tulojen ja menojen yhteissummat
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // saldo
  const [balance, setBalance] = useState(0);

  // menot jaettuina kategorioiden mukaan
  const [expenseByCateory, setExpenseByCategory] = useState({});

  // react routerin navigate että uloskirjautuessa siirtyy takasin kirjautumissivulle
  const navigate = useNavigate();

  // en ymmärrä useEffectiä joten tämä on todnäk väärin t. alina
  /*  useEffect(() => {
       getUser();
       getCategories();
       getTotals();
   }, []);
*/

  useEffect(() => {
    const fetchData = async () => {
      await getUser();
      await getCategories();
      if (userInfo) { // Jos userInfo on onnistuneesti haettu (käyttäjä on kirjautunut sisään), jatka tietojen käsittelyyn

        await expensesByCategory();
        await getTotals();
        calculateBalance();
      }
    };
    fetchData();
  }, [userInfo]); // use effect suoritetaan aina uudestaan kun userinfo muuttuja muuttuu


  const getTotals = () => {
    calculateTotalExpense();
    calculateTotalIncome();
  }

  // Lasketaan saldo tulojen ja menojen perusteella
  const calculateBalance = () => {
    const currentBalance = totalIncome - totalExpense;
    setBalance(currentBalance);
  };


  // supabase tarjoaa valmiit koodinpätkät taulujen hallintaan (await) jotka vaatii async -funktion
  // haetaan kirjautuneen käyttäjän tiedot
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser(); // nämä koodit siis suoraan supabasesta
    setUserInfo(user);
  }



  // haetaan kaikki kategoriatiedot tietokantataulusta
  const getCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*')
    setCategories(data);
  }



  // lisätään uusi tulo (kirjautuneen käyttäjän id-tiedon kanssa) income -tauluun
  const addIncome = async () => {
    const { data, error } = await supabase
      .from('income')
      .insert([{
        amount: parseFloat(incomeAmount),
        user_id: userInfo.id
      }])
    setIncomeAmount('');
    if (error) {
      console.error(error);
    }

    // lasketaan lisäämisen jälkeen kaikki taulun tulot yhteen 
    calculateTotalIncome();

  }



  // lisätään uusi meno expense -tauluun, valitun kategorian id -tiedon ja kirjautuneen käyttäjän id -tiedon kanssa
  const addExpense = async () => {
    const { data, error } = await supabase
      .from('expense')
      .insert([{
        amount: parseFloat(expenseAmount),
        categoryid: parseFloat(selectedCategoryId),
        user_id: userInfo.id
      }])
    setExpenseAmount('');
    if (error) {
      console.error(error);
    }

    // lasketaan lisäämisen jälkeen menot yhteen 
    calculateTotalExpense();
    await expensesByCategory();

  }



  // laskee käyttäjän lisäämät tulot yhteen: hakee ensin taulusta kaikki "amount" tiedot, joissa user_id vastaa kirjautuneen käyttäjän id -tietoa
  const calculateTotalIncome = async () => {
    const { data: income, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userInfo.id)

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
      .eq('user_id', userInfo.id)

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
  const expensesByCategory = async () => {
    // haetaan taas kaikki expense tiedot (määrä ja kategorian id)
    const { data: expenses, error } = await supabase
      .from('expense')
      .select('amount, categoryid')
      .eq('user_id', userInfo.id)

    // apuobjekti, johon tallennetaan id ja yhteissumma
    const grouped = {};

    // käydään kaikki aiemmin noudetut expenses -taulukon objektit läpi
    expenses.forEach((expense) => {
      const categoryId = expense.categoryid;

      // tarkistetaan onko grouped -objektissa jo kyseistä kategorian id:tä olemassa
      if (!grouped[categoryId]) {

        // jos ei, alustetaan sen arvoksi (summaksi) 0
        grouped[categoryId] = 0;
      }

      // lisätään aiempaan kategoria id:n summaan uusi käsiteltävä summa
      grouped[categoryId] += parseFloat(expense.amount);
    });

    // asetetaan apuobjekti useStaten arvoksi
    // console.log(grouped);

    setExpenseByCategory(grouped);

  }
 

  const renderExpensesByCategory = () => {
    if (categories.length > 0) {
      return (
        <ul>
          {categories.map((category) => (
            <li key={category.categoryid}>
              {category.categoryname}: {expenseByCateory[category.categoryid] || 0} € {/* jos undefined niin arvo 0 */}
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>No expenses by category</p>;
    }
  };

  const renderRemainingMoneyByCategory = () => {
    if (categories.length > 0) {
      return (
        <ul>
          {categories.map((category) => {
            const spent = expenseByCateory[category.categoryid] || 0; // käytetyt rahat, jos undefined niin arvo 0
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
      if (userInfo) {
        resetIncome(userInfo);
      } else{
        alert("Log in to reset.")
      }
    };

    const handleResetExpense = () => {
      if (userInfo) {
        resetExpense(userInfo);
      } else{
        alert("Log in to reset.")
      }
    };



  // käyttäjän uloskirjautuminen
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserInfo(null);
    setTotalExpense(0);
    setTotalIncome(0);
    setBalance(0);

    // https://reactrouter.com/en/main/hooks/use-navigate
    navigate('/');
  };



  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>

      <h1>Welcome to the Home Page</h1>

      {/* Jos käyttäjän tiedot olemassa, näytetään ne, muuten näytetään "Loading..." */}
      {userInfo ? <p>Logged in as: {userInfo.email}</p> : <p>Loading...</p>}

      {/* Tulon lisääminen */}
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

      {/* Menon lisääminen */}
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

        <button onClick={handleResetIncome}>Reset Income</button>

        <h3>Total Expense: {totalExpense} €</h3>

        <button onClick={handleResetExpense}>Reset Expense</button>

        <h3>Balance: {balance} </h3>

        <h3>Your Expenses by Category</h3>
        {renderExpensesByCategory()}

        <h3>Your remaining money for each category: </h3>
        {renderRemainingMoneyByCategory()} 

        
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