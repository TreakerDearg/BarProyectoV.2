import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';
import { ok, badRequest } from '../utils/response.js';
import { logger } from '../config/logger.js';

/**
 * Export audit logs to Excel format
 */
export const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, entityType, actionType } = req.query;

    // TODO: Fetch audit logs from database based on filters
    // For now, return sample data
    const auditLogs = [
      {
        id: '1',
        action: 'create',
        entity: 'Product',
        entityId: 'prod_001',
        userId: req.user?.id || 'system',
        userName: req.user?.name || 'System',
        timestamp: new Date(),
        changes: { name: 'New Product', price: 10.99 },
        metadata: { ip: '127.0.0.1' },
      },
      {
        id: '2',
        action: 'update',
        entity: 'Inventory',
        entityId: 'inv_001',
        userId: req.user?.id || 'system',
        userName: req.user?.name || 'System',
        timestamp: new Date(Date.now() - 3600000),
        changes: { stock: { from: 50, to: 45 } },
        metadata: { ip: '127.0.0.1' },
      },
    ];

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Audit Logs');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Action', key: 'action', width: 15 },
      { header: 'Entity', key: 'entity', width: 20 },
      { header: 'Entity ID', key: 'entityId', width: 25 },
      { header: 'User', key: 'userName', width: 20 },
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Changes', key: 'changes', width: 40 },
      { header: 'Metadata', key: 'metadata', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    auditLogs.forEach((log) => {
      worksheet.addRow({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        userName: log.userName,
        timestamp: log.timestamp.toISOString(),
        changes: JSON.stringify(log.changes),
        metadata: JSON.stringify(log.metadata),
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    logger.info('[Audit] Audit logs exported successfully');
    return res.send(buffer);
  } catch (error) {
    logger.error('[Audit] Error exporting audit logs:', error);
    return badRequest(res, 'Error exporting audit logs');
  }
};

/**
 * Get audit logs — lee desde ActivityLog (fuente de verdad real)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      activityType,
      userId,
      userRole,
      shift,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // Construir filtro
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }
    if (activityType && activityType !== 'all') filter.activityType = activityType;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }
    if (userRole) filter.userRole = userRole;
    if (shift)    filter.shift    = shift;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    // Mapear al formato que espera el frontend (AuditLog interface)
    const mapped = logs.map((log) => ({
      id:         log._id.toString(),
      action:     mapActivityTypeToAction(log.activityType),
      entity:     mapActivityTypeToEntity(log.activityType),
      entityId:   log.orderId?.toString() || log.tableId?.toString() || undefined,
      userId:     log.userId?.toString(),
      userName:   log.userName,
      userRole:   log.userRole,
      timestamp:  log.createdAt,
      description: log.description,
      shift:      log.shift,
      metadata:   log.metadata || {},
      ipAddress:  log.metadata?.ip || undefined,
    }));

    logger.info(`[Audit] ${mapped.length} activity logs retrieved`);

    return ok(res, {
      logs: mapped,
      pagination: {
        page:       pageNum,
        limit:      limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('[Audit] Error fetching audit logs:', error);
    return badRequest(res, 'Error al obtener logs de auditoría');
  }
};

// Mapear activityType del modelo al formato "action" del frontend
function mapActivityTypeToAction(activityType) {
  const map = {
    login: 'login',
    logout: 'logout',
    identity_decision: 'login',
    order_created: 'create',
    order_completed: 'update',
    order_cancelled: 'delete',
    payment_processed: 'create',
    inventory_updated: 'update',
    discount_applied: 'update',
    table_assigned: 'update',
    menu_viewed: 'update',
    recipe_accessed: 'update',
    roulette_used: 'update',
    permission_change: 'update',
    settings_updated: 'update',
  };
  return map[activityType] || 'update';
}

function mapActivityTypeToEntity(activityType) {
  const map = {
    login: 'Auth',
    logout: 'Auth',
    identity_decision: 'Auth',
    order_created: 'Order',
    order_completed: 'Order',
    order_cancelled: 'Order',
    payment_processed: 'Payment',
    inventory_updated: 'Inventory',
    discount_applied: 'Discount',
    table_assigned: 'Table',
    menu_viewed: 'Menu',
    recipe_accessed: 'Recipe',
    roulette_used: 'Roulette',
    permission_change: 'User',
    settings_updated: 'Settings',
  };
  return map[activityType] || 'System';
}
};

/**
 * Clear audit logs (admin only)
 */
export const clearAuditLogs = async (req, res) => {
  try {
    const { beforeDate } = req.body;

    // TODO: Delete audit logs from database before specified date
    // For now, just log the action
    logger.info('[Audit] Audit logs cleared', { beforeDate });

    return ok(res, { message: 'Audit logs cleared successfully' });
  } catch (error) {
    logger.error('[Audit] Error clearing audit logs:', error);
    return badRequest(res, 'Error clearing audit logs');
  }
};
