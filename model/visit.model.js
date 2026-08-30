const mongoose = require("mongoose");
// الزيارات
const visitSchema = new mongoose.Schema(
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

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // =========================
    // Visit Information
    // =========================

    visitDate: {
      type: Date,
      default: Date.now,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    symptoms: {
      type: String,
      trim: true,
    },

    diagnosis: {
      type: String,
      trim: true,
    },

    examination: {
      type: String,
      trim: true,
    },

    treatment: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    // =========================
    // Prescription
    // =========================

    prescription: [
      {
        medicineName: {
          type: String,
          required: true,
          trim: true,
        },

        dosage: {
          type: String,
          trim: true,
        },

        frequency: {
          type: String,
          trim: true,
        },

        duration: {
          type: String,
          trim: true,
        },

        instructions: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Visit", visitSchema);
