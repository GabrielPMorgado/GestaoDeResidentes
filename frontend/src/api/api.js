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

// Estatísticas de profissionais
export const obterEstatisticasProfissionais = async () => {
  try {
    const response = await api.get('/profissionais/estatisticas/geral');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar estatísticas' };
  }
};

export default api;
