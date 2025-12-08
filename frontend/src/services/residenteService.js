import api from '../api/axios';

const residenteService = {
  criar: async (residenteData) => {
    const response = await api.post('/residentes', residenteData);
    return response.data;
  },

  listarAtivos: async () => {
    const response = await api.get('/residentes');
    return response.data;
  },

  listarTodos: async () => {
    const response = await api.get('/residentes/todos');
    return response.data;
  },

  listarInativos: async () => {
    const response = await api.get('/residentes/inativos');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/residentes/${id}`);
    return response.data;
  },

  buscarPorCpf: async (cpf) => {
    const response = await api.get(`/residentes/cpf/${cpf}`);
    return response.data;
  },

  atualizar: async (id, residenteData) => {
    const response = await api.put(`/residentes/${id}`, residenteData);
    return response.data;
  },

  inativar: async (id) => {
    const response = await api.delete(`/residentes/${id}`);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/residentes/${id}`);
    return response.data;
  },

  reativar: async (id) => {
    const response = await api.put(`/residentes/${id}/reativar`);
    return response.data;
  },

  obterEstatisticas: async () => {
    const [ativos, inativos] = await Promise.all([
      residenteService.listarAtivos(),
      residenteService.listarInativos()
    ]);
    
    return {
      totalAtivos: ativos.length,
      totalInativos: inativos.length,
      total: ativos.length + inativos.length
    };
  }
};

export default residenteService;
