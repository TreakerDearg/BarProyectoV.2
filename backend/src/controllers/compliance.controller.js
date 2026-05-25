import mongoose from "mongoose";
import User from "../models/User.js";
import { logger } from "../config/logger.js";
import {
  ok, created, badRequest, notFound,
} from "../utils/response.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   PROTOCOL DEFINITIONS
========================================================= */
const PROTOCOLS = {
  opening: {
    name: "Protocolo de Apertura",
    checklist: [
      { id: "op1", task: "Verificar stock de barra", category: "inventory", weight: 10 },
      { id: "op2", task: "Revisar sistema POS", category: "equipment", weight: 10 },
      { id: "op3", task: "Limpiar áreas de trabajo", category: "cleaning", weight: 15 },
      { id: "op4", task: "Encender equipos", category: "equipment", weight: 10 },
      { id: "op5", task: "Verificar cajas de dinero", category: "cash", weight: 15 },
      { id: "op6", task: "Revisar reservas del día", category: "operations", weight: 10 },
      { id: "op7", task: "Briefing de equipo", category: "communication", weight: 15 },
      { id: "op8", task: "Verificar temperatura de equipos", category: "safety", weight: 10 },
    ],
    targetTime: 30, // minutos
  },
  closing: {
    name: "Protocolo de Cierre",
    checklist: [
      { id: "cl1", task: "Contar caja", category: "cash", weight: 20 },
      { id: "cl2", task: "Cierre de sistema POS", category: "equipment", weight: 15 },
      { id: "cl3", task: "Limpiar y desinfectar áreas", category: "cleaning", weight: 20 },
      { id: "cl4", task: "Apagar equipos", category: "equipment", weight: 10 },
      { id: "cl5", task: "Actualizar inventario ventas", category: "inventory", weight: 15 },
      { id: "cl6", task: "Reporte de incidentes", category: "communication", weight: 10 },
      { id: "cl7", task: "Verificar puertas/ventanas", category: "safety", weight: 10 },
    ],
    targetTime: 25, // minutos
  },
  service: {
    name: "Protocolo de Servicio",
    checklist: [
      { id: "sv1", task: "Saludo al cliente", category: "greeting", weight: 15 },
      { id: "sv2", task: "Presentación de menú", category: "communication", weight: 10 },
      { id: "sv3", task: "Toma de orden correcta", category: "accuracy", weight: 20 },
      { id: "sv4", task: "Confirmación de pedido", category: "accuracy", weight: 15 },
      { id: "sv5", task: "Servicio en tiempo adecuado", category: "timing", weight: 20 },
      { id: "sv6", task: "Despedida del cliente", category: "greeting", weight: 10 },
      { id: "sv7", task: "Limpieza de mesa post-servicio", category: "cleaning", weight: 10 },
    ],
    targetTime: 0, // por servicio
  },
  safety: {
    name: "Protocolo de Seguridad",
    checklist: [
      { id: "sf1", task: "Uso de EPP adecuado", category: "equipment", weight: 20 },
      { id: "sf2", task: "Manipulación higiénica de alimentos", category: "hygiene", weight: 25 },
      { id: "sf3", task: "Procedimientos de emergencia", category: "emergency", weight: 20 },
      { id: "sf4", task: "Almacenamiento seguro", category: "storage", weight: 15 },
      { id: "sf5", task: "Registro de incidentes", category: "reporting", weight: 10 },
      { id: "sf6", task: "Mantenimiento de áreas", category: "maintenance", weight: 10 },
    ],
    targetTime: 0, // continuo
  },
};

/* =========================================================
   GET USER COMPLIANCE
======================================================== */
export const getUserCompliance = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    const compliance = user.compliance || {};

    // Calcular score detallado por protocolo
    const protocolScores = {};
    Object.keys(PROTOCOLS).forEach(protocolKey => {
      const protocolData = compliance.protocols?.[protocolKey] || { completed: 0, total: PROTOCOLS[protocolKey].checklist.length };
      const score = protocolData.total > 0 ? (protocolData.completed / protocolData.total) * 100 : 100;
      
      protocolScores[protocolKey] = {
        score: parseFloat(score.toFixed(2)),
        completed: protocolData.completed || 0,
        total: protocolData.total || PROTOCOLS[protocolKey].checklist.length,
        lastChecked: protocolData.lastChecked,
      };
    });

    return ok(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      compliance: {
        overallScore: compliance.overallScore || 100,
        protocolAdherence: compliance.protocolAdherence || 100,
        timeCompliance: compliance.timeCompliance || 100,
        qualityScore: compliance.qualityScore || 100,
        protocolScores,
        violations: compliance.violations || [],
        warnings: compliance.warnings || [],
      },
    });
  } catch (error) { next(error); }
};

/* =========================================================
   SUBMIT PROTOCOL CHECKLIST
========================================================= */
export const submitProtocolChecklist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { protocol, completedItems, notes, duration } = req.body;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    if (!protocol || !PROTOCOLS[protocol]) {
      return badRequest(res, "Protocolo inválido");
    }

    if (!completedItems || !Array.isArray(completedItems)) {
      return badRequest(res, "Items completados son obligatorios");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    const protocolDefinition = PROTOCOLS[protocol];
    const totalItems = protocolDefinition.checklist.length;
    const completedCount = completedItems.length;
    const score = (completedCount / totalItems) * 100;

    // Verificar cumplimiento de tiempo objetivo
    let timeCompliance = 100;
    if (protocolDefinition.targetTime > 0 && duration) {
      timeCompliance = duration <= protocolDefinition.targetTime ? 100 : Math.max(0, 100 - ((duration - protocolDefinition.targetTime) / protocolDefinition.targetTime) * 50);
    }

    // Actualizar compliance del usuario
    const updatePath = `compliance.protocols.${protocol}`;
    await User.findByIdAndUpdate(userId, {
      [`${updatePath}.completed`]: completedCount,
      [`${updatePath}.total`]: totalItems,
      [`${updatePath}.lastChecked`]: new Date(),
      $inc: { "compliance.timeCompliance": timeCompliance },
      $set: { "compliance.overallScore": calculateOverallScore(completedCount, totalItems, timeCompliance) }
    });

    logger.info(`[Compliance] Protocol submitted: ${userId} ${protocol} (${completedCount}/${totalItems})`);

    return created(res, {
      protocol,
      score: parseFloat(score.toFixed(2)),
      completed: completedCount,
      total: totalItems,
      timeCompliance: parseFloat(timeCompliance.toFixed(2)),
      notes,
    }, "Checklist de protocolo registrado");
  } catch (error) { next(error); }
};

/* =========================================================
   GET PROTOCOL DEFINITION
======================================================== */
export const getProtocolDefinition = async (req, res, next) => {
  try {
    const { protocol } = req.params;

    if (!protocol || !PROTOCOLS[protocol]) {
      return badRequest(res, "Protocolo inválido");
    }

    return ok(res, PROTOCOLS[protocol]);
  } catch (error) { next(error); }
};

/* =========================================================
   REPORT VIOLATION
======================================================== */
export const reportViolation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, description, severity } = req.body;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    if (!type || !description || !severity) {
      return badRequest(res, "Tipo, descripción y severidad son obligatorios");
    }

    const validSeverities = ["low", "medium", "high", "critical"];
    if (!validSeverities.includes(severity)) {
      return badRequest(res, `Severidad inválida. Válidas: ${validSeverities.join(", ")}`);
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    // Agregar violación
    const violation = {
      type,
      description,
      severity,
      date: new Date(),
      resolved: false,
    };

    // Reducir score de compliance según severidad
    const penalty = {
      low: 5,
      medium: 15,
      high: 25,
      critical: 40,
    }[severity];

    await User.findByIdAndUpdate(userId, {
      $push: { "compliance.violations": violation },
      $inc: { "compliance.overallScore": -penalty }
    });

    logger.warn(`[Compliance] Violation reported: ${userId} - ${type} (${severity})`);

    return created(res, violation, "Violación reportada y registrada");
  } catch (error) { next(error); }
};

/* =========================================================
   RESOLVE VIOLATION
======================================================== */
export const resolveViolation = async (req, res, next) => {
  try {
    const { userId, violationId } = req.params;

    if (!isValidId(userId) || !isValidId(violationId)) {
      return badRequest(res, "IDs inválidos");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    const violation = user.compliance?.violations?.id(violationId);
    if (!violation) {
      return notFound(res, "Violación no encontrada");
    }

    await User.findByIdAndUpdate(userId, {
      "compliance.violations.$[elem]._id": violationId,
      "compliance.violations.$[elem].resolved": true,
    });

    logger.info(`[Compliance] Violation resolved: ${userId} - ${violationId}`);

    return ok(res, { resolved: true }, "Violación marcada como resuelta");
  } catch (error) { next(error); }
};

/* =========================================================
   ADD WARNING
======================================================== */
export const addWarning = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, message } = req.body;

    if (!isValidId(userId)) {
      return badRequest(res, "ID inválido");
    }

    if (!type || !message) {
      return badRequest(res, "Tipo y mensaje son obligatorios");
    }

    const user = await User.findById(userId);
    if (!user) {
      return notFound(res, "Usuario no encontrado");
    }

    const warning = {
      type,
      message,
      date: new Date(),
      acknowledged: false,
    };

    await User.findByIdAndUpdate(userId, {
      $push: { "compliance.warnings": warning }
    });

    logger.info(`[Compliance] Warning added: ${userId} - ${type}`);

    return created(res, warning, "Advertencia agregada");
  } catch (error) { next(error); }
};

/* =========================================================
   GET COMPLIANCE REPORT
======================================================== */
export const getComplianceReport = async (req, res, next) => {
  try {
    const { role, period = "monthly" } = req.query;

    const match = { isEmployee: true };
    if (role) match.role = role;

    const users = await User.find(match).select("name email role compliance");

    const report = users.map(user => {
      const comp = user.compliance || {};
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        scores: {
          overall: comp.overallScore || 100,
          protocolAdherence: comp.protocolAdherence || 100,
          timeCompliance: comp.timeCompliance || 100,
          quality: comp.qualityScore || 100,
        },
        violations: {
          total: (comp.violations || []).length,
          unresolved: (comp.violations || []).filter(v => !v.resolved).length,
          bySeverity: groupBySeverity(comp.violations || []),
        },
        warnings: {
          total: (comp.warnings || []).length,
          unacknowledged: (comp.warnings || []).filter(w => !w.acknowledged).length,
        },
      };
    });

    // Calcular promedios del equipo
    const teamStats = {
      averageScore: report.reduce((sum, r) => sum + r.scores.overall, 0) / report.length,
      totalViolations: report.reduce((sum, r) => sum + r.violations.total, 0),
      totalWarnings: report.reduce((sum, r) => sum + r.warnings.total, 0),
      employeesNeedingAttention: report.filter(r => r.scores.overall < 80).length,
    };

    return ok(res, {
      report,
      teamStats,
      totalEmployees: report.length,
    });
  } catch (error) { next(error); }
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */
function calculateOverallScore(completed, total, timeCompliance) {
  const protocolScore = total > 0 ? (completed / total) * 100 : 100;
  return parseFloat(((protocolScore * 0.7) + (timeCompliance * 0.3)).toFixed(2));
}

function groupBySeverity(violations) {
  const groups = { low: 0, medium: 0, high: 0, critical: 0 };
  violations.forEach(v => {
    if (groups[v.severity] !== undefined) {
      groups[v.severity]++;
    }
  });
  return groups;
}
