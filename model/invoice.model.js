const mongoose = require("mongoose");
//الفاتورة
const invoiceItemSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    // رقم الفاتورة
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // المريض
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

    // الزيارة المرتبطة بالفاتورة
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
    },

    // تاريخ الفاتورة
    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // الخدمات
    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Invoice must contain at least one service",
      },
    },

    // الخصم
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // المبلغ الإجمالي قبل الخصم
    subtotal: {
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

    // طريقة الدفع
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "wallet"],
      default: "cash",
    },

    // حالة الفاتورة
    status: {
      type: String,
      enum: ["paid", "pending", "partial", "cancelled"],
      default: "pending",
    },

    // ملاحظات
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
