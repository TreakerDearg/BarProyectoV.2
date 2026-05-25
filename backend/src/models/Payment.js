import mongoose from "mongoose";

/* =========================================================
   PAYMENT SCHEMA
   Sistema de pagos integrado con Table y Order
========================================================= */
const paymentSchema = new mongoose.Schema(
  {
    /* =========================
       RELACIONES
    ========================= */
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    /* =========================
       FINANCIEROS
    ========================= */
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ["cash", "transfer", "card", "qr", "wallet", "split"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    /* =========================
       DESCUENTOS
    ========================= */
    discounts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Discount",
      default: [],
    },

    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =========================
       CAMBIO (VUELTO) - Solo para efectivo
    ========================= */
    change: {
      type: Number,
      default: 0,
      min: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       TARJETA - Card payment details
    ========================= */
    cardDetails: {
      lastFour: { type: String },
      cardType: { type: String, enum: ["visa", "mastercard", "amex", "other"] },
      authorizationCode: { type: String },
      terminalId: { type: String },
    },

    /* =========================
       QR - QR payment details
    ========================= */
    qrDetails: {
      provider: { type: String, enum: ["mercadopago", "paypal", "other"] },
      transactionId: { type: String },
      qrCode: { type: String },
      expiresAt: { type: Date },
    },

    /* =========================
       WALLET - Digital wallet details
    ========================= */
    walletDetails: {
      provider: { type: String, enum: ["applepay", "googlepay", "paypal", "other"] },
      transactionId: { type: String },
      email: { type: String },
    },

    /* =========================
       SPLIT - Divided payment details
    ========================= */
    splitDetails: {
      isPartial: { type: Boolean, default: false },
      totalSplits: { type: Number, default: 1 },
      currentSplit: { type: Number, default: 1 },
      splitAmount: { type: Number },
      parentPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
      childPayments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    },

    /* =========================
       AUDITORÍA
    ========================= */
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       RECIBO DIGITAL (EJEMPLO)
    ========================= */
    receipt: {
      receiptNumber: {
        type: String,
        unique: true,
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
      items: [
        {
          name: String,
          quantity: Number,
          price: Number,
          subtotal: Number,
        },
      ],
    },

    /* =========================
       METADATA
    ========================= */
    metadata: {
      device: String,
      ip: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */
paymentSchema.index({ table: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ sessionId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ processedBy: 1, createdAt: -1 });

/* =========================================================
   VIRTUALS
========================================================= */
paymentSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

paymentSchema.virtual("hasDiscount").get(function () {
  return this.discounts && this.discounts.length > 0;
});

paymentSchema.virtual("isRefunded").get(function () {
  return this.status === "refunded";
});

/* =========================================================
   METHODS
========================================================= */

/**
 * Genera número de recibo único
 * Formato: PAY-YYYYMMDD-XXXX
 */
paymentSchema.methods.generateReceiptNumber = function () {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PAY-${dateStr}-${random}`;
};

/**
 * Calcula el cambio (vuelto) para pagos en efectivo
 */
paymentSchema.methods.calculateChange = function (amountPaid) {
  if (this.method !== "cash") return 0;
  const change = Math.max(0, amountPaid - this.amount);
  this.change = change;
  this.amountPaid = amountPaid;
  return change;
};

/**
 * Valida si el pago es dividido
 */
paymentSchema.methods.isSplitPayment = function () {
  return this.method === "split" || this.splitDetails?.isPartial;
};

/**
 * Calcula el monto restante para pagos parciales
 */
paymentSchema.methods.getRemainingAmount = function () {
  if (!this.isSplitPayment()) return 0;
  const totalPaid = this.splitDetails?.childPayments?.length || 0;
  const totalSplits = this.splitDetails?.totalSplits || 1;
  const splitAmount = this.splitDetails?.splitAmount || this.amount / totalSplits;
  return splitAmount * (totalSplits - totalPaid);
};

/* =========================================================
   PRE SAVE HOOK
========================================================= */
paymentSchema.pre("save", function (next) {
  // Generar número de recibo si no existe
  if (!this.receipt?.receiptNumber) {
    if (!this.receipt) this.receipt = {};
    this.receipt.receiptNumber = this.generateReceiptNumber();
  }

  // Validar que el cambio no sea mayor al monto pagado
  if (this.method === "cash" && this.change > this.amountPaid) {
    this.change = Math.max(0, this.amountPaid - this.amount);
  }

  // Validar campos específicos por método
  if (this.method === "card" && !this.cardDetails?.lastFour) {
    return next(new Error("Se requieren detalles de tarjeta para pagos con tarjeta"));
  }

  if (this.method === "qr" && !this.qrDetails?.transactionId) {
    return next(new Error("Se requieren detalles de QR para pagos QR"));
  }

  if (this.method === "wallet" && !this.walletDetails?.transactionId) {
    return next(new Error("Se requieren detalles de billetera para pagos con wallet"));
  }

  // Validar pagos divididos
  if (this.method === "split" || this.splitDetails?.isPartial) {
    if (!this.splitDetails?.splitAmount) {
      this.splitDetails.splitAmount = this.amount / (this.splitDetails?.totalSplits || 1);
    }
  }

  next();
});

/* =========================================================
   POST SAVE HOOK - Actualizar Order y Table
========================================================= */
paymentSchema.post("save", async function (doc) {
  try {
    // Si el pago está completado, actualizar Order
    if (doc.status === "completed") {
      const Order = mongoose.model("Order");
      await Order.findByIdAndUpdate(doc.order, {
        payment: doc._id,
        paymentStatus: "paid",
        paymentMethod: doc.method,
      });

      // Crear log de actividad automáticamente
      const ActivityLog = mongoose.model("ActivityLog");
      const User = mongoose.model("User");
      const user = await User.findById(doc.processedBy).lean();
      
      await ActivityLog.create({
         userId: doc.processedBy,
         userName: user?.name || "Sistema",
         userRole: user?.role || "cashier",
         activityType: "payment_processed",
         description: `Procesó pago de $${doc.amount.toFixed(2)} mediante ${doc.method}`,
         metadata: { method: doc.method, status: doc.status, amount: doc.amount },
         sessionId: doc.sessionId,
         paymentId: doc._id,
         orderId: doc.order,
         tableId: doc.table,
      });
    }

    // Actualizar Table con total de pagos
    const Table = mongoose.model("Table");
    await Table.findByIdAndUpdate(doc.table, {
      $inc: { totalPayments: doc.amount },
      lastPaymentAt: new Date(),
    });
  } catch (error) {
    console.error("[Payment] Error en post-save hook:", error);
  }
});

/* =========================================================
   TO JSON
========================================================= */
paymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Payment", paymentSchema);
