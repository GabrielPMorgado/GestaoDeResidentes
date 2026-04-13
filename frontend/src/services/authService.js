import axios from '../api/axios';

export const authService = {
  // Login
  async login(email, senha) {
    const response = await axios.post('/auth/login', { email, senha });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const userStr = localStorage.getItem('usuario');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obter token
  getToken() {
    return localStorage.getItem('token');
  },

  // Verificar se é admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.tipo === 'admin';
  },

  // Verificar token no servidor
  async verificarToken() {
    try {
      const response = await axios.get('/auth/verificar');
      return response.data;
    } catch {
      this.logout();
      return null;
    }
  },

  // Criar acesso para profissional (apenas admin)
  async criarAcessoProfissional(dados) {
    const response = await axios.post('/auth/criar-acesso-profissional', dados);
    return response.data;
  },

  // Listar usuários (apenas admin)
  async listarUsuarios() {
    const response = await axios.get('/auth/usuarios');
    return response.data;
  },

  // Alterar status do usuário (apenas admin)
  async alterarStatusUsuario(id, ativo) {
    const response = await axios.patch(`/auth/usuarios/${id}/status`, { ativo });
    return response.data;
  },

  // Atualizar usuário (email, tipo, nivel_acesso)
  async atualizarUsuario(id, dados) {
    const response = await axios.put(`/auth/usuarios/${id}`, dados);
    return response.data;
  },

  // Redefinir senha de um usuário (admin)
  async redefinirSenhaUsuario(id, novaSenha) {
    const response = await axios.post(`/auth/usuarios/${id}/redefinir-senha`, { novaSenha });
    return response.data;
  },

  // Excluir usuário
  async excluirUsuario(id) {
    const response = await axios.delete(`/auth/usuarios/${id}`);
    return response.data;
  },

  // Recuperar senha
  async recuperarSenha(email) {
    const response = await axios.post('/auth/recuperar-senha', { email });
    return response.data;
  },

  // Redefinir senha
  async redefinirSenha(token, novaSenha) {
    const response = await axios.post('/auth/redefinir-senha', { token, novaSenha });
    return response.data;
  },

  // Trocar senha (usuário logado)
  async trocarSenha(senhaAtual, novaSenha, confirmarSenha) {
    const response = await axios.post('/auth/trocar-senha', { 
      senhaAtual, 
      novaSenha, 
      confirmarSenha 
    });
    return response.data;
  }
};
