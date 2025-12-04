require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Routes (we will add these later)
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const memberRoutes = require("./routes/memberRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");



const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/members", memberRoutes);
app.use("/expenses", expenseRoutes);
app.use("/budgets", budgetRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
