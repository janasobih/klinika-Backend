const User = require("../model/user.model");
const slugify = require("slugify");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

const cloudinary = require("../config/cloudinary.config");
const uploadToCloudinary = require("../utilite/uploadToCloudinary.utilite");

const allowedRoles = ["doctor", "receptionist", "accountant", "nurse"];

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

  // Required fields
  if (!name || !email || !password || !role) {
    return next(
      new AppError("Name, email, password and role are required", 400),
    );
  }

  // Validate role
  const selectedRole = role.toLowerCase();

  if (!allowedRoles.includes(selectedRole)) {
    return next(
      new AppError(
        "Invalid role. Allowed roles: doctor, receptionist, accountant, nurse",
        400,
      ),
    );
  }

  // Upload profile image
  let img = null;

  if (req.file) {
    const result = await uploadToCloudinary(req.file, "klinika/users");
    img = result.secure_url;
  }

  // Create user
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
    workingHours,

    img,

    slug: slugify(name, {
      lower: true,
      strict: true,
    }),
  });

  const result = await User.findById(user._id).select("-password");

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
});

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

//////Certificate///////
exports.addCertificate = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const { title, desc } = req.body;

  if (!req.file) {
    return next(new AppError("Certificate file is required", 400));
  }

  const user = await User.findOne({ slug });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const result = await uploadToCloudinary(
    req.file,
    "klinika/users/certificates",
  );

  user.certificates.push({
    title: title,
    desc: desc,
    file: result.secure_url,
  });

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Certificate uploaded successfully",
    data: user.certificates[user.certificates.length - 1],
  });
});

exports.getUserCertificate = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const user = await User.findOne({
    slug,
  }).select("certificates");

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      Certificate: user.certificates,
    },
  });
});

exports.getCertificate = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  const user = await User.findOne({
    slug,
  });

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const certificate = user.certificates.id(id);

  if (!certificate) {
    return next(new AppError("certificate not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      certificate,
    },
  });
});

exports.updateCertificate = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  const { file, title, desc } = req.body;

  const user = await User.findOne({
    slug,
  });

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const certificate = user.certificates.id(id);

  if (!certificate) {
    return next(new AppError("Certificate not found", 404));
  }

  if (file !== undefined) {
    certificate.file = file;
  }

  if (title !== undefined) {
    certificate.title = title;
  }

  if (desc !== undefined) {
    certificate.desc = desc;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      certificate,
    },
  });
});

exports.deleteCertificate = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  const user = await User.findOne({ slug });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const certificate = user.certificates.id(id);

  if (!certificate) {
    return next(new AppError("Certificate not found", 404));
  }

  // Delete from Cloudinary
  try {
    if (certificate.publicId) {
      await cloudinary.uploader.destroy(certificate.publicId);
    }
  } catch (error) {
    console.log("Cloudinary delete error:", error);

    return next(
      new AppError(
        `Failed to delete file from Cloudinary: ${error.message}`,
        500,
      ),
    );
  }

  // Delete from MongoDB
  const index = user.certificates.findIndex(
    (certificate) => certificate._id.toString() === id,
  );

  if (index !== -1) {
    user.certificates.splice(index, 1);
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Certificate deleted successfully",
    data: null,
  });
});

//////Awards///////
exports.addAwards = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const { title, desc } = req.body;

  if (!req.file) {
    return next(new AppError("Awards file is required", 400));
  }

  const user = await User.findOne({ slug });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const result = await uploadToCloudinary(req.file, "klinika/users/Awards");

  user.awards.push({
    title: title,
    desc: desc,
    file: result.secure_url,
  });

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Awards uploaded successfully",
    data: user.awards[user.awards.length - 1],
  });
});

exports.getUserAwards = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const user = await User.findOne({
    slug,
  }).select("awards");

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      awards: user.awards,
    },
  });
});

exports.getAwards = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  const user = await User.findOne({
    slug,
  });

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const awards = user.awards.id(id);

  if (!awards) {
    return next(new AppError("awards not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      awards,
    },
  });
});

exports.updateAwards = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  const { file, title, desc } = req.body;

  const user = await User.findOne({
    slug,
  });

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const awards = user.awards.id(id);

  if (!awards) {
    return next(new AppError("awards not found", 404));
  }

  if (file !== undefined) {
    awards.file = file;
  }

  if (title !== undefined) {
    awards.title = title;
  }

  if (desc !== undefined) {
    awards.desc = desc;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      awards,
    },
  });
});

exports.deleteAwards = catchAsync(async (req, res, next) => {
  const { slug, id } = req.params;

  const user = await User.findOne({ slug });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const awards = user.awards.id(id);

  if (!awards) {
    return next(new AppError("awards not found", 404));
  }

  // Delete from Cloudinary
  try {
    if (awards.publicId) {
      await cloudinary.uploader.destroy(awards.publicId);
    }
  } catch (error) {
    console.log("Cloudinary delete error:", error);

    return next(
      new AppError(
        `Failed to delete file from Cloudinary: ${error.message}`,
        500,
      ),
    );
  }

  // Delete from MongoDB
  const index = user.awards.findIndex((awards) => awards._id.toString() === id);

  if (index !== -1) {
    user.awards.splice(index, 1);
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "award deleted successfully",
    data: null,
  });
});
