const supabase = require("../services/supabaseClient");

// Add or update monthly budget
exports.setBudget = async (req, res) => {
  try {
    const { workspace_id, month, amount } = req.body;

    if (!workspace_id || !month || !amount) {
      return res.status(400).json({ error: "workspace_id, month, and amount required" });
    }

    const firstDayString = `${month}-01`; // Force YYYY-MM-01 format

    const { data, error } = await supabase
      .from("budgets")
      .upsert({
        workspace_id,
        month: firstDayString,
        amount
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Budget saved successfully", budget: data });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// Get spending summary for a given workspace + month
exports.getBudgetSummary = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const month = req.query.month; // format YYYY-MM

    if (!month) {
      return res.status(400).json({ error: "month required (format: YYYY-MM)" });
    }

    const firstDayString = `${month}-01`;

    // Fetch budget for the workspace & month
    const { data: budget, error: bError } = await supabase
      .from("budgets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("month", firstDayString)
      .single();

    if (bError || !budget) {
      return res.status(404).json({ error: "No budget found for this month" });
    }

    // Fetch all workspace expenses
    const { data: expenses, error: eError } = await supabase
      .from("expenses")
      .select("amount, created_at")
      .eq("workspace_id", workspaceId);

    if (eError) {
      return res.status(500).json({ error: eError.message });
    }

    // Calculate monthly spent amount
    let spent = 0;
    const budgetDate = new Date(firstDayString);
    const targetMonth = budgetDate.getMonth();
    const targetYear = budgetDate.getFullYear();

    expenses.forEach(exp => {
      if (!exp.created_at) return;
      const d = new Date(exp.created_at);
      if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
        spent += Number(exp.amount || 0);
      }
    });

    const percentage = budget.amount ? (spent / budget.amount) * 100 : 0;

    let status = "normal";
    if (percentage >= 100) status = "critical";
    else if (percentage >= 90) status = "warning";
    else if (percentage >= 80) status = "alert";

    return res.json({
      workspace_id: workspaceId,
      month,
      budget: Number(budget.amount),
      spent,
      percentage: Math.round(percentage),
      status
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
