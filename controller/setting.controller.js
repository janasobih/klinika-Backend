const Settings = require("../model/setting.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

exports.getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();

  // Create default settings if not found
  if (!settings) {
    settings = await Settings.create({
      clinicName: "My Clinic",
      phone: "",
      email: "",
      address: "",

      workingDays: [
        "saturday",
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
      ],

      workingHours: {
        start: "09:00",
        end: "17:00",
      },

      paymentMethods: ["cash"],

      taxRate: 0,

      appointmentDuration: 30,

      maxAdvanceBookingDays: 30,

      minAdvanceBookingHours: 2,
    });
  }

  res.status(200).json({
    status: "success",
    data: settings,
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();

  // Create settings if not found
  if (!settings) {
    settings = await Settings.create(req.body);

    return res.status(201).json({
      status: "success",
      message: "Settings created successfully",
      data: settings,
    });
  }

  // =========================
  // Clinic Information
  // =========================

  if (req.body.clinicName !== undefined) {
    settings.clinicName = req.body.clinicName;
  }

  if (req.body.phone !== undefined) {
    settings.phone = req.body.phone;
  }

  if (req.body.email !== undefined) {
    settings.email = req.body.email;
  }

  if (req.body.address !== undefined) {
    settings.address = req.body.address;
  }

  // =========================
  // Working Days
  // =========================

  if (req.body.workingDays !== undefined) {
    settings.workingDays = req.body.workingDays;
  }

  // =========================
  // Working Hours
  // =========================

  if (req.body.workingHours !== undefined) {
    settings.workingHours = req.body.workingHours;
  }

  // =========================
  // Payment
  // =========================

  if (req.body.paymentMethods !== undefined) {
    settings.paymentMethods = req.body.paymentMethods;
  }

  if (req.body.taxRate !== undefined) {
    settings.taxRate = req.body.taxRate;
  }

  // =========================
  // Appointments
  // =========================

  if (req.body.appointmentDuration !== undefined) {
    settings.appointmentDuration = req.body.appointmentDuration;
  }

  if (req.body.maxAdvanceBookingDays !== undefined) {
    settings.maxAdvanceBookingDays = req.body.maxAdvanceBookingDays;
  }

  if (req.body.minAdvanceBookingHours !== undefined) {
    settings.minAdvanceBookingHours = req.body.minAdvanceBookingHours;
  }

  await settings.save();

  res.status(200).json({
    status: "success",
    message: "Settings updated successfully",
    data: settings,
  });
});
