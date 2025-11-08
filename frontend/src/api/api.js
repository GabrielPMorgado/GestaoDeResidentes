import axios from 'axios';

// URL base da API
const API_URL = 'http://localhost:3000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// RESIDENTES
// ============================================

// Criar novo residente
export const criarResidente = async (dados) => {
  try {
    const response = await api.post('/residentes', dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao cadastrar residente' };
  }
};

// Listar residentes
export const listarResidentes = async (filtros = {}) => {
  try {
    const response = await api.get('/residentes', { params: filtros });
    return response.data;
  } catch (error) {
    console.error('Erro na API listarResidentes:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { success: false, message: error.message || 'Erro ao listar residentes' };
  }
};

// Buscar residente por ID
export const buscarResidentePorId = async (id) => {
  try {
    const response = await api.get(`/residentes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar residente' };
  }
};

// Buscar residente por CPF
export const buscarResidentePorCpf = async (cpf) => {
  try {
    const response = await api.get(`/residentes/cpf/${cpf}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar residente' };
  }
};

// Atualizar residente
export const atualizarResidente = async (id, dados) => {
  try {
    const response = await api.put(`/residentes/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar residente' };
  }
};

// Deletar residente (inativar)
export const deletarResidente = async (id) => {
  try {
    const response = await api.delete(`/residentes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao deletar residente' };
  }
};

// Deletar residente permanentemente (remover do banco)
export const deletarResidentePermanente = async (id) => {
  try {
    const response = await api.delete(`/residentes/${id}/permanente`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao deletar residente permanentemente' };
  }
};

// Estatísticas
export const obterEstatisticas = async () => {
  try {
    const response = await api.get('/residentes/estatisticas');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar estatísticas' };
  }
};

// ============================================
// PROFISSIONAIS
// ============================================

// Criar novo profissional
export const criarProfissional = async (dados) => {
  try {
    const response = await api.post('/profissionais', dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao cadastrar profissional' };
  }
};

// Listar profissionais
export const listarProfissionais = async (filtros = {}) => {
  try {
    console.log('Chamando API listarProfissionais com filtros:', filtros);
    const response = await api.get('/profissionais', { params: filtros });
    console.log('Resposta listarProfissionais:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro na API listarProfissionais:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { success: false, message: error.message || 'Erro ao listar profissionais' };
  }
};

// Buscar profissional por ID
export const buscarProfissionalPorId = async (id) => {
  try {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar profissional' };
  }
};

// Buscar profissional por CPF
export const buscarProfissionalPorCpf = async (cpf) => {
  try {
    const response = await api.get(`/profissionais/cpf/${cpf}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar profissional' };
  }
};

// Atualizar profissional
export const atualizarProfissional = async (id, dados) => {
  try {
    const response = await api.put(`/profissionais/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar profissional' };
  }
};

// Deletar profissional (inativar)
export const deletarProfissional = async (id) => {
  try {
    const response = await api.delete(`/profissionais/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao deletar profissional' };
  }
};

// Deletar profissional permanentemente (remover do banco)
export const deletarProfissionalPermanente = async (id) => {
  try {
    const response = await api.delete(`/profissionais/${id}/permanente`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao deletar profissional permanentemente' };
  }
};

// Estatísticas de profissionais
export const obterEstatisticasProfissionais = async () => {
  try {
    const response = await api.get('/profissionais/estatisticas/geral');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar estatísticas' };
  }
};

// ============================================
// AGENDAMENTOS
// ============================================

// Criar novo agendamento
export const criarAgendamento = async (dados) => {
  try {
    const response = await api.post('/agendamentos', dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao criar agendamento' };
  }
};

// Listar agendamentos
export const listarAgendamentos = async (filtros = {}) => {
  try {
    const response = await api.get('/agendamentos', { params: filtros });
    return response.data;
  } catch (error) {
    console.error('Erro na API listarAgendamentos:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { success: false, message: error.message || 'Erro ao listar agendamentos' };
  }
};

// Buscar agendamento por ID
export const buscarAgendamentoPorId = async (id) => {
  try {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar agendamento' };
  }
};

// Buscar agendamentos por residente
export const buscarAgendamentosPorResidente = async (residente_id) => {
  try {
    const response = await api.get(`/agendamentos/residente/${residente_id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar agendamentos do residente' };
  }
};

// Buscar agendamentos por profissional
export const buscarAgendamentosPorProfissional = async (profissional_id) => {
  try {
    const response = await api.get(`/agendamentos/profissional/${profissional_id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar agendamentos do profissional' };
  }
};

// Atualizar agendamento
export const atualizarAgendamento = async (id, dados) => {
  try {
    const response = await api.put(`/agendamentos/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar agendamento' };
  }
};

// Cancelar agendamento
export const cancelarAgendamento = async (id, dados) => {
  try {
    const response = await api.patch(`/agendamentos/${id}/cancelar`, dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao cancelar agendamento' };
  }
};

// Confirmar agendamento
export const confirmarAgendamento = async (id) => {
  try {
    const response = await api.patch(`/agendamentos/${id}/confirmar`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao confirmar agendamento' };
  }
};

// Estatísticas de agendamentos
export const obterEstatisticasAgendamentos = async () => {
  try {
    const response = await api.get('/agendamentos/estatisticas/geral');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar estatísticas' };
  }
};

// ============================================
// HISTÓRICO DE CONSULTAS
// ============================================

// Listar histórico de consultas de um residente
export const listarHistoricoConsultas = async (residenteId, filtros = {}) => {
  try {
    const response = await api.get(`/historico-consultas/residente/${residenteId}`, { params: filtros });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar histórico de consultas' };
  }
};

// Listar histórico de consultas de um profissional
export const listarHistoricoConsultasProfissional = async (profissionalId, filtros = {}) => {
  try {
    const response = await api.get(`/historico-consultas/profissional/${profissionalId}`, { params: filtros });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar histórico de consultas do profissional' };
  }
};

// Criar nova consulta no histórico
export const criarHistoricoConsulta = async (dados) => {
  try {
    const response = await api.post('/historico-consultas', dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao registrar consulta' };
  }
};

// Obter detalhes de uma consulta
export const obterHistoricoConsulta = async (id) => {
  try {
    const response = await api.get(`/historico-consultas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar consulta' };
  }
};

// Atualizar consulta do histórico
export const atualizarHistoricoConsulta = async (id, dados) => {
  try {
    const response = await api.put(`/historico-consultas/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar consulta' };
  }
};

// Deletar consulta do histórico
export const deletarHistoricoConsulta = async (id) => {
  try {
    const response = await api.delete(`/historico-consultas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao deletar consulta' };
  }
};

export default api;
