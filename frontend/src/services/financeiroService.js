import api from '../api/axios';

const financeiroService = {
  // Despesas
  criarDespesa: async (despesa) => {
    const response = await api.post('/financeiro/despesas', despesa);
    return response.data;
  },

  listarDespesas: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await api.get(`/financeiro/despesas?${params}`);
    return response.data;
  },

  obterDespesa: async (id) => {
    const response = await api.get(`/financeiro/despesas/${id}`);
    return response.data;
  },

  atualizarDespesa: async (id, despesa) => {
    const response = await api.put(`/financeiro/despesas/${id}`, despesa);
    return response.data;
  },

  excluirDespesa: async (id) => {
    const response = await api.delete(`/financeiro/despesas/${id}`);
    return response.data;
  },

  // Mensalidades
  criarMensalidade: async (mensalidade) => {
    const response = await api.post('/financeiro/mensalidades', mensalidade);
    return response.data;
  },

  listarMensalidades: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await api.get(`/financeiro/mensalidades?${params}`);
    return response.data;
  },

  obterMensalidade: async (id) => {
    const response = await api.get(`/financeiro/mensalidades/${id}`);
    return response.data;
  },

  atualizarMensalidade: async (id, mensalidade) => {
    const response = await api.put(`/financeiro/mensalidades/${id}`, mensalidade);
    return response.data;
  },

  pagarMensalidade: async (id, dadosPagamento) => {
    const response = await api.post(`/financeiro/mensalidades/${id}/pagar`, dadosPagamento);
    return response.data;
  },

  // Salários
  criarSalario: async (salario) => {
    const response = await api.post('/financeiro/salarios', salario);
    return response.data;
  },

  listarSalarios: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await api.get(`/financeiro/salarios?${params}`);
    return response.data;
  },

  obterSalario: async (id) => {
    const response = await api.get(`/financeiro/salarios/${id}`);
    return response.data;
  },

  atualizarSalario: async (id, salario) => {
    const response = await api.put(`/financeiro/salarios/${id}`, salario);
    return response.data;
  },

  pagarSalario: async (id, dadosPagamento) => {
    const response = await api.post(`/financeiro/salarios/${id}/pagar`, dadosPagamento);
    return response.data;
  },

  // Relatórios
  obterResumoFinanceiro: async (mes = null, ano = null) => {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    if (ano) params.append('ano', ano);
    const response = await api.get(`/financeiro/resumo?${params}`);
    return response.data;
  },

  obterTransacoes: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await api.get(`/financeiro/transacoes?${params}`);
    return response.data;
  }
};

export default financeiroService;
