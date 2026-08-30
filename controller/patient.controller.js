const Patient = require("../model/patient.model");
const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");
const slug = require("slugify");

// Create Patient
exports.createPatient = catchAsync(async (req, res, next) => {
  const patientData = req.body;

  if (!patientData.personalInformation?.name) {
    return next(new AppError("Patient name is required", 400));
  }

  const patient = await Patient.create({
    ...patientData,
    slug: slug(patientData.personalInformation.name),
  });

  res.status(201).json({
    status: "success",
    message: "Patient created successfully",
    data: patient,
  });
});

// Get All Patients
exports.getAllPatients = catchAsync(async (req, res) => {
  const patients = await Patient.find();

  res.status(200).json({
    status: "success",
    results: patients.length,
    data: patients,
  });
});

// Get One Patient
exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({
    slug: req.params.slug,
  });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: patient,
  });
});

// Update Patient
exports.updatePatient = catchAsync(async (req, res, next) => {
  const updateData = {};

  Object.keys(req.body).forEach((key) => {
    if (
      typeof req.body[key] === "object" &&
      req.body[key] !== null &&
      !Array.isArray(req.body[key])
    ) {
      Object.keys(req.body[key]).forEach((nestedKey) => {
        updateData[`${key}.${nestedKey}`] = req.body[key][nestedKey];
      });
    } else {
      updateData[key] = req.body[key];
    }
  });

  const patient = await Patient.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Patient updated successfully",
    data: patient,
  });
});

// Delete Patient
// exports.deletePatient = catchAsync(async (req, res, next) => {
//   const patient = await Patient.findOneAndDelete({
//     slug: req.params.slug,
//   });

//   if (!patient) {
//     return next(new AppError("Patient not found", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
// });
