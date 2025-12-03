/**
 * Middleware de tratamento centralizado de erros
 */

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Manipulador de erros do Sequelize
const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(e => e.message);
    return new AppError(`Erro de validação: ${messages.join(', ')}`, 400);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'campo';
    return new AppError(`${field} já existe no sistema`, 409);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('Registro relacionado não encontrado', 404);
  }

  if (error.name === 'SequelizeDatabaseError') {
    return new AppError('Erro no banco de dados', 500);
  }

  return error;
};

// Middleware principal de erro
const errorHandler = (err, req, res, next) => {
  const error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log de erro para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro capturado:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Tratar erros do Sequelize
  if (err.name && err.name.includes('Sequelize')) {
    error = handleSequelizeError(err);
  }

  // Resposta de erro
  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
};

// Manipulador de rotas não encontradas
const notFound = (req, res, next) => {
  const error = new AppError(`Rota não encontrada: ${req.originalUrl}`, 404);
  next(error);
};

// Manipulador para erros assíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};
