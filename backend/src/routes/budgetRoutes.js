const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const canAccessWorkspace = require("../middleware/canAccessWorkspace");
const requireRole = require("../middleware/requireRole");

const { setBudget, getBudgetSummary } = require("../controllers/budgetController");

router.use(verifyToken);

// Only owner/admin can set budget
router.post("/", canAccessWorkspace, requireRole(["owner", "admin"]), setBudget);

// All roles can view budget summary
router.get("/:workspaceId", canAccessWorkspace, requireRole(["owner", "admin", "member", "viewer"]), getBudgetSummary);

module.exports = router;
