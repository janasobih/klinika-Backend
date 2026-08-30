const User = require("../model/user.model");
const Role = require("../model/role.model");
const Doctor = require("../model/doctor.model");

const slugify = require("slugify");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

const cloudinary = require("../config/cloudinary.config");

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

  const role = await Role.findOne({
    name: user.role,
  });

  if (!role) {
    return next(new AppError("Role not found", 404));
  }

  const hasDoctorPermission = role.permissions?.includes("doctor.profile");

  let doctor = null;

  if (hasDoctorPermission) {
    doctor = await Doctor.findOne({
      user: user._id,
    });
  }

  res.status(200).json({
    status: "success",

    data: {
      user: {
        ...user.toObject(),

        role: {
          name: role.name,
          permissions: role.permissions,
        },
      },

      doctor,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return next(
      new AppError("Name, email, password and role are required", 400),
    );
  }

  const selectedRole = await Role.findOne({
    name: role,
  });

  if (!selectedRole) {
    return next(new AppError("Role not found", 404));
  }

  let img = null;

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "klinika/users",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(req.file.buffer);
    });

    img = result.secure_url;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    img,

    slug: slugify(name),
  });

  const result = await User.findOne({
    slug: user.slug,
  }).select("-password");

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, role } = req.body;

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

  if (role !== undefined) {
    const selectedRole = await Role.findOne({
      name: role,
    });

    if (!selectedRole) {
      return next(new AppError("Role not found", 404));
    }

    user.role = role;
  }

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "klinika/users",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(req.file.buffer);
    });

    user.img = result.secure_url;
  }

  await user.save();

  const updatedUser = await User.findOne({
    slug: user.slug,
  }).select("-password");

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: updatedUser,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findOne({
    slug: req.user.slug,
  }).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (email !== undefined) {
    user.email = email;
  }

  // Upload new image
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "klinika/users",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(req.file.buffer);
    });

    user.img = result.secure_url;
  }

  await user.save();

  const updatedUser = await User.findOne({
    slug: user.slug,
  }).select("-password");

  res.status(200).json({
    status: "success",
    message: "Account updated successfully",
    data: updatedUser,
  });
});
