import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

//propsit
export default function BudgetCard({
  title,
  totalAmount,
  items,
  showDetails,
  toggleDetails,
  filterByDate,
  startDate,
  endDate,
}) {
  let filteredItems = items;

  // suodatetaan päivämäärän perusteella
  if (filterByDate) {
    filteredItems = items.filter(
      (item) =>
        new Date(item.date_added) >= startDate &&
        new Date(item.date_added) <= endDate
    );
  }

  return (
    <Card
      style={{
        marginBottom: "20px",
        padding: "15px",
        cursor: "pointer",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}: {totalAmount} €
      </Typography>

      <ExpandMoreIcon
        style={{
          cursor: "pointer",
          transition: "0.4s",
          transform: showDetails ? "rotate(180deg)" : "rotate(0deg)", // Kun showDetails on true, nuoli kääntyy 180 astetta ja palaa takaisin, kun se on false
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleDetails();
        }}
      />
      {showDetails && (
        <List>
          {filteredItems.map((item) => {
            let dateText = "";
            let amountText = `${item.amount} €`;

            // jos päivämäärä tulee näyttää
            if (filterByDate) {
              const formattedDate = new Date(item.date_added)
                .toISOString()
                .slice(0, 10);
              dateText = `${formattedDate}: ${amountText}`;
            } else {
              dateText = amountText;
            }

            return (
              <ListItem key={item.id || item.incomeid || item.expenseid}>
                {dateText}
              </ListItem>
            );
          })}
        </List>
      )}
    </Card>
  );
}
