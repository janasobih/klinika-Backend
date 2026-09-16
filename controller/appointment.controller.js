const Appointment = require("../model/appointment.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

exports.createAppointment = catchAsync(async (req, res, next) => {
  const { patient, doctor, date, startTime, type } = req.body;

  if (!patient || !doctor || !date || !startTime) {
    return next(
      new AppError("Patient, doctor, date and start time are required", 400),
    );
  }

  const appointmentDateTime = new Date(date);

  const [hours, minutes] = startTime.split(":");

  appointmentDateTime.setHours(Number(hours), Number(minutes), 0, 0);

  if (appointmentDateTime < new Date()) {
    return next(
      new AppError("You cannot create an appointment in the past", 400),
    );
  }

  const doctorAppointment = await Appointment.findOne({
    doctor,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
    },
    startTime,
    status: { $ne: "cancelled" },
  });

  if (doctorAppointment) {
    return next(
      new AppError("Doctor already has an appointment at this time", 400),
    );
  }

  const patientAppointment = await Appointment.findOne({
    patient,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
    },
    startTime,
    status: { $ne: "cancelled" },
  });

  if (patientAppointment) {
    return next(
      new AppError("Patient already has an appointment at this time", 400),
    );
  }

  const appointment = await Appointment.create({
    patient,
    doctor,
    date,
    startTime,
    type,
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
