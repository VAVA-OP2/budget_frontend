# VAVA - Budgeting App

Welcome to the **VAVA - Budgeting App** repository! This project is built using **Vite** as the development environment along with **React** and **JavaScript**.

---

## **About the Application**

The **VAVA - Budgeting App** is designed to help users efficiently manage their finances by tracking income, expenses, and savings goals.  
Key features include:
- Tracking income and expenses by categories.
- Setting personalized savings goals and monitoring progress.
- Visualizing financial data with interactive charts.
- Receiving AI-powered budgeting suggestions for smarter financial decisions.

This application is perfect for individuals who want to take control of their finances and achieve their savings goals with ease.

You can try the live version of the app here:  
[**VAVA - Budgeting App on GitHub Pages**](https://vava-op2.github.io/budget_frontend//)

---

## **Table of Contents**

1. [Technologies Used](#technologies-used)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Features](#features)
5. [Issues](#issues)
6. [Authors](#authors)
7. [License](#license)

---

## **Technologies Used**

- **Frontend:** React, Vite
- **Backend:** Supabase (Edge Functions)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Additional Tools:** OpenAI API / Supabase edge functions (for budgeting suggestions)

---

## **Installation**

Follow these steps to set up and run the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/VAVA-OP2/budget_frontend.git
2. **Navigate to the project directory**
   ```bash
   cd vite-project
3. **Install dependencies**
   ```bash

   npm install

4. **Set up Supabase**
   - if you don't already have a Supabase project, create one at https://supabase.com
   - Go to Project Settings -> API section of your Supabase project and copy the following:
   Project URL,
   Service Role Key
5. **Create a .env file**
   - In the root directory of the project, crreate a file named .env and add the following lines:
     ```bash
     VITE_SUPABASE_URL=YourSupabaseURL
     VITE_SUPABASE_KEY=YourSupabaseKey
   - Replace YourSupabaseURL and YourSupabaseKey with the values from your Supabase project.

     
5. **Start the development server**
   ```bash
   npm run dev
6. **Open the app in your browser at**
   ```bash
   http://localhost:3000

## **Database Setup**

To replicate the database for this project, follow these steps:

1. Open your PostgreSQL or Supabase SQL editor.

2. Open the [setup-sql-budget-scripts.txt](https://github.com/VAVA-OP2/budget_frontend/blob/main/vite-project/setup-sql-budget-scripts.txt) file in this repository.

3. Copy the SQL script from the file and paste it into the editor.

4. Run the script to create the necessary database tables and relationships.
---

**Note:** The database currently does not contain any data. If you want to test the application without hardcoded data, you need to comment out lines 100-102 in the [`FetchUsersInfo`](https://github.com/VAVA-OP2/budget_frontend/blob/main/vite-project/src/components/FetchUsersInfo.jsx) file.





## Features

- **Income and Expense Tracking**  
  Easily add, edit, and delete income and expense entries by category to track your financial flow.
  
- **Visual data presentation**  
  View detailed analytics and breakdowns of expenses by categories to understand spending habits.

- **Savings Goals Management**  
  Set a personalized savings goal and monitor your progress toward achieving it.

- **Data Reset Functionality**  
  Reset all data, including income, expenses, and savings, to start fresh anytime.

- **User Authentication**  
  Secure user authentication powered by Supabase, ensuring that your data is private and accessible only to you.

- **AI-Powered Budgeting Suggestions**  
  Leverage OpenAI API to receive smart budgeting recommendations based on your income and expense data.

## Issues

You can find the issues of the app here:  
[**VAVA - Issues page**](https://github.com/VAVA-OP2/budget_frontend/issues)

## **Authors**

This project was developed by the following contributors:

- **Alina Lokkinen**  
  [GitHub Profile](https://github.com/AlinaLokkinen)

- **Anastasia Lamberg**  
  [GitHub Profile](https://github.com/anastasialamberg)

- **Valtteri Laakso**  
  [GitHub Profile](https://github.com/vaddee)

- **Viivi Salin**  
  [GitHub Profile](https://github.com/viivisalin)



## **License**

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

See the [LICENSE](https://github.com/VAVA-OP2/budget_frontend/blob/main/vite-project/LICENSE) file for more information.






   


