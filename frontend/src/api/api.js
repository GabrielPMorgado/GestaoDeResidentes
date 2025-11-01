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
    throw error.response?.data || { message: 'Erro ao listar residentes' };
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

export default api;
