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

router.post(
  "/",
  upload.single("img"),
  authenticate,
  authorize("admin"),
  createUser,
);

router.get("/", authenticate, authorize("admin"), getAllUsers);

router.get("/doctors", authenticate, authorize("admin"), getAllDoctors);

router.get("/me", authenticate, getMe);

router.patch("/me", upload.single("img"), authenticate, updateMe);

router.get("/:id", authenticate, authorize("admin"), getAccount);

router.patch(
  "/:slug",
  upload.single("img"),
  authenticate,
  authorize("admin"),
  updateUser,
);

//////certificates////////
router.post(
  "/:slug/certificates",
  upload.single("file"),
  authenticate,
  addCertificate,
);

router.get("/:slug/certificates", authenticate, getUserCertificate);

router.get("/:slug/certificates/:id", authenticate, getCertificate);

router.patch(
  "/:slug/certificates/:id",
  upload.single("file"),
  authenticate,
  updateCertificate,
);

router.delete("/:slug/certificates/:id", authenticate, deleteCertificate);

//////Awards////////
router.post("/:slug/awards", upload.single("file"), authenticate, addAwards);

router.get("/:slug/awards", authenticate, getUserAwards);

router.get("/:slug/awards/:id", authenticate, getAwards);

router.patch(
  "/:slug/awards/:id",
  upload.single("file"),
  authenticate,
  updateAwards,
);

router.delete("/:slug/awards/:id", authenticate, deleteAwards);

module.exports = router;
