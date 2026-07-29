/* =========================================================
   SESSION MODEL
   Modelo para gestión de sesiones con refresh tokens
========================================================= */

import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  // Identificación
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Refresh Token (hasheado)
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },

  // Información de plataforma y dispositivo
  platform: {
    type: String,
    enum: ['web', 'desktop', 'mobile', 'admin'],
    default: 'web',
  },

  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    name: String,
    os: String,
    browser: String,
    userAgent: String,
  },

  // Ubicación
  location: {
    ip: String,
    country: String,
    city: String,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },

  lastActivity: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  revokedAt: {
    type: Date,
    default: null,
  },

  // Estado
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
  },

  // Metadatos
  metadata: {
    isTrusted: {
      type: Boolean,
      default: false,
    },
    isRemembered: {
      type: Boolean,
      default: false,
    },
    loginMethod: {
      type: String,
      enum: ['password', 'google', 'github', 'microsoft', 'apple'],
      default: 'password',
    },
    mfaVerified: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Índices
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ status: 1, expiresAt: 1 });

// Método para verificar si la sesión está activa
sessionSchema.methods.isActive = function() {
  return this.status === 'active' && this.expiresAt > new Date();
};

// Método para revocar la sesión
sessionSchema.methods.revoke = async function() {
  this.status = 'revoked';
  this.revokedAt = new Date();
  return await this.save();
};

// Método para actualizar última actividad
sessionSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  return await this.save();
};

// Método estático para limpiar sesiones expiradas
sessionSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    status: 'active',
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

// Método estático para obtener sesiones activas de un usuario
sessionSchema.statics.getActiveSessions = async function(userId) {
  return this.find({
    userId,
    status: 'active',
    expiresAt: { $gt: new Date() },
  }).sort({ lastActivity: -1 });
};

// Método estático para revocar todas las sesiones de un usuario
sessionSchema.statics.revokeAllUserSessions = async function(userId, exceptSessionId = null) {
  const query = {
    userId,
    status: 'active',
  };

  if (exceptSessionId) {
    query._id = { $ne: exceptSessionId };
  }

  const result = await this.updateMany(query, {
    status: 'revoked',
    revokedAt: new Date(),
  });

  return result.modifiedCount;
};

// Método estático para revocar sesión por refresh token
sessionSchema.statics.revokeByRefreshToken = async function(refreshToken) {
  const session = await this.findOne({ refreshToken, status: 'active' });
  
  if (!session) {
    return null;
  }

  await session.revoke();
  return session;
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
