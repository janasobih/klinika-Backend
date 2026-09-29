const mongoose = require("mongoose");
// المواعيد
const appointmentSchema = new mongoose.Schema(
  {
    patientType: {
      type: String,
      enum: ["new", "existing"],
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      default: 30,
      min: 5,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },

    type: {
      type: String,
      enum: ["consultation", "follow-up", "check-up", "emergency", "other"],
      default: "consultation",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
