const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // =========================
    // Clinic Information
    // =========================

    clinicName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // =========================
    // Working Hours
    // =========================

    workingDays: {
      type: [String],
      enum: [
        "saturday",
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
      default: [],
    },

    workingHours: {
      start: {
        type: String,
        default: "09:00",
      },

      end: {
        type: String,
        default: "17:00",
      },
    },

    // =========================
    // Payment Settings
    // =========================

    paymentMethods: {
      type: [String],
      enum: ["cash", "card", "bank_transfer", "insurance"],
      default: ["cash"],
    },

    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // =========================
    // Appointment Settings
    // =========================

    appointmentDuration: {
      type: Number,
      min: 5,
      default: 30,
    },

    maxAdvanceBookingDays: {
      type: Number,
      min: 0,
      default: 30,
    },

    minAdvanceBookingHours: {
      type: Number,
      min: 0,
      default: 2,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settings", settingsSchema);
