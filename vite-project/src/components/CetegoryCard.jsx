import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function CategoryCard({
  title,
  categories,
  showDetails,
  toggleDetails,
  filterByDate,
  startDate,
  endDate,
}) {
  const getFilteredCategories = () => {
    if (!filterByDate || !startDate || !endDate) {
      return categories || []; // Varmistaa, että palautetaan taulukko
    }

    // Suodatetaan kategoriat päivämäärän mukaan
    return (
      categories.filter((category) => {
        const categoryDate = new Date(category.date_added);
        return categoryDate >= startDate && categoryDate <= endDate;
      }) || []
    );
  };

  const filteredCategories = getFilteredCategories();

  return (
    <Card
      style={{
        marginBottom: "20px",
        padding: "15px",
        cursor: "pointer",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
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

      {showDetails && (
        <List>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              let dateText = `${category.amount} €`;

              if (filterByDate && category.date_added) {
                const formattedDate = new Date(category.date_added);
                if (!isNaN(formattedDate)) {
                  dateText = `${category.amount} € (Date: ${formattedDate
                    .toISOString()
                    .slice(0, 10)})`;
                }
              }

              return (
                <ListItem key={category.categoryid}>
                  {category.categoryname}: {dateText}
                </ListItem>
              );
            })
          ) : (
            <Typography variant="body2">Ei kategorioita saatavilla</Typography>
          )}
        </List>
      )}
    </Card>
  );
}
