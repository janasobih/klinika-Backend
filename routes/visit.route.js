const express = require("express");
const router = express.Router();

const {
  createVisit,
  getAllVisits,
  getVisit,
  getPatientVisits,
  updateVisit,
} = require("../controller/visit.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { checkPermission } = require("../middleware/permission.middleware");

router.get("/", authenticate, getAllVisits);

router.post("/", authenticate, checkPermission("visits"), createVisit);

router.get("/patient/:patientId", authenticate, getPatientVisits);

router.get("/:id", authenticate, getVisit);

router.patch("/:id", authenticate, checkPermission("visits"), updateVisit);

module.exports = router;
