import mongoose from "mongoose";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Table from "../models/Table.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Reservation from "../models/Reservation.js";
import { logger } from "../config/logger.js";
import {
  ok, badRequest, notFound,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   GET USER PERFORMANCE
========================================================= */
export const getUserPerformance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { period = "monthly", startDate, endDate } = req.query;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    // Calcular rango de fechas
    let dateFilter = {};
    if (period === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else if (period === "monthly") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    } else if (startDate && endDate) {
      dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Obtener datos de rendimiento del usuario
    const performance = user.performance || {};

    // Calcular métricas específicas según rol
    const moduleMetrics = {};

    if (user.role === "waiter" || user.role === "bartender") {
      // Métricas de mesas
      const tableSessions = await Table.find({
        currentServer: userId,
        updatedAt: dateFilter
      });

      moduleMetrics.tables = {
        totalServed: tableSessions.length,
        avgServiceTime: calculateAverageServiceTime(tableSessions),
        customerSatisfaction: calculateCustomerSatisfaction(tableSessions),
      };
    }

    if (user.role === "kitchen" || user.role === "bartender") {
      // Métricas de pedidos
      const orders = await Order.find({
        processedBy: userId,
        createdAt: dateFilter
      });

      moduleMetrics.orders = {
        totalProcessed: orders.length,
        avgPrepTime: calculateAveragePrepTime(orders),
        accuracy: calculateOrderAccuracy(orders),
      };
    }

    if (user.role === "cashier") {
      // Métricas de pagos
      const payments = await Payment.find({
        processedBy: userId,
        createdAt: dateFilter
      });

      moduleMetrics.payments = {
        totalProcessed: payments.length,
        avgProcessingTime: calculateAveragePaymentTime(payments),
        accuracy: calculatePaymentAccuracy(payments),
        totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      };
    }

    if (user.role === "waiter") {
      // Métricas de reservas
      const reservations = await Reservation.find({
        createdBy: userId,
        createdAt: dateFilter
      });

      moduleMetrics.reservations = {
        totalManaged: reservations.length,
        noShowRate: calculateNoShowRate(reservations),
        confirmationRate: calculateConfirmationRate(reservations),
      };
    }

    // Combinar con métricas almacenadas
    const combinedMetrics = {
      ...performance.modules,
      ...moduleMetrics,
    };

    return ok(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shift: user.shift,
      },
      performance: {
        totalShifts: performance.totalShifts || 0,
        totalHours: performance.totalHours || 0,
        averageRating: performance.averageRating || 0,
        totalOrders: performance.totalOrders || 0,
        totalSales: performance.totalSales || 0,
        avgOrderTime: performance.avgOrderTime || 0,
        errorRate: performance.errorRate || 0,
        onTimeRate: performance.onTimeRate || 0,
      },
      modules: combinedMetrics,
      period,
      dateRange: dateFilter,
    });
  } catch (error) { throw error; }
};

/* =========================================================
   GET PERFORMANCE SUMMARY (BY ROLE)
========================================================= */
export const getPerformanceSummary = async (req, res, next) => {
  try {
    const { role, period = "monthly" } = req.query;

    const match = { isEmployee: true };
    if (role) match.role = role;

    const users = await User.find(match).select("name email role performance");

    const summary = users.map(user => {
      const perf = user.performance || {};
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        metrics: {
          totalShifts: perf.totalShifts || 0,
          totalHours: perf.totalHours || 0,
          averageRating: perf.averageRating || 0,
          totalSales: perf.totalSales || 0,
          errorRate: perf.errorRate || 0,
          onTimeRate: perf.onTimeRate || 0,
        },
        modules: perf.modules || {},
      };
    });

    // Calcular promedios del equipo
    const teamAverages = {
      totalShifts: summary.reduce((sum, s) => sum + s.metrics.totalShifts, 0) / summary.length,
      totalHours: summary.reduce((sum, s) => sum + s.metrics.totalHours, 0) / summary.length,
      averageRating: summary.reduce((sum, s) => sum + s.metrics.averageRating, 0) / summary.length,
      totalSales: summary.reduce((sum, s) => sum + s.metrics.totalSales, 0),
      errorRate: summary.reduce((sum, s) => sum + s.metrics.errorRate, 0) / summary.length,
      onTimeRate: summary.reduce((sum, s) => sum + s.metrics.onTimeRate, 0) / summary.length,
    };

    return ok(res, {
      summary,
      teamAverages,
      totalEmployees: summary.length,
    });
  } catch (error) { throw error; }
};

/* =========================================================
   UPDATE PERFORMANCE METRICS
======================================================== */
export const updatePerformance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { module, data } = req.body;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    if (!module || !data) {
      return badRequest(res, "Módulo y datos son obligatorios");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    // Actualizar métricas específicas del módulo
    const updatePath = `performance.modules.${module}`;
    const updates = {};

    Object.keys(data).forEach(key => {
      updates[`${updatePath}.${key}`] = data[key];
    });

    await User.findByIdAndUpdate(userId, {
      $inc: updates,
      $set: { "performance.totalShifts": 1 }
    });

    logger.info(`[Performance] Updated: ${userId} module ${module}`);

    return ok(res, { module, data }, "Métricas de rendimiento actualizadas");
  } catch (error) { throw error; }
};

/* =========================================================
   GET PERFORMANCE RANKING
======================================================== */
export const getPerformanceRanking = async (req, res, next) => {
  try {
    const { role, metric = "totalSales", period = "monthly", limit = 10 } = req.query;

    let aggregationPipeline = [
      { $match: { isEmployee: true } }
    ];

    if (role) {
      aggregationPipeline.push({ $match: { role } });
    }

    let metricPath = `performance.${metric}`;
    if (metric === "sales") metricPath = "performance.totalSales";
    if (metric === "rating") metricPath = "performance.averageRating";
    if (metric === "shifts") metricPath = "performance.totalShifts";

    aggregationPipeline.push(
      {
        $sort: { [metricPath]: -1 }
      },
      {
        $limit: parseInt(limit) || 10
      },
      {
        $project: {
          user: "$name",
          email: "$email",
          role: "$role",
          metric: `$${metricPath}`,
        }
      }
    );

    const ranking = await User.aggregate(aggregationPipeline);

    return ok(res, {
      ranking,
      metric,
      period,
      count: ranking.length,
    });
  } catch (error) { throw error; }
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */
function calculateAverageServiceTime(tableSessions) {
  if (!tableSessions || tableSessions.length === 0) return 0;
  
  const times = tableSessions
    .filter(t => t.currentSessionStart && t.closedAt)
    .map(t => (new Date(t.closedAt) - new Date(t.currentSessionStart)) / (1000 * 60)); // minutos

  if (times.length === 0) return 0;
  return parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2));
}

function calculateCustomerSatisfaction(tableSessions) {
  // Placeholder - en realidad vendría de reviews/feedback
  return Math.floor(Math.random() * 20) + 80; // 80-100
}

function calculateAveragePrepTime(orders) {
  if (!orders || orders.length === 0) return 0;
  
  const times = orders
    .filter(o => o.createdAt && o.completedAt)
    .map(o => (new Date(o.completedAt) - new Date(o.createdAt)) / (1000 * 60));

  if (times.length === 0) return 0;
  return parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2));
}

function calculateOrderAccuracy(orders) {
  // Placeholder - en realidad contaría errores vs total
  return Math.floor(Math.random() * 10) + 90; // 90-100
}

function calculateAveragePaymentTime(payments) {
  if (!payments || payments.length === 0) return 0;
  
  const times = payments
    .filter(p => p.createdAt && p.completedAt)
    .map(p => (new Date(p.completedAt) - new Date(p.createdAt)) / (1000 * 60));

  if (times.length === 0) return 0;
  return parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2));
}

function calculatePaymentAccuracy(payments) {
  // Placeholder - en realidad contaría errores vs total
  return 100;
}

function calculateNoShowRate(reservations) {
  if (!reservations || reservations.length === 0) return 0;
  
  const noShows = reservations.filter(r => r.status === "no-show").length;
  return parseFloat(((noShows / reservations.length) * 100).toFixed(2));
}

function calculateConfirmationRate(reservations) {
  if (!reservations || reservations.length === 0) return 0;
  
  const confirmed = reservations.filter(r => r.status === "confirmed" || r.status === "seated").length;
  return parseFloat(((confirmed / reservations.length) * 100).toFixed(2));
}
