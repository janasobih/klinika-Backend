const Appointment = require("../model/appointment.model");
const Patient = require("../model/patient.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

exports.createAppointment = catchAsync(async (req, res, next) => {
  const {
    patientType,
    patient,
    newPatient,
    doctor,
    date,
    startTime,
    type,
    duration,
    notes,
  } = req.body;

  if (!patientType || !doctor || !date || !startTime) {
    return next(
      new AppError(
        "Patient type, doctor, date and start time are required",
        400,
      ),
    );
  }

  if (patientType === "existing") {
    if (!patient) {
      return next(new AppError("Please select an existing patient", 400));
    }
  }

  if (patientType === "new") {
    if (!newPatient) {
      return next(new AppError("Please provide new patient information", 400));
    }

    if (
      !newPatient.name ||
      !newPatient.phone ||
      !newPatient.gender ||
      !newPatient.dateOfBirth
    ) {
      return next(
        new AppError(
          "Name, phone, gender and date of birth are required for new patient",
          400,
        ),
      );
    }
  }

  if (!["new", "existing"].includes(patientType)) {
    return next(new AppError("Patient type must be new or existing", 400));
  }

  // Create New Patient

  let patientId = patient;

  if (patientType === "new") {
    const { name, phone, email, gender, dateOfBirth, nationalID } = newPatient;

    // ==========================
    // Calculate Age
    // ==========================

    const birthDate = new Date(dateOfBirth);

    if (Number.isNaN(birthDate.getTime())) {
      return next(new AppError("Invalid date of birth", 400));
    }

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Check existing patient
    const existingPatient = await Patient.findOne({
      phone,
    });

    if (existingPatient) {
      return next(
        new AppError("A patient with this Phone number already exists", 400),
      );
    }

    // Create Patient

    const newCreatedPatient = await Patient.create({
      personalInformation: {
        name,
        phone,
        email,
        gender,
        dateOfBirth,
        age,
        nationalID,
      },
    });

    patientId = newCreatedPatient._id;
  }

  // Validate Date

  const appointmentDateTime = new Date(date);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return next(new AppError("Invalid appointment date", 400));
  }

  const [hours, minutes] = startTime.split(":");

  if (
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(Number(hours)) ||
    Number.isNaN(Number(minutes))
  ) {
    return next(new AppError("Invalid start time", 400));
  }

  appointmentDateTime.setHours(Number(hours), Number(minutes), 0, 0);

  if (appointmentDateTime < new Date()) {
    return next(
      new AppError("You cannot create an appointment in the past", 400),
    );
  }

  // ==========================
  // Start / End of Day
  // ==========================

  const appointmentDay = new Date(date);

  appointmentDay.setHours(0, 0, 0, 0);

  const nextDay = new Date(appointmentDay);

  nextDay.setDate(nextDay.getDate() + 1);

  // ==========================
  // Doctor Conflict
  // ==========================

  const doctorAppointment = await Appointment.findOne({
    doctor,

    date: {
      $gte: appointmentDay,
      $lt: nextDay,
    },

    startTime,

    status: {
      $ne: "cancelled",
    },
  });

  if (doctorAppointment) {
    return next(
      new AppError("Doctor already has an appointment at this time", 400),
    );
  }

  // ==========================
  // Patient Conflict
  // ==========================

  const patientAppointment = await Appointment.findOne({
    patient: patientId,

    date: {
      $gte: appointmentDay,
      $lt: nextDay,
    },

    startTime,

    status: {
      $ne: "cancelled",
    },
  });

  if (patientAppointment) {
    return next(
      new AppError("Patient already has an appointment at this time", 400),
    );
  }

  // ==========================
  // Create Appointment
  // ==========================

  const appointment = await Appointment.create({
    patientType,
    patient: patientId,
    doctor,
    date: appointmentDay,
    startTime,
    type,
    duration,
    notes,
  });

  await appointment.populate([
    {
      path: "patient",
    },
    {
      path: "doctor",
    },
  ]);

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: appointment,
  });
});

exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const { status, date } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const appointments = await Appointment.find(filter)
    .populate("patient")
    .populate("doctor")
    .sort({
      date: 1,
      startTime: 1,
    });

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: appointments,
  });
});

exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient")
    .populate("doctor");

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: appointment,
  });
});

exports.getDoctorAppointments = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  const { status, date } = req.query;

  const filter = {
    doctor: doctorId,
  };

  if (status) {
    filter.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const appointments = await Appointment.find(filter).populate("patient").sort({
    date: 1,
    startTime: 1,
  });

  res.status(200).json({
    status: "success",
    doctor: doctorId,
    results: appointments.length,
    data: appointments,
  });
});

exports.getPatientAppointments = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  const { status, date } = req.query;

  const filter = {
    patient: patientId,
  };

  if (status) {
    filter.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const appointments = await Appointment.find(filter)
    .populate("patient")
    .populate("doctor")
    .sort({
      date: 1,
      startTime: 1,
    });

  res.status(200).json({
    status: "success",
    patient: patientId,
    results: appointments.length,
    data: appointments,
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  const doctor = req.body.doctor || appointment.doctor;
  const patient = req.body.patient || appointment.patient;
  const date = req.body.date || appointment.date;
  const startTime = req.body.startTime || appointment.startTime;

  const appointmentDateTime = new Date(date);

  const [hours, minutes] = startTime.split(":");

  appointmentDateTime.setHours(Number(hours), Number(minutes), 0, 0);

  if (appointmentDateTime < new Date()) {
    return next(
      new AppError("You cannot move an appointment to the past", 400),
    );
  }

  const doctorConflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctor,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
    },
    startTime,
    status: { $ne: "cancelled" },
  });

  if (doctorConflict) {
    return next(
      new AppError("Doctor already has an appointment at this time", 400),
    );
  }

  const patientConflict = await Appointment.findOne({
    _id: { $ne: appointment._id },
    patient,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
    },
    startTime,
    status: { $ne: "cancelled" },
  });

  if (patientConflict) {
    return next(
      new AppError("Patient already has an appointment at this time", 400),
    );
  }

  Object.assign(appointment, req.body);

  await appointment.save();

  await appointment.populate([
    {
      path: "patient",
    },
    {
      path: "doctor",
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Appointment updated successfully",
    data: appointment,
  });
});

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Appointment deleted successfully",
  });
});
