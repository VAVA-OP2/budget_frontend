import React from "react";
import { Card, Typography, Divider } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const RemainingMoneyCard = ({ title, show, toggle, renderContent, byDate }) => (
  <Card
    onClick={toggle}
    style={{ marginBottom: "20px", padding: "15px", cursor: "pointer" }}
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
      <div>
        <Divider style={{ margin: "10px 0" }} />
        {renderContent()}
      </div>
    )}
  </Card>
);

export default RemainingMoneyCard;
