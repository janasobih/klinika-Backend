const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    permissions: [
      {
        type: String,
        enum: [
          "patients",
          "doctors",
          "user",
          "appointments", //المواعيد
          "invoice", //فاتورة
          "visit", //الزيارات
          "doctor.profile",
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Role", roleSchema);
