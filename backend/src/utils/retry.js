/* =========================================================
   RETRY UTILITY - Database operations with retry logic
   Handles transient database errors with exponential backoff
========================================================= */

import { logger } from "../config/logger.js";

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.delay - Initial delay in ms (default: 100)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 5000)
 * @param {Array} options.retryableErrors - Error types to retry (default: transient errors)
 * @returns {Promise} - Result of the function
 */
export const retry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    delay = 100,
    maxDelay = 5000,
    retryableErrors = [
      'MongoNetworkError',
      'MongoTimeoutError',
      'MongoCursorTimeoutError',
      'MongoServerError',
      'NetworkError',
      'ETIMEDOUT',
      'ECONNRESET',
    ],
  } = options;

  let lastError;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = retryableErrors.some(errorType => 
        error.name === errorType || 
        error.code === errorType ||
        error.message?.includes(errorType)
      );

      if (!isRetryable || attempt === maxRetries) {
        logger.error(`[Retry] Failed after ${attempt} attempts`, {
          error: error.message,
          errorName: error.name,
          errorCode: error.code,
        });
        throw error;
      }

      // Exponential backoff
      const waitTime = Math.min(currentDelay, maxDelay);
      logger.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${waitTime}ms`, {
        error: error.message,
        errorName: error.name,
      });

      await new Promise(resolve => setTimeout(resolve, waitTime));
      currentDelay *= 2; // Exponential backoff
    }
  }

  throw lastError;
};

/**
 * Retry database operations specifically
 * @param {Function} operation - Database operation to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the operation
 */
export const retryDatabaseOperation = async (operation, options = {}) => {
  const defaultOptions = {
    maxRetries: 3,
    delay: 100,
    maxDelay: 3000,
    retryableErrors: [
      'MongoNetworkError',
      'MongoTimeoutError',
      'MongoCursorTimeoutError',
      'MongoServerError',
      'WriteConflict',
      'TransientTransactionError',
    ],
  };

  return retry(operation, { ...defaultOptions, ...options });
};

/**
 * Retry with session for transactional operations
 * @param {Function} operation - Operation that takes a session
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the operation
 */
export const retryWithSession = async (operation, options = {}) => {
  const defaultOptions = {
    maxRetries: 2, // Fewer retries for transactions
    delay: 50,
    maxDelay: 200,
    retryableErrors: [
      'WriteConflict',
      'TransientTransactionError',
    ],
  };

  return retry(operation, { ...defaultOptions, ...options });
};

/**
 * Run a MongoDB transaction with automatic retry on transient errors
 * Handles TransientTransactionError, UnknownTransactionCommitResult, and WriteConflict
 * @param {Function} operation - Function that receives a session and performs transactional operations
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 100)
 * @returns {Promise} - Result of the transaction
 */
export const runTransactionWithRetry = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 100,
  } = options;

  const retryableErrors = [
    'TransientTransactionError',
    'UnknownTransactionCommitResult',
    'WriteConflict',
    'MongoWriteConflict',
  ];

  let lastError;
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = retryableErrors.some(errorType =>
        error.name === errorType ||
        error.code === errorType ||
        error.message?.includes(errorType) ||
        error.message?.includes('Write conflict')
      );

      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      if (!isRetryable || attempt === maxRetries) {
        logger.error(`[Transaction] Failed after ${attempt} attempt(s)`, {
          error: error.message,
          errorName: error.name,
          errorCode: error.code,
        });
        throw error;
      }

      logger.warn(`[Transaction] Retry attempt ${attempt + 1}/${maxRetries} - Write conflict detected`, {
        error: error.message,
        errorName: error.name,
      });

      // Exponential backoff: 100ms, 200ms, 400ms
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= 2;
    } finally {
      session.endSession();
    }
  }

  throw lastError;
};

export default {
  retry,
  retryDatabaseOperation,
  retryWithSession,
  runTransactionWithRetry,
};
