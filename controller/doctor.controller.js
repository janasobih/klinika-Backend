const Doctor = require("../model/doctor.model");
const User = require("../model/user.model");
const Role = require("../model/role.model");

const AppError = require("../utilite/appError.utilite");
const catchAsync = require("../utilite/catchAsync.utilte");

exports.createMyDoctorProfile = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    slug: req.user.slug,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const role = await Role.findOne({
    name: user.role,
  });

  if (!role) {
    return next(new AppError("Role not found", 404));
  }

  const hasPermission = role.permissions?.includes("doctor.profile");

  if (!hasPermission) {
    return next(new AppError("You do not have doctor profile permission", 403));
  }

  const existingDoctor = await Doctor.findOne({
    user: user._id,
  });

  if (existingDoctor) {
    return next(new AppError("Doctor profile already exists", 400));
  }

  const {
    specialty,
    phone,
    bio,
    experienceYears,
    qualifications,
    certificates,
    image,
  } = req.body;

  if (!specialty) {
    return next(new AppError("Doctor specialty is required", 400));
  }

  const doctor = await Doctor.create({
    user: user._id,
    image: image || null,
    phone,
    specialty,
    bio,
    experienceYears,
    qualifications: qualifications || [],
    certificates: certificates || [],
  });

  const result = await Doctor.findById(doctor._id).populate(
    "user",
    "name email img role slug",
  );

  res.status(201).json({
    status: "success",
    message: "Doctor profile created successfully",
    data: result,
  });
});

exports.updateMyDoctorProfile = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    slug: req.user.slug,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const doctor = await Doctor.findOne({
    user: user._id,
  });

  if (!doctor) {
    return next(new AppError("Doctor profile not found", 404));
  }

  const {
    image,
    phone,
    specialty,
    bio,
    experienceYears,
    qualifications,
    certificates,
  } = req.body;

  if (image !== undefined) {
    doctor.image = image;
  }

  if (phone !== undefined) {
    doctor.phone = phone;
  }

  if (specialty !== undefined) {
    doctor.specialty = specialty;
  }

  if (bio !== undefined) {
    doctor.bio = bio;
  }

  if (experienceYears !== undefined) {
    doctor.experienceYears = experienceYears;
  }

  if (qualifications !== undefined) {
    doctor.qualifications = qualifications;
  }

  if (certificates !== undefined) {
    doctor.certificates = certificates;
  }

  await doctor.save();

  const result = await Doctor.findById(doctor._id).populate(
    "user",
    "name email img role slug",
  );

  res.status(200).json({
    status: "success",
    message: "Doctor profile updated successfully",

    data: result,
  });
});

exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await Doctor.find()
    .populate("user", "name email img role")
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    status: "success",
    results: doctors.length,
    data: doctors,
  });
});

exports.getDoctor = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    slug: req.params.slug,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const doctor = await Doctor.findOne({
    user: user._id,
  }).populate("user", "name email img role slug");

  if (!doctor) {
    return next(new AppError("Doctor profile not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: doctor,
  });
});

exports.updateDoctor = catchAsync(async (req, res, next) => {
  const {
    image,
    phone,
    specialty,
    bio,
    experienceYears,
    qualifications,
    certificates,
  } = req.body;

  const user = await User.findOne({
    slug: req.params.slug,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const doctor = await Doctor.findOne({
    user: user._id,
  });

  if (!doctor) {
    return next(new AppError("Doctor profile not found", 404));
  }

  if (image !== undefined) {
    doctor.image = image;
  }

  if (phone !== undefined) {
    doctor.phone = phone;
  }

  if (specialty !== undefined) {
    doctor.specialty = specialty;
  }

  if (bio !== undefined) {
    doctor.bio = bio;
  }

  if (experienceYears !== undefined) {
    doctor.experienceYears = experienceYears;
  }

  if (qualifications !== undefined) {
    doctor.qualifications = qualifications;
  }

  if (certificates !== undefined) {
    doctor.certificates = certificates;
  }

  await doctor.save();

  const result = await Doctor.findOne({
    user: user._id,
  }).populate("user", "name email img role slug");

  res.status(200).json({
    status: "success",
    message: "Doctor updated successfully",
    data: result,
  });
});

// exports.deleteDoctor = catchAsync(async (req, res, next) => {
//   const doctor = await Doctor.findByIdAndDelete(req.params.id);

//   if (!doctor) {
//     return next(new AppError("Doctor not found", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     message: "Doctor profile deleted successfully",
//   });
// });
