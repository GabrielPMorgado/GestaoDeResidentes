import axios from 'axios';
import logger from '../utils/logger';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do axios com configurações globais
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    
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

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    logger.api(
      response.config.method,
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      logger.api(
        error.config?.method || 'UNKNOWN',
        error.config?.url || 'UNKNOWN',
        status,
        data
      );
      
      switch (status) {
        case 401:
          logger.warn('Não autorizado', data.message);
          break;
        case 403:
          logger.warn('Acesso negado', data.message);
          break;
        case 404:
          logger.warn('Recurso não encontrado', data.message);
          break;
        case 500:
          logger.error('Erro no servidor', data.message);
          break;
        default:
          logger.error('Erro na requisição', data.message);
      }
    } else if (error.request) {
      logger.error('Servidor não respondeu. Verifique sua conexão.', error);
    } else {
      logger.error('Erro na configuração da requisição', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTION
// ============================================
const handleError = (error, defaultMessage) => {
  throw error.response?.data || { message: defaultMessage };
};

// ============================================
// RESIDENTES
// ============================================
export const criarResidente = async (dados) => {
  try {
    const response = await api.post('/residentes', dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao cadastrar residente');
  }
};

export const listarResidentes = async (filtros = {}) => {
  try {
    const response = await api.get('/residentes', { params: filtros });
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao listar residentes');
  }
};

export const buscarResidentePorId = async (id) => {
  try {
    const response = await api.get(`/residentes/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar residente');
  }
};

export const atualizarResidente = async (id, dados) => {
  try {
    const response = await api.put(`/residentes/${id}`, dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao atualizar residente');
  }
};

export const deletarResidente = async (id) => {
  try {
    const response = await api.delete(`/residentes/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao deletar residente');
  }
};

export const deletarResidentePermanente = async (id) => {
  try {
    const response = await api.delete(`/residentes/${id}/permanente`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao deletar residente permanentemente');
  }
};

export const obterEstatisticas = async () => {
  try {
    const response = await api.get('/residentes/estatisticas');
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar estatísticas');
  }
};

// ============================================
// PROFISSIONAIS
// ============================================
export const criarProfissional = async (dados) => {
  try {
    const response = await api.post('/profissionais', dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao cadastrar profissional');
  }
};

export const listarProfissionais = async (filtros = {}) => {
  try {
    const response = await api.get('/profissionais', { params: filtros });
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao listar profissionais');
  }
};

export const buscarProfissionalPorId = async (id) => {
  try {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar profissional');
  }
};

export const atualizarProfissional = async (id, dados) => {
  try {
    const response = await api.put(`/profissionais/${id}`, dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao atualizar profissional');
  }
};

export const deletarProfissional = async (id) => {
  try {
    const response = await api.delete(`/profissionais/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao deletar profissional');
  }
};

export const deletarProfissionalPermanente = async (id) => {
  try {
    const response = await api.delete(`/profissionais/${id}/permanente`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao deletar profissional permanentemente');
  }
};

export const obterEstatisticasProfissionais = async () => {
  try {
    const response = await api.get('/profissionais/estatisticas/geral');
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar estatísticas');
  }
};

// ============================================
// AGENDAMENTOS
// ============================================
export const criarAgendamento = async (dados) => {
  try {
    const response = await api.post('/agendamentos', dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao criar agendamento');
  }
};

export const listarAgendamentos = async (filtros = {}) => {
  try {
    const response = await api.get('/agendamentos', { params: filtros });
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao listar agendamentos');
  }
};

export const buscarAgendamentoPorId = async (id) => {
  try {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar agendamento');
  }
};

export const buscarAgendamentosPorResidente = async (residente_id) => {
  try {
    const response = await api.get(`/agendamentos/residente/${residente_id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar agendamentos do residente');
  }
};

export const buscarAgendamentosPorProfissional = async (profissional_id) => {
  try {
    const response = await api.get(`/agendamentos/profissional/${profissional_id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar agendamentos do profissional');
  }
};

export const atualizarAgendamento = async (id, dados) => {
  try {
    const response = await api.put(`/agendamentos/${id}`, dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao atualizar agendamento');
  }
};

export const cancelarAgendamento = async (id, dados) => {
  try {
    const response = await api.patch(`/agendamentos/${id}/cancelar`, dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao cancelar agendamento');
  }
};

export const confirmarAgendamento = async (id) => {
  try {
    const response = await api.patch(`/agendamentos/${id}/confirmar`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao confirmar agendamento');
  }
};

export const obterEstatisticasAgendamentos = async () => {
  try {
    const response = await api.get('/agendamentos/estatisticas/geral');
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar estatísticas');
  }
};

// ============================================
// HISTÓRICO DE CONSULTAS
// ============================================
export const listarHistoricoConsultas = async (residenteId, filtros = {}) => {
  try {
    const response = await api.get(`/historico-consultas/residente/${residenteId}`, { params: filtros });
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar histórico de consultas');
  }
};

export const listarHistoricoConsultasProfissional = async (profissionalId, filtros = {}) => {
  try {
    const response = await api.get(`/historico-consultas/profissional/${profissionalId}`, { params: filtros });
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar histórico de consultas do profissional');
  }
};

export const criarHistoricoConsulta = async (dados) => {
  try {
    const response = await api.post('/historico-consultas', dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao registrar consulta');
  }
};

export const obterHistoricoConsulta = async (id) => {
  try {
    const response = await api.get(`/historico-consultas/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao buscar consulta');
  }
};

export const atualizarHistoricoConsulta = async (id, dados) => {
  try {
    const response = await api.put(`/historico-consultas/${id}`, dados);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao atualizar consulta');
  }
};

export const deletarHistoricoConsulta = async (id) => {
  try {
    const response = await api.delete(`/historico-consultas/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erro ao deletar consulta');
  }
};

export default api;
