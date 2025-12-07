import api from '../api/axios';

const relatorioService = {
  obterEstatisticasGerais: async () => {
    const response = await api.get('/relatorios/estatisticas');
    return response.data;
  },

  agendamentosPorPeriodo: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/agendamentos/periodo', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  agendamentosPorProfissional: async (profissionalId, dataInicio = null, dataFim = null) => {
    const response = await api.get(`/relatorios/profissional/${profissionalId}`, {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  agendamentosPorResidente: async (residenteId, dataInicio = null, dataFim = null) => {
    const response = await api.get(`/relatorios/residente/${residenteId}`, {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  consultasRealizadas: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/consultas/realizadas', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  consultasCanceladas: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/consultas/canceladas', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  }
};

export default relatorioService;
