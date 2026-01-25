// Not found handler
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with this value already exists.',
          field: err.meta?.target?.[0],
          statusCode: 409,
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Not Found',
          message: 'Record not found.',
          statusCode: 404,
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid reference to related record.',
          statusCode: 400,
        });
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      statusCode: 400,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
      statusCode: 401,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
      statusCode: 401,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'File too large',
      statusCode: 400,
    });
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
