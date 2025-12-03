import { useState, useEffect } from 'react';
import agendamentoService from '../../services/agendamentoService';
import { authService } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';

function PainelProfissional() {
  const { showSuccess, showError } = useNotification();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const usuario = authService.getCurrentUser();

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      const dados = await agendamentoService.listar();
      // Filtrar apenas agendamentos do profissional logado
      const meusAgendamentos = dados.filter(
        a => a.profissional_id === usuario.profissional.id
      );
      setAgendamentos(meusAgendamentos);
    } catch (error) {
      showError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await agendamentoService.atualizarStatus(id, novoStatus);
      showSuccess('Status atualizado com sucesso!');
      carregarAgendamentos();
    } catch (error) {
      showError('Erro ao atualizar status');
    }
  };

  const agendamentosFiltrados = agendamentos.filter(a => 
    filtroStatus === 'todos' || a.status === filtroStatus
  );

  const statusConfig = {
    agendado: { color: 'amber', icon: 'calendar-check', label: 'Agendado' },
    confirmado: { color: 'cyan', icon: 'check-circle', label: 'Confirmado' },
    em_atendimento: { color: 'blue', icon: 'clock-history', label: 'Em Atendimento' },
    concluido: { color: 'emerald', icon: 'check2-circle', label: 'Concluído' },
    cancelado: { color: 'red', icon: 'x-circle', label: 'Cancelado' },
    falta: { color: 'slate', icon: 'slash-circle', label: 'Falta' }
  };

  const contadores = {
    total: agendamentos.length,
    hoje: agendamentos.filter(a => {
      const hoje = new Date().toISOString().split('T')[0];
      return a.data_agendamento === hoje;
    }).length,
    confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    concluidos: agendamentos.filter(a => a.status === 'concluido').length
  };

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
          <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
            <i className="bi bi-calendar2-week text-3xl text-white"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Meus Agendamentos</h1>
            <p className="text-slate-400">Bem-vindo(a), {usuario.profissional.nome_completo}</p>
          </div>
        </div>
        <button
          onClick={carregarAgendamentos}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <i className="bi bi-arrow-clockwise"></i>
          Atualizar
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total</p>
              <p className="text-3xl font-bold text-white">{contadores.total}</p>
            </div>
            <div className="p-4 bg-blue-500/20 rounded-xl">
              <i className="bi bi-calendar3 text-3xl text-blue-400"></i>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Hoje</p>
              <p className="text-3xl font-bold text-white">{contadores.hoje}</p>
            </div>
            <div className="p-4 bg-cyan-500/20 rounded-xl">
              <i className="bi bi-clock text-3xl text-cyan-400"></i>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Confirmados</p>
              <p className="text-3xl font-bold text-white">{contadores.confirmados}</p>
            </div>
            <div className="p-4 bg-amber-500/20 rounded-xl">
              <i className="bi bi-check-circle text-3xl text-amber-400"></i>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Concluídos</p>
              <p className="text-3xl font-bold text-white">{contadores.concluidos}</p>
            </div>
            <div className="p-4 bg-emerald-500/20 rounded-xl">
              <i className="bi bi-check2-circle text-3xl text-emerald-400"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['todos', 'agendado', 'confirmado', 'em_atendimento', 'concluido'].map(status => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {status === 'todos' ? 'Todos' : statusConfig[status]?.label}
          </button>
        ))}
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-600">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Data</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Horário</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Residente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Tipo</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <i className="bi bi-inbox text-4xl mb-2 block"></i>
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                agendamentosFiltrados.map((agendamento) => {
                  const config = statusConfig[agendamento.status] || statusConfig.agendado;
                  return (
                    <tr key={agendamento.id} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-white">
                        {new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {agendamento.hora_agendamento?.substring(0, 5) || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{agendamento.residente_nome}</p>
                          <p className="text-slate-400 text-sm">Quarto: {agendamento.residente?.numero_quarto || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {agendamento.tipo_atendimento || 'Consulta'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400`}>
                          <i className={`bi bi-${config.icon} mr-1`}></i>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {agendamento.status === 'confirmado' && (
                            <button
                              onClick={() => atualizarStatus(agendamento.id, 'em_atendimento')}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-all"
                            >
                              Iniciar
                            </button>
                          )}
                          {agendamento.status === 'em_atendimento' && (
                            <button
                              onClick={() => atualizarStatus(agendamento.id, 'concluido')}
                              className="px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-all"
                            >
                              Concluir
                            </button>
                          )}
                          {agendamento.observacoes && (
                            <button
                              title={agendamento.observacoes}
                              className="px-3 py-1 bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 rounded-lg text-sm transition-all"
                            >
                              <i className="bi bi-chat-text"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PainelProfissional;
