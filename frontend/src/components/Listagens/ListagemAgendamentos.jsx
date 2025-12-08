import { useState, useMemo } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import {
  confirmarAgendamento,
  buscarAgendamentoPorId,
  atualizarAgendamento
} from '../../api/axios'
import { useAgendamentos, useCancelarAgendamento } from '../../hooks'

function ListagemAgendamentos() {
  const { success, error: showError } = useNotification()
  
  // React Query - Cache automático
  const { data: agendamentosData = [], isLoading: loading, refetch } = useAgendamentos()
  const cancelarMutation = useCancelarAgendamento()
  
  // Debug: verificar dados
  console.log('📊 agendamentosData:', agendamentosData)
  console.log('📊 Primeiro agendamento:', agendamentosData[0])
  console.log('📊 isLoading:', loading)
  
  const [mostrarCancelados, setMostrarCancelados] = useState(false)
  
  const [filtros, setFiltros] = useState({
    status: '',
    tipo_atendimento: '',
    data_inicio: '',
    data_fim: '',
    busca: ''
  })
  
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)
  
  const [detalhesModal, setDetalhesModal] = useState(null)
  const [editarModal, setEditarModal] = useState(null)

  // Processar e filtrar agendamentos
  const agendamentosFiltrados = useMemo(() => {
    let dados = Array.isArray(agendamentosData) ? agendamentosData : []
    
    // Filtrar cancelados
    if (mostrarCancelados) {
      dados = dados.filter(ag => ag.status === 'cancelado')
    } else {
      dados = dados.filter(ag => ag.status !== 'cancelado')
    }
    
    // Aplicar filtros
    if (filtros.status) {
      dados = dados.filter(ag => ag.status === filtros.status)
    }
    
    if (filtros.tipo_atendimento) {
      dados = dados.filter(ag => ag.tipo_atendimento === filtros.tipo_atendimento)
    }
    
    if (filtros.data_inicio) {
      dados = dados.filter(ag => ag.data_agendamento >= filtros.data_inicio)
    }
    
    if (filtros.data_fim) {
      dados = dados.filter(ag => ag.data_agendamento <= filtros.data_fim)
    }
    
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      dados = dados.filter(ag => 
        ag.residente_nome?.toLowerCase().includes(busca) ||
        ag.profissional_nome?.toLowerCase().includes(busca)
      )
    }
    
    // Ordenar por data (mais recente primeiro)
    return dados.sort((a, b) => {
      const dataA = new Date(a.data_agendamento + 'T' + (a.hora_inicio || '00:00'))
      const dataB = new Date(b.data_agendamento + 'T' + (b.hora_inicio || '00:00'))
      return dataB - dataA
    })
  }, [agendamentosData, mostrarCancelados, filtros])

  // Paginação
  const { agendamentos, totalPaginas, totalItens } = useMemo(() => {
    const total = agendamentosFiltrados.length
    const paginas = Math.ceil(total / itensPorPagina)
    const inicio = (paginaAtual - 1) * itensPorPagina
    const fim = inicio + itensPorPagina
    const dados = agendamentosFiltrados.slice(inicio, fim)
    
    return {
      agendamentos: dados,
      totalPaginas: paginas,
      totalItens: total
    }
  }, [agendamentosFiltrados, paginaAtual, itensPorPagina])

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = agendamentosData.length
    const agendados = agendamentosData.filter(ag => ag.status === 'agendado').length
    const confirmados = agendamentosData.filter(ag => ag.status === 'confirmado').length
    const concluidos = agendamentosData.filter(ag => ag.status === 'concluido').length
    const cancelados = agendamentosData.filter(ag => ag.status === 'cancelado').length
    
    console.log('📊 ESTATÍSTICAS:', { total, agendados, confirmados, concluidos, cancelados })
    console.log('📊 Status dos agendamentos:', agendamentosData.map(ag => ag.status))
    
    return {
      total,
      agendados,
      confirmados,
      concluidos,
      cancelados
    }
  }, [agendamentosData])

  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }))
    setPaginaAtual(1)
  }

  const limparFiltros = () => {
    setFiltros({
      status: '',
      tipo_atendimento: '',
      data_inicio: '',
      data_fim: '',
      busca: ''
    })
    setPaginaAtual(1)
  }

  const handleConfirmar = async (id) => {
    if (!window.confirm('Deseja confirmar este agendamento?')) return

    try {
      const response = await confirmarAgendamento(id)
      
      if (response.success) {
        success('Agendamento confirmado com sucesso!')
        refetch() // Recarregar dados do React Query
      } else {
        throw new Error(response.message || 'Erro ao confirmar')
      }
    } catch (error) {
      showError(error.message || 'Erro ao confirmar agendamento')
    }
  }

  const handleCancelar = async (id) => {
    const motivo = window.prompt('Digite o motivo do cancelamento:')
    if (!motivo) return

    const canceladoPor = window.prompt('Cancelado por (nome):')
    if (!canceladoPor) return

    try {
      await cancelarMutation.mutateAsync({
        id,
        dados: {
          motivo_cancelamento: motivo,
          cancelado_por: canceladoPor
        }
      })
      success('Agendamento cancelado com sucesso!')
    } catch (error) {
      showError(error.message || 'Erro ao cancelar agendamento')
    }
  }

  const verDetalhes = async (id) => {
    try {
      const response = await buscarAgendamentoPorId(id)
      if (response.success) {
        setDetalhesModal(response.data)
      }
    } catch {
      showError('Erro ao buscar detalhes')
    }
  }

  const abrirModalEditar = async (id) => {
    try {
      const response = await buscarAgendamentoPorId(id)
      if (response.success) {
        setEditarModal(response.data)
      }
    } catch {
      showError('Erro ao buscar agendamento')
    }
  }

  const handleSalvarEdicao = async () => {
    if (editarModal.hora_fim <= editarModal.hora_inicio) {
      showError('A hora de término deve ser posterior à hora de início')
      return
    }
    
    try {
      const dados = {
        data_agendamento: editarModal.data_agendamento,
        hora_inicio: editarModal.hora_inicio,
        hora_fim: editarModal.hora_fim,
        tipo_atendimento: editarModal.tipo_atendimento,
        observacoes: editarModal.observacoes
      }
      
      await atualizarAgendamento(editarModal.id, dados)
      success('Agendamento atualizado com sucesso!')
      setEditarModal(null)
      refetch() // Recarregar dados do React Query
    } catch (error) {
      showError(error.message || 'Erro ao atualizar agendamento')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      agendado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      confirmado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      em_atendimento: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      em_andamento: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      concluido: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
      falta: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_atendimento: 'Em Atendimento',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      falta: 'Falta'
    }
    return <span className={`px-3 py-1 border rounded-full text-xs font-medium ${badges[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{labels[status] || status}</span>
  }

  const getTipoAtendimentoBadge = (tipo) => {
    const badges = {
      'Consulta Médica': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Enfermagem': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Fisioterapia': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Psicologia': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Nutrição': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'Exame': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'Procedimento': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'Outro': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
    return <span className={`px-3 py-1 border rounded-full text-xs font-medium ${badges[tipo] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{tipo}</span>
  }

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const formatarHora = (hora) => {
    return hora?.substring(0, 5) || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-calendar-check text-2xl sm:text-3xl text-amber-400"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Listagem de Agendamentos</h1>
              <p className="text-sm text-slate-400">Gerencie os agendamentos dos residentes</p>
            </div>
          </div>

          {/* Estatísticas */}
          {estatisticas && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-calendar-check text-xl text-amber-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.total || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-calendar-plus text-xl text-blue-400"></i>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400">Agendados</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.agendados || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="bi bi-calendar-check-fill text-xl sm:text-2xl text-emerald-400"></i>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400">Confirmados</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.confirmados || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                    <i className="bi bi-check-circle-fill text-xl sm:text-2xl text-slate-400"></i>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400">Concluídos</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.concluidos || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-funnel text-amber-400"></i>
            Filtros
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                name="status"
                value={filtros.status}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
                <option value="falta">Falta</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
              <select
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                name="tipo_atendimento"
                value={filtros.tipo_atendimento}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="Consulta Médica">Consulta Médica</option>
                <option value="Enfermagem">Enfermagem</option>
                <option value="Fisioterapia">Fisioterapia</option>
                <option value="Psicologia">Psicologia</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Exame">Exame</option>
                <option value="Procedimento">Procedimento</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Data Início</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                name="data_inicio"
                value={filtros.data_inicio}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Data Fim</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                name="data_fim"
                value={filtros.data_fim}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                name="busca"
                value={filtros.busca}
                onChange={handleFiltroChange}
                placeholder="Residente ou profissional..."
              />
            </div>

            <div className="flex items-end">
              <button
                className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all"
                onClick={limparFiltros}
                title="Limpar filtros"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <button
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${mostrarCancelados ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
              onClick={() => setMostrarCancelados(!mostrarCancelados)}
            >
              <i className={`bi ${mostrarCancelados ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              <span className="text-sm">{mostrarCancelados ? 'Ocultar cancelados' : 'Ver cancelados'}</span>
            </button>
          </div>
        </div>

        {/* Tabela Desktop e Cards Mobile */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-12 w-12 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando agendamentos...</p>
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-calendar-x text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Agendamento</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Residente</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Profissional</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Informações</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {agendamentos.map((agendamento) => (
                      <tr key={agendamento.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-white font-medium">
                              <i className="bi bi-calendar3 text-amber-400"></i>
                              {formatarData(agendamento.data_agendamento)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <i className="bi bi-clock"></i>
                              {formatarHora(agendamento.hora_inicio)} - {formatarHora(agendamento.hora_fim)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                              {(agendamento.residente?.nome_completo || agendamento.Residente?.nome_completo || 'N')[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {agendamento.residente?.nome_completo || agendamento.Residente?.nome_completo || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                              {(agendamento.profissional?.nome_completo || agendamento.Profissional?.nome_completo || 'N')[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {agendamento.profissional?.nome_completo || agendamento.Profissional?.nome_completo || 'N/A'}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {agendamento.profissional?.profissao || agendamento.Profissional?.profissao || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {getTipoAtendimentoBadge(agendamento.tipo_atendimento)}
                            {getStatusBadge(agendamento.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110"
                              onClick={() => verDetalhes(agendamento.id)}
                              title="Ver detalhes"
                            >
                              <i className="bi bi-eye text-lg"></i>
                            </button>
                            
                            {agendamento.status === 'agendado' && (
                              <>
                                <button
                                  className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all hover:scale-110"
                                  onClick={() => abrirModalEditar(agendamento.id)}
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil text-lg"></i>
                                </button>
                                <button
                                  className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all hover:scale-110"
                                  onClick={() => handleConfirmar(agendamento.id)}
                                  title="Confirmar"
                                >
                                  <i className="bi bi-check-circle text-lg"></i>
                                </button>
                                <button
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110"
                                  onClick={() => handleCancelar(agendamento.id)}
                                  title="Cancelar"
                                >
                                  <i className="bi bi-x-circle text-lg"></i>
                                </button>
                              </>
                            )}
                            
                            {agendamento.status === 'confirmado' && (
                              <button
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110"
                                onClick={() => handleCancelar(agendamento.id)}
                                title="Cancelar"
                              >
                                <i className="bi bi-x-circle text-lg"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="lg:hidden divide-y divide-slate-700/50">
                {agendamentos.map((agendamento) => (
                  <div key={agendamento.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar Residente */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {(agendamento.residente?.nome_completo || agendamento.Residente?.nome_completo || 'N')[0]}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        {/* Nome Residente */}
                        <h4 className="text-base font-semibold text-white mb-1 truncate">
                          {agendamento.residente?.nome_completo || agendamento.Residente?.nome_completo || 'N/A'}
                        </h4>
                        
                        {/* Data e Hora */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5 text-sm text-slate-300">
                            <i className="bi bi-calendar3 text-amber-400"></i>
                            <span>{formatarData(agendamento.data_agendamento)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-300">
                            <i className="bi bi-clock text-blue-400"></i>
                            <span>{formatarHora(agendamento.hora_inicio)} - {formatarHora(agendamento.hora_fim)}</span>
                          </div>
                        </div>
                        
                        {/* Profissional */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(agendamento.profissional?.nome_completo || agendamento.Profissional?.nome_completo || 'N')[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {agendamento.profissional?.nome_completo || agendamento.Profissional?.nome_completo || 'N/A'}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {agendamento.profissional?.profissao || agendamento.Profissional?.profissao || ''}
                            </div>
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getTipoAtendimentoBadge(agendamento.tipo_atendimento)}
                          {getStatusBadge(agendamento.status)}
                        </div>
                        
                        {/* Ações */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-3 py-1.5 text-sm text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all flex items-center gap-1.5"
                            onClick={() => verDetalhes(agendamento.id)}
                          >
                            <i className="bi bi-eye"></i>
                            <span>Detalhes</span>
                          </button>
                          
                          {agendamento.status === 'agendado' && (
                            <>
                              <button
                                className="px-3 py-1.5 text-sm text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-all flex items-center gap-1.5"
                                onClick={() => abrirModalEditar(agendamento.id)}
                              >
                                <i className="bi bi-pencil"></i>
                                <span>Editar</span>
                              </button>
                              <button
                                className="px-3 py-1.5 text-sm text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all flex items-center gap-1.5"
                                onClick={() => handleConfirmar(agendamento.id)}
                              >
                                <i className="bi bi-check-circle"></i>
                                <span>Confirmar</span>
                              </button>
                              <button
                                className="px-3 py-1.5 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all flex items-center gap-1.5"
                                onClick={() => handleCancelar(agendamento.id)}
                              >
                                <i className="bi bi-x-circle"></i>
                                <span>Cancelar</span>
                              </button>
                            </>
                          )}
                          
                          {agendamento.status === 'confirmado' && (
                            <button
                              className="px-3 py-1.5 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all flex items-center gap-1.5"
                              onClick={() => handleCancelar(agendamento.id)}
                            >
                              <i className="bi bi-x-circle"></i>
                              <span>Cancelar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm text-slate-400">Itens por página:</label>
                    <select
                      className="px-3 py-1.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      value={itensPorPagina}
                      onChange={(e) => {
                        setItensPorPagina(Number(e.target.value))
                        setPaginaAtual(1)
                      }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="text-sm text-slate-400">
                      Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a{' '}
                      {Math.min(paginaAtual * itensPorPagina, totalItens)} de {totalItens}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-2 rounded-xl transition-all ${
                        paginaAtual === 1 
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-700/50 text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setPaginaAtual(1)}
                      disabled={paginaAtual === 1}
                    >
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                    <button
                      className={`px-3 py-2 rounded-xl transition-all ${
                        paginaAtual === 1 
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-700/50 text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setPaginaAtual(paginaAtual - 1)}
                      disabled={paginaAtual === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <span className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30">
                      {paginaAtual}
                    </span>
                    <button
                      className={`px-3 py-2 rounded-xl transition-all ${
                        paginaAtual === totalPaginas 
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-700/50 text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setPaginaAtual(paginaAtual + 1)}
                      disabled={paginaAtual === totalPaginas}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                    <button
                      className={`px-3 py-2 rounded-xl transition-all ${
                        paginaAtual === totalPaginas 
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-700/50 text-white hover:bg-slate-700'
                      }`}
                      onClick={() => setPaginaAtual(totalPaginas)}
                      disabled={paginaAtual === totalPaginas}
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Detalhes */}
      {detalhesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetalhesModal(null)}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-info-circle"></i>
                Detalhes do Agendamento
              </h3>
              <button onClick={() => setDetalhesModal(null)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-400">Residente</label>
                  <p className="text-white font-medium mt-1">
                    {detalhesModal.residente?.nome_completo || detalhesModal.Residente?.nome_completo}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Profissional</label>
                  <p className="text-white font-medium mt-1">
                    {(detalhesModal.profissional?.nome_completo || detalhesModal.Profissional?.nome_completo)} - {(detalhesModal.profissional?.profissao || detalhesModal.Profissional?.profissao)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Data</label>
                  <p className="text-white font-medium mt-1">{formatarData(detalhesModal.data_agendamento)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Horário</label>
                  <p className="text-white font-medium mt-1">
                    {formatarHora(detalhesModal.hora_inicio)} às {formatarHora(detalhesModal.hora_fim)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Tipo</label>
                  <p className="mt-1">{getTipoAtendimentoBadge(detalhesModal.tipo_atendimento)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <p className="mt-1">{getStatusBadge(detalhesModal.status)}</p>
                </div>
                {detalhesModal.observacoes && (
                  <div className="col-span-full">
                    <label className="text-sm text-slate-400">Observações</label>
                    <p className="text-white font-medium mt-1">{detalhesModal.observacoes}</p>
                  </div>
                )}
                {detalhesModal.status === 'cancelado' && (
                  <>
                    <div>
                      <label className="text-sm text-slate-400">Cancelado por</label>
                      <p className="text-white font-medium mt-1">{detalhesModal.cancelado_por}</p>
                    </div>
                    <div className="col-span-full">
                      <label className="text-sm text-slate-400">Motivo do cancelamento</label>
                      <p className="text-white font-medium mt-1">{detalhesModal.motivo_cancelamento}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={() => setDetalhesModal(null)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editarModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditarModal(null)}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-pencil-square"></i>
                Editar Agendamento
              </h3>
              <button onClick={() => setEditarModal(null)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="text-sm text-slate-400">Residente</label>
                  <p className="text-white font-medium mt-1">{editarModal.Residente?.nome_completo}</p>
                </div>
                <div className="md:col-span-3">
                  <label className="text-sm text-slate-400">Profissional</label>
                  <p className="text-white font-medium mt-1">{editarModal.Profissional?.nome_completo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data *</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={editarModal.data_agendamento}
                    onChange={(e) => setEditarModal({...editarModal, data_agendamento: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hora Início *</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={editarModal.hora_inicio}
                    onChange={(e) => setEditarModal({...editarModal, hora_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hora Fim *</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={editarModal.hora_fim}
                    onChange={(e) => setEditarModal({...editarModal, hora_fim: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Atendimento *</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={editarModal.tipo_atendimento}
                    onChange={(e) => setEditarModal({...editarModal, tipo_atendimento: e.target.value})}
                  >
                    <option value="Consulta Médica">Consulta Médica</option>
                    <option value="Enfermagem">Enfermagem</option>
                    <option value="Fisioterapia">Fisioterapia</option>
                    <option value="Psicologia">Psicologia</option>
                    <option value="Nutrição">Nutrição</option>
                    <option value="Exame">Exame</option>
                    <option value="Procedimento">Procedimento</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows="3"
                    value={editarModal.observacoes || ''}
                    onChange={(e) => setEditarModal({...editarModal, observacoes: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={() => setEditarModal(null)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleSalvarEdicao} className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg shadow-lg shadow-amber-500/30 transition-all">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListagemAgendamentos
