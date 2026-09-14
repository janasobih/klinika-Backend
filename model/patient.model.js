const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
    },
    //   personal information
    personalInformation: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      otherPhone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      gender: {
        type: String,
        enum: ["male", "female"],
        required: true,
      },

      dateOfBirth: {
        type: Date,
      },

      nationalID: {
        type: String,
        trim: true,
      },

      address: {
        type: String,
      },
    },

    // Medical information  الملف الطبي
    medicalInformation: {
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },

      allergies: [
        {
          type: String,
        },
      ],

      chronicDiseases: [
        {
          type: String,
        },
      ],

      medications: [
        {
          type: String,
        },
      ],

      previousSurgeries: [
        {
          name: {
            type: String,
            trim: true,
          },

          date: {
            type: Date,
          },
        },
      ],

      familyMedicalHistory: {
        type: String,
      },

      medicalHistory: {
        type: String,
      },
    },

    // emergencyContact التواصل الطارئ
    emergencyContact: {
      emergencyname: {
        type: String,
        trim: true,
      },

      emergencyphone: {
        type: String,
        trim: true,
      },

      emergencyrelationship: {
        type: String,
        trim: true,
      },
    },

    // insurance التامين
    insurance: {
      company: {
        type: String,
        trim: true,
      },

      memberNumber: {
        type: String,
        trim: true,
      },

      coverageRatio: {
        type: Number,
        min: 0,
        max: 100,
      },

      endDate: {
        type: Date,
      },
    },

    // attachment  المرفقات
    attachments: [
      {
        file: {
          type: String,
          required: true,
        },

        fileName: {
          type: String,
        },

        fileType: {
          type: String,
        },

        description: {
          type: String,
          trim: true,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Patient", patientSchema);
