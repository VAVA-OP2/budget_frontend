import { useEffect, useState } from "react";
import { supabase } from "/supabaseClient";
import { useNavigate } from "react-router-dom";
import { resetIncome, resetExpense, resetDataByDates } from "./Reset";
import "../styles.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BudgetCard from "./BudgetCard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  Card,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import CategoryCard from "./CategoryCard";

export default function Calculations(props) {
  // lasketut tulojen ja menojen yhteissummat
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // saldo
  const [balance, setBalance] = useState(0);

  // menot jaettuina kategorioiden mukaan
  const [expenseByCategory, setExpenseByCategory] = useState({});
  const [expenseByCategoryWithDate, setExpenseByCategoryWithDate] = useState(
    {}
  );

  // Tulot ja menot erikseen
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

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

  //kertoo onko card avattu
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const [showIncomeByCategory, setShowIncomeByCategory] = useState(false);
  const [showExpenseByCategory, setShowExpenseByCategory] = useState(false);

  const [showRemainingMoney, setShowRemainingMoney] = useState(false);

  // kun korttia klikataan, arvo vaihtuu ja näyttää/piilottaa listan
  const toggleIncome = () => setShowIncome(!showIncome);
  const toggleExpense = () => setShowExpense(!showExpense);

  const toggleIncomeByCategory = () =>
    setShowIncomeByCategory(!showIncomeByCategory);
  const toggleExpenseByCategory = () =>
    setShowExpenseByCategory(!showExpenseByCategory);

  const toggleRemainingMoney = () => setShowRemainingMoney(!showRemainingMoney);

  useEffect(() => {
    const getData = async () => {
      calculateBalance();
      expensesByCategory();
      getIncomeByCategories();
    };
    getTotals();
    getData();
  }, [
    props.userInfo,
    totalIncome,
    totalExpense,
    incomeByDate,
    expensesByDate,
    searchByDate,
  ]); // use effect suoritetaan aina uudestaan kun userinfo muuttuja muuttuu

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
  }, [props.userInfo]);

  const getTotals = () => {
    calculateTotalExpense();
    calculateTotalIncome();
  };

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
      .from("income")
      .select("amount")
      .eq("user_id", props.userInfo.id);

    // lasketaan määrät yhteen
    let total = 0;

    income.forEach((a) => {
      // 'a' on {amount: 1}
      // 'a.amount' on '1'
      total += parseFloat(a.amount);
    });

    setTotalIncome(total);
  };

  // lasketaan menot yhteen
  // sama idea kuin tulojen yhteenlaskemisessa
  const calculateTotalExpense = async () => {
    const { data: expense, error } = await supabase
      .from("expense")
      .select("amount")
      .eq("user_id", props.userInfo.id);

    let total = 0;

    expense.forEach((a) => {
      // 'a' on {amount: 1}
      // 'a.amount' on 1
      total += parseFloat(a.amount);
    });

    setTotalExpense(total);
  };

  // Haetaan käyttäjän tulot erikseen
  const fetchIncomes = async () => {
    const { data, error } = await supabase
      .from("income")
      .select("incomeid, amount, date_added")
      .eq("user_id", props.userInfo.id);

    if (!error && data) {
      console.log("Fetched incomes:", data);
      setIncomes(data);
    } else if (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  //Haetaan käyttäjän menot erikseen
  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expense")
      .select("expenseid, amount, date_added")
      .eq("user_id", props.userInfo.id);

    if (!error && data) {
      console.log("Fetched expenses:", data);
      setExpenses(data);
    } else if (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const getIncomeByCategories = async () => {
    const { data: income, error } = await supabase
      .from("income")
      .select("amount, categoryid")
      .eq("user_id", props.userInfo.id);

    const grouped = {};

    income.forEach((income) => {
      const categoryId = income.categoryid;

      if (!grouped[categoryId]) {
        grouped[categoryId] = 0;
      }

      grouped[categoryId] += parseFloat(income.amount);
    });
    setIncomeByCategory(grouped);
  };

  // getIncomeByCategoriesByDate
  const getIncomeByCategoriesByDate = async () => {
    const { data: income, error } = await supabase
      .from("income")
      .select("amount, categoryid")
      .eq("user_id", props.userInfo.id)
      .gte("date_added", startDate.toISOString())
      .lte("date_added", endDate.toISOString());

    const grouped = {};

    income.forEach((income) => {
      const categoryId = income.categoryid;
      if (!grouped[categoryId]) {
        grouped[categoryId] = 0;
      }
      grouped[categoryId] += parseFloat(income.amount);
    });
    setIncomeByCategoryWithDate(grouped);
  };

  const expensesByCategory = async () => {
    const { data: expenses, error } = await supabase
      .from("expense")
      .select("amount, categoryid")
      .eq("user_id", props.userInfo.id);

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
  };

  // jos haetaan päivämäärien perusteella
  const getExpensesByCategoryWithDate = async () => {
    const { data: expenses, error } = await supabase
      .from("expense")
      .select("amount, categoryid")
      .eq("user_id", props.userInfo.id)
      .gte("date_added", startDate.toISOString())
      .lte("date_added", endDate.toISOString());

    const grouped = {};

    expenses.forEach((expense) => {
      const categoryId = expense.categoryid;

      if (!grouped[categoryId]) {
        grouped[categoryId] = 0;
      }
      grouped[categoryId] += parseFloat(expense.amount);
    });
    setExpenseByCategoryWithDate(grouped);
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
    } else {
      alert("Log in to reset.");
    }
  };

  const handleResetExpense = () => {
    if (props.userInfo) {
      resetExpense(props.userInfo);
    } else {
      alert("Log in to reset.");
    }
  };

  const handleResetByDate = () => {
    if (props.userInfo) {
      resetDataByDates(
        props.userInfo,
        startDate.toISOString(),
        endDate.toISOString()
      );
    } else {
      alert("Error");
    }
  };

  // haetaan tulotiedot annettujen päivämäärien perusteella
  const getIncomeByDate = async () => {
    setSearchByDate(true);

    const { data: income, error } = await supabase
      .from("income")
      .select("amount")
      .eq("user_id", props.userInfo.id)
      .gte("date_added", startDate.toISOString())
      .lte("date_added", endDate.toISOString());

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
  };

  const getExpensesByDate = async () => {
    const { data: expense, error } = await supabase

      .from("expense")
      .select("amount")
      .eq("user_id", props.userInfo.id)
      .gte("date_added", startDate.toISOString())
      .lte("date_added", endDate.toISOString());

    let total = 0;

    expense.forEach((a) => {
      // 'a' on {amount: 1}
      // 'a.amount' on 1
      total += parseFloat(a.amount);
    });

    setExpensesByDate(total);
  };

  return (
    <div className="home_content-aligned_left">
      <p className="dates-paragraph">Search for transactions based on date</p>
      <div className="dates-container">
        <p className="dates-paragraph">Start Date</p>
        <DatePicker
          showIcon
          selected={startDate}
          onChange={(date) => {
            // asettaa päivämäärän alkamaan keskiyöstä, muuten päivämäärän kellonaika sama kuin käyttäjän
            const newDate = new Date(
              Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                0,
                0,
                0,
                0
              )
            );

            // console.log('Start Date: ' + newDate.toISOString());

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
            const newDate = new Date(
              Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                23,
                59,
                59,
                0
              )
            );

            // console.log('newDate: ' + newDate.toISOString());
            // käyttäjä valitsee päivämääräksi 15.10.2024 -> newDate 15.10.2024 klo 23.59.59

            setEndDate(newDate);
          }}
          className="dates-picker-input"
        />
      </div>

      <div className="dates-buttons-container">
        <button
          className="dates-button"
          onClick={() => {
            getIncomeByDate();
            getExpensesByDate();
            getExpensesByCategoryWithDate();
            getIncomeByCategoriesByDate();
          }}
        >
          Search
        </button>

        <button
          className="dates-button"
          onClick={() => {
            setSearchByDate(false);
            setStartDate(new Date());
            setEndDate(new Date());
          }}
        >
          Reset Dates
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {!searchByDate ? (
          <div>
            <BudgetCard
              title="Total Income"
              totalAmount={totalIncome}
              items={incomes}
              showDetails={showIncome}
              toggleDetails={toggleIncome}
              filterByDate={false}
            />
            <BudgetCard
              title="Total Expense"
              totalAmount={totalExpense}
              items={expenses}
              showDetails={showExpense}
              toggleDetails={toggleExpense}
              filterByDate={false}
            />
          </div>
        ) : (
          <div>
            <BudgetCard
              title="Total Income (by date)"
              totalAmount={incomeByDate}
              items={incomes}
              showDetails={showIncome}
              toggleDetails={toggleIncome}
              filterByDate={true}
              startDate={startDate}
              endDate={endDate}
            />
            <BudgetCard
              title="Total Expense (by date)"
              totalAmount={expensesByDate}
              items={expenses}
              showDetails={showExpense}
              toggleDetails={toggleExpense}
              filterByDate={true}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}

        <Card
          style={{
            marginBottom: "20px",
            padding: "15px",
            cursor: "pointer",
          }}
        >
          <Typography variant="h7" gutterBottom>
            Balance: {balance} €
          </Typography>
        </Card>

        <div style={{ marginTop: "20px" }}>
          {!searchByDate ? (
            <div>
              {/* Income by Category */}
              <Card
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  cursor: "pointer",
                }}
                onClick={toggleIncomeByCategory}
              >
                <Typography variant="h6">Your income by category</Typography>

                <ExpandMoreIcon
                  style={{
                    cursor: "pointer",
                    transition: "0.4s",
                    transform: showIncomeByCategory
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIncomeByCategory();
                  }}
                />

                {showIncomeByCategory && (
                  <List>
                    {props.incomeCategories.map((category) => (
                      <ListItem key={category.categoryid}>
                        <ListItemText
                          primary={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography variant="h6" component="span">
                                {category.categoryname}
                              </Typography>
                              <Typography
                                variant="h6"
                                component="span"
                                style={{ marginLeft: "10px" }}
                              >
                                {(
                                  incomeByCategory[category.categoryid] || 0
                                ).toFixed(2)}{" "}
                                €
                              </Typography>
                            </div>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>

              {/* Expense by Category */}
              <Card
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  cursor: "pointer",
                }}
                onClick={toggleExpenseByCategory}
              >
                <Typography variant="h6">Your expenses by category</Typography>

                <ExpandMoreIcon
                  style={{
                    cursor: "pointer",
                    transition: "0.4s",
                    transform: showExpenseByCategory
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpenseByCategory();
                  }}
                />

                {showExpenseByCategory && (
                  <List>
                    {props.expenseCategories.map((category) => (
                      <ListItem key={category.categoryid}>
                        <ListItemText
                          primary={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography variant="h6" component="span">
                                {category.categoryname}
                              </Typography>
                              <Typography
                                variant="h6"
                                component="span"
                                style={{ marginLeft: "10px" }}
                              >
                                {(
                                  expenseByCategory[category.categoryid] || 0
                                ).toFixed(2)}{" "}
                                €
                              </Typography>
                            </div>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>
            </div>
          ) : (
            <div>
              {/* Income by Category with Date */}
              <Card
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  cursor: "pointer",
                }}
                onClick={toggleIncomeByCategory}
              >
                <Typography variant="h6">
                  Your income by category (by date)
                </Typography>

                <ExpandMoreIcon
                  style={{
                    cursor: "pointer",
                    transition: "0.4s",
                    transform: showIncomeByCategory
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIncomeByCategory();
                  }}
                />

                {showIncomeByCategory && (
                  <List>
                    {props.incomeCategories.map((category) => (
                      <ListItem key={category.categoryid}>
                        <ListItemText
                          primary={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography variant="h6" component="span">
                                {category.categoryname}
                              </Typography>
                              <Typography
                                variant="h6"
                                component="span"
                                style={{ marginLeft: "10px" }}
                              >
                                {(
                                  incomeByCategory[category.categoryid] || 0
                                ).toFixed(2)}{" "}
                                €
                              </Typography>
                            </div>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>

              {/* Expense by Category with Date */}
              <Card
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  cursor: "pointer",
                }}
                onClick={toggleExpenseByCategory}
              >
                <Typography variant="h6">
                  Your expenses by category (by date)
                </Typography>

                {showExpenseByCategory && (
                  <List>
                    {props.expenseCategories.map((category) => (
                      <ListItem key={category.categoryid}>
                        <ListItemText
                          primary={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography variant="h6" component="span">
                                {category.categoryname}
                              </Typography>
                              <Typography
                                variant="h6"
                                component="span"
                                style={{ marginLeft: "10px" }}
                              >
                                {(
                                  expenseByCategory[category.categoryid] || 0
                                ).toFixed(2)}{" "}
                                €
                              </Typography>
                            </div>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Remaining Money by Category */}
        <div style={{ marginTop: "20px" }}>
          {!searchByDate ? (
            <div>
              <Card
                onClick={toggleRemainingMoney}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  cursor: "pointer",
                }}
              >
                <Typography variant="h6">
                  Your remaining money for each expense category
                </Typography>

                {showRemainingMoney && (
                  <div>
                    <Typography style={{ margin: "10px 0" }} />
                    {renderRemainingMoneyByCategory()}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div>
              <Card
                onClick={toggleRemainingMoney}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  cursor: "pointer",
                }}
              >
                <Typography variant="h6">
                  Your remaining money for each expense category (by date)
                </Typography>

                {showRemainingMoney && (
                  <div>
                    <Divider style={{ margin: "10px 0" }} />
                    {renderRemainingMoneyByCategory()}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* income ja expense datan poistonapit */}
      <div className="warning-button-container">
        <button className="warning-button" onClick={handleResetIncome}>
          Delete income data
        </button>
        <button className="warning-button" onClick={handleResetExpense}>
          Delete expense data{" "}
        </button>

        {/* näytä tämä nappi jos päivämäärähakua on käytetty */}
        {searchByDate ? (
          <button className="warning-button" onClick={handleResetByDate}>
            Delete data from date range
          </button>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
