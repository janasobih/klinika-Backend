const mongoose = require("mongoose");

//    الفاتورة
const invoiceServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

// الفاتورة
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // الخدمات الموجودة في الفاتورة
    services: {
      type: [invoiceServiceSchema],
      required: true,
    },

    // إجمالي الأسعار قبل الخصم
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // إجمالي الخصومات
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // الإجمالي بعد الخصم
    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    // المبلغ المدفوع
    paid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // المبلغ المتبقي
    remaining: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      default: "cash",
    },

    status: {
      type: String,
      enum: ["paid", "pending", "partial", "cancelled"],
      default: "pending",
    },

    notes: {
      type: String,
    },

    TermsAndConditions: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
