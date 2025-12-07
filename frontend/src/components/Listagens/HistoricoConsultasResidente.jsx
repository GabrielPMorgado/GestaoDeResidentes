import { useState, useEffect } from 'react'
import { listarHistoricoConsultas, listarAgendamentos } from '../../api/axios'

function HistoricoConsultasResidente({ residenteId, residenteNome, onVoltar }) {
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [consultasFiltradas, setConsultasFiltradas] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [filtroDia, setFiltroDia] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    carregarHistorico()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenteId])

  useEffect(() => {
    aplicarFiltros()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicoConsultas, filtroDia, filtroMes, filtroAno, filtroStatus])

  const carregarHistorico = async () => {
    setLoading(true)
    
    try {
      // Buscar tanto consultas do histórico quanto agendamentos
      const [historicoResponse, agendamentosResponse] = await Promise.all([
        listarHistoricoConsultas(residenteId),
        listarAgendamentos({ residente_id: residenteId })
      ])
      
      let todasConsultas = []
      
      // Adicionar histórico de consultas
      if (historicoResponse.success) {
        const consultas = historicoResponse.data?.consultas || []
        todasConsultas = consultas.map(c => ({
          ...c,
          id: c.id ? `consulta-${c.id}` : `temp-${Date.now()}-${Math.random()}`,
          origem: 'historico'
        }))
      }
      
      // Adicionar agendamentos (incluindo cancelados)
      if (agendamentosResponse.success) {
        const agendamentos = agendamentosResponse.data?.agendamentos || []
        const agendamentosFormatados = agendamentos.map(ag => ({
          id: `agendamento-${ag.id}`,
          originalId: ag.id,
          data_consulta: ag.data,
          profissional: ag.Profissional,
          tipo_consulta: ag.tipo_atendimento,
          diagnostico: ag.observacoes || '-',
          status: ag.status,
          origem: 'agendamento'
        }))
        todasConsultas = [...todasConsultas, ...agendamentosFormatados]
      }
      
      // Ordenar por data (mais recente primeiro)
      todasConsultas.sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))
      
      setHistoricoConsultas(todasConsultas)
      setConsultasFiltradas(todasConsultas)
    } catch (err) {

      setHistoricoConsultas([])
      setConsultasFiltradas([])
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let consultasFiltro = [...historicoConsultas]

    // Filtro por data
    if (filtroDia || filtroMes || filtroAno) {
      consultasFiltro = consultasFiltro.filter(consulta => {
        const dataConsulta = new Date(consulta.data_consulta)
        const dia = dataConsulta.getDate()
        const mes = dataConsulta.getMonth() + 1
        const ano = dataConsulta.getFullYear()

        const matchDia = !filtroDia || dia === parseInt(filtroDia)
        const matchMes = !filtroMes || mes === parseInt(filtroMes)
        const matchAno = !filtroAno || ano === parseInt(filtroAno)

        return matchDia && matchMes && matchAno
      })
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      consultasFiltro = consultasFiltro.filter(c => c.status === filtroStatus)
    }

    setConsultasFiltradas(consultasFiltro)
  }

  const limparFiltros = () => {
    setFiltroDia('')
    setFiltroMes('')
    setFiltroAno('')
    setFiltroStatus('todos')
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-12 w-12 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-lg">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-12">
      {/* Cabeçalho Premium com Gradiente */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-xl border-b border-purple-500/20 mb-8 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl p-4 shadow-2xl">
                  <i className="bi bi-clock-history text-white text-4xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2">
                  Histórico de Consultas Médicas
                </h3>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 backdrop-blur rounded-full border border-purple-500/20">
                  <i className="bi bi-person-fill-check text-cyan-400"></i>
                  <span className="font-bold text-white">{residenteNome}</span>
                </div>
              </div>
            </div>
            <button 
              className="group px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 border border-slate-600"
              onClick={onVoltar}
            >
              <i className="bi bi-arrow-left-circle text-xl group-hover:-translate-x-1 transition-transform"></i>
              <span className="font-semibold">Voltar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* Filtros Avançados */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 px-8 py-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h5 className="text-xl font-black text-white flex items-center gap-3">
                  <i className="bi bi-sliders2 text-2xl"></i>
                  Filtros Avançados
                </h5>
                <button 
                  className="group/btn px-5 py-2.5 bg-white/90 hover:bg-white text-purple-600 rounded-xl transition-all duration-300 text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                  onClick={limparFiltros}
                >
                  <i className="bi bi-arrow-counterclockwise group-hover/btn:rotate-180 transition-transform duration-500"></i>
                  Limpar
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="bi bi-calendar-day text-purple-400"></i>
                  Dia
                </label>
                <select 
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 font-semibold hover:border-purple-500/40 cursor-pointer"
                  value={filtroDia}
                  onChange={(e) => setFiltroDia(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-pink-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="bi bi-calendar-month text-pink-400"></i>
                  Mês
                </label>
                <select 
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-pink-500/20 rounded-xl text-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 font-semibold hover:border-pink-500/40 cursor-pointer"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="1">📅 Janeiro</option>
                  <option value="2">📅 Fevereiro</option>
                  <option value="3">📅 Março</option>
                  <option value="4">📅 Abril</option>
                  <option value="5">📅 Maio</option>
                  <option value="6">📅 Junho</option>
                  <option value="7">📅 Julho</option>
                  <option value="8">📅 Agosto</option>
                  <option value="9">📅 Setembro</option>
                  <option value="10">📅 Outubro</option>
                  <option value="11">📅 Novembro</option>
                  <option value="12">📅 Dezembro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="bi bi-calendar-year text-cyan-400"></i>
                  Ano
                </label>
                <select 
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-cyan-500/20 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 font-semibold hover:border-cyan-500/40 cursor-pointer"
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="bi bi-funnel-fill text-indigo-400"></i>
                  Status
                </label>
                <select 
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-indigo-500/20 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-semibold hover:border-indigo-500/40 cursor-pointer"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="todos">📋 Todos</option>
                  <option value="realizada">✅ Realizadas</option>
                  <option value="confirmado">✔️ Confirmadas</option>
                  <option value="pendente">⏳ Pendentes</option>
                  <option value="cancelado">❌ Canceladas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="bi bi-bar-chart-fill text-emerald-400"></i>
                  Total
                </label>
                <div className="relative group/counter">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-25 group-hover/counter:opacity-50 transition"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/30 rounded-xl py-3 text-center backdrop-blur">
                    <strong className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 block">{consultasFiltradas.length}</strong>
                    <small className="text-slate-400 text-xs font-bold uppercase tracking-wider">consulta(s)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {consultasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-16 text-center max-w-2xl shadow-2xl">
                <div className="mb-8">
                  <i className="bi bi-inbox text-9xl text-purple-500/30"></i>
                </div>
                <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4">
                  Nenhuma Consulta Encontrada
                </h4>
                <p className="text-slate-400 text-lg font-medium">
                  {historicoConsultas.length === 0 
                    ? '📋 Este residente ainda não possui histórico de atendimentos médicos.'
                    : '🔍 Nenhuma consulta corresponde aos filtros selecionados. Tente ajustar os critérios de busca.'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas Premium */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 p-6 hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 shadow-xl">
                        <i className="bi bi-calendar-check-fill text-white text-4xl"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{consultasFiltradas.length}</h2>
                      <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">Total</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 p-6 hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl blur opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl p-3 shadow-xl">
                        <i className="bi bi-check-circle-fill text-white text-4xl"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                        {consultasFiltradas.filter(c => c.status === 'realizada' || c.status === 'confirmado').length}
                      </h2>
                      <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Realizadas</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 animate-pulse" style={{ 
                      width: `${(consultasFiltradas.filter(c => c.status === 'realizada' || c.status === 'confirmado').length / consultasFiltradas.length) * 100}%` 
                    }}></div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/20 rounded-2xl shadow-2xl hover:shadow-red-500/20 transition-all duration-300 p-6 hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl blur opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-red-500 to-rose-500 rounded-xl p-3 shadow-xl">
                        <i className="bi bi-x-circle-fill text-white text-4xl"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                        {consultasFiltradas.filter(c => c.status === 'cancelado').length}
                      </h2>
                      <p className="text-xs text-red-300 font-bold uppercase tracking-widest">Canceladas</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 animate-pulse" style={{ 
                      width: `${(consultasFiltradas.filter(c => c.status === 'cancelado').length / consultasFiltradas.length) * 100}%` 
                    }}></div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 p-6 hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-3 shadow-xl">
                        <i className="bi bi-clock-fill text-white text-4xl"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                        {consultasFiltradas.filter(c => c.status === 'pendente').length}
                      </h2>
                      <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Pendentes</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" style={{ 
                      width: `${(consultasFiltradas.filter(c => c.status === 'pendente').length / consultasFiltradas.length) * 100}%` 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline de Consultas Premium */}
            <div className="space-y-6">
              {consultasFiltradas.map((consulta, index) => (
                <div key={consulta.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                    {/* Header Colorido */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 rounded-xl p-3">
                            <i className="bi bi-calendar-event-fill text-white text-3xl"></i>
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-white">{formatarData(consulta.data_consulta)}</h5>
                            <small className="text-white/70 capitalize font-semibold">
                              {new Date(consulta.data_consulta).toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </small>
                          </div>
                        </div>
                        <span className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg ${
                          consulta.status === 'realizada' ? 'bg-emerald-500 text-white' :
                          consulta.status === 'confirmado' ? 'bg-cyan-500 text-white' :
                          consulta.status === 'cancelado' ? 'bg-red-500 text-white' :
                          consulta.status === 'pendente' ? 'bg-amber-500 text-slate-900' :
                          'bg-slate-600 text-white'
                        }`}>
                          <i className={`bi ${
                            consulta.status === 'realizada' ? 'bi-check-circle-fill' :
                            consulta.status === 'confirmado' ? 'bi-check2-circle' :
                            consulta.status === 'cancelado' ? 'bi-x-circle-fill' :
                            consulta.status === 'pendente' ? 'bi-clock-fill' :
                            'bi-circle'
                          } mr-2`}></i>
                          {consulta.status?.toUpperCase() || 'INDEFINIDO'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Profissional */}
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
                          <i className="bi bi-person-circle text-white text-5xl"></i>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <i className="bi bi-person-badge-fill text-blue-400"></i>
                            {consulta.profissional?.nome_completo || 'Profissional não informado'}
                          </h5>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm shadow-sm">
                              <i className="bi bi-card-text mr-1"></i>
                              <strong>Registro:</strong> {consulta.profissional?.registro_profissional || '-'}
                            </span>
                            <span className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-sm shadow-sm">
                              <i className="bi bi-hospital mr-1"></i>
                              <strong>Especialidade:</strong> {consulta.profissional?.especialidade || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes em Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-cyan-500/10 border-l-4 border-cyan-500 rounded-lg p-4 shadow-sm">
                          <div className="flex gap-3 items-start">
                            <i className="bi bi-clipboard-pulse-fill text-cyan-400 text-3xl mt-1"></i>
                            <div className="flex-1">
                              <small className="text-slate-400 uppercase font-bold block mb-1 text-xs tracking-wider">
                                Tipo de Atendimento
                              </small>
                              <p className="text-white font-semibold text-base">
                                {consulta.tipo_consulta || 'Não especificado'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-500/10 border-l-4 border-slate-500 rounded-lg p-4 shadow-sm">
                          <div className="flex gap-3 items-start">
                            <i className="bi bi-file-text-fill text-slate-400 text-3xl mt-1"></i>
                            <div className="flex-1">
                              <small className="text-slate-400 uppercase font-bold block mb-1 text-xs tracking-wider">
                                Observações Médicas
                              </small>
                              <p className="text-white font-semibold text-base">
                                {consulta.diagnostico || 'Sem observações registradas'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      {consulta.origem === 'agendamento' && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <span className="px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm shadow-sm inline-flex items-center gap-2">
                            <i className="bi bi-calendar3-fill"></i>
                            Origem: <strong>Agendamento</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HistoricoConsultasResidente
