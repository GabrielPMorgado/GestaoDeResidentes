import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../../services/authService';
import profissionalService from '../../services/profissionalService';
import { useNotification } from '../../contexts/NotificationContext';

const NIVEIS_ACESSO = {
  total: { label: 'Total', cor: 'purple', descricao: 'Acesso completo a todos os módulos' },
  gerencial: { label: 'Gerencial', cor: 'blue', descricao: 'Gerencia módulos e relatórios' },
  operacional: { label: 'Operacional', cor: 'emerald', descricao: 'Uso diário do sistema' },
  visualizacao: { label: 'Visualização', cor: 'slate', descricao: 'Somente leitura' }
};

function GerenciarAcessos() {
  const { success: showSuccess, error: showError } = useNotification();
  const [usuarios, setUsuarios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    profissional_id: '',
    email: '',
    senha: '',
    nivel_acesso: 'operacional'
  });

  // Modais de ações
  const [modalEditar, setModalEditar] = useState(false);
  const [modalRedefinirSenha, setModalRedefinirSenha] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);

  // Form de edição
  const [editForm, setEditForm] = useState({
    email: '',
    tipo: '',
    nivel_acesso: ''
  });

  // Form de redefinição de senha
  const [novaSenhaForm, setNovaSenhaForm] = useState('');

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);


  const carregarDados = useCallback(async () => {
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
  }, [showError]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função carregarDados já está declarada acima com useCallback

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.criarAcessoProfissional(formData);
      showSuccess('Acesso criado com sucesso!');
      setShowModal(false);
      setFormData({ profissional_id: '', email: '', senha: '', nivel_acesso: 'operacional' });
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
    } catch {
      showError('Erro ao alterar status');
    }
  };

  // Abrir modal de edição
  const abrirEditar = (usuario) => {
    setUsuarioSelecionado(usuario);
    setEditForm({
      email: usuario.email,
      tipo: usuario.tipo,
      nivel_acesso: usuario.nivel_acesso || 'operacional'
    });
    setModalEditar(true);
    setMenuAberto(null);
  };

  // Salvar edição
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      await authService.atualizarUsuario(usuarioSelecionado.id, editForm);
      showSuccess('Usuário atualizado com sucesso!');
      setModalEditar(false);
      setUsuarioSelecionado(null);
      carregarDados();
    } catch (error) {
      showError(error.response?.data?.erro || 'Erro ao atualizar usuário');
    }
  };

  // Abrir modal de redefinir senha
  const abrirRedefinirSenha = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNovaSenhaForm('');
    setModalRedefinirSenha(true);
    setMenuAberto(null);
  };

  // Redefinir senha
  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    try {
      await authService.redefinirSenhaUsuario(usuarioSelecionado.id, novaSenhaForm);
      showSuccess('Senha redefinida com sucesso!');
      setModalRedefinirSenha(false);
      setUsuarioSelecionado(null);
      setNovaSenhaForm('');
    } catch (error) {
      showError(error.response?.data?.erro || 'Erro ao redefinir senha');
    }
  };

  // Abrir modal de exclusão
  const abrirExcluir = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalExcluir(true);
    setMenuAberto(null);
  };

  // Excluir usuário
  const handleExcluir = async () => {
    try {
      await authService.excluirUsuario(usuarioSelecionado.id);
      showSuccess('Usuário excluído com sucesso!');
      setModalExcluir(false);
      setUsuarioSelecionado(null);
      carregarDados();
    } catch (error) {
      showError(error.response?.data?.erro || 'Erro ao excluir usuário');
    }
  };

  // Helper para cor do nível de acesso
  const getNivelAcessoStyle = (nivel) => {
    const config = NIVEIS_ACESSO[nivel] || NIVEIS_ACESSO.operacional;
    const cores = {
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return { classes: cores[config.cor], label: config.label };
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-amber-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-key-fill text-2xl text-amber-400"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Gerenciar Acessos</h1>
              <p className="text-sm text-slate-400">Controle de acesso dos profissionais ao sistema</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={profissionaisDisponiveis.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="bi bi-plus-lg"></i>
            Criar Novo Acesso
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <i className="bi bi-people-fill text-xl sm:text-2xl text-blue-400"></i>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Total de Usuários</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{usuarios.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <i className="bi bi-person-check-fill text-xl sm:text-2xl text-emerald-400"></i>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Profissionais Cadastrados</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{profissionais.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <i className="bi bi-person-plus-fill text-xl sm:text-2xl text-amber-400"></i>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Disponíveis para Acesso</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{profissionaisDisponiveis.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <i className="bi bi-list-ul text-amber-400"></i>
              Lista de Usuários
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/30 border-b border-slate-700/50">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-300">Tipo</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-300">Nome/Email</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-300">Profissão</th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-slate-300">Nível de Acesso</th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-slate-300 hidden md:table-cell">Último Acesso</th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => {
                  const nivelStyle = getNivelAcessoStyle(usuario.nivel_acesso);
                  return (
                  <tr key={usuario.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs font-medium ${
                        usuario.tipo === 'admin' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {usuario.tipo === 'admin' ? 'Admin' : 'Prof.'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {usuario.profissional?.nome_completo || 'Administrador'}
                        </p>
                        <p className="text-slate-400 text-xs">{usuario.email}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-300 text-sm">
                      {usuario.profissional?.profissao || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${nivelStyle.classes}`}>
                        {nivelStyle.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs font-medium ${
                        usuario.ativo 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-slate-300 text-xs hidden md:table-cell">
                      {usuario.ultimo_acesso 
                        ? new Date(usuario.ultimo_acesso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                        : 'Nunca'
                      }
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="relative inline-block" ref={menuAberto === usuario.id ? menuRef : null}>
                        <button
                          onClick={() => setMenuAberto(menuAberto === usuario.id ? null : usuario.id)}
                          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                          title="Ações"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>

                        {menuAberto === usuario.id && (
                          <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                            {/* Editar */}
                            <button
                              onClick={() => abrirEditar(usuario)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                            >
                              <i className="bi bi-pencil-square text-amber-400"></i>
                              Editar Usuário
                            </button>

                            {/* Redefinir Senha */}
                            <button
                              onClick={() => abrirRedefinirSenha(usuario)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                            >
                              <i className="bi bi-key text-blue-400"></i>
                              Redefinir Senha
                            </button>

                            {/* Ativar / Desativar */}
                            {usuario.tipo !== 'admin' && (
                              <button
                                onClick={() => { toggleStatus(usuario.id, usuario.ativo); setMenuAberto(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                              >
                                <i className={`bi ${usuario.ativo ? 'bi-toggle-off text-orange-400' : 'bi-toggle-on text-emerald-400'}`}></i>
                                {usuario.ativo ? 'Desativar' : 'Ativar'}
                              </button>
                            )}

                            {/* Separador */}
                            {usuario.tipo !== 'admin' && (
                              <>
                                <div className="border-t border-slate-700/50"></div>
                                {/* Excluir */}
                                <button
                                  onClick={() => abrirExcluir(usuario)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <i className="bi bi-trash3"></i>
                                  Excluir Acesso
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
          </table>
        </div>
      </div>

        {/* Modal Criar Acesso */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <i className="bi bi-person-plus text-xl text-amber-400"></i>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Criar Acesso</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Profissional <span className="text-amber-400">*</span>
                    <span className="text-xs text-slate-500 ml-2">({profissionaisDisponiveis.length} disponíveis)</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.profissional_id}
                      onChange={(e) => setFormData({ ...formData, profissional_id: e.target.value })}
                      className="w-full px-4 pr-10 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none"
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
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="bi bi-chevron-down text-slate-400 text-sm"></i>
                    </div>
                  </div>
                  {profissionaisDisponiveis.length === 0 && (
                    <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                      <i className="bi bi-info-circle"></i>
                      Todos os profissionais ativos já possuem acesso ao sistema
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Senha <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nível de Acesso <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.nivel_acesso}
                      onChange={(e) => setFormData({ ...formData, nivel_acesso: e.target.value })}
                      className="w-full px-4 pr-10 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none"
                    >
                      {Object.entries(NIVEIS_ACESSO).map(([key, val]) => (
                        <option key={key} value={key}>{val.label} — {val.descricao}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="bi bi-chevron-down text-slate-400 text-sm"></i>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/30"
                  >
                    Criar Acesso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Usuário */}
        {modalEditar && usuarioSelecionado && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <i className="bi bi-pencil-square text-xl text-amber-400"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Editar Usuário</h2>
                    <p className="text-xs text-slate-400">{usuarioSelecionado.profissional?.nome_completo || 'Administrador'}</p>
                  </div>
                </div>
                <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-white transition-colors">
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSalvarEdicao} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Usuário</label>
                  <div className="relative">
                    <select
                      value={editForm.tipo}
                      onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                      className="w-full px-4 pr-10 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none"
                    >
                      <option value="profissional">Profissional</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="bi bi-chevron-down text-slate-400 text-sm"></i>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nível de Acesso</label>
                  <div className="relative">
                    <select
                      value={editForm.nivel_acesso}
                      onChange={(e) => setEditForm({ ...editForm, nivel_acesso: e.target.value })}
                      className="w-full px-4 pr-10 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none"
                    >
                      {Object.entries(NIVEIS_ACESSO).map(([key, val]) => (
                        <option key={key} value={key}>{val.label} — {val.descricao}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i className="bi bi-chevron-down text-slate-400 text-sm"></i>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-slate-400">
                      <i className="bi bi-info-circle text-amber-400 mr-1"></i>
                      <strong className="text-slate-300">Total:</strong> Todos os módulos | 
                      <strong className="text-slate-300"> Gerencial:</strong> Gerencia e relatórios | 
                      <strong className="text-slate-300"> Operacional:</strong> Uso diário | 
                      <strong className="text-slate-300"> Visualização:</strong> Somente leitura
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={() => setModalEditar(false)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/30">
                    <i className="bi bi-check-lg mr-2"></i>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Redefinir Senha */}
        {modalRedefinirSenha && usuarioSelecionado && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <i className="bi bi-key text-xl text-blue-400"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Redefinir Senha</h2>
                    <p className="text-xs text-slate-400">{usuarioSelecionado.profissional?.nome_completo || usuarioSelecionado.email}</p>
                  </div>
                </div>
                <button onClick={() => setModalRedefinirSenha(false)} className="text-slate-400 hover:text-white transition-colors">
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleRedefinirSenha} className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-300 flex items-start gap-2">
                    <i className="bi bi-exclamation-triangle mt-0.5"></i>
                    A senha será substituída imediatamente. O usuário precisará usar a nova senha no próximo login.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nova Senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={novaSenhaForm}
                    onChange={(e) => setNovaSenhaForm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={() => setModalRedefinirSenha(false)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30">
                    <i className="bi bi-key mr-2"></i>
                    Redefinir Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmar Exclusão */}
        {modalExcluir && usuarioSelecionado && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <i className="bi bi-trash3 text-xl text-red-400"></i>
                  </div>
                  <h2 className="text-xl font-bold text-white">Excluir Acesso</h2>
                </div>
                <button onClick={() => setModalExcluir(false)} className="text-slate-400 hover:text-white transition-colors">
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-300 flex items-start gap-2">
                    <i className="bi bi-exclamation-triangle mt-0.5"></i>
                    Esta ação é irreversível. O acesso do usuário será removido permanentemente.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                  <p className="text-sm text-slate-300">
                    <strong>Usuário:</strong> {usuarioSelecionado.profissional?.nome_completo || usuarioSelecionado.email}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong>Email:</strong> {usuarioSelecionado.email}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button onClick={() => setModalExcluir(false)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleExcluir}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30">
                    <i className="bi bi-trash3 mr-2"></i>
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarAcessos;
