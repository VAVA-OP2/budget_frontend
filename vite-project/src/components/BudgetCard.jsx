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
        border: "1px solid #ddd", // Lisää rajaus, jotta laatikko erottuu
        borderRadius: "8px", // Pyöristetyt kulmat
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}: {totalAmount} €
      </Typography>

      <ExpandMoreIcon
        style={{
          cursor: "pointer",
          transition: "0.4s",
          transform: showDetails ? "rotate(180deg)" : "rotate(0deg)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleDetails();
        }}
      />

      {/* Collapse - avattava lista */}
      <Collapse in={showDetails}>
        <Box
          sx={{
            marginTop: "10px", // Lisää tilaa ylhäältä
            padding: "10px", // Lisää sisäistä tilaa
            border: "1px solid #ddd", // Lisää raja
            borderRadius: "8px", // Pyöristetyt kulmat
            backgroundColor: "#f9f9f9", // Taustaväri
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
