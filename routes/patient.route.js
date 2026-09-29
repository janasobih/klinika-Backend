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
router.get("/:_id", authenticate, getPatient);

// Create patient
router.post("/", authenticate, checkPermission("patients"), createPatient);

// Update patient
router.patch("/:_id", authenticate, checkPermission("patients"), updatePatient);

// // Delete patient
// router.delete("/:slug", authenticate, deletePatient);

//addAttachment
router.post(
  "/:_id/attachments",
  upload.single("file"),
  authenticate,
  addAttachment,
);

//getPatientAttachments
router.get("/:_id/attachments", authenticate, getPatientAttachments);

//getAttachment
router.get("/:_id/attachments/:attachmentId", authenticate, getAttachment);

//updateAttachment
router.patch(
  "/:_id/attachments/:attachmentId",
  upload.single("file"),
  authenticate,
  updateAttachment,
);

//deleteAttachment
router.delete(
  "/:_id/attachments/:attachmentId",
  authenticate,
  deleteAttachment,
);

module.exports = router;
