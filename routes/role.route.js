const express = require("express");
const router = express.Router();

const {
  createRole,
  getAllRoles,
  getRole,
  updateRole,
} = require("../controller/role.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// // Get all roles
router.get("/", authenticate, authorize("admin"), getAllRoles);

// // Get one role
router.get("/:name", authenticate, authorize("admin"), getRole);

// Create role
router.post("/", authenticate, authorize("admin"), createRole);

// Update role permissions
router.patch("/:name", authenticate, authorize("admin"), updateRole);

module.exports = router;
