const supabase = require("../services/supabaseClient");

function requireRole(allowedRoles) {
  if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];

  return async (req, res, next) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId || req.body.workspace_id;

    if (!workspaceId)
      return res.status(400).json({ error: "workspace_id is required" });

    // Get role from workspace_members
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .single();

    if (error || !data)
      return res.status(403).json({ error: "Not a workspace member" });

    if (!allowedRoles.includes(data.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: allowedRoles,
        your_role: data.role
      });
    }

    req.user.role = data.role;
    next();
  };
}

module.exports = requireRole;
