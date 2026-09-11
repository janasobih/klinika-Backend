const Invoice = require("../model/invoice.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

// Generate invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });

  let invoiceNumber = "INV-2026-0001";

  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-").pop(), 10);

    if (!isNaN(lastNumber)) {
      invoiceNumber = `INV-2026-${String(lastNumber + 1).padStart(4, "0")}`;
    }
  }

  return invoiceNumber;
};

// Calculate services and invoice totals
const calculateInvoiceTotals = (services, paid) => {
  let subtotal = 0;
  let totalDiscount = 0;

  const calculatedServices = services.map((service) => {
    const price = Number(service.price);
    const discount = Number(service.discount || 0);

    // Validate price
    if (isNaN(price) || price < 0) {
      throw new AppError(`Invalid price for service: ${service.name}`, 400);
    }

    // Validate discount
    if (isNaN(discount) || discount < 0) {
      throw new AppError(`Invalid discount for service: ${service.name}`, 400);
    }

    // Discount cannot be greater than service price
    if (discount > price) {
      throw new AppError(
        `Discount cannot be greater than price for service: ${service.name}`,
        400,
      );
    }

    // Calculate service total
    const serviceTotal = price - discount;

    subtotal += price;
    totalDiscount += discount;

    return {
      name: service.name,
      price,
      discount,
      total: serviceTotal,
    };
  });

  // Invoice total after discounts
  const total = subtotal - totalDiscount;

  const paidAmount = Number(paid || 0);

  // Validate paid
  if (isNaN(paidAmount) || paidAmount < 0) {
    throw new AppError("Invalid paid amount", 400);
  }

  if (paidAmount > total) {
    throw new AppError("Paid amount cannot be greater than invoice total", 400);
  }

  // Remaining amount
  const remaining = total - paidAmount;

  // Payment status
  let status = "pending";

  if (paidAmount === total && total > 0) {
    status = "paid";
  } else if (paidAmount > 0 && paidAmount < total) {
    status = "partial";
  }

  return {
    services: calculatedServices,
    subtotal,
    discount: totalDiscount,
    total,
    paid: paidAmount,
    remaining,
    status,
  };
};

exports.createInvoice = catchAsync(async (req, res, next) => {
  const {
    patient,
    doctor,
    visit,
    invoiceDate,
    services,
    paid = 0,
    paymentMethod = "cash",
    notes,
    TermsAndConditions,
  } = req.body;

  // Validate services
  if (!Array.isArray(services) || services.length === 0) {
    return next(new AppError("At least one service is required", 400));
  }

  // Validate each service name
  for (const service of services) {
    if (!service.name || typeof service.name !== "string") {
      return next(new AppError("Each service must have a valid name", 400));
    }
  }

  // Calculate invoice
  const calculatedInvoice = calculateInvoiceTotals(services, paid);

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice
  const invoice = await Invoice.create({
    invoiceNumber,
    patient,
    doctor,
    visit,
    invoiceDate,
    services: calculatedInvoice.services,
    subtotal: calculatedInvoice.subtotal,
    discount: calculatedInvoice.discount,
    total: calculatedInvoice.total,
    paid: calculatedInvoice.paid,
    remaining: calculatedInvoice.remaining,
    paymentMethod,
    status: calculatedInvoice.status,
    notes,
    TermsAndConditions,
  });

  res.status(201).json({
    status: "success",
    message: "Invoice created successfully",
    data: invoice,
  });
});

exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.find().sort({ invoiceDate: -1 });

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: invoice,
  });
});

exports.getPatientInvoices = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.find({
    patient: req.params.patientId,
  }).sort({ invoiceDate: -1 });

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

exports.getDoctorInvoices = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.find({
    doctor: req.params.doctorId,
  })

    .sort({ invoiceDate: -1 });

  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: invoices,
  });
});

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  const {
    services = invoice.services,
    paid = invoice.paid,
    paymentMethod = invoice.paymentMethod,
    notes = invoice.notes,
    TermsAndConditions = invoice.TermsAndConditions,
    invoiceDate = invoice.invoiceDate,
  } = req.body;

  // Validate services
  if (!Array.isArray(services) || services.length === 0) {
    return next(new AppError("At least one service is required", 400));
  }

  // Validate service names
  for (const service of services) {
    if (!service.name || typeof service.name !== "string") {
      return next(new AppError("Each service must have a valid name", 400));
    }
  }

  // Recalculate invoice
  const calculatedInvoice = calculateInvoiceTotals(services, paid);

  // Update invoice
  invoice.services = calculatedInvoice.services;

  invoice.subtotal = calculatedInvoice.subtotal;
  invoice.discount = calculatedInvoice.discount;
  invoice.total = calculatedInvoice.total;

  invoice.paid = calculatedInvoice.paid;
  invoice.remaining = calculatedInvoice.remaining;

  invoice.paymentMethod = paymentMethod;
  invoice.notes = notes;
  invoice.TermsAndConditions = TermsAndConditions;
  invoice.invoiceDate = invoiceDate;

  invoice.status = calculatedInvoice.status;

  await invoice.save();

  res.status(200).json({
    status: "success",
    message: "Invoice updated successfully",
    data: invoice,
  });
});
