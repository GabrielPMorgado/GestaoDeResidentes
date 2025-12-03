import api from '../api/axios';

/**
 * Service para gerenciamento de Profissionais
 * Centraliza todas as operações relacionadas a profissionais de saúde
 */
const profissionalService = {
  /**
   * Criar novo profissional
   * @param {Object} profissionalData - Dados do profissional
   * @returns {Promise} Profissional criado
   */
  criar: async (profissionalData) => {
    try {
      const response = await api.post('/profissionais', profissionalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar todos os profissionais ativos
   * @returns {Promise} Lista de profissionais
   */
  listarAtivos: async () => {
    try {
      const response = await api.get('/profissionais');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar todos os profissionais (ativos e inativos)
   * @returns {Promise} Lista de todos os profissionais
   */
  listarTodos: async () => {
    try {
      const response = await api.get('/profissionais/todos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar apenas profissionais inativos
   * @returns {Promise} Lista de profissionais inativos
   */
  listarInativos: async () => {
    try {
      const response = await api.get('/profissionais/inativos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar profissional por ID
   * @param {number} id - ID do profissional
   * @returns {Promise} Dados do profissional
   */
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/profissionais/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar profissional por CPF
   * @param {string} cpf - CPF do profissional
   * @returns {Promise} Dados do profissional
   */
  buscarPorCpf: async (cpf) => {
    try {
      const response = await api.get(`/profissionais/cpf/${cpf}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar profissionais por especialidade
   * @param {string} especialidade - Especialidade médica
   * @returns {Promise} Lista de profissionais da especialidade
   */
  buscarPorEspecialidade: async (especialidade) => {
    try {
      const response = await api.get(`/profissionais/especialidade/${especialidade}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Atualizar dados do profissional
   * @param {number} id - ID do profissional
   * @param {Object} profissionalData - Novos dados do profissional
   * @returns {Promise} Profissional atualizado
   */
  atualizar: async (id, profissionalData) => {
    try {
      const response = await api.put(`/profissionais/${id}`, profissionalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Deletar profissional (soft delete)
   * @param {number} id - ID do profissional
   * @returns {Promise} Mensagem de sucesso
   */
  deletar: async (id) => {
    try {
      const response = await api.delete(`/profissionais/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reativar profissional inativo
   * @param {number} id - ID do profissional
   * @returns {Promise} Profissional reativado
   */
  reativar: async (id) => {
    try {
      const response = await api.put(`/profissionais/${id}/reativar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter lista de especialidades disponíveis
   * @returns {Promise} Array de especialidades
   */
  listarEspecialidades: async () => {
    try {
      const profissionais = await profissionalService.listarAtivos();
      const especialidades = [...new Set(profissionais.map(p => p.especialidade))];
      return especialidades.sort();
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validar CPF único
   * @param {string} cpf - CPF a validar
   * @param {number} idExcluir - ID do profissional a excluir da validação (para updates)
   * @returns {Promise<boolean>} True se CPF é único
   */
  validarCpfUnico: async (cpf, idExcluir = null) => {
    try {
      const profissionais = await profissionalService.listarTodos();
      return !profissionais.some(p => p.cpf === cpf && p.id !== idExcluir);
    } catch (error) {
      return false;
    }
  },

  /**
   * Validar RG único
   * @param {string} rg - RG a validar
   * @param {number} idExcluir - ID do profissional a excluir da validação (para updates)
   * @returns {Promise<boolean>} True se RG é único
   */
  validarRgUnico: async (rg, idExcluir = null) => {
    try {
      const profissionais = await profissionalService.listarTodos();
      return !profissionais.some(p => p.rg === rg && p.id !== idExcluir);
    } catch (error) {
      return false;
    }
  },

  /**
   * Obter estatísticas de profissionais
   * @returns {Promise} Estatísticas (total ativos, inativos, por especialidade, etc)
   */
  obterEstatisticas: async () => {
    try {
      const [ativos, inativos] = await Promise.all([
        profissionalService.listarAtivos(),
        profissionalService.listarInativos()
      ]);
      
      // Contar profissionais por especialidade
      const porEspecialidade = ativos.reduce((acc, prof) => {
        acc[prof.especialidade] = (acc[prof.especialidade] || 0) + 1;
        return acc;
      }, {});

      return {
        totalAtivos: ativos.length,
        totalInativos: inativos.length,
        total: ativos.length + inativos.length,
        porEspecialidade
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default profissionalService;
