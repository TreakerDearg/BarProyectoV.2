/* =========================================================
   PAYMENT-SPECIFIC ERROR CLASSES
   Custom error types for better error handling and debugging
========================================================= */

export class PaymentError extends Error {
  constructor(message, code = "PAYMENT_ERROR", statusCode = 500) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PaymentValidationError extends PaymentError {
  constructor(message) {
    super(message, "PAYMENT_VALIDATION_ERROR", 400);
    this.name = "PaymentValidationError";
  }
}

export class PaymentNotFoundError extends PaymentError {
  constructor(message = "Payment not found") {
    super(message, "PAYMENT_NOT_FOUND", 404);
    this.name = "PaymentNotFoundError";
  }
}

export class TableNotFoundError extends PaymentError {
  constructor(message = "Table not found") {
    super(message, "TABLE_NOT_FOUND", 404);
    this.name = "TableNotFoundError";
  }
}

export class OrderNotFoundError extends PaymentError {
  constructor(message = "Order not found") {
    super(message, "ORDER_NOT_FOUND", 404);
    this.name = "OrderNotFoundError";
  }
}

export class OrderAlreadyPaidError extends PaymentError {
  constructor(message = "Order already paid") {
    super(message, "ORDER_ALREADY_PAID", 400);
    this.name = "OrderAlreadyPaidError";
  }
}

export class OrderAlreadyClosedError extends PaymentError {
  constructor(message = "Order already closed") {
    super(message, "ORDER_ALREADY_CLOSED", 400);
    this.name = "OrderAlreadyClosedError";
  }
}

export class TableNoActiveSessionError extends PaymentError {
  constructor(message = "Table has no active session") {
    super(message, "TABLE_NO_ACTIVE_SESSION", 400);
    this.name = "TableNoActiveSessionError";
  }
}

export class SessionMismatchError extends PaymentError {
  constructor(message = "Session mismatch between order and table") {
    super(message, "SESSION_MISMATCH", 400);
    this.name = "SessionMismatchError";
  }
}

export class InvalidAmountError extends PaymentError {
  constructor(message = "Invalid payment amount") {
    super(message, "INVALID_AMOUNT", 400);
    this.name = "InvalidAmountError";
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(message = "Insufficient funds for payment") {
    super(message, "INSUFFICIENT_FUNDS", 400);
    this.name = "InsufficientFundsError";
  }
}

export class PaymentAlreadyRefundedError extends PaymentError {
  constructor(message = "Payment already refunded") {
    super(message, "PAYMENT_ALREADY_REFUNDED", 400);
    this.name = "PaymentAlreadyRefundedError";
  }
}

export class DatabaseError extends PaymentError {
  constructor(message = "Database operation failed") {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
  }
}

export class PaymentProcessingError extends PaymentError {
  constructor(message = "Payment processing failed") {
    super(message, "PAYMENT_PROCESSING_ERROR", 500);
    this.name = "PaymentProcessingError";
  }
}

export const isPaymentError = (error) => {
  return error instanceof PaymentError;
};

export const getPaymentErrorCode = (error) => {
  if (isPaymentError(error)) {
    return error.code;
  }
  return "UNKNOWN_ERROR";
};

export default {
  PaymentError,
  PaymentValidationError,
  PaymentNotFoundError,
  TableNotFoundError,
  OrderNotFoundError,
  OrderAlreadyPaidError,
  OrderAlreadyClosedError,
  TableNoActiveSessionError,
  SessionMismatchError,
  InvalidAmountError,
  InsufficientFundsError,
  PaymentAlreadyRefundedError,
  DatabaseError,
  PaymentProcessingError,
  isPaymentError,
  getPaymentErrorCode,
};
