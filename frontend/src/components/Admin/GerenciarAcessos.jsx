import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import profissionalService from '../../services/profissionalService';
import { useNotification } from '../../contexts/NotificationContext';

function GerenciarAcessos() {
  const { success: showSuccess, error: showError } = useNotification();
  const [usuarios, setUsuarios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    profissional_id: '',
    email: '',
    senha: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [usuariosResponse, profissionaisResponse] = await Promise.all([
        authService.listarUsuarios(),
        profissionalService.listar({ status: 'ativo', limit: 1000 })
      ]);
      
      // Processar usuários
      const usuariosArray = Array.isArray(usuariosResponse) 
        ? usuariosResponse 
        : (usuariosResponse?.data || usuariosResponse?.usuarios || []);
      
      setUsuarios(usuariosArray);
      
      // Processar profissionais
      const profissionaisArray = Array.isArray(profissionaisResponse) 
        ? profissionaisResponse 
        : (profissionaisResponse?.data?.profissionais || profissionaisResponse?.profissionais || []);
      
      const profissionaisAtivos = profissionaisArray.filter(p => p.status === 'ativo');
      
      setProfissionais(profissionaisAtivos);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      showError(error?.message || 'Erro ao carregar dados');
      setUsuarios([]);
      setProfissionais([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.criarAcessoProfissional(formData);
      showSuccess('Acesso criado com sucesso!');
      setShowModal(false);
      setFormData({ profissional_id: '', email: '', senha: '' });
      carregarDados();
    } catch (error) {
      showError(error.response?.data?.erro || 'Erro ao criar acesso');
    }
  };

  const toggleStatus = async (id, ativoAtual) => {
    try {
      await authService.alterarStatusUsuario(id, !ativoAtual);
      showSuccess(`Usuário ${!ativoAtual ? 'ativado' : 'desativado'} com sucesso!`);
      carregarDados();
    } catch (error) {
      showError('Erro ao alterar status');
    }
  };

  // Profissionais que já têm acesso
  const profissionaisComAcesso = usuarios
    .filter(u => u.tipo === 'profissional')
    .map(u => u.profissional_id);

  // Profissionais disponíveis para criar acesso
  const profissionaisDisponiveis = profissionais.filter(
    p => !profissionaisComAcesso.includes(p.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <i className="bi bi-key-fill text-3xl text-white"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Acessos</h1>
            <p className="text-slate-400">Controle de acesso dos profissionais ao sistema</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={profissionaisDisponiveis.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="bi bi-plus-lg"></i>
          Criar Novo Acesso
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <i className="bi bi-people-fill text-2xl text-blue-400"></i>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total de Usuários</p>
              <h3 className="text-2xl font-bold text-white">{usuarios.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <i className="bi bi-person-check-fill text-2xl text-emerald-400"></i>
            </div>
            <div>
              <p className="text-sm text-slate-400">Profissionais Cadastrados</p>
              <h3 className="text-2xl font-bold text-white">{profissionais.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <i className="bi bi-person-plus-fill text-2xl text-amber-400"></i>
            </div>
            <div>
              <p className="text-sm text-slate-400">Disponíveis para Acesso</p>
              <h3 className="text-2xl font-bold text-white">{profissionaisDisponiveis.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-600">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Nome/Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Profissão</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Último Acesso</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      usuario.tipo === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {usuario.tipo === 'admin' ? 'Administrador' : 'Profissional'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">
                        {usuario.profissional?.nome_completo || 'Administrador'}
                      </p>
                      <p className="text-slate-400 text-sm">{usuario.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {usuario.profissional?.profissao || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      usuario.ativo 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300 text-sm">
                    {usuario.ultimo_acesso 
                      ? new Date(usuario.ultimo_acesso).toLocaleString('pt-BR')
                      : 'Nunca acessou'
                    }
                  </td>
                  <td className="px-6 py-4 text-center">
                    {usuario.tipo !== 'admin' && (
                      <button
                        onClick={() => toggleStatus(usuario.id, usuario.ativo)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          usuario.ativo
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                      >
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Acesso */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Acesso</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <i className="bi bi-x-lg text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profissional ({profissionaisDisponiveis.length} disponíveis)
                </label>
                <select
                  required
                  value={formData.profissional_id}
                  onChange={(e) => setFormData({ ...formData, profissional_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um profissional</option>
                  {profissionaisDisponiveis.length === 0 ? (
                    <option disabled>Nenhum profissional disponível</option>
                  ) : (
                    profissionaisDisponiveis.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome_completo} - {p.profissao}
                      </option>
                    ))
                  )}
                </select>
                {profissionaisDisponiveis.length === 0 && (
                  <p className="text-amber-400 text-sm mt-2">
                    ℹ️ Todos os profissionais ativos já possuem acesso ao sistema
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all"
                >
                  Criar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GerenciarAcessos;
