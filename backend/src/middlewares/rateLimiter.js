const rateLimits = new Map();

const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Muitas requisições. Tente novamente mais tarde.'
  } = options;

  return (req, res, next) => {
    // Bypass em desenvolvimento para localhost
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Limpar registros antigos
    for (const [key, data] of rateLimits.entries()) {
      if (now - data.resetTime > windowMs) {
        rateLimits.delete(key);
      }
    }
    
    const clientData = rateLimits.get(ip);
    
    if (!clientData) {
      rateLimits.set(ip, {
        count: 1,
        resetTime: now
      });
      return next();
    }
    
    if (now - clientData.resetTime > windowMs) {
      rateLimits.set(ip, {
        count: 1,
        resetTime: now
      });
      return next();
    }
    
    clientData.count++;
    
    if (clientData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((windowMs - (now - clientData.resetTime)) / 1000)
      });
    }
    
    next();
  };
};

module.exports = rateLimiter;
