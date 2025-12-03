/**
 * Middleware para limitar taxa de requisições (Rate Limiting)
 * Previne abuso e ataques DDoS
 */

const rateLimits = new Map();

const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    maxRequests = 100,
    message = 'Muitas requisições. Tente novamente mais tarde.'
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Limpar registros antigos
    for (const [key, data] of rateLimits.entries()) {
      if (now - data.resetTime > windowMs) {
        rateLimits.delete(key);
      }
    }
    
    // Verificar limite para este IP
    const clientData = rateLimits.get(ip);
    
    if (!clientData) {
      rateLimits.set(ip, {
        count: 1,
        resetTime: now
      });
      return next();
    }
    
    // Resetar se passou a janela de tempo
    if (now - clientData.resetTime > windowMs) {
      rateLimits.set(ip, {
        count: 1,
        resetTime: now
      });
      return next();
    }
    
    // Incrementar contador
    clientData.count++;
    
    // Verificar se excedeu o limite
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
