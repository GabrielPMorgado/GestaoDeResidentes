import { useState, useEffect, useCallback } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

function PacientesAgendados({ onIniciarAtendimento }) {
  const { error: showError, success: showSuccess } = useNotification()
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  // Removido mostrarBoasVindas pois não é utilizado
  const [modoProximos, setModoProximos] = useState(false)
  const [residenteSelecionado, setResidenteSelecionado] = useState(null)
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [filtroHistorico, setFiltroHistorico] = useState({
    profissional: '',
    tipo: '',
    periodo: 'todos', // todos, ultima-semana, ultimo-mes, ultimo-ano
    status: 'todos'
  })
  const [filtros, setFiltros] = useState({
    busca: '',
    data: new Date().toISOString().split('T')[0],
    tipo_atendimento: '',
    status: ''
  })

  const carregarAgendamentos = useCallback(async () => {
    setLoading(true)
    try {
      // Para profissionais, usar profissional_id; para admin, não filtrar
      const params = {
        profissional_id: user?.tipo === 'profissional' ? user?.profissional_id : undefined,
        data_inicio: filtros.data,
        data_fim: filtros.data,
        status: filtros.status || undefined,
        tipo_atendimento: filtros.tipo_atendimento || undefined,
        busca: filtros.busca || undefined
      }

      console.log('📋 Carregando agendamentos com params:', params)
      const response = await api.get('/agendamentos', { params })
      console.log('✅ Resposta:', response.data)
      
      if (response.data?.success) {
        const agendamentosData = response.data.data?.agendamentos || []
        
        // Ordenar por hora
        agendamentosData.sort((a, b) => {
          const horaA = a.hora_inicio || '00:00'
          const horaB = b.hora_inicio || '00:00'
          return horaA.localeCompare(horaB)
        })
        
        setAgendamentos(agendamentosData)
      }
    } catch (error) {
      console.error(error)
      showError('Erro ao carregar agendamentos')
      setAgendamentos([])
    } finally {
      setLoading(false)
    }
  }, [user, filtros, showError])

  // Notificação de boas-vindas (mostrar apenas uma vez por sessão)
  useEffect(() => {
    const jaExibiuBoasVindas = sessionStorage.getItem('boasVindasExibida')
    if (!jaExibiuBoasVindas) {
      const horaAtual = new Date().getHours()
      let saudacao = 'Bom dia'
      if (horaAtual >= 12 && horaAtual < 18) saudacao = 'Boa tarde'
      else if (horaAtual >= 18) saudacao = 'Boa noite'
      
      setTimeout(() => {
        showSuccess(`${saudacao}, ${user?.nome || 'Profissional'}! Seus pacientes agendados estão prontos para atendimento.`)
        sessionStorage.setItem('boasVindasExibida', 'true')
      }, 500)
    }
  }, [showSuccess, user?.nome])

  useEffect(() => {
    carregarAgendamentos()
  }, [filtros, carregarAgendamentos])

  const getStatusBadge = (status) => {
    const configs = {
      agendado: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: 'bi-calendar-check', label: 'Aguardando' },
      confirmado: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: 'bi-check-circle', label: 'Confirmado' },
      em_atendimento: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: 'bi-activity', label: 'Em Atendimento' },
      concluido: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', icon: 'bi-check-circle-fill', label: 'Finalizado' },
      cancelado: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: 'bi-x-circle', label: 'Cancelado' }
    }
    
    const config = configs[status] || configs.agendado
    
    return (
      <span className={`px-3 py-1.5 ${config.bg} ${config.text} border ${config.border} rounded-lg text-xs font-semibold flex items-center gap-1.5`}>
        <i className={`bi ${config.icon}`}></i>
        {config.label}
      </span>
    )
  }

  const formatarHora = (hora) => hora?.substring(0, 5) || ''

  const getAlertasResidente = () => {
    // Aqui você pode adicionar lógica para buscar alertas do banco
    return []
  }

  // Função para filtrar próximos atendimentos (próximas 2 horas)
  const getProximosAtendimentos = () => {
    const agora = new Date()
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
    const duasHorasDepois = new Date(agora.getTime() + 2 * 60 * 60 * 1000)
    const horaLimite = `${String(duasHorasDepois.getHours()).padStart(2, '0')}:${String(duasHorasDepois.getMinutes()).padStart(2, '0')}`
    
    return agendamentos.filter(ag => {
      const horaInicio = ag.hora_inicio?.substring(0, 5) || '00:00'
      return horaInicio >= horaAtual && horaInicio <= horaLimite && 
             (ag.status === 'agendado' || ag.status === 'confirmado')
    })
  }

  const agendamentosFiltrados = modoProximos ? getProximosAtendimentos() : agendamentos

  const abrirHistorico = async (residente) => {
    setResidenteSelecionado(residente)
    setLoadingHistorico(true)
    setHistoricoConsultas([]) // Resetar antes de carregar
    
    try {
      const response = await api.get(`/historico-consultas/residente/${residente.id}`)
      
      if (response.data?.success) {
        // A API retorna em response.data.data.consultas
        const historico = response.data.data?.consultas || []
        setHistoricoConsultas(Array.isArray(historico) ? historico : [])
      } else {
        setHistoricoConsultas([])
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      showError('Erro ao carregar histórico do paciente')
      setHistoricoConsultas([])
    } finally {
      setLoadingHistorico(false)
    }
  }

  const fecharHistorico = () => {
    setResidenteSelecionado(null)
    setHistoricoConsultas([])
    setFiltroHistorico({ profissional: '', tipo: '', periodo: 'todos' })
  }

  const filtrarHistorico = () => {
    let consultasFiltradas = [...historicoConsultas]

    // Filtrar por profissional
    if (filtroHistorico.profissional) {
      consultasFiltradas = consultasFiltradas.filter(c => 
        c.profissional?.nome_completo?.toLowerCase().includes(filtroHistorico.profissional.toLowerCase())
      )
    }

    // Filtrar por tipo de consulta
    if (filtroHistorico.tipo) {
      consultasFiltradas = consultasFiltradas.filter(c => c.tipo_consulta === filtroHistorico.tipo)
    }

    // Filtrar por período
    if (filtroHistorico.periodo !== 'todos') {
      const hoje = new Date()
      const dataLimite = new Date()
      
      switch (filtroHistorico.periodo) {
        case 'ultima-semana':
          dataLimite.setDate(hoje.getDate() - 7)
          break
        case 'ultimo-mes':
          dataLimite.setMonth(hoje.getMonth() - 1)
          break
        case 'ultimo-ano':
          dataLimite.setFullYear(hoje.getFullYear() - 1)
          break
      }

      consultasFiltradas = consultasFiltradas.filter(c => 
        new Date(c.data_consulta) >= dataLimite
      )
    }

    // Filtrar por status
    if (filtroHistorico.status !== 'todos') {
      consultasFiltradas = consultasFiltradas.filter(c => c.status === filtroHistorico.status)
    }

    return consultasFiltradas
  }

  const consultasFiltradas = filtrarHistorico()

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 'N/A'
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="bi bi-people-fill text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pacientes Agendados</h1>
              <p className="text-slate-400">Atendimentos para hoje - {new Date(filtros.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
            </div>
          </div>

          {/* Atalho Rápido - Próximos Atendimentos */}
          {getProximosAtendimentos().length > 0 && (
            <div className="mb-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-xl border border-amber-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center animate-pulse">
                    <i className="bi bi-clock-history text-2xl text-amber-400"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Próximos Atendimentos
                      <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-400">
                        {getProximosAtendimentos().length}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-400">Agendados para as próximas 2 horas</p>
                  </div>
                </div>
                <button
                  onClick={() => setModoProximos(!modoProximos)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    modoProximos
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <i className={`bi ${modoProximos ? 'bi-list' : 'bi-funnel'} mr-2`}></i>
                  {modoProximos ? 'Ver Todos' : 'Filtrar Próximos'}
                </button>
              </div>
            </div>
          )}

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <i className="bi bi-calendar-check text-xl text-blue-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Aguardando</p>
                  <h3 className="text-xl font-bold text-white">
                    {agendamentos.filter(a => a.status === 'agendado' || a.status === 'confirmado').length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <i className="bi bi-activity text-xl text-amber-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Em Atendimento</p>
                  <h3 className="text-xl font-bold text-white">
                    {agendamentos.filter(a => a.status === 'em_atendimento').length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <i className="bi bi-check-circle-fill text-xl text-emerald-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Finalizados</p>
                  <h3 className="text-xl font-bold text-white">
                    {agendamentos.filter(a => a.status === 'concluido').length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <i className="bi bi-list-check text-xl text-slate-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <h3 className="text-xl font-bold text-white">{agendamentos.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-funnel text-emerald-400"></i>
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.data}
                onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="agendado">Aguardando</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluido">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Atendimento</label>
              <select
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.tipo_atendimento}
                onChange={(e) => setFiltros({ ...filtros, tipo_atendimento: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="Consulta Médica">Consulta Médica</option>
                <option value="Enfermagem">Enfermagem</option>
                <option value="Fisioterapia">Fisioterapia</option>
                <option value="Psicologia">Psicologia</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Exame">Exame</option>
                <option value="Procedimento">Procedimento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar Paciente</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nome ou matrícula..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-12 w-12 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando agendamentos...</p>
            </div>
          ) : agendamentosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-calendar-x text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">
                {modoProximos 
                  ? 'Nenhum atendimento nas próximas 2 horas'
                  : 'Nenhum agendamento encontrado para esta data'
                }
              </p>
              {modoProximos && (
                <button
                  onClick={() => setModoProximos(false)}
                  className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all"
                >
                  Ver todos os agendamentos
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {agendamentosFiltrados.map((agendamento) => {
                const residente = agendamento.Residente || agendamento.residente
                const alertas = getAlertasResidente(residente)
                
                return (
                  <div key={agendamento.id} className="p-6 hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-start gap-6">
                      {/* Horário */}
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center">
                          <i className="bi bi-clock text-emerald-400 text-sm mb-1"></i>
                          <span className="text-white font-bold text-sm">{formatarHora(agendamento.hora_inicio)}</span>
                        </div>
                      </div>

                      {/* Informações do Paciente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {residente?.nome_completo?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{residente?.nome_completo || 'Paciente'}</h3>
                              <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span>ID: {residente?.id}</span>
                                {residente?.data_nascimento && (
                                  <span>• {new Date().getFullYear() - new Date(residente.data_nascimento).getFullYear()} anos</span>
                                )}
                                {residente?.numero_quarto && (
                                  <span>• Quarto {residente.numero_quarto}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(agendamento.status)}
                        </div>

                        {/* Alertas Importantes */}
                        {alertas.length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                              <i className="bi bi-exclamation-triangle-fill text-red-400 text-lg"></i>
                              <div>
                                <p className="text-sm font-semibold text-red-400 mb-1">Alertas Importantes:</p>
                                <ul className="text-sm text-red-300 space-y-1">
                                  {alertas.map((alerta, idx) => (
                                    <li key={idx}>• {alerta}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detalhes do Atendimento */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Tipo de Atendimento</p>
                            <p className="text-sm font-medium text-white">{agendamento.tipo_atendimento}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Duração</p>
                            <p className="text-sm font-medium text-white">
                              {formatarHora(agendamento.hora_inicio)} - {formatarHora(agendamento.hora_fim)}
                            </p>
                          </div>
                        </div>

                        {agendamento.observacoes && (
                          <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                            <p className="text-xs text-slate-400 mb-1">Observações</p>
                            <p className="text-sm text-slate-300">{agendamento.observacoes}</p>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex items-center gap-3">
                          {(agendamento.status === 'agendado' || agendamento.status === 'confirmado') && (
                            <button
                              onClick={() => onIniciarAtendimento(agendamento)}
                              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                            >
                              <i className="bi bi-play-circle-fill"></i>
                              Iniciar Atendimento
                            </button>
                          )}
                          
                          {agendamento.status === 'em_atendimento' && (
                            <button
                              onClick={() => onIniciarAtendimento(agendamento)}
                              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
                            >
                              <i className="bi bi-arrow-repeat"></i>
                              Continuar Atendimento
                            </button>
                          )}

                          <button
                            onClick={() => abrirHistorico(residente)}
                            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <i className="bi bi-journal-medical"></i>
                            Ver Histórico
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Histórico do Paciente */}
      {residenteSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={fecharHistorico}>
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <i className="bi bi-person-fill text-3xl text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{residenteSelecionado.nome_completo}</h2>
                    <p className="text-blue-100">Prontuário do Paciente</p>
                  </div>
                </div>
                <button
                  onClick={fecharHistorico}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <i className="bi bi-x-lg text-white text-xl"></i>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Informações do Paciente */}
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <i className="bi bi-info-circle text-blue-400"></i>
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">CPF</p>
                    <p className="text-white font-medium">{residenteSelecionado.cpf || 'Não informado'}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Data de Nascimento</p>
                    <p className="text-white font-medium">
                      {residenteSelecionado.data_nascimento 
                        ? new Date(residenteSelecionado.data_nascimento).toLocaleDateString('pt-BR')
                        : 'Não informado'
                      }
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Idade</p>
                    <p className="text-white font-medium">{calcularIdade(residenteSelecionado.data_nascimento)} anos</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Telefone</p>
                    <p className="text-white font-medium">{residenteSelecionado.telefone || 'Não informado'}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Quarto</p>
                    <p className="text-white font-medium">{residenteSelecionado.quarto || 'Não informado'}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <p className={`font-medium ${residenteSelecionado.status === 'ativo' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {residenteSelecionado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                {/* Condições Médicas */}
                {residenteSelecionado.condicoes_medicas && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      Condições Médicas
                    </p>
                    <p className="text-white">{residenteSelecionado.condicoes_medicas}</p>
                  </div>
                )}

                {/* Medicamentos */}
                {residenteSelecionado.medicamentos && (
                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-xs text-blue-400 font-semibold mb-2 flex items-center gap-2">
                      <i className="bi bi-capsule"></i>
                      Medicamentos em Uso
                    </p>
                    <p className="text-white">{residenteSelecionado.medicamentos}</p>
                  </div>
                )}

                {/* Responsável */}
                {residenteSelecionado.responsavel_nome && (
                  <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 font-semibold mb-2">Responsável</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Nome</p>
                        <p className="text-white">{residenteSelecionado.responsavel_nome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Telefone</p>
                        <p className="text-white">{residenteSelecionado.responsavel_telefone || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Histórico de Consultas */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <i className="bi bi-clock-history text-emerald-400"></i>
                    Histórico de Consultas
                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
                      {consultasFiltradas.length} {consultasFiltradas.length === 1 ? 'registro' : 'registros'}
                      {consultasFiltradas.length !== historicoConsultas.length && (
                        <span className="text-slate-400"> de {historicoConsultas.length}</span>
                      )}
                    </span>
                  </h3>
                </div>

                {/* Filtros do Histórico */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 mb-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="bi bi-funnel text-amber-400"></i>
                    Filtrar Consultas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Buscar Profissional</label>
                      <input
                        type="text"
                        placeholder="Nome do profissional..."
                        value={filtroHistorico.profissional}
                        onChange={(e) => setFiltroHistorico({ ...filtroHistorico, profissional: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Tipo de Consulta</label>
                      <select
                        value={filtroHistorico.tipo}
                        onChange={(e) => setFiltroHistorico({ ...filtroHistorico, tipo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="consulta">Consulta</option>
                        <option value="enfermagem">Enfermagem</option>
                        <option value="fisioterapia">Fisioterapia</option>
                        <option value="psicologia">Psicologia</option>
                        <option value="nutricao">Nutrição</option>
                        <option value="exame">Exame</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Período</label>
                      <select
                        value={filtroHistorico.periodo}
                        onChange={(e) => setFiltroHistorico({ ...filtroHistorico, periodo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="todos">Todos os períodos</option>
                        <option value="ultima-semana">Última semana</option>
                        <option value="ultimo-mes">Último mês</option>
                        <option value="ultimo-ano">Último ano</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                      <select
                        value={filtroHistorico.status}
                        onChange={(e) => setFiltroHistorico({ ...filtroHistorico, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="todos">Todos os status</option>
                        <option value="realizada">✅ Realizadas</option>
                        <option value="confirmado">✔️ Confirmadas</option>
                        <option value="pendente">⏳ Pendentes</option>
                        <option value="cancelado">❌ Canceladas</option>
                      </select>
                    </div>
                  </div>

                  {(filtroHistorico.profissional || filtroHistorico.tipo || filtroHistorico.periodo !== 'todos' || filtroHistorico.status !== 'todos') && (
                    <button
                      onClick={() => setFiltroHistorico({ profissional: '', tipo: '', periodo: 'todos', status: 'todos' })}
                      className="mt-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors flex items-center gap-2"
                    >
                      <i className="bi bi-x-circle"></i>
                      Limpar Filtros
                    </button>
                  )}
                </div>

                {loadingHistorico ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : consultasFiltradas.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
                    <i className="bi bi-journal-medical text-5xl text-slate-600 mb-3"></i>
                    <p className="text-slate-400">
                      {historicoConsultas.length === 0 
                        ? 'Nenhuma consulta registrada' 
                        : 'Nenhuma consulta encontrada com os filtros aplicados'
                      }
                    </p>
                    {historicoConsultas.length > 0 && (
                      <button
                        onClick={() => setFiltroHistorico({ profissional: '', tipo: '', periodo: 'todos' })}
                        className="mt-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all text-sm"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultasFiltradas.map((consulta) => (
                      <div key={consulta.id} className="bg-slate-900/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <i className="bi bi-calendar-check text-emerald-400 text-lg"></i>
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {new Date(consulta.data_consulta).toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                              <p className="text-sm text-slate-400">
                                {consulta.profissional?.nome_completo || consulta.Profissional?.nome_completo || 'Profissional não identificado'} - {consulta.profissional?.especialidade || consulta.Profissional?.profissao || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
                            #{consulta.id}
                          </span>
                        </div>

                        {consulta.queixa_principal && (
                          <div className="mb-3">
                            <p className="text-xs text-amber-400 font-semibold mb-1">Queixa Principal</p>
                            <p className="text-white text-sm">{consulta.queixa_principal}</p>
                          </div>
                        )}

                        {consulta.diagnostico && (
                          <div className="mb-3">
                            <p className="text-xs text-blue-400 font-semibold mb-1">Diagnóstico</p>
                            <p className="text-white text-sm">{consulta.diagnostico}</p>
                          </div>
                        )}

                        {consulta.procedimentos && (
                          <div className="mb-3">
                            <p className="text-xs text-emerald-400 font-semibold mb-1">Procedimentos</p>
                            <p className="text-white text-sm">{consulta.procedimentos}</p>
                          </div>
                        )}

                        {consulta.prescricao && (
                          <div className="mb-3">
                            <p className="text-xs text-purple-400 font-semibold mb-1">Prescrição</p>
                            <p className="text-white text-sm">{consulta.prescricao}</p>
                          </div>
                        )}

                        {consulta.observacoes && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <p className="text-xs text-slate-400 font-semibold mb-1">Observações</p>
                            <p className="text-slate-300 text-sm">{consulta.observacoes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PacientesAgendados
