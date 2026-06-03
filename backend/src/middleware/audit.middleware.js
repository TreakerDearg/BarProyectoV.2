import logger from '../config/logger.js';

/**
 * Audit Log Middleware
 * Captures all CRUD operations and important actions for audit trail
 */
export const auditLog = (actionType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override res.json to capture response
    res.json = function (data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditEntry = {
          action: actionType,
          entity: getEntityType(req),
          entityId: getEntityId(req),
          userId: req.user?.id || null,
          userName: req.user?.name || 'System',
          timestamp: new Date(),
          changes: getChanges(req, data),
          metadata: {
            method: req.method,
            path: req.path,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
          },
        };

        // TODO: Save audit entry to database
        // For now, just log it
        logger.info('[Audit]', auditEntry);
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Helper function to determine entity type from request
 */
function getEntityType(req) {
  const path = req.path;
  if (path.includes('/products')) return 'Product';
  if (path.includes('/inventory')) return 'Inventory';
  if (path.includes('/orders')) return 'Order';
  if (path.includes('/users')) return 'User';
  if (path.includes('/tables')) return 'Table';
  if (path.includes('/reservations')) return 'Reservation';
  if (path.includes('/recipes')) return 'Recipe';
  if (path.includes('/menus')) return 'Menu';
  if (path.includes('/discounts')) return 'Discount';
  if (path.includes('/payments')) return 'Payment';
  return 'Unknown';
}

/**
 * Helper function to extract entity ID from request
 */
function getEntityId(req) {
  // Try to get ID from params
  if (req.params.id) return req.params.id;
  if (req.params.productId) return req.params.productId;
  if (req.params.orderId) return req.params.orderId;
  if (req.params.userId) return req.params.userId;
  
  // Try to get ID from body (for create operations)
  if (req.body?._id) return req.body._id;
  if (req.body?.id) return req.body.id;
  
  return null;
}

/**
 * Helper function to extract changes from request/response
 */
function getChanges(req, responseData) {
  const changes = {};

  // For create operations
  if (req.method === 'POST') {
    changes.new = req.body;
  }
  
  // For update operations
  if (req.method === 'PUT' || req.method === 'PATCH') {
    changes.update = req.body;
  }
  
  // For delete operations
  if (req.method === 'DELETE') {
    changes.deleted = true;
  }

  // Add response data if available
  if (responseData?.data) {
    changes.result = responseData.data;
  }

  return changes;
}

/**
 * Specialized audit middleware for specific actions
 */
export const auditCreate = auditLog('create');
export const auditUpdate = auditLog('update');
export const auditDelete = auditLog('delete');
export const auditRead = auditLog('read');
