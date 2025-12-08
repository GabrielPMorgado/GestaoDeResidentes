import { useState, useEffect } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

function PacientesAgendados({ onIniciarAtendimento }) {
  const { error: showError } = useNotification()
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    busca: '',
    data: new Date().toISOString().split('T')[0],
    tipo_atendimento: '',
    status: ''
  })

  useEffect(() => {
    carregarAgendamentos()
  }, [filtros])

  const carregarAgendamentos = async () => {
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
      showError('Erro ao carregar agendamentos')
      setAgendamentos([])
    } finally {
      setLoading(false)
    }
  }

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

  const getAlertasResidente = (residente) => {
    const alertas = []
    // Aqui você pode adicionar lógica para buscar alertas do banco
    return alertas
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
          ) : agendamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-calendar-x text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">Nenhum agendamento encontrado para esta data</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {agendamentos.map((agendamento) => {
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
    </div>
  )
}

export default PacientesAgendados
