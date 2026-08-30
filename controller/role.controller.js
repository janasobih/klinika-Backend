const Role = require("../model/role.model");
const slug = require("slugify");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

exports.createRole = catchAsync(async (req, res, next) => {
  const { name, permissions } = req.body;

  const role = await Role.create({
    name,
    permissions,
    slug: slug(name),
  });

  res.status(201).json({
    status: "success",
    message: "Role created successfully",
    data: role,
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const { name } = req.params;

  const role = await Role.findOneAndUpdate({ name }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!role) {
    return next(new AppError("Role not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Role permissions updated successfully",
    data: role,
  });
});

exports.getAllRoles = catchAsync(async (req, res) => {
  const role = await Role.find();

  res.status(201).json({
    status: "success",
    message: "Role list ",
    data: role,
  });
});

exports.getRole = catchAsync(async (req, res) => {
  const { name } = req.params;
  const role = await Role.findOne({ name });

  if (!role) {
    return res.status(404).json({
      status: "fail",
      message: "Role not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Role",
    data: role,
  });
});
