const supabase = require("../services/supabaseClient");

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspace_id, title, amount, category } = req.body;

    if (!workspace_id || !title || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        workspace_id,
        title,
        amount,
        category,
        created_by: userId,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error });

    res.json({
      message: "Expense created",
      expense: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get expenses for a workspace
exports.getExpenses = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;

    const { data, error } = await supabase
      .from("expenses")
      .select("*, profiles(first_name, last_name, email)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error });

    res.json({ expenses: data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { title, amount, category } = req.body;

    const { error } = await supabase
      .from("expenses")
      .update({ title, amount, category, updated_at: new Date() })
      .eq("id", expenseId);

    if (error) return res.status(500).json({ error });

    res.json({ message: "Expense updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (error) return res.status(500).json({ error });

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.reviewExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { action, comment } = req.body; // action: "approve" or "reject"
    const approverId = req.user.id;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Action must be approve or reject" });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { data, error } = await supabase
      .from("expenses")
      .update({
        status: newStatus,
        approver_id: approverId,
        approver_comment: comment || null,
        updated_at: new Date(),
      })
      .eq("id", expenseId)
      .select()
      .single();

    if (error) return res.status(500).json({ error });

    res.json({
      message: `Expense ${newStatus}`,
      expense: data,
    });
  } catch (err) {
    console.error("reviewExpense ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
