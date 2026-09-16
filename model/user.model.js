const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    phone: {
      type: String,
      trim: true,
    },

    img: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "doctor", "receptionist", "accountant", "nurse"],
    },

    gender: {
      type: String,
      enum: ["male", "female"],
    },

    dateOfBirth: {
      type: Date,
    },

    specialty: {
      type: String,
      trim: true,
    },

    clinicAddress: {
      type: String,
      trim: true,
    },

    experienceYears: {
      type: Number,
      min: 0,
    },

    bio: {
      type: String,
      trim: true,
    },

    certificates: [
      {
        title: {
          type: String,
          trim: true,
        },

        desc: {
          type: String,
        },

        file: {
          type: String,
        },
      },
    ],

    awards: [
      {
        title: {
          type: String,
          trim: true,
        },

        desc: {
          type: String,
        },

        file: {
          type: String,
        },
      },
    ],

    workingHours: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
