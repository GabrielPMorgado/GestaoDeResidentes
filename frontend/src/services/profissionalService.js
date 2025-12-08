import api from '../api/axios';

const profissionalService = {
  criar: async (profissionalData) => {
    const response = await api.post('/profissionais', profissionalData);
    return response.data;
  },

  listar: async (params = {}) => {
    const response = await api.get('/profissionais', { params });
    return response.data?.data?.profissionais || response.data;
  },

  listarAtivos: async () => {
    const response = await api.get('/profissionais', { params: { status: 'ativo', limit: 1000 } });
    return response.data;
  },

  listarTodos: async () => {
    const response = await api.get('/profissionais', { params: { limit: 1000 } });
    return response.data;
  },

  listarInativos: async () => {
    const response = await api.get('/profissionais', { params: { status: 'inativo', limit: 1000 } });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  },

  buscarPorCpf: async (cpf) => {
    const response = await api.get(`/profissionais/cpf/${cpf}`);
    return response.data;
  },

  buscarPorEspecialidade: async (especialidade) => {
    const response = await api.get(`/profissionais/especialidade/${especialidade}`);
    return response.data;
  },

  atualizar: async (id, profissionalData) => {
    const response = await api.put(`/profissionais/${id}`, profissionalData);
    return response.data;
  },

  inativar: async (id) => {
    const response = await api.delete(`/profissionais/${id}`);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/profissionais/${id}`);
    return response.data;
  },

  reativar: async (id) => {
    const response = await api.put(`/profissionais/${id}/reativar`);
    return response.data;
  },

  obterEstatisticas: async () => {
    const [ativos, inativos] = await Promise.all([
      profissionalService.listarAtivos(),
      profissionalService.listarInativos()
    ]);
    
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
  }
};

export default profissionalService;
