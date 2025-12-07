const isDevelopment = import.meta.env.MODE === 'development';
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

const LogColors = {
  DEBUG: '#6c757d',
  INFO: '#0dcaf0',
  WARN: '#ffc107',
  ERROR: '#dc3545'
};

const formatMessage = (level, message, data) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  return { timestamp, level, message, data };
};

export const logger = {
  debug: (message, data = null) => {
    if (!isDevelopment || !isDebugEnabled) return;
    const formatted = formatMessage('DEBUG', message, data);
    console.log(
      `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
      `color: ${LogColors.DEBUG}`,
      data || ''
    );
  },

  info: (message, data = null) => {
    if (!isDevelopment) return;
    const formatted = formatMessage('INFO', message, data);
    console.log(
      `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
      `color: ${LogColors.INFO}`,
      data || ''
    );
  },

  warn: (message, data = null) => {
    const formatted = formatMessage('WARN', message, data);
    if (isDevelopment) {
      console.warn(
        `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
        `color: ${LogColors.WARN}`,
        data || ''
      );
    }
  },

  error: (message, error = null) => {
    const formatted = formatMessage('ERROR', message, error);
    if (isDevelopment) {
      console.error(
        `%c[${formatted.timestamp}] ${formatted.level}: ${formatted.message}`,
        `color: ${LogColors.ERROR}; font-weight: bold`,
        error || ''
      );
    }
  },

  api: (method, url, status, data = null) => {
    if (!isDevelopment) return;
    const color = status >= 200 && status < 300 ? '#28a745' : '#dc3545';
    console.log(
      `%c[API] ${method.toUpperCase()} ${url} - Status: ${status}`,
      `color: ${color}`,
      data || ''
    );
  }
};

export default logger;
