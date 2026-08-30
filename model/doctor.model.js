const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    experienceYears: {
      type: Number,
      min: 0,
    },

    qualifications: [
      {
        title: {
          type: String,
          required: true,
        },

        institution: String,

        year: Number,
      },
    ],

    certificates: [
      {
        title: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        description: String,

        year: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Doctor", doctorSchema);
