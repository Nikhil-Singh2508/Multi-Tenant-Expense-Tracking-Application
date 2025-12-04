const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

const {
  inviteMember,
  updateMemberRole,
  removeMember,
  getMembers
} = require("../controllers/memberController");

router.use(verifyToken);

// Only owner + admin can invite
router.post("/:workspaceId/invite", requireRole(["owner", "admin"]), inviteMember);

// Only owner/admin can update roles
router.put("/:workspaceId/role/:userId", requireRole(["owner", "admin"]), updateMemberRole);

// Only owner/admin remove users
router.delete("/:workspaceId/:userId", requireRole(["owner", "admin"]), removeMember);

// All workspace members can view members
router.get("/:workspaceId", requireRole(["owner", "admin", "member", "viewer"]), getMembers);

module.exports = router;
