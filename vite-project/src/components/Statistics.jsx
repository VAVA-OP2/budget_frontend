import React, { useEffect, useState } from 'react';
import BubbleChart from '@weknow/react-bubble-chart-d3';
import { supabase } from '/supabaseClient';
import { useLocation } from 'react-router-dom';

export default function Statistics({ userInfo, categories }) {

  const [expenses, setExpenses] = useState([]);

  // Tähän kuplien käyttämät värit
  const colors = ['#77dd77', '#ff6961', '#ffb347', '#84b6f4', '#d79bfb', '#ffdd77', '#77f3e4'];

  let { state } = useLocation();

  useEffect(() => {
    if (!state.userInfo) return; // Ei palauta mitään jos ei saa userInfo tiedon

    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from('expense')
        .select('amount, categoryid')
        .eq('user_id', state.userInfo.id);

      if (error) {
        console.error('Error fetching expenses:', error);
      } else {
        setExpenses(data || []); // Päivittää kulut state:iin tai tyhjällä taulukolla
      }
    };

    fetchExpenses();
  }, [state.userInfo]);

  // Tämä näytetään bubbleChartille
  const bubbleData = state.categories.map((category, index) => {
    let totalAmount = 0;

    expenses.forEach(expense => {
      if (expense.categoryid === category.categoryid) {
        totalAmount += parseFloat(expense.amount); // Summaa kategorioitten kulut yhteen
      }
    });

    // Luo kupla olion jokaiselle kululle 
    return {
      label: category.categoryname,
      value: totalAmount,
      color: colors[index % colors.length], // Määrittää värin kulun indeksin perusteella
    };
  }).filter(data => data.value > 0); // Pitää vain kulut joilla on tietoa

  // Jos userInfo ja categories renderöinnissä ongelmaa näyttää lautaus viestin
  if (!userInfo || categories.length === 0) {
    return <p>Loading user info and categories...</p>;
  }

  return (
    <div>
      <h3>Expenses by Category</h3>
      {bubbleData.length > 0 ? ( // Jos vähintään yksi kategoria, jossa on kuluja palauttaa bubbleDatan
        <BubbleChart
          data={bubbleData}
          width={800}
          height={800}
          fontSize={16}
          showLegend={true}
        />
      ) : (
        <p>No expenses available</p>
      )}
    </div>
  );
}
