const express = require("express");

const router = express.Router();

const {
  createPatient,
  getAllPatients,
  getPatient,
  updatePatient,
} = require("../controller/patient.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { checkPermission } = require("../middleware/permission.middleware");

// Get all patients
router.get("/", authenticate, getAllPatients);

// Get one patient
router.get("/:slug", authenticate, getPatient);

// Create patient
router.post("/", authenticate, checkPermission("patients"), createPatient);

// Update patient
router.patch(
  "/:slug",
  authenticate,
  checkPermission("patients"),
  updatePatient,
);

// // Delete patient
// router.delete("/:slug", authenticate, deletePatient);

module.exports = router;
