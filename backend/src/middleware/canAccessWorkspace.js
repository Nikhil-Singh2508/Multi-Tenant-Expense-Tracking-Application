const supabase = require("../services/supabaseClient");

module.exports = async function (req, res, next) {
  const userId = req.user.id;

  const workspaceId =
      (req.body && req.body.workspace_id) ||
      req.params.workspaceId ||
      req.query.workspace_id;

  if (!workspaceId)
    return res.status(400).json({ error: "workspace_id required" });

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return res.status(403).json({ error: "Not authorized for workspace" });
  }

  req.user.role = data.role;
  next();
};
