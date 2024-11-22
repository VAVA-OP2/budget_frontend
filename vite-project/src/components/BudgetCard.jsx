import React from "react";
import { Card, List, ListItem, Typography, Collapse, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

  // Suodatetaan päivämäärän perusteella
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

      {/*Nuoli, josta avautuu lista*/}
      <ExpandMoreIcon
        style={{
          cursor: "pointer",
          transition: "0.4s",
          transform: showDetails ? "rotate(180deg)" : "rotate(0deg)", //kääntää nuolen
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleDetails();
        }}
      />

      <Collapse in={showDetails}>
        <Box
          sx={{
            marginTop: "10px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <List>
            {filteredItems.map((item) => {
              let dateText = "";
              let amountText = `${item.amount} €`;

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
        </Box>
      </Collapse>
    </Card>
  );
}
