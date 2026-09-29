const Patient = require("../model/patient.model");
const slugify = require("slugify");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

const cloudinary = require("../config/cloudinary.config");
const uploadToCloudinary = require("../utilite/uploadToCloudinary.utilite");

exports.createPatient = catchAsync(async (req, res, next) => {
  const {
    name,
    phone,
    otherPhone,
    email,
    gender,
    dateOfBirth,
    nationalID,
    address,

    bloodType,
    allergies,
    chronicDiseases,
    medications,
    previousSurgeries,
    familyMedicalHistory,
    medicalHistory,

    emergencyname,
    emergencyphone,
    emergencyrelationship,

    company,
    memberNumber,
    coverageRatio,
    endDate,
  } = req.body;

  // Required fields
  if (!name || !phone || !gender || !dateOfBirth) {
    return next(
      new AppError("Name, phone, gender and date of birth are required", 400),
    );
  }

  // ==========================
  // Calculate Age
  // ==========================

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // Create slug
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  // Check if patient already exists
  const existingPatient = await Patient.findOne({ slug });

  if (existingPatient) {
    return next(new AppError("A patient with this name already exists", 400));
  }

  // Create patient
  const patient = await Patient.create({
    slug,

    personalInformation: {
      name,
      phone,
      otherPhone,
      email,
      gender,
      dateOfBirth,
      age,
      nationalID,
      address,
    },

    medicalInformation: {
      bloodType,
      allergies,
      chronicDiseases,
      medications,
      previousSurgeries,
      familyMedicalHistory,
      medicalHistory,
    },

    emergencyContact: {
      emergencyname,
      emergencyphone,
      emergencyrelationship,
    },

    insurance: {
      company,
      memberNumber,
      coverageRatio,
      endDate,
    },

    attachments: [],
  });

  res.status(201).json({
    status: "success",
    message: "Patient created successfully",
    data: {
      patient,
    },
  });
});

exports.getAllPatients = catchAsync(async (req, res) => {
  const patients = await Patient.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",

    results: patients.length,

    data: {
      patients,
    },
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const { _id } = req.params;

  const patient = await Patient.findOne({ _id });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

exports.updatePatient = catchAsync(async (req, res, next) => {
  const { _id } = req.params;

  const patient = await Patient.findOne({ _id });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  const {
    name,
    phone,
    otherPhone,
    email,
    gender,
    dateOfBirth,
    nationalID,
    address,

    bloodType,
    allergies,
    chronicDiseases,
    medications,
    familyMedicalHistory,
    medicalHistory,

    emergencyName,
    emergencyPhone,
    emergencyRelationship,

    insuranceCompany,
    memberNumber,
    coverageRatio,
    insuranceEndDate,
  } = req.body;

  // ==========================
  // Personal Information
  // ==========================

  if (name !== undefined) {
    patient.personalInformation.name = name;
  }

  if (phone !== undefined) {
    patient.personalInformation.phone = phone;
  }

  if (otherPhone !== undefined) {
    patient.personalInformation.otherPhone = otherPhone;
  }

  if (email !== undefined) {
    patient.personalInformation.email = email;
  }

  if (gender !== undefined) {
    patient.personalInformation.gender = gender;
  }

  if (dateOfBirth !== undefined) {
    patient.personalInformation.dateOfBirth = dateOfBirth;
  }

  if (nationalID !== undefined) {
    patient.personalInformation.nationalID = nationalID;
  }

  if (address !== undefined) {
    patient.personalInformation.address = address;
  }

  // ==========================
  // Medical Information
  // ==========================

  if (bloodType !== undefined) {
    patient.medicalInformation.bloodType = bloodType;
  }

  if (allergies !== undefined) {
    patient.medicalInformation.allergies = allergies;
  }

  if (chronicDiseases !== undefined) {
    patient.medicalInformation.chronicDiseases = chronicDiseases;
  }

  if (medications !== undefined) {
    patient.medicalInformation.medications = medications;
  }

  if (familyMedicalHistory !== undefined) {
    patient.medicalInformation.familyMedicalHistory = familyMedicalHistory;
  }

  if (medicalHistory !== undefined) {
    patient.medicalInformation.medicalHistory = medicalHistory;
  }

  // ==========================
  // Emergency Contact
  // ==========================

  if (emergencyName !== undefined) {
    patient.emergencyContact.name = emergencyName;
  }

  if (emergencyPhone !== undefined) {
    patient.emergencyContact.phone = emergencyPhone;
  }

  if (emergencyRelationship !== undefined) {
    patient.emergencyContact.relationship = emergencyRelationship;
  }

  // ==========================
  // Insurance
  // ==========================

  if (insuranceCompany !== undefined) {
    patient.insurance.company = insuranceCompany;
  }

  if (memberNumber !== undefined) {
    patient.insurance.memberNumber = memberNumber;
  }

  if (coverageRatio !== undefined) {
    patient.insurance.coverageRatio = coverageRatio;
  }

  if (insuranceEndDate !== undefined) {
    patient.insurance.endDate = insuranceEndDate;
  }

  await patient.save();

  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

exports.deletePatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findOne({ id });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  // Delete patient's attachments from Cloudinary
  if (patient.attachments?.length > 0) {
    await Promise.all(
      patient.attachments.map(async (attachment) => {
        try {
          await cloudinary.uploader.destroy(attachment.publicId, {
            resource_type: "auto",
          });
        } catch (error) {
          console.error("Cloudinary delete error:", error.message);
        }
      }),
    );
  }

  await Patient.deleteOne({
    _id: patient._id,
  });

  res.status(204).send();
});

//////Attachment/////
exports.addAttachment = catchAsync(async (req, res, next) => {
  const { _id } = req.params;

  const { fileName, fileType, description } = req.body;

  if (!req.file) {
    return next(new AppError("Please upload a file", 400));
  }

  // id = patient slug
  const patient = await Patient.findOne({
    _id,
  });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  const result = await uploadToCloudinary(req.file, "klinika/patients");

  const attachment = {
    file: {
      url: result.secure_url,
      public_id: result.public_id,
    },
    fileName,
    fileType,
    description,
  };

  patient.attachments.push(attachment);

  await patient.save();

  const newAttachment = patient.attachments[patient.attachments.length - 1];

  res.status(201).json({
    status: "success",
    data: {
      attachment: newAttachment,
    },
  });
});

exports.getPatientAttachments = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findOne({
    id,
  }).select("attachments");

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: patient.attachments.length,
    data: {
      attachments: patient.attachments,
    },
  });
});

exports.getAttachment = catchAsync(async (req, res, next) => {
  const { _id, attachmentId } = req.params;

  const patient = await Patient.findOne({
    _id,
  });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  const attachment = patient.attachments.id(attachmentId);

  if (!attachment) {
    return next(new AppError("Attachment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      attachment,
    },
  });
});

exports.updateAttachment = catchAsync(async (req, res, next) => {
  const { _id, attachmentId } = req.params;

  const { fileName, fileType, description } = req.body;

  const patient = await Patient.findOne({
    _id,
  });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  const attachment = patient.attachments.id(attachmentId);

  if (!attachment) {
    return next(new AppError("Attachment not found", 404));
  }

  if (fileName !== undefined) {
    attachment.fileName = fileName;
  }

  if (fileType !== undefined) {
    attachment.fileType = fileType;
  }

  if (description !== undefined) {
    attachment.description = description;
  }

  // Remove existing file
  if (req.body.removeFile === "true") {
    if (attachment.file?.public_id) {
      await cloudinary.uploader.destroy(attachment.file.public_id);
    }

    attachment.file = null;
  }

  // Replace existing file
  else if (req.file) {
    if (attachment.file?.public_id) {
      await cloudinary.uploader.destroy(attachment.file.public_id);
    }

    const result = await uploadToCloudinary(req.file, "klinika/patients");

    attachment.file = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  await patient.save();

  res.status(200).json({
    status: "success",
    data: {
      attachment,
    },
  });
});

exports.deleteAttachment = catchAsync(async (req, res, next) => {
  const { _id, attachmentId } = req.params;

  const patient = await Patient.findOne({
    _id,
  });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  const attachment = patient.attachments.id(attachmentId);

  if (!attachment) {
    return next(new AppError("Attachment not found", 404));
  }

  // Delete file from Cloudinary
  try {
    if (attachment.file?.public_id) {
      await cloudinary.uploader.destroy(attachment.file.public_id);
    }
  } catch (error) {
    console.log("Cloudinary delete error:", error);

    return next(
      new AppError(
        `Failed to delete file from Cloudinary: ${error.message}`,
        500,
      ),
    );
  }

  // Delete attachment from MongoDB
  patient.attachments.pull(attachmentId);

  await patient.save();

  res.status(200).json({
    status: "success",
    message: "Attachment deleted successfully",
    data: null,
  });
});
