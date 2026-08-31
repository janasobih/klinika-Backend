const Invoice = require("../model/invoice.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

// Create Invoice
exports.createInvoice = catchAsync(async (req, res, next) => {
  const {
    patient,
    doctor,
    visit,
    invoiceDate,
    items,
    discount = 0,
    paid = 0,
    paymentMethod = "cash",
    notes,
  } = req.body;

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    return total + Number(item.price);
  }, 0);

  // Calculate total after discount
  const total = Math.max(subtotal - Number(discount), 0);

  // Validate paid amount
  if (Number(paid) > total) {
    return next(
      new AppError("Paid amount cannot be greater than invoice total", 400),
    );
  }

  // Calculate remaining
  const remaining = total - Number(paid);

  // Calculate status
  let status = "pending";

  if (paid === total && total > 0) {
    status = "paid";
  } else if (paid > 0 && paid < total) {
    status = "partial";
  }

  // Generate invoice number
  const lastInvoice = await Invoice.findOne().sort({
    createdAt: -1,
  });

  let invoiceNumber = "INV-2026-0001";

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-").pop());

    invoiceNumber = `INV-2026-${String(lastNumber + 1).padStart(4, "0")}`;
  }

  const invoice = await Invoice.create({
    invoiceNumber,
    patient,
    doctor,
    visit,
    invoiceDate,
    items,
    discount,
    subtotal,
    total,
    paid,
    remaining,
    paymentMethod,
    status,
    notes,
  });

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("patient")
    .populate("visit");

  res.status(201).json({
    status: "success",
    message: "Invoice created successfully",
    data: populatedInvoice,
  });
});

// Get All Invoices
exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.find()
    .populate("patient")
    .populate("visit")
    .sort({ invoiceDate: -1 });

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

// Get Invoice By ID
exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("patient")
    .populate("visit");

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: invoice,
  });
});

// Get Invoices By Patient
exports.getPatientInvoices = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.find({
    patient: req.params.patientId,
  })
    .populate("visit")
    .sort({ invoiceDate: -1 });

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

// Get Invoices By doctor
exports.getDoctorInvoices = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.find({
    doctor: req.params.doctorId,
  })
    .populate("visit")
    .sort({ invoiceDate: -1 });

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

// Update Invoice
exports.updateInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  const {
    items = invoice.items,
    discount = invoice.discount,
    paid = invoice.paid,
    paymentMethod = invoice.paymentMethod,
    notes = invoice.notes,
    invoiceDate = invoice.invoiceDate,
  } = req.body;

  // Recalculate
  const subtotal = items.reduce((total, item) => {
    return total + Number(item.price);
  }, 0);

  const total = Math.max(subtotal - Number(discount), 0);

  if (Number(paid) > total) {
    return next(
      new AppError("Paid amount cannot be greater than invoice total", 400),
    );
  }

  const remaining = total - Number(paid);

  let status = "pending";

  if (paid === total && total > 0) {
    status = "paid";
  } else if (paid > 0 && paid < total) {
    status = "partial";
  }

  invoice.items = items;
  invoice.discount = discount;
  invoice.subtotal = subtotal;
  invoice.total = total;
  invoice.paid = paid;
  invoice.remaining = remaining;
  invoice.paymentMethod = paymentMethod;
  invoice.notes = notes;
  invoice.invoiceDate = invoiceDate;
  invoice.status = status;

  await invoice.save();

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("patient")
    .populate("visit");

  res.status(200).json({
    status: "success",
    message: "Invoice updated successfully",
    data: populatedInvoice,
  });
});
