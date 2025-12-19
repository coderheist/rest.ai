import morgan from 'morgan';
import logger from '../utils/logger.js';

// Custom Morgan token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startTime) return '0';
  const diff = process.hrtime(req._startTime);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
});

// Custom Morgan token for user ID
morgan.token('user-id', (req) => {
  return req.user?._id || 'anonymous';
});

// Custom Morgan token for tenant ID
morgan.token('tenant-id', (req) => {
  return req.user?.tenantId || 'none';
});

// Define Morgan format
const morganFormat = ':method :url :status :response-time-ms ms - :user-id - :tenant-id - :remote-addr';

// Create Morgan middleware that uses Winston
export const requestLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip logging health check endpoints in production
    if (process.env.NODE_ENV === 'production' && req.url === '/api/health') {
      return true;
    }
    return false;
  }
});

// Enhanced request logging middleware with timing
export const enhancedRequestLogger = (req, res, next) => {
  // Start timer
  req._startTime = process.hrtime();
  
  // Log request start
  logger.http({
    type: 'request_start',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?._id,
    tenantId: req.user?.tenantId
  });

  // Capture original end method
  const originalEnd = res.end;

  // Override end method to log response
  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    // Calculate response time
    const diff = process.hrtime(req._startTime);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    // Log response
    logger.http({
      type: 'request_complete',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?._id,
      tenantId: req.user?.tenantId,
      contentLength: res.get('content-length')
    });
  };

  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error({
    type: 'error',
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id,
    tenantId: req.user?.tenantId,
    statusCode: err.statusCode || 500
  });

  next(err);
};

export default requestLogger;
