const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getAccount,
  getAllDoctors,
  updateUser,
  getMe,
  updateMe,
  addCertificate,
  getUserCertificate,
  getCertificate,
  updateCertificate,
  deleteCertificate,
  addAwards,
  getUserAwards,
  getAwards,
  updateAwards,
  deleteAwards,
} = require("../controller/user.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// const { checkPermission } = require("../middleware/permission.middleware");

const upload = require("../middleware/uploads.middleware");

router.post("/", upload.single("img"), createUser);

router.get("/", authenticate, authorize("admin"), getAllUsers);

router.get("/doctors", authenticate, authorize("admin"), getAllDoctors);

router.get("/me", authenticate, getMe);

router.patch("/me", upload.single("img"), authenticate, updateMe);

router.get("/:id", authenticate, authorize("admin"), getAccount);

router.patch(
  "/:id",
  upload.single("img"),
  authenticate,
  authorize("admin"),
  updateUser,
);

//////certificates////////
router.post(
  "/me/certificates",
  authenticate,
  upload.single("file"),
  addCertificate,
);

router.get("/me/certificates", authenticate, getUserCertificate);

router.get("/me/certificates/:id", authenticate, getCertificate);

router.patch(
  "/me/certificates/:id",
  authenticate,
  upload.single("file"),
  updateCertificate,
);

router.delete("/me/certificates/:id", authenticate, deleteCertificate);

//////Awards////////
router.post("/me/awards", upload.single("file"), authenticate, addAwards);

router.get("/me/awards", authenticate, getUserAwards);

router.get("/me/awards/:id", authenticate, getAwards);

router.patch(
  "/me/awards/:id",
  upload.single("file"),
  authenticate,
  updateAwards,
);

router.delete("/me/awards/:id", authenticate, deleteAwards);

module.exports = router;
