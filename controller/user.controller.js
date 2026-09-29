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

  // Admin updates another user's account
  const user = await User.findById(req.params.id);

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

  // Update role
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

  // Update profile image
  if (req.body.removeImage === "true") {
    if (user.img?.public_id) {
      await cloudinary.uploader.destroy(user.img.public_id);
    }

    user.img = null;
  } else if (req.file) {
    if (user.img?.public_id) {
      await cloudinary.uploader.destroy(user.img.public_id);
    }

    const result = await uploadToCloudinary(req.file, "klinika/users");

    user.img = {
      url: result.secure_url,
      public_id: result.public_id,
    };
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

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update data
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

  // Update profile image

  if (req.body.removeImage === "true") {
    if (user.img?.public_id) {
      await cloudinary.uploader.destroy(user.img.public_id);
    }

    user.img = null;
  } else if (req.file) {
    if (user.img?.public_id) {
      await cloudinary.uploader.destroy(user.img.public_id);
    }

    const result = await uploadToCloudinary(req.file, "klinika/users");

    user.img = {
      url: result.secure_url,
      public_id: result.public_id,
    };
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
  const { title, desc } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let file;
  let publicId;

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file,
      "klinika/users/certificates",
    );

    file = result.secure_url;
    publicId = result.public_id;
  }

  user.certificates.push({
    title,
    desc,
    file,
    publicId,
  });

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Certificate uploaded successfully",
    data: user.certificates[user.certificates.length - 1],
  });
});

exports.getUserCertificate = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("certificates");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      certificates: user.certificates,
    },
  });
});

exports.getCertificate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const certificate = user.certificates.id(id);

  if (!certificate) {
    return next(new AppError("Certificate not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      certificate,
    },
  });
});

exports.updateCertificate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, desc } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const certificate = user.certificates.id(id);

  if (!certificate) {
    return next(new AppError("Certificate not found", 404));
  }

  if (title !== undefined) {
    certificate.title = title;
  }

  if (desc !== undefined) {
    certificate.desc = desc;
  }

  if (req.body.removeFile === "true") {
    // Delete existing file from Cloudinary
    if (certificate.publicId) {
      await cloudinary.uploader.destroy(certificate.publicId);
    }

    certificate.file = null;
    certificate.publicId = null;
  } else if (req.file) {
    // Delete old file from Cloudinary
    if (certificate.publicId) {
      await cloudinary.uploader.destroy(certificate.publicId);
    }

    // Upload new file
    const result = await uploadToCloudinary(
      req.file,
      "klinika/users/certificates",
    );

    certificate.file = result.secure_url;
    certificate.publicId = result.public_id;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Certificate updated successfully",
    data: {
      certificate,
    },
  });
});

exports.deleteCertificate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

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
  const { title, desc } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let file;
  let publicId;

  if (req.file) {
    const result = await uploadToCloudinary(req.file, "klinika/users/awards");
    file = result.secure_url;
    publicId = result.public_id;
  }

  user.awards.push({
    title,
    desc,
    file,
    publicId,
  });

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Award added successfully",
    data: user.awards[user.awards.length - 1],
  });
});

exports.getUserAwards = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("awards");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      awards: user.awards,
    },
  });
});

exports.getAwards = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const award = user.awards.id(id);

  if (!award) {
    return next(new AppError("Award not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      award,
    },
  });
});

exports.updateAwards = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, desc } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const award = user.awards.id(id);

  if (!award) {
    return next(new AppError("Award not found", 404));
  }

  if (title !== undefined) {
    award.title = title;
  }

  if (desc !== undefined) {
    award.desc = desc;
  }

  // Update award file only if a new file was uploaded
  if (req.body.removeFile === "true") {
    // Delete existing file from Cloudinary
    if (award.publicId) {
      await cloudinary.uploader.destroy(award.publicId);
    }

    award.file = null;
    award.publicId = null;
  } else if (req.file) {
    // Delete old file from Cloudinary
    if (award.publicId) {
      await cloudinary.uploader.destroy(award.publicId);
    }

    // Upload new file
    const result = await uploadToCloudinary(req.file, "klinika/users/awards");

    award.file = result.secure_url;
    award.publicId = result.public_id;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Award updated successfully",
    data: {
      award,
    },
  });
});

exports.deleteAwards = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const award = user.awards.id(id);

  if (!award) {
    return next(new AppError("Award not found", 404));
  }

  // Delete from Cloudinary
  try {
    if (award.publicId) {
      await cloudinary.uploader.destroy(award.publicId);
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

  award.deleteOne();

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Award deleted successfully",
    data: null,
  });
});
