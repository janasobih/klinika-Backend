const Appointment = require("../model/appointment.model");
const Invoice = require("../model/invoice.model");
const Patient = require("../model/patient.model");

const mongoose = require("mongoose");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

exports.getAppointmentsReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, status, type, doctor } = req.query;

  const filter = {};

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return next(new AppError("Invalid start date", 400));
      }

      filter.date.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return next(new AppError("Invalid end date", 400));
      }

      end.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  if (status) {
    filter.status = status;
  }

  if (type) {
    filter.type = type;
  }

  if (doctor) {
    filter.doctor = doctor;
  }

  const [appointments, summary] = await Promise.all([
    Appointment.find(filter)
      .populate("patient", "name phone")
      .populate("doctor", "name specialty")
      .sort({ date: -1 })
      .lean(),

    Appointment.aggregate([
      { $match: filter },

      {
        $group: {
          _id: {
            status: "$status",
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          status: "$_id.status",
          type: "$_id.type",
          count: 1,
        },
      },

      {
        $sort: {
          status: 1,
          type: 1,
        },
      },
    ]),
  ]);

  res.status(200).json({
    status: "success",
    results: appointments.length,

    data: {
      appointments,
      summary,
    },
  });
});

exports.getInvoiceReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, paymentMethod, status, doctor } = req.query;

  const filter = {};

  if (startDate || endDate) {
    filter.invoiceDate = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return next(new AppError("Invalid start date", 400));
      }

      start.setUTCHours(0, 0, 0, 0);
      filter.invoiceDate.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return next(new AppError("Invalid end date", 400));
      }

      end.setUTCHours(23, 59, 59, 999);
      filter.invoiceDate.$lte = end;
    }

    if (
      filter.invoiceDate.$gte &&
      filter.invoiceDate.$lte &&
      filter.invoiceDate.$gte > filter.invoiceDate.$lte
    ) {
      return next(new AppError("Start date must be before end date", 400));
    }
  }

  if (status) {
    filter.status = status;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (doctor) {
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return next(new AppError("Invalid doctor ID", 400));
    }

    filter.doctor = doctor;
  }

  const [invoices, summary, statusSummary, paymentSummary] = await Promise.all([
    Invoice.find(filter)
      .populate("patient", "personalInformation")
      .populate("doctor", "name specialty")
      .sort({ invoiceDate: -1 })
      .lean(),

    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,

          totalInvoices: { $sum: 1 },

          totalRevenue: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$total", 0],
            },
          },

          totalPaid: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$paid", 0],
            },
          },

          totalRemaining: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$remaining", 0],
            },
          },

          totalDiscount: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$discount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalInvoices: 1,
          totalRevenue: 1,
          totalPaid: 1,
          totalRemaining: 1,
          totalDiscount: 1,
        },
      },
    ]),

    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$total" },
          paid: { $sum: "$paid" },
          remaining: { $sum: "$remaining" },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          total: 1,
          paid: 1,
          remaining: 1,
        },
      },
      { $sort: { status: 1 } },
    ]),

    Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$total" },
          paid: { $sum: "$paid" },
        },
      },
      {
        $project: {
          _id: 0,
          paymentMethod: "$_id",
          count: 1,
          total: 1,
          paid: 1,
        },
      },
      { $sort: { paymentMethod: 1 } },
    ]),
  ]);

  res.status(200).json({
    status: "success",
    results: invoices.length,

    data: {
      invoices,

      summary: summary[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        totalDiscount: 0,
      },

      statusSummary,
      paymentSummary,
    },
  });
});

exports.getPatientReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, doctor } = req.query;

  // 1. Build date filter
  const dateFilter = {};

  if (startDate) {
    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      return next(new AppError("Invalid start date", 400));
    }

    start.setUTCHours(0, 0, 0, 0);
    dateFilter.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      return next(new AppError("Invalid end date", 400));
    }

    end.setUTCHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }

  if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
    return next(new AppError("Start date must be before end date", 400));
  }

  // 2. Filter completed visits
  const appointmentFilter = {
    status: "completed",
    patient: { $ne: null },
  };

  if (Object.keys(dateFilter).length) {
    appointmentFilter.date = dateFilter;
  }

  if (doctor) {
    appointmentFilter.doctor = doctor;
  }

  // 3. Get visits with patient and doctor information
  let appointments = await Appointment.find(appointmentFilter)
    .populate("patient", "personalInformation createdAt")
    .populate("doctor", "name specialty")
    .sort({ date: -1 })
    .lean();

  // 4. Count unique patients and group visits by doctor
  const uniquePatients = new Set();
  const doctorStats = new Map();

  for (const appointment of appointments) {
    if (!appointment.patient?._id) continue;

    uniquePatients.add(appointment.patient._id.toString());

    const doctorId = appointment.doctor?._id?.toString();

    if (!doctorId) continue;

    if (!doctorStats.has(doctorId)) {
      doctorStats.set(doctorId, {
        doctorId,
        doctorName: appointment.doctor.name,
        totalVisits: 0,
        uniquePatients: new Set(),
      });
    }

    const stats = doctorStats.get(doctorId);

    stats.totalVisits += 1;
    stats.uniquePatients.add(appointment.patient._id.toString());
  }

  const visitsByDoctor = Array.from(doctorStats.values())
    .map((stats) => ({
      doctorId: stats.doctorId,
      doctorName: stats.doctorName,
      totalVisits: stats.totalVisits,
      uniquePatients: stats.uniquePatients.size,
    }))
    .sort((a, b) => b.totalVisits - a.totalVisits);

  // 5. Count newly registered patients
  const patientDateFilter = {};

  if (dateFilter.$gte) {
    patientDateFilter.$gte = dateFilter.$gte;
  }

  if (dateFilter.$lte) {
    patientDateFilter.$lte = dateFilter.$lte;
  }

  const newPatients = Object.keys(patientDateFilter).length
    ? await Patient.countDocuments({
        createdAt: patientDateFilter,
      })
    : await Patient.countDocuments();

  res.status(200).json({
    status: "success",

    data: {
      summary: {
        uniquePatients: uniquePatients.size,
        totalVisits: appointments.length,
        newPatients,
      },

      visitsByDoctor,
    },
  });
});
