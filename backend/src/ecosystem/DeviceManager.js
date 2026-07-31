/**
 * DEVICE MANAGER
 * Gestiona todos los dispositivos y sesiones del ecosistema
 */

import mongoose from "mongoose";

/**
 * Esquema de dispositivo/sesión
 */
const deviceSchema = new mongoose.Schema(
  {
    /* ================= USER INFO ================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },

    /* ================= DEVICE INFO ================= */
    platform: {
      type: String,
      required: true,
      enum: ['web_client', 'web_admin', 'desktop', 'mobile', 'tablet', 'kiosk', 'api'],
      index: true,
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'laptop', 'mobile', 'tablet', 'kiosk', 'server', 'other'],
    },
    browser: {
      type: String,
    },
    os: {
      type: String,
    },
    appVersion: {
      type: String,
    },
    deviceName: {
      type: String,
    },

    /* ================= NETWORK INFO ================= */
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },

    /* ================= SESSION INFO ================= */
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    refreshTokenId: {
      type: String,
      index: true,
    },
    tokenExpiresAt: {
      type: Date,
    },
    refreshTokenExpiresAt: {
      type: Date,
    },

    /* ================= ACTIVITY ================= */
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },

    /* ================= METADATA ================= */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================= INDEXES ================= */
deviceSchema.index({ userId: 1, isActive: 1, lastActivity: -1 });
deviceSchema.index({ userId: 1, platform: 1 });
deviceSchema.index({ sessionId: 1, isActive: 1 });
deviceSchema.index({ refreshTokenId: 1, isActive: 1 });
deviceSchema.index({ lastActivity: -1 }); // Para limpieza de sesiones expiradas

/* ================= METHODS ================= */
/**
 * Registra un nuevo dispositivo/sesión
 */
deviceSchema.statics.registerDevice = async function (deviceData) {
  try {
    const device = await this.create({
      ...deviceData,
      lastActivity: new Date(),
      isActive: true,
      isRevoked: false,
    });
    return device;
  } catch (error) {
    console.error('Error al registrar dispositivo:', error);
    throw error;
  }
};

/**
 * Obtiene todos los dispositivos activos de un usuario
 */
deviceSchema.statics.getActiveDevices = async function (userId) {
  return this.find({
    userId,
    isActive: true,
    isRevoked: false,
  }).sort({ lastActivity: -1 });
};

/**
 * Obtiene todos los dispositivos de un usuario (incluyendo inactivos)
 */
deviceSchema.statics.getAllDevices = async function (userId) {
  return this.find({
    userId,
  }).sort({ lastActivity: -1 });
};

/**
 * Actualiza la última actividad de un dispositivo
 */
deviceSchema.statics.updateActivity = async function (sessionId) {
  return this.findOneAndUpdate(
    { sessionId, isActive: true, isRevoked: false },
    { lastActivity: new Date() },
    { new: true }
  );
};

/**
 * Revoca un dispositivo específico
 */
deviceSchema.statics.revokeDevice = async function (sessionId, reason = 'user_action') {
  return this.findOneAndUpdate(
    { sessionId },
    {
      isActive: false,
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
    { new: true }
  );
};

/**
 * Revoca todos los dispositivos de un usuario excepto el actual
 */
deviceSchema.statics.revokeAllDevicesExcept = async function (userId, currentSessionId, reason = 'global_logout') {
  return this.updateMany(
    {
      userId,
      sessionId: { $ne: currentSessionId },
      isActive: true,
      isRevoked: false,
    },
    {
      isActive: false,
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
};

/**
 * Revoca todos los dispositivos de un usuario
 */
deviceSchema.statics.revokeAllDevices = async function (userId, reason = 'global_logout') {
  return this.updateMany(
    {
      userId,
      isActive: true,
      isRevoked: false,
    },
    {
      isActive: false,
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    }
  );
};

/**
 * Revoca un dispositivo por refreshTokenId
 */
deviceSchema.statics.revokeByRefreshToken = async function (refreshTokenId, reason = 'token_revoked') {
  return this.findOneAndUpdate(
    { refreshTokenId, isActive: true, isRevoked: false },
    {
      isActive: false,
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
    { new: true }
  );
};

/**
 * Verifica si un dispositivo es válido
 */
deviceSchema.statics.isDeviceValid = async function (sessionId) {
  const device = await this.findOne({
    sessionId,
    isActive: true,
    isRevoked: false,
  });
  return !!device;
};

/**
 * Limpia dispositivos expirados (para mantenimiento)
 */
deviceSchema.statics.cleanupExpiredDevices = async function () {
  const now = new Date();
  const result = await this.deleteMany({
    $or: [
      { tokenExpiresAt: { $lt: now } },
      { refreshTokenExpiresAt: { $lt: now } },
    ],
    isActive: true,
  });
  return result.deletedCount;
};

/**
 * Obtiene estadísticas de dispositivos de un usuario
 */
deviceSchema.statics.getDeviceStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$isActive', true] }, { $eq: ['$isRevoked', false] }] }, 1, 0],
          },
        },
      },
    },
  ]);
  return stats;
};

export default mongoose.model("Device", deviceSchema);
