import api from '../api/axios';

/**
 * Service para gerenciamento de Agendamentos
 * Centraliza todas as operações relacionadas a agendamentos de consultas
 */
const agendamentoService = {
  /**
   * Criar novo agendamento
   * @param {Object} agendamentoData - Dados do agendamento
   * @returns {Promise} Agendamento criado
   */
  criar: async (agendamentoData) => {
    try {
      const response = await api.post('/agendamentos', agendamentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar todos os agendamentos
   * @returns {Promise} Lista de agendamentos
   */
  listar: async () => {
    try {
      const response = await api.get('/agendamentos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar agendamento por ID
   * @param {number} id - ID do agendamento
   * @returns {Promise} Dados do agendamento
   */
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar agendamentos por residente
   * @param {number} residenteId - ID do residente
   * @returns {Promise} Lista de agendamentos do residente
   */
  buscarPorResidente: async (residenteId) => {
    try {
      const response = await api.get(`/agendamentos/residente/${residenteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar agendamentos por profissional
   * @param {number} profissionalId - ID do profissional
   * @returns {Promise} Lista de agendamentos do profissional
   */
  buscarPorProfissional: async (profissionalId) => {
    try {
      const response = await api.get(`/agendamentos/profissional/${profissionalId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar agendamentos por data
   * @param {string} data - Data no formato YYYY-MM-DD
   * @returns {Promise} Lista de agendamentos da data
   */
  buscarPorData: async (data) => {
    try {
      const response = await api.get(`/agendamentos/data/${data}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar agendamentos por período
   * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
   * @param {string} dataFim - Data final no formato YYYY-MM-DD
   * @returns {Promise} Lista de agendamentos do período
   */
  buscarPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const response = await api.get(`/agendamentos/periodo`, {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buscar agendamentos por status
   * @param {string} status - Status do agendamento (agendado, confirmado, cancelado, realizado)
   * @returns {Promise} Lista de agendamentos com o status
   */
  buscarPorStatus: async (status) => {
    try {
      const response = await api.get(`/agendamentos/status/${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Atualizar dados do agendamento
   * @param {number} id - ID do agendamento
   * @param {Object} agendamentoData - Novos dados do agendamento
   * @returns {Promise} Agendamento atualizado
   */
  atualizar: async (id, agendamentoData) => {
    try {
      const response = await api.put(`/agendamentos/${id}`, agendamentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Atualizar status do agendamento
   * @param {number} id - ID do agendamento
   * @param {string} status - Novo status
   * @returns {Promise} Agendamento atualizado
   */
  atualizarStatus: async (id, status) => {
    try {
      const response = await api.patch(`/agendamentos/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Confirmar agendamento
   * @param {number} id - ID do agendamento
   * @returns {Promise} Agendamento confirmado
   */
  confirmar: async (id) => {
    return agendamentoService.atualizarStatus(id, 'confirmado');
  },

  /**
   * Cancelar agendamento
   * @param {number} id - ID do agendamento
   * @param {string} motivoCancelamento - Motivo do cancelamento
   * @returns {Promise} Agendamento cancelado
   */
  cancelar: async (id, motivoCancelamento) => {
    try {
      const response = await api.patch(`/agendamentos/${id}/cancelar`, { motivoCancelamento });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Marcar agendamento como realizado
   * @param {number} id - ID do agendamento
   * @returns {Promise} Agendamento marcado como realizado
   */
  marcarRealizado: async (id) => {
    return agendamentoService.atualizarStatus(id, 'realizado');
  },

  /**
   * Deletar agendamento
   * @param {number} id - ID do agendamento
   * @returns {Promise} Mensagem de sucesso
   */
  deletar: async (id) => {
    try {
      const response = await api.delete(`/agendamentos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Verificar disponibilidade de horário
   * @param {number} profissionalId - ID do profissional
   * @param {string} data - Data no formato YYYY-MM-DD
   * @param {string} horario - Horário no formato HH:MM
   * @param {number} idExcluir - ID do agendamento a excluir da verificação (para updates)
   * @returns {Promise<boolean>} True se horário está disponível
   */
  verificarDisponibilidade: async (profissionalId, data, horario, idExcluir = null) => {
    try {
      const agendamentos = await agendamentoService.buscarPorProfissional(profissionalId);
      
      // Verificar se já existe agendamento neste horário (exceto cancelados)
      const conflito = agendamentos.some(ag => 
        ag.data === data && 
        ag.horario === horario && 
        ag.status !== 'cancelado' &&
        ag.id !== idExcluir
      );
      
      return !conflito;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  },

  /**
   * Obter agendamentos do dia atual
   * @returns {Promise} Lista de agendamentos de hoje
   */
  agendamentosHoje: async () => {
    const hoje = new Date().toISOString().split('T')[0];
    return agendamentoService.buscarPorData(hoje);
  },

  /**
   * Obter próximos agendamentos (próximos 7 dias)
   * @returns {Promise} Lista de próximos agendamentos
   */
  proximosAgendamentos: async () => {
    try {
      const hoje = new Date();
      const proximaSemana = new Date(hoje);
      proximaSemana.setDate(hoje.getDate() + 7);
      
      const dataInicio = hoje.toISOString().split('T')[0];
      const dataFim = proximaSemana.toISOString().split('T')[0];
      
      return agendamentoService.buscarPorPeriodo(dataInicio, dataFim);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter estatísticas de agendamentos
   * @returns {Promise} Estatísticas (total, por status, hoje, semana, etc)
   */
  obterEstatisticas: async () => {
    try {
      const [todos, hoje, proximos] = await Promise.all([
        agendamentoService.listar(),
        agendamentoService.agendamentosHoje(),
        agendamentoService.proximosAgendamentos()
      ]);
      
      // Contar por status
      const porStatus = todos.reduce((acc, ag) => {
        acc[ag.status] = (acc[ag.status] || 0) + 1;
        return acc;
      }, {});

      return {
        total: todos.length,
        hoje: hoje.length,
        proximaSemana: proximos.length,
        porStatus,
        agendados: porStatus.agendado || 0,
        confirmados: porStatus.confirmado || 0,
        cancelados: porStatus.cancelado || 0,
        realizados: porStatus.realizado || 0
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default agendamentoService;
