const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  createWorkspace,
  getMyWorkspaces
} = require("../controllers/workspaceController");

// All workspace routes require login
router.use(verifyToken);

router.post("/", createWorkspace);
router.get("/", getMyWorkspaces);

module.exports = router;
