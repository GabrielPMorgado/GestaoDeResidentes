/**
 * Middleware para logging de requisições
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capturar o método original res.json para logar a resposta
  const originalJson = res.json.bind(res);
  
  res.json = function(body) {
    const duration = Date.now() - start;
    
    // Log colorido no console
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const resetColor = '\x1b[0m';
    
    console.log(
      `${new Date().toISOString()} | ` +
      `${statusColor}${res.statusCode}${resetColor} | ` +
      `${req.method} ${req.path} | ` +
      `${duration}ms`
    );
    
    return originalJson(body);
  };
  
  next();
};

module.exports = requestLogger;
