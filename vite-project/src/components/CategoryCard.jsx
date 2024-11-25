import React from "react";
import { Card, List, ListItem, ListItemText, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const CategoryCard = ({ title, categories, data, show, toggle, byDate }) => (
  <Card
    className="by_category-card"
    onClick={toggle}
  >
    <Typography variant="h6">
      {title}: {byDate}
    </Typography>
    <ExpandMoreIcon
      style={{
        cursor: "pointer",
        transition: "0.4s",
        transform: show ? "rotate(180deg)" : "rotate(0deg)", //kääntää nuolen
      }}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
    />
    {show && (
      <List className="list-background">
        {categories.map((category) => (
          <ListItem key={category.categoryid}>
            <ListItemText
              primary={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h8" component="span">
                    {category.categoryname}
                  </Typography>
                  <Typography
                    variant="h8"
                    component="span"
                    style={{ marginLeft: "10px" }}
                  >
                    {(data?.[category.categoryid] || 0).toFixed(2)} €
                  </Typography>
                </div>
              }
            />
          </ListItem>
        ))}
      </List>
    )}
  </Card>
);

export default CategoryCard;
