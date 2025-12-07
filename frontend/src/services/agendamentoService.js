import api from '../api/axios';

const agendamentoService = {
  criar: async (agendamentoData) => {
    const response = await api.post('/agendamentos', agendamentoData);
    return response.data;
  },

  listar: async () => {
    const response = await api.get('/agendamentos');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  },

  buscarPorResidente: async (residenteId) => {
    const response = await api.get(`/agendamentos/residente/${residenteId}`);
    return response.data;
  },

  buscarPorProfissional: async (profissionalId) => {
    const response = await api.get(`/agendamentos/profissional/${profissionalId}`);
    return response.data;
  },

  buscarPorData: async (data) => {
    const response = await api.get(`/agendamentos/data/${data}`);
    return response.data;
  },

  buscarPorPeriodo: async (dataInicio, dataFim) => {
    const response = await api.get(`/agendamentos/periodo`, {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  buscarPorStatus: async (status) => {
    const response = await api.get(`/agendamentos/status/${status}`);
    return response.data;
  },

  atualizar: async (id, agendamentoData) => {
    const response = await api.put(`/agendamentos/${id}`, agendamentoData);
    return response.data;
  },

  atualizarStatus: async (id, status) => {
    const response = await api.patch(`/agendamentos/${id}/status`, { status });
    return response.data;
  },

  confirmar: async (id) => {
    return agendamentoService.atualizarStatus(id, 'confirmado');
  },

  cancelar: async (id, dados) => {
    const response = await api.patch(`/agendamentos/${id}/cancelar`, dados);
    return response.data;
  },

  marcarRealizado: async (id) => {
    return agendamentoService.atualizarStatus(id, 'realizado');
  },

  deletar: async (id) => {
    const response = await api.delete(`/agendamentos/${id}`);
    return response.data;
  },

  agendamentosHoje: async () => {
    const hoje = new Date().toISOString().split('T')[0];
    return agendamentoService.buscarPorData(hoje);
  },

  proximosAgendamentos: async () => {
    const hoje = new Date();
    const proximaSemana = new Date(hoje);
    proximaSemana.setDate(hoje.getDate() + 7);
    
    const dataInicio = hoje.toISOString().split('T')[0];
    const dataFim = proximaSemana.toISOString().split('T')[0];
    
    return agendamentoService.buscarPorPeriodo(dataInicio, dataFim);
  },

  obterEstatisticas: async () => {
    const [todos, hoje, proximos] = await Promise.all([
      agendamentoService.listar(),
      agendamentoService.agendamentosHoje(),
      agendamentoService.proximosAgendamentos()
    ]);
    
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
  }
};

export default agendamentoService;
