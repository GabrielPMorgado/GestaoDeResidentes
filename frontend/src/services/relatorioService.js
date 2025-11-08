import api from '../api/axios';

/**
 * Service para gerenciamento de Relatórios e Estatísticas
 * Centraliza todas as operações relacionadas a relatórios do sistema
 */
const relatorioService = {
  /**
   * Obter estatísticas gerais do sistema
   * @returns {Promise} Estatísticas completas
   */
  obterEstatisticasGerais: async () => {
    try {
      const response = await api.get('/relatorios/estatisticas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter relatório de agendamentos por período
   * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
   * @param {string} dataFim - Data final no formato YYYY-MM-DD
   * @returns {Promise} Relatório de agendamentos
   */
  agendamentosPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const response = await api.get('/relatorios/agendamentos/periodo', {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter relatório de agendamentos por profissional
   * @param {number} profissionalId - ID do profissional
   * @param {string} dataInicio - Data inicial (opcional)
   * @param {string} dataFim - Data final (opcional)
   * @returns {Promise} Relatório do profissional
   */
  agendamentosPorProfissional: async (profissionalId, dataInicio = null, dataFim = null) => {
    try {
      const response = await api.get(`/relatorios/profissional/${profissionalId}`, {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter relatório de agendamentos por residente
   * @param {number} residenteId - ID do residente
   * @param {string} dataInicio - Data inicial (opcional)
   * @param {string} dataFim - Data final (opcional)
   * @returns {Promise} Relatório do residente
   */
  agendamentosPorResidente: async (residenteId, dataInicio = null, dataFim = null) => {
    try {
      const response = await api.get(`/relatorios/residente/${residenteId}`, {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter relatório de consultas realizadas
   * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
   * @param {string} dataFim - Data final no formato YYYY-MM-DD
   * @returns {Promise} Relatório de consultas
   */
  consultasRealizadas: async (dataInicio, dataFim) => {
    try {
      const response = await api.get('/relatorios/consultas/realizadas', {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter relatório de consultas canceladas
   * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
   * @param {string} dataFim - Data final no formato YYYY-MM-DD
   * @returns {Promise} Relatório de cancelamentos
   */
  consultasCanceladas: async (dataInicio, dataFim) => {
    try {
      const response = await api.get('/relatorios/consultas/canceladas', {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter ranking de profissionais (mais atendimentos)
   * @param {string} dataInicio - Data inicial (opcional)
   * @param {string} dataFim - Data final (opcional)
   * @param {number} limite - Quantidade máxima de resultados
   * @returns {Promise} Ranking de profissionais
   */
  rankingProfissionais: async (dataInicio = null, dataFim = null, limite = 10) => {
    try {
      const response = await api.get('/relatorios/ranking/profissionais', {
        params: { dataInicio, dataFim, limite }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter especialidades mais procuradas
   * @param {string} dataInicio - Data inicial (opcional)
   * @param {string} dataFim - Data final (opcional)
   * @returns {Promise} Ranking de especialidades
   */
  especialidadesMaisProcuradas: async (dataInicio = null, dataFim = null) => {
    try {
      const response = await api.get('/relatorios/ranking/especialidades', {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter taxa de comparecimento
   * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
   * @param {string} dataFim - Data final no formato YYYY-MM-DD
   * @returns {Promise} Taxa de comparecimento
   */
  taxaComparecimento: async (dataInicio, dataFim) => {
    try {
      const response = await api.get('/relatorios/taxa-comparecimento', {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter horários de pico
   * @param {string} dataInicio - Data inicial (opcional)
   * @param {string} dataFim - Data final (opcional)
   * @returns {Promise} Horários com mais agendamentos
   */
  horariosDePico: async (dataInicio = null, dataFim = null) => {
    try {
      const response = await api.get('/relatorios/horarios-pico', {
        params: { dataInicio, dataFim }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Exportar relatório em PDF
   * @param {string} tipo - Tipo de relatório
   * @param {Object} filtros - Filtros do relatório
   * @returns {Promise<Blob>} Arquivo PDF
   */
  exportarPDF: async (tipo, filtros = {}) => {
    try {
      const response = await api.post('/relatorios/exportar/pdf', 
        { tipo, filtros },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Exportar relatório em Excel
   * @param {string} tipo - Tipo de relatório
   * @param {Object} filtros - Filtros do relatório
   * @returns {Promise<Blob>} Arquivo Excel
   */
  exportarExcel: async (tipo, filtros = {}) => {
    try {
      const response = await api.post('/relatorios/exportar/excel',
        { tipo, filtros },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Baixar arquivo exportado
   * @param {Blob} blob - Arquivo blob
   * @param {string} nomeArquivo - Nome do arquivo
   */
  baixarArquivo: (blob, nomeArquivo) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Obter dados para dashboard principal
   * @returns {Promise} Dados agregados do dashboard
   */
  obterDadosDashboard: async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      const dataInicio = umMesAtras.toISOString().split('T')[0];

      const [
        estatisticas,
        agendamentosHoje,
        agendamentosMes,
        taxaComparecimento
      ] = await Promise.all([
        relatorioService.obterEstatisticasGerais(),
        api.get(`/agendamentos/data/${hoje}`),
        relatorioService.agendamentosPorPeriodo(dataInicio, hoje),
        relatorioService.taxaComparecimento(dataInicio, hoje)
      ]);

      return {
        estatisticas,
        agendamentosHoje: agendamentosHoje.data,
        agendamentosMes,
        taxaComparecimento
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default relatorioService;
