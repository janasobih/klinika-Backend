const express = require("express");

const router = express.Router();

const {
  createPatient,
  getAllPatients,
  getPatient,
  updatePatient,
  addAttachment,
  getPatientAttachments,
  getAttachment,
  updateAttachment,
  deleteAttachment,
} = require("../controller/patient.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { checkPermission } = require("../middleware/permission.middleware");

const upload = require("../middleware/uploads.middleware");

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

//addAttachment
router.post(
  "/:slug/attachments",
  upload.single("file"),
  authenticate,
  addAttachment,
);

//getPatientAttachments
router.get("/:slug/attachments", authenticate, getPatientAttachments);

//getAttachment
router.get("/:slug/attachments/:id", authenticate, getAttachment);

//updateAttachment
router.patch(
  "/:slug/attachments/:id",
  upload.single("file"),
  authenticate,
  updateAttachment,
);

//deleteAttachment
router.delete("/:slug/attachments/:id", authenticate, deleteAttachment);

module.exports = router;
