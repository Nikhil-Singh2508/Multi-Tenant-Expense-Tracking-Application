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
    const userId = req.user.id;

    const { data: expenses, error: expError } = await supabase
      .from("expenses")
      .select(`
        *,
        creator:profiles!expenses_created_by_fkey(first_name, last_name),
        approver:profiles!expenses_approver_id_fkey(first_name, last_name)
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (expError) {
      return res.status(500).json({ error: expError.message || expError });
    }

    // Fetch role in workspace
    const { data: member, error: roleError } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (roleError || !member) {
      return res.status(403).json({ error: "Not part of workspace" });
    }

    const expensesWithNames = expenses.map((exp) => ({
      ...exp,
      created_by_name: exp.creator
        ? `${exp.creator.first_name} ${exp.creator.last_name}`
        : "Unknown",
      approver_name: exp.approver
        ? `${exp.approver.first_name} ${exp.approver.last_name}`
        : null,
    }));

    return res.json({
      expenses: expensesWithNames,
      role: member.role,
      userId,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
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
    const { action, comment } = req.body;
    const approverId = req.user.id;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Action must be approve or reject" });
    }

    // Fetch expense so we can check who created it
    const { data: expense, error: fetchError } = await supabase
      .from("expenses")
      .select("created_by")
      .eq("id", expenseId)
      .single();

    if (fetchError || !expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Prevent self approval
    if (expense.created_by === approverId) {
      return res
        .status(403)
        .json({ error: "Users cannot approve their own expenses" });
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

    return res.json({
      message: `Expense ${newStatus}`,
      expense: data,
    });
  } catch (err) {
    console.error("reviewExpense ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
