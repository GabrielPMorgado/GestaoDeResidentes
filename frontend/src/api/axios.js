import axios from 'axios';

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
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta (para tratar erros globalmente)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response) {
      // Erro de resposta do servidor
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Não autorizado - redirecionar para login
          console.error('Não autorizado:', data.message);
          // window.location.href = '/login';
          break;
        case 403:
          // Proibido
          console.error('Acesso negado:', data.message);
          break;
        case 404:
          // Não encontrado
          console.error('Recurso não encontrado:', data.message);
          break;
        case 500:
          // Erro interno do servidor
          console.error('Erro no servidor:', data.message);
          break;
        default:
          console.error('Erro na requisição:', data.message);
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('Servidor não respondeu. Verifique sua conexão.');
    } else {
      // Erro ao configurar a requisição
      console.error('Erro na configuração da requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
