import axios from 'axios';
import logger from '../utils/logger';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do axios com configurações globais
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de requisição (para adicionar token, etc)
api.interceptors.request.use(
  (config) => {
    // Log da requisição
    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    logger.error('Erro ao configurar requisição', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta (para tratar erros globalmente)
api.interceptors.response.use(
  (response) => {
    // Log da resposta bem-sucedida
    logger.api(
      response.config.method,
      response.config.url,
      response.status,
      response.data
    );
    
    return response;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response) {
      // Erro de resposta do servidor
      const { status, data } = error.response;
      
      logger.api(
        error.config?.method || 'UNKNOWN',
        error.config?.url || 'UNKNOWN',
        status,
        data
      );
      
      switch (status) {
        case 401:
          // Não autorizado - redirecionar para login
          logger.warn('Não autorizado', data.message);
          // window.location.href = '/login';
          break;
        case 403:
          // Proibido
          logger.warn('Acesso negado', data.message);
          break;
        case 404:
          // Não encontrado
          logger.warn('Recurso não encontrado', data.message);
          break;
        case 500:
          // Erro interno do servidor
          logger.error('Erro no servidor', data.message);
          break;
        default:
          logger.error('Erro na requisição', data.message);
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      logger.error('Servidor não respondeu. Verifique sua conexão.', error);
    } else {
      // Erro ao configurar a requisição
      logger.error('Erro na configuração da requisição', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
