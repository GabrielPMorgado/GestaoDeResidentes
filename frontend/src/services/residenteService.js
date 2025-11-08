import api from '../api/axios';

/**
 * Service para gerenciamento de Residentes
 * Centraliza todas as operações relacionadas a residentes
 */
const residenteService = {
  /**
   * Criar novo residente
   * @param {Object} residenteData - Dados do residente
   * @returns {Promise} Residente criado
   */
  criar: async (residenteData) => {
    try {
      const response = await api.post('/residentes', residenteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar todos os residentes ativos
   * @returns {Promise} Lista de residentes
   */
  listarAtivos: async () => {
    try {
      const response = await api.get('/residentes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar todos os residentes (ativos e inativos)
   * @returns {Promise} Lista de todos os residentes
   */
  listarTodos: async () => {
    try {
      const response = await api.get('/residentes/todos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar apenas residentes inativos
   * @returns {Promise} Lista de residentes inativos
   */
  listarInativos: async () => {
    try {
      const response = await api.get('/residentes/inativos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar residente por ID
   * @param {number} id - ID do residente
   * @returns {Promise} Dados do residente
   */
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/residentes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar residente por CPF
   * @param {string} cpf - CPF do residente
   * @returns {Promise} Dados do residente
   */
  buscarPorCpf: async (cpf) => {
    try {
      const response = await api.get(`/residentes/cpf/${cpf}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Atualizar dados do residente
   * @param {number} id - ID do residente
   * @param {Object} residenteData - Novos dados do residente
   * @returns {Promise} Residente atualizado
   */
  atualizar: async (id, residenteData) => {
    try {
      const response = await api.put(`/residentes/${id}`, residenteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Deletar residente (soft delete)
   * @param {number} id - ID do residente
   * @returns {Promise} Mensagem de sucesso
   */
  deletar: async (id) => {
    try {
      const response = await api.delete(`/residentes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reativar residente inativo
   * @param {number} id - ID do residente
   * @returns {Promise} Residente reativado
   */
  reativar: async (id) => {
    try {
      const response = await api.put(`/residentes/${id}/reativar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validar CPF único
   * @param {string} cpf - CPF a validar
   * @param {number} idExcluir - ID do residente a excluir da validação (para updates)
   * @returns {Promise<boolean>} True se CPF é único
   */
  validarCpfUnico: async (cpf, idExcluir = null) => {
    try {
      const residentes = await residenteService.listarTodos();
      return !residentes.some(r => r.cpf === cpf && r.id !== idExcluir);
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      return false;
    }
  },

  /**
   * Validar RG único
   * @param {string} rg - RG a validar
   * @param {number} idExcluir - ID do residente a excluir da validação (para updates)
   * @returns {Promise<boolean>} True se RG é único
   */
  validarRgUnico: async (rg, idExcluir = null) => {
    try {
      const residentes = await residenteService.listarTodos();
      return !residentes.some(r => r.rg === rg && r.id !== idExcluir);
    } catch (error) {
      console.error('Erro ao validar RG:', error);
      return false;
    }
  },

  /**
   * Obter estatísticas de residentes
   * @returns {Promise} Estatísticas (total ativos, inativos, etc)
   */
  obterEstatisticas: async () => {
    try {
      const [ativos, inativos] = await Promise.all([
        residenteService.listarAtivos(),
        residenteService.listarInativos()
      ]);
      
      return {
        totalAtivos: ativos.length,
        totalInativos: inativos.length,
        total: ativos.length + inativos.length
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default residenteService;
