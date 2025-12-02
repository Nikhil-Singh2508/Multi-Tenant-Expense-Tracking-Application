const supabase = require("../services/supabaseClient");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Authorization header missing" });

  const token = authHeader.split(" ")[1];

  const { data: userData, error } = await supabase.auth.getUser(token);

  if (error || !userData?.user)
    return res.status(401).json({ error: "Invalid or expired token" });

  // Attach authenticated user
  req.user = {
    id: userData.user.id,
    email: userData.user.email,
  };

  next();
}

module.exports = verifyToken;
