const Settings = require("../model/setting.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const uploadToCloudinary = require("../utilite/uploadToCloudinary.utilite");

exports.getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();

  // Create default settings if not found
  if (!settings) {
    settings = await Settings.create({
      clinicName: "My Clinic",
      phone: "",
      email: "",
      address: "",
      logo: "",

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
  if (typeof req.body.workingDays === "string") {
    req.body.workingDays = JSON.parse(req.body.workingDays);
  }

  if (typeof req.body.paymentMethods === "string") {
    req.body.paymentMethods = JSON.parse(req.body.paymentMethods);
  }

  let settings = await Settings.findOne();

  // Create settings if not found
  if (!settings) {
    settings = await Settings.create({
      clinicName: req.body.clinicName || "My Clinic",
      phone: req.body.phone || "",
      email: req.body.email || "",
      address: req.body.address || "",
      logo: "",

      workingDays: req.body.workingDays || [
        "saturday",
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
      ],

      workingHours: req.body.workingHours,
      paymentMethods: req.body.paymentMethods || ["cash"],
      taxRate: req.body.taxRate,
      appointmentDuration: req.body.appointmentDuration,
      maxAdvanceBookingDays: req.body.maxAdvanceBookingDays,
      minAdvanceBookingHours: req.body.minAdvanceBookingHours,
    });

    // Upload logo
    if (req.file) {
      const result = await uploadToCloudinary(req.file);

      settings.logo = result.secure_url;

      await settings.save();
    }

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

  if (req.file) {
    const result = await uploadToCloudinary(req.file);

    settings.logo = result.secure_url;
  }

  if (req.body.workingDays !== undefined) {
    settings.workingDays = req.body.workingDays;
  }

  if (req.body.workingHours !== undefined) {
    settings.workingHours = req.body.workingHours;
  }

  if (req.body.paymentMethods !== undefined) {
    settings.paymentMethods = req.body.paymentMethods;
  }

  if (req.body.taxRate !== undefined) {
    settings.taxRate = req.body.taxRate;
  }

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
