const mongoose = require("mongoose");
// المواعيد
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
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

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "no-show"],
      default: "pending",
    },

    type: {
      type: String,
      enum: ["consultation", "follow-up", "check-up", "emergency", "other"],
      default: "consultation",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
