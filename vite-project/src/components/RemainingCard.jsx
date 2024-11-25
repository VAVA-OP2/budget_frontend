import React from "react";
import { Card, Typography, Divider } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const RemainingMoneyCard = ({ title, show, toggle, renderContent, byDate }) => (
  <Card
    onClick={toggle}
    className="remaining_money-card"
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
      <div className="div_background">
        <Divider style={{ margin: "10px 0" }} />
        {renderContent()}
      </div>
    )}
  </Card>
);

export default RemainingMoneyCard;
