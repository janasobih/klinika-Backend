const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    // المريض
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // الطبيب المعالج
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // تاريخ الزيارة
    visitDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // سبب الزيارة
    reason: {
      type: String,
      trim: true,
      required: true,
    },

    // العلامات الحيوية
    vitalSigns: {
      weight: {
        type: Number, // kg
        min: 0,
      },

      height: {
        type: Number, // cm
        min: 0,
      },

      pulse: {
        type: Number, // bpm
        min: 0,
      },

      temperature: {
        type: Number, // °C
        min: 0,
      },
    },

    // التشخيص
    diagnosis: {
      type: String,
      trim: true,
    },

    // العلاج
    treatment: {
      type: String,
      trim: true,
    },

    // ملاحظات الطبيب
    doctorNotes: {
      type: String,
      trim: true,
    },

    // موعد المتابعة
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Visit", visitSchema);
