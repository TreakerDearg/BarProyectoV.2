import mongoose from "mongoose";

/* =========================================================
   PAYMENT METHOD CONFIG SCHEMA
   Configuración de métodos de pago disponibles y sus gateways
========================================================= */
const paymentMethodConfigSchema = new mongoose.Schema(
  {
    /* =========================
       MÉTODO DE PAGO
    ========================= */
    method: {
      type: String,
      enum: ["cash", "transfer", "card", "qr", "wallet", "split"],
      required: true,
      unique: true,
      index: true,
    },

    /* =========================
       ESTADO
    ========================= */
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =========================
       CONFIGURACIÓN ESPECÍFICA
    ========================= */
    config: {
      type: {
        default: {},
      },
      /* TARJETA */
      card: {
        provider: { 
          type: String, 
          enum: ["stripe", "mercado_pago", "local", ""],
          default: ""
        },
        apiKey: { type: String, default: "" },
        merchantId: { type: String, default: "" },
        terminalId: { type: String, default: "" },
        enableTip: { type: Boolean, default: false },
        maxAmount: { type: Number, default: 100000 },
      },

      /* QR */
      qr: {
        provider: { 
          type: String, 
          enum: ["mercadopago", "paypal", "local", ""],
          default: ""
        },
        apiKey: { type: String, default: "" },
        merchantId: { type: String, default: "" },
        expiryMinutes: { type: Number, default: 15 },
        maxAmount: { type: Number, default: 50000 },
      },

      /* WALLET */
      wallet: {
        provider: { 
          type: String, 
          enum: ["applepay", "googlepay", "paypal", ""],
          default: ""
        },
        apiKey: { type: String, default: "" },
        merchantId: { type: String, default: "" },
        enableApplePay: { type: Boolean, default: false },
        enableGooglePay: { type: Boolean, default: false },
      },

      /* TRANSFERENCIA */
      transfer: {
        accountNumber: { type: String, default: "" },
        bankName: { type: String, default: "" },
        accountHolder: { type: String, default: "" },
        cbu: { type: String, default: "" },
        alias: { type: String, default: "" },
        requireProof: { type: Boolean, default: true },
      },

      /* EFECTIVO */
      cash: {
        requireCount: { type: Boolean, default: true },
        enableChangeRounding: { type: Boolean, default: false },
        maxAmount: { type: Number, default: 100000 },
      },

      /* SPLIT */
      split: {
        maxSplits: { type: Number, default: 10 },
        minAmountPerSplit: { type: Number, default: 100 },
        enableUnevenSplit: { type: Boolean, default: true },
      },
    },

    /* =========================
       COMISIONES
    ========================= */
    fees: {
      type: {
        type: String,
        enum: ["percentage", "fixed", "none"],
        default: "none",
      },
      value: { type: Number, default: 0 },
      minFee: { type: Number, default: 0 },
      maxFee: { type: Number, default: 0 },
    },

    /* =========================
       LÍMITES
    ========================= */
    limits: {
      minAmount: { type: Number, default: 0 },
      maxAmount: { type: Number, default: 100000 },
      dailyLimit: { type: Number, default: 500000 },
      monthlyLimit: { type: Number, default: 5000000 },
    },

    /* =========================
       REQUISITOS
    ========================= */
    requirements: {
      requireCustomerInfo: { type: Boolean, default: false },
      requireEmail: { type: Boolean, default: false },
      requirePhone: { type: Boolean, default: false },
      requireAddress: { type: Boolean, default: false },
    },

    /* =========================
       HORARIOS DISPONIBLES
    ========================= */
    availability: {
      type: {
        type: String,
        enum: ["always", "schedule", "manual"],
        default: "always",
      },
      schedule: {
        type: {
          default: {},
        },
        monday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
        tuesday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
        wednesday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
        thursday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
        friday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
        saturday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
        sunday: { 
          start: { type: String, default: "00:00" },
          end: { type: String, default: "23:59" },
          enabled: { type: Boolean, default: true }
        },
      },
    },

    /* =========================
       METADATA
    ========================= */
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "payment_method_configs",
  }
);

/* =========================================================
   VIRTUALS
========================================================= */
paymentMethodConfigSchema.virtual("isAvailable").get(function () {
  if (!this.isActive) return false;

  if (!this.availability || !this.availability.type) return true;

  if (this.availability.type === "always") return true;

  if (this.availability.type === "manual") return true;

  if (this.availability.type === "schedule") {
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (!this.availability.schedule || !this.availability.schedule[dayName]) return true;
    
    const daySchedule = this.availability.schedule[dayName];

    if (!daySchedule?.enabled) return false;

    const { start, end } = daySchedule;
    if (!start || !end) return true;

    return currentTime >= start && currentTime <= end;
  }

  return true;
});

/* =========================================================
   METHODS
========================================================= */

/**
 * Calcula la comisión para un monto dado
 */
paymentMethodConfigSchema.methods.calculateFee = function (amount) {
  if (!this.fees || this.fees.type === "none") return 0;

  if (this.fees.type === "fixed") {
    let fee = this.fees.value || 0;
    if (fee < (this.fees.minFee || 0)) fee = this.fees.minFee || 0;
    if (fee > (this.fees.maxFee || Infinity)) fee = this.fees.maxFee || Infinity;
    return fee;
  }

  if (this.fees.type === "percentage") {
    let fee = (amount * (this.fees.value || 0)) / 100;
    if (fee < (this.fees.minFee || 0)) fee = this.fees.minFee || 0;
    if (fee > (this.fees.maxFee || Infinity)) fee = this.fees.maxFee || Infinity;
    return fee;
  }

  return 0;
};

/**
 * Valida si un monto está dentro de los límites
 */
paymentMethodConfigSchema.methods.isValidAmount = function (amount) {
  const limits = this.limits || {};
  const minAmount = limits.minAmount || 0;
  const maxAmount = limits.maxAmount || Infinity;
  
  if (amount < minAmount) return false;
  if (amount > maxAmount) return false;
  return true;
};

/* =========================================================
   STATICS
========================================================= */

/**
 * Obtener métodos de pago activos
 */
paymentMethodConfigSchema.statics.getActiveMethods = async function () {
  try {
    const configs = await this.find({ isActive: true }).sort({ priority: -1 });
    return configs.filter((config) => config.isAvailable);
  } catch (error) {
    console.error("Error in getActiveMethods:", error);
    return [];
  }
};

/**
 * Obtener configuración por método
 */
paymentMethodConfigSchema.statics.getByMethod = async function (method) {
  try {
    return await this.findOne({ method });
  } catch (error) {
    console.error("Error in getByMethod:", error);
    return null;
  }
};

/**
 * Seed inicial de métodos de pago
 */
paymentMethodConfigSchema.statics.seedDefaultMethods = async function () {
  try {
    const count = await this.countDocuments();
    if (count > 0) {
      console.log("Payment methods already seeded, skipping...");
      return [];
    }

    const defaultMethods = [
      {
        method: "cash",
        isActive: true,
        displayName: "Efectivo",
        description: "Pagos en efectivo físico",
        icon: "dollar-sign",
        priority: 100,
        config: {
          cash: {
            requireCount: true,
            enableChangeRounding: false,
            maxAmount: 100000,
          },
        },
        fees: {
          type: "none",
          value: 0,
          minFee: 0,
          maxFee: 0,
        },
        limits: {
          minAmount: 0,
          maxAmount: 100000,
          dailyLimit: 500000,
          monthlyLimit: 5000000,
        },
        requirements: {
          requireCustomerInfo: false,
          requireEmail: false,
          requirePhone: false,
          requireAddress: false,
        },
        availability: {
          type: "always",
        },
      },
      {
        method: "transfer",
        isActive: true,
        displayName: "Transferencia",
        description: "Transferencias bancarias",
        icon: "credit-card",
        priority: 90,
        config: {
          transfer: {
            accountNumber: "0000123456",
            bankName: "Banco Ejemplo",
            accountHolder: "Bartender System",
            cbu: "0000001234567890123456",
            alias: "bartender.pay",
            requireProof: true,
          },
        },
        fees: {
          type: "none",
          value: 0,
          minFee: 0,
          maxFee: 0,
        },
        limits: {
          minAmount: 100,
          maxAmount: 500000,
          dailyLimit: 1000000,
          monthlyLimit: 10000000,
        },
        requirements: {
          requireCustomerInfo: true,
          requireEmail: false,
          requirePhone: true,
          requireAddress: false,
        },
        availability: {
          type: "always",
        },
      },
      {
        method: "card",
        isActive: false,
        displayName: "Tarjeta",
        description: "Tarjetas de crédito/débito",
        icon: "credit-card",
        priority: 80,
        config: {
          card: {
            provider: "local",
            apiKey: "",
            merchantId: "",
            terminalId: "",
            enableTip: false,
            maxAmount: 100000,
          },
        },
        fees: {
          type: "percentage",
          value: 3.5,
          minFee: 10,
          maxFee: 1000,
        },
        limits: {
          minAmount: 50,
          maxAmount: 100000,
          dailyLimit: 1000000,
          monthlyLimit: 10000000,
        },
        requirements: {
          requireCustomerInfo: true,
          requireEmail: false,
          requirePhone: true,
          requireAddress: false,
        },
        availability: {
          type: "always",
        },
      },
      {
        method: "split",
        isActive: true,
        displayName: "Dividir Cuenta",
        description: "Dividir pagos entre varias personas",
        icon: "users",
        priority: 70,
        config: {
          split: {
            maxSplits: 10,
            minAmountPerSplit: 100,
            enableUnevenSplit: true,
          },
        },
        fees: {
          type: "none",
          value: 0,
          minFee: 0,
          maxFee: 0,
        },
        limits: {
          minAmount: 200,
          maxAmount: 100000,
          dailyLimit: 500000,
          monthlyLimit: 5000000,
        },
        requirements: {
          requireCustomerInfo: false,
          requireEmail: false,
          requirePhone: false,
          requireAddress: false,
        },
        availability: {
          type: "always",
        },
      },
      {
        method: "partial",
        isActive: true,
        displayName: "Pago Parcial",
        description: "Realizar un pago parcial",
        icon: "wallet",
        priority: 60,
        config: {
          cash: {
            requireCount: true,
            enableChangeRounding: false,
            maxAmount: 100000,
          },
        },
        fees: {
          type: "none",
          value: 0,
          minFee: 0,
          maxFee: 0,
        },
        limits: {
          minAmount: 50,
          maxAmount: 100000,
          dailyLimit: 500000,
          monthlyLimit: 5000000,
        },
        requirements: {
          requireCustomerInfo: false,
          requireEmail: false,
          requirePhone: false,
          requireAddress: false,
        },
        availability: {
          type: "always",
        },
      },
    ];

    const inserted = await this.insertMany(defaultMethods);
    console.log(` Seeded ${inserted.length} default payment methods`);
    return inserted;
  } catch (error) {
    console.error("Error seeding default payment methods:", error);
    throw error;
  }
};

/* =========================================================
   TO JSON
========================================================= */
paymentMethodConfigSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    // No exponer API keys en respuestas JSON
    if (ret.config?.card?.apiKey) delete ret.config.card.apiKey;
    if (ret.config?.qr?.apiKey) delete ret.config.qr.apiKey;
    if (ret.config?.wallet?.apiKey) delete ret.config.wallet.apiKey;
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

paymentMethodConfigSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    if (ret.config?.card?.apiKey) delete ret.config.card.apiKey;
    if (ret.config?.qr?.apiKey) delete ret.config.qr.apiKey;
    if (ret.config?.wallet?.apiKey) delete ret.config.wallet.apiKey;
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("PaymentMethodConfig", paymentMethodConfigSchema);
