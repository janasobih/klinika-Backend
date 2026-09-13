const User = require("../model/user.model");
const slugify = require("slugify");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

const cloudinary = require("../config/cloudinary.config");

const allowedRoles = ["doctor", "receptionist", "accountant", "nurse"];

/* =========================================================
   Upload File To Cloudinary
========================================================= */

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      )
      .end(file.buffer);
  });
};

/* =========================================================
   Parse JSON Field
========================================================= */

const parseJSON = (value, defaultValue = []) => {
  if (!value) {
    return defaultValue;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return defaultValue;
  }
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-password").sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    slug: req.user.slug,
  }).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    gender,
    dateOfBirth,
    specialty,
    clinicAddress,
    experienceYears,
    bio,
    workingHours,
  } = req.body;

  /* -------------------------
     Required fields
  ------------------------- */

  if (!name || !email || !password || !role) {
    return next(
      new AppError("Name, email, password and role are required", 400),
    );
  }

  /* -------------------------
     Validate Role
  ------------------------- */

  const selectedRole = role.toLowerCase();

  if (!allowedRoles.includes(selectedRole)) {
    return next(
      new AppError(
        "Invalid role. Allowed roles: doctor, receptionist, accountant, nurse",
        400,
      ),
    );
  }

  /* -------------------------
     Profile Image
  ------------------------- */

  let img = null;

  if (req.files?.img?.[0]) {
    const result = await uploadToCloudinary(req.files.img[0], "klinika/users");

    img = result.secure_url;
  }

  /* -------------------------
     Certificates
  ------------------------- */

  const certificateTitles = parseJSON(req.body.certificateTitles);

  let certificates = [];

  if (req.files?.certificates) {
    const uploadedCertificates = await Promise.all(
      req.files.certificates.map(async (file, index) => {
        const result = await uploadToCloudinary(
          file,
          "klinika/users/certificates",
        );

        return {
          title: certificateTitles[index] || file.originalname,
          image: result.secure_url,
        };
      }),
    );

    certificates = uploadedCertificates;
  }

  /* -------------------------
     Awards
  ------------------------- */

  const awardTitles = parseJSON(req.body.awardTitles);

  let awards = [];

  if (req.files?.awards) {
    const uploadedAwards = await Promise.all(
      req.files.awards.map(async (file, index) => {
        const result = await uploadToCloudinary(file, "klinika/users/awards");

        return {
          title: awardTitles[index] || file.originalname,
          image: result.secure_url,
        };
      }),
    );

    awards = uploadedAwards;
  }

  /* -------------------------
     Create User
  ------------------------- */

  const user = await User.create({
    name,
    email,
    password,
    role: selectedRole,

    phone,
    gender,
    dateOfBirth,

    specialty,
    clinicAddress,
    experienceYears,
    bio,

    certificates,
    awards,

    workingHours,

    img,

    slug: slugify(name, {
      lower: true,
      strict: true,
    }),
  });

  /* -------------------------
     Remove Password
  ------------------------- */

  const result = await User.findById(user._id).select("-password");

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    role,
    phone,
    gender,
    dateOfBirth,
    specialty,
    clinicAddress,
    experienceYears,
    bio,
    workingHours,
  } = req.body;

  const user = await User.findOne({
    slug: req.params.slug,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (email !== undefined) {
    user.email = email;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  if (gender !== undefined) {
    user.gender = gender;
  }

  if (dateOfBirth !== undefined) {
    user.dateOfBirth = dateOfBirth;
  }

  if (specialty !== undefined) {
    user.specialty = specialty;
  }

  if (clinicAddress !== undefined) {
    user.clinicAddress = clinicAddress;
  }

  if (experienceYears !== undefined) {
    user.experienceYears = experienceYears;
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  if (workingHours !== undefined) {
    user.workingHours = workingHours;
  }

  /* -------------------------
     Role
  ------------------------- */

  if (role !== undefined) {
    const selectedRole = role.toLowerCase();

    if (!allowedRoles.includes(selectedRole)) {
      return next(
        new AppError(
          "Invalid role. Allowed roles: doctor, receptionist, accountant, nurse",
          400,
        ),
      );
    }

    user.role = selectedRole;
  }

  /* -------------------------
     Profile Image
  ------------------------- */

  if (req.files?.img?.[0]) {
    const result = await uploadToCloudinary(req.files.img[0], "klinika/users");

    user.img = result.secure_url;
  }

  /* -------------------------
     Certificates
  ------------------------- */

  if (req.files?.certificates) {
    const certificateTitles = parseJSON(req.body.certificateTitles);

    const uploadedCertificates = await Promise.all(
      req.files.certificates.map(async (file, index) => {
        const result = await uploadToCloudinary(
          file,
          "klinika/users/certificates",
        );

        return {
          title: certificateTitles[index] || file.originalname,
          image: result.secure_url,
        };
      }),
    );

    user.certificates = uploadedCertificates;
  }

  /* -------------------------
     Awards
  ------------------------- */

  if (req.files?.awards) {
    const awardTitles = parseJSON(req.body.awardTitles);

    const uploadedAwards = await Promise.all(
      req.files.awards.map(async (file, index) => {
        const result = await uploadToCloudinary(file, "klinika/users/awards");

        return {
          title: awardTitles[index] || file.originalname,
          image: result.secure_url,
        };
      }),
    );

    user.awards = uploadedAwards;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: updatedUser,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    gender,
    dateOfBirth,
    specialty,
    clinicAddress,
    experienceYears,
    bio,
    workingHours,
  } = req.body;

  const user = await User.findOne({
    slug: req.user.slug,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (email !== undefined) {
    user.email = email;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  if (gender !== undefined) {
    user.gender = gender;
  }

  if (dateOfBirth !== undefined) {
    user.dateOfBirth = dateOfBirth;
  }

  if (specialty !== undefined) {
    user.specialty = specialty;
  }

  if (clinicAddress !== undefined) {
    user.clinicAddress = clinicAddress;
  }

  if (experienceYears !== undefined) {
    user.experienceYears = experienceYears;
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  if (workingHours !== undefined) {
    user.workingHours = workingHours;
  }

  if (req.files?.img?.[0]) {
    const result = await uploadToCloudinary(req.files.img[0], "klinika/users");

    user.img = result.secure_url;
  }

  if (req.files?.certificates) {
    const certificateTitles = parseJSON(req.body.certificateTitles);

    const uploadedCertificates = await Promise.all(
      req.files.certificates.map(async (file, index) => {
        const result = await uploadToCloudinary(
          file,
          "klinika/users/certificates",
        );

        return {
          title: certificateTitles[index] || file.originalname,
          image: result.secure_url,
        };
      }),
    );

    user.certificates = uploadedCertificates;
  }

  if (req.files?.awards) {
    const awardTitles = parseJSON(req.body.awardTitles);

    const uploadedAwards = await Promise.all(
      req.files.awards.map(async (file, index) => {
        const result = await uploadToCloudinary(file, "klinika/users/awards");

        return {
          title: awardTitles[index] || file.originalname,
          image: result.secure_url,
        };
      }),
    );

    user.awards = uploadedAwards;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password");

  res.status(200).json({
    status: "success",
    message: "Account updated successfully",
    data: updatedUser,
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const account = await User.findById(req.params.id).select("-password");

  if (!account) {
    return next(new AppError("Account not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: account,
  });
});

exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await User.find({
    role: "doctor",
  })
    .select("-password")
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    status: "success",
    results: doctors.length,
    data: doctors,
  });
});
