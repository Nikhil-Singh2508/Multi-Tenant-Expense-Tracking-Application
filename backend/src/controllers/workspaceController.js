const supabase = require("../services/supabaseClient");

// Create a new workspace
exports.createWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Workspace name required" });

    // 1. Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({
        name,
        owner_id: userId
      })
      .select()
      .single();

    if (wsError) return res.status(500).json({ error: wsError });

    // 2. Assign creator as OWNER in workspace_members
    const { error: wmError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: "owner"
      });

    if (wmError) return res.status(500).json({ error: wmError });

    return res.json({
      message: "Workspace created successfully",
      workspace
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get all workspaces of logged-in user
exports.getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("workspace_members")
      .select("workspaces(id,name,owner_id)")
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error });

    const workspaces = data.map(row => row.workspaces);

    res.json({ workspaces });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
