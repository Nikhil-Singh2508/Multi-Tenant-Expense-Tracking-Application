const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const canAccessWorkspace = require("../middleware/canAccessWorkspace");
const requireRole = require("../middleware/requireRole");

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.use(verifyToken);

// Create (owner, admin, member)
router.post(
  "/",
  canAccessWorkspace,
  requireRole(["owner", "admin", "member"]),
  createExpense
);

// Get (any member including viewer)
router.get(
  "/:workspaceId",
  canAccessWorkspace,
  requireRole(["owner", "admin", "member", "viewer"]),
  getExpenses
);

// Update (owner, admin, creator)
router.put("/:id", requireRole(["owner", "admin", "member"]), updateExpense);

// Delete (owner, admin, creator)
router.delete("/:id", requireRole(["owner", "admin", "member"]), deleteExpense);

const { reviewExpense } = require("../controllers/expenseController");

// Approve or reject expense (admin/owner only)
router.post(
  "/:workspaceId/review/:id",
  verifyToken,
  canAccessWorkspace,
  requireRole(["owner", "admin"]),
  reviewExpense
);


module.exports = router;
