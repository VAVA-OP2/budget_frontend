import React, { useEffect, useState } from "react";
import BubbleChart from "@weknow/react-bubble-chart-d3";
import { supabase } from "/supabaseClient";

export default function Statistics({ userInfo, expenseCategories }) {
  const [expenses, setExpenses] = useState([]);
  const colors = [
    "#77dd77",
    "#ff6961",
    "#ffb347",
    "#84b6f4",
    "#d79bfb",
    "#ffdd77",
    "#77f3e4",
  ];

  useEffect(() => {
    if (!userInfo) return;

    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from("expense")
        .select("amount, categoryid")
        .eq("user_id", userInfo.id);

      if (error) {
        console.error("Error fetching expenses:", error);
      } else {
        setExpenses(data || []);
      }
    };

    fetchExpenses();
  }, [userInfo]);

  const bubbleData = expenseCategories.map((category, index) => {
      let totalAmount = 0;

      expenses.forEach((expense) => {
        if (expense.categoryid === category.categoryid) {
          totalAmount += parseFloat(expense.amount);
        }
      });

      return {
        label: category.categoryname,
        value: totalAmount,
        color: colors[index % colors.length],
      };
    })
    .filter((data) => data.value > 0);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Expenses by Category</h3>
      {bubbleData.length > 0 ? (
        <BubbleChart
          data={bubbleData}
          width={1000}
          height={1000}
          fontSize={16}
          showLegend={true}
        />
      ) : (
        <p>No expenses available</p>
      )}
    </div>
  );
}
