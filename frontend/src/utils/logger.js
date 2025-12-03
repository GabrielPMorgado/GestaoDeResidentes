/**
 * Sistema de Logging para Frontend
 * Gerencia logs de forma profissional com controle de ambiente
 */

const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Níveis de log
 */
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Cores para console (desenvolvimento)
 */
const LogColors = {
  DEBUG: '#6c757d',
  INFO: '#0dcaf0',
  WARN: '#ffc107',
  ERROR: '#dc3545'
};

/**
 * Formata a mensagem de log
 */
const formatMessage = (level, message, data) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  return {
    timestamp,
    level,
    message,
    data
  };
};

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log de debug (apenas desenvolvimento)
   */
  debug: (message, data = null) => {
    if (!isDevelopment) return;
    
    const formatted = formatMessage(LogLevel.DEBUG, message, data);
    console.log(
      `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
      `color: ${LogColors.DEBUG}`,
      data || ''
    );
  },

  /**
   * Log informativo
   */
  info: (message, data = null) => {
    if (!isDevelopment) return;
    
    const formatted = formatMessage(LogLevel.INFO, message, data);
    console.log(
      `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
      `color: ${LogColors.INFO}`,
      data || ''
    );
  },

  /**
   * Log de aviso
   */
  warn: (message, data = null) => {
    const formatted = formatMessage(LogLevel.WARN, message, data);
    
    if (isDevelopment) {
      console.warn(
        `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
        `color: ${LogColors.WARN}`,
        data || ''
      );
    }
    
    // Em produção, pode enviar para serviço de monitoramento
    // sendToMonitoring(formatted);
  },

  /**
   * Log de erro
   */
  error: (message, error = null) => {
    const formatted = formatMessage(LogLevel.ERROR, message, error);
    
    if (isDevelopment) {
      console.error(
        `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
        `color: ${LogColors.ERROR}; font-weight: bold`,
        error || ''
      );
    }
    
    // Em produção, pode enviar para serviço de monitoramento (Sentry, etc)
    // sendToMonitoring(formatted);
  },

  /**
   * Log de requisição API
   */
  api: (method, url, status, data = null) => {
    if (!isDevelopment) return;
    
    const color = status >= 200 && status < 300 ? '#28a745' : '#dc3545';
    console.log(
      `%c[API] ${method.toUpperCase()} ${url} - Status: ${status}`,
      `color: ${color}`,
      data || ''
    );
  },

  /**
   * Log de performance
   */
  performance: (label, duration) => {
    if (!isDevelopment) return;
    
    console.log(
      `%c[PERFORMANCE] ${label}: ${duration.toFixed(2)}ms`,
      'color: #6f42c1'
    );
  }
};

/**
 * Hook para medir performance de funções
 */
export const measurePerformance = async (label, fn) => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  logger.performance(label, duration);
  
  return result;
};

/**
 * Exportação padrão
 */
export default logger;
