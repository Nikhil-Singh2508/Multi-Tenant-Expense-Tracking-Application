const supabase = require("../services/supabaseClient");

// Invite user to workspace (email-based)
exports.inviteMember = async (req, res) => {
  try {
    const { workspace_id, email, role } = req.body;

    if (!workspace_id || !email || !role)
      return res.status(400).json({ error: "Missing required fields" });

    // Step 1: find user by email in auth.users
    const { data: users } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email);

    if (!users || users.length === 0)
      return res.status(404).json({ error: "User does not exist" });

    const userId = users[0].id;

    // Step 2: Add to workspace
    const { error } = await supabase.from("workspace_members").insert({
      workspace_id,
      user_id: userId,
      role
    });

    if (error) return res.status(500).json({ error });

    res.json({ message: "User invited successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Change member role (only owner + admin)
exports.updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    const { error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error });

    res.json({ message: "Member role updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error });

    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get workspace members
exports.getMembers = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;

    const { data, error } = await supabase
      .from("workspace_members")
      .select("user_id, role, profiles(first_name, last_name, email)")
      .eq("workspace_id", workspaceId);

    if (error) return res.status(500).json({ error });

    res.json({ members: data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
