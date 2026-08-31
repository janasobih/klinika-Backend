const Visit = require("../model/visit.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

// Create Visit
exports.createVisit = catchAsync(async (req, res, next) => {
  const {
    patient,
    doctor,
    visitDate,
    reason,
    vitalSigns,
    diagnosis,
    treatment,
    doctorNotes,
    followUpDate,
  } = req.body;

  //   // Generate visit number
  //   const lastVisit = await Visit.findOne().sort({ createdAt: -1 });

  //   let visitNumber = "V-001";

  //   if (lastVisit) {
  //     const lastNumber = parseInt(lastVisit.visitNumber.split("-")[1]);

  //     visitNumber = `V-${String(lastNumber + 1).padStart(3, "0")}`;
  //   }

  const visit = await Visit.create({
    patient,
    doctor,
    visitDate,
    reason,
    vitalSigns,
    diagnosis,
    treatment,
    doctorNotes,
    followUpDate,
  });

  const populatedVisit = await Visit.findById(visit._id)
    .populate("patient")
    .populate("doctor");

  res.status(201).json({
    status: "success",
    message: "Visit created successfully",
    data: populatedVisit,
  });
});

// Get All Visits
exports.getAllVisits = catchAsync(async (req, res, next) => {
  const visits = await Visit.find()
    .populate("patient")
    .populate("doctor")
    .sort({ visitDate: -1 });

  res.status(200).json({
    status: "success",
    results: visits.length,
    data: visits,
  });
});

// Get Visit By ID
exports.getVisit = catchAsync(async (req, res, next) => {
  const visit = await Visit.findById(req.params.id)
    .populate("patient")
    .populate("doctor");

  if (!visit) {
    return next(new AppError("Visit not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: visit,
  });
});

// Get Visits By Patient
exports.getPatientVisits = catchAsync(async (req, res, next) => {
  const visits = await Visit.find({
    patient: req.params.patientId,
  })
    .populate("doctor")
    .sort({ visitDate: -1 });

  res.status(200).json({
    status: "success",
    results: visits.length,
    data: visits,
  });
});

// Update Visit
exports.updateVisit = catchAsync(async (req, res, next) => {
  const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("patient")
    .populate("doctor");

  if (!visit) {
    return next(new AppError("Visit not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Visit updated successfully",
    data: visit,
  });
});

// Delete Visit
// exports.deleteVisit = catchAsync(async (req, res, next) => {
//   const visit = await Visit.findByIdAndDelete(req.params.id);

//   if (!visit) {
//     return next(new AppError("Visit not found", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     message: "Visit deleted successfully",
//   });
// });
