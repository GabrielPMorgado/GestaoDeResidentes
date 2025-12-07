/**
 * Logger centralizado para o sistema
 * Controla logs baseado no ambiente (development/production)
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const DEBUG_ENABLED = process.env.DEBUG === 'true' || isDevelopment;

const logger = {
  // Log de informação (sempre mostra)
  info: (...args) => {
    console.log('[INFO]', ...args);
  },

  // Log de erro (sempre mostra)
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  // Log de debug (apenas em desenvolvimento ou se DEBUG=true)
  debug: (...args) => {
    if (DEBUG_ENABLED) {
      console.log('[DEBUG]', ...args);
    }
  },

  // Log de warning
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  // Log de sucesso
  success: (...args) => {
    if (DEBUG_ENABLED) {
      console.log('[✓]', ...args);
    }
  }
};

module.exports = logger;
