import { useState, useEffect, useMemo } from 'react'
import api, { atualizarResidente } from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { useResidentesAtivos, useEstatisticas, useInativarResidente, useAtualizarResidente } from '../../hooks'

function ListagemResidentes({ onVerHistorico }) {
  const { success, error: showError } = useNotification()
  
  // React Query - Cache automático
  const { data: residentesData = [], isLoading: loading, refetch } = useResidentesAtivos()
  const inativarMutation = useInativarResidente()
  const atualizarMutation = useAtualizarResidente()
  
  // Calcular estatísticas localmente
  const estatisticas = useMemo(() => {
    const dados = Array.isArray(residentesData) ? residentesData : []
    return {
      total: dados.length,
      ativos: dados.filter(r => r.status === 'ativo').length,
      inativos: dados.filter(r => r.status === 'inativo').length,
      suspensos: dados.filter(r => r.status === 'suspenso').length
    }
  }, [residentesData])
  
  const [showVisualizarModal, setShowVisualizarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [residenteSelecionado, setResidenteSelecionado] = useState(null)
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  
  const [filtros, setFiltros] = useState({
    status: '',
    busca: '',
    pagina: 1,
    limite: 10
  })

  // Processar dados com memoização
  const residentes = useMemo(() => {
    let dados = Array.isArray(residentesData) ? residentesData : []
    
    // Aplicar filtros
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      dados = dados.filter(r => 
        r.nome_completo?.toLowerCase().includes(busca) ||
        r.cpf?.includes(busca) ||
        r.rg?.includes(busca)
      )
    }
    
    // Ordenar alfabeticamente
    return dados.sort((a, b) => {
      const nomeA = (a.nome_completo || '').toLowerCase()
      const nomeB = (b.nome_completo || '').toLowerCase()
      return nomeA.localeCompare(nomeB, 'pt-BR')
    })
  }, [residentesData, filtros.busca])

  const paginacao = useMemo(() => {
    const total = residentes.length
    const paginas = Math.ceil(total / filtros.limite)
    const inicio = (filtros.pagina - 1) * filtros.limite
    const fim = inicio + filtros.limite
    const dados = residentes.slice(inicio, fim)
    
    return {
      total,
      paginas,
      paginaAtual: filtros.pagina,
      dados
    }
  }, [residentes, filtros.pagina, filtros.limite])

  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja inativar o residente "${nome}"?`)) return
    
    try {
      await inativarMutation.mutateAsync(id)
      success('Residente inativado com sucesso!')
    } catch (err) {
      showError(err.message || 'Erro ao inativar residente')
    }
  }

  const handleVisualizar = (residente) => {
    setResidenteSelecionado(residente)
    setShowVisualizarModal(true)
  }

  const handleEditar = (residente) => {
    setResidenteSelecionado(residente)
    setShowEditarModal(true)
  }

  const handleCampoChange = (campo, valor) => {
    let valorFormatado = valor
    
    if (campo === 'cpf') {
      valorFormatado = valor.replace(/\D/g, '')
      if (valorFormatado.length <= 11) {
        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1.$2')
        valorFormatado = valorFormatado.replace(/(\d{3})(\d)/, '$1.$2')
        valorFormatado = valorFormatado.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      }
    }
    
    if (campo === 'telefone' || campo === 'telefone_responsavel') {
      valorFormatado = valor.replace(/\D/g, '')
      if (valorFormatado.length <= 11) {
        valorFormatado = valorFormatado.replace(/^(\d{2})(\d)/g, '($1) $2')
        valorFormatado = valorFormatado.replace(/(\d)(\d{4})$/, '$1-$2')
      }
    }
    
    setResidenteSelecionado({...residenteSelecionado, [campo]: valorFormatado})
  }

  const handleSalvarEdicao = async () => {
    try {
      await atualizarMutation.mutateAsync({ 
        id: residenteSelecionado.id, 
        dados: residenteSelecionado 
      })
      success('Residente atualizado com sucesso! A lista será atualizada automaticamente.')
      setShowEditarModal(false)
    } catch (err) {
      showError(err.message || 'Erro ao atualizar residente')
    }
  }

  const handleVerHistorico = async (residente) => {
    setResidenteSelecionado(residente)
    setShowHistoricoModal(true)
    setLoadingHistorico(true)
    
    try {
      // Buscar histórico de consultas
      const response = await api.get('/historico-consultas', {
        params: { residente_id: residente.id }
      })
      
      if (response.data?.success) {
        const consultas = response.data.data?.consultas || []
        // Ordenar por data (mais recente primeiro)
        consultas.sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))
        setHistoricoConsultas(consultas)
      } else {
        setHistoricoConsultas([])
      }
    } catch (err) {
      showError('Erro ao carregar histórico de consultas')
      setHistoricoConsultas([])
    } finally {
      setLoadingHistorico(false)
    }
  }

  const handleFecharModals = () => {
    setShowVisualizarModal(false)
    setShowEditarModal(false)
    setShowHistoricoModal(false)
    setResidenteSelecionado(null)
    setHistoricoConsultas([])
  }
  
  const parseSinaisVitais = (sinaisVitaisStr) => {
    if (!sinaisVitaisStr) return {}
    if (typeof sinaisVitaisStr === 'object') return sinaisVitaisStr
    try {
      return JSON.parse(sinaisVitaisStr)
    } catch {
      return {}
    }
  }

  const aplicarFiltros = () => {
    setFiltros(prev => ({ ...prev, pagina: 1 }))
  }

  const limparFiltros = () => {
    setFiltros({
      status: '',
      busca: '',
      pagina: 1,
      limite: 10
    })
  }

  const mudarPagina = (novaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: novaPagina }))
  }

  const formatarCPF = (cpf) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '-'
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade + ' anos'
  }

  const getBadgeStatus = (status) => {
    const badges = {
      ativo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      inativo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      suspenso: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
    return badges[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-people-fill text-2xl sm:text-3xl text-amber-400"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Listagem de Residentes</h1>
              <p className="text-sm text-slate-400">Gerenciamento completo dos residentes cadastrados</p>
            </div>
          </div>

          {/* Estatísticas */}
          {estatisticas && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-people-fill text-xl text-amber-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.total || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-check-circle-fill text-xl text-emerald-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ativos</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.ativos || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-slate-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-x-circle-fill text-xl text-slate-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Inativos</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.inativos || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-exclamation-triangle-fill text-xl text-orange-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Suspensos</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{estatisticas?.suspensos || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-funnel text-amber-400"></i>
            Filtros
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                placeholder="Nome, CPF ou quarto..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Por página</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                value={filtros.limite}
                onChange={(e) => setFiltros(prev => ({ ...prev, limite: parseInt(e.target.value), pagina: 1 }))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="lg:col-span-1 flex items-end gap-2">
              <button 
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-lg shadow-amber-500/20 font-medium"
                onClick={aplicarFiltros}
              >
                <i className="bi bi-search"></i>
              </button>
              <button 
                className="flex-1 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all"
                onClick={limparFiltros}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando residentes...</p>
            </div>
          ) : paginacao.dados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">Nenhum residente encontrado</p>
            </div>
          ) : (
            <>
              {/* Tabela Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/80 border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Residente</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Contato</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Informações</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {paginacao.dados.map((residente) => (
                      <tr key={residente.id} className="hover:bg-slate-700/20 transition-all group">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20 flex-shrink-0">
                              {residente.nome_completo.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate">{residente.nome_completo}</div>
                              <div className="text-xs text-slate-400">ID: #{residente.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <i className="bi bi-credit-card text-amber-400"></i>
                              <span className="font-mono">{formatarCPF(residente.cpf)}</span>
                            </div>
                            {residente.telefone && (
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <i className="bi bi-telephone"></i>
                                <span>{residente.telefone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-medium">
                                {calcularIdade(residente.data_nascimento)}
                              </span>
                              {residente.numero_quarto && (
                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-medium">
                                  <i className="bi bi-door-closed"></i> Quarto {residente.numero_quarto}
                                </span>
                              )}
                            </div>
                            {residente.data_entrada && (
                              <div className="text-xs text-slate-400">
                                Entrada: {formatarData(residente.data_entrada)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold ${getBadgeStatus(residente.status)}`}>
                            <i className={`bi ${residente.status === 'ativo' ? 'bi-check-circle-fill' : residente.status === 'suspenso' ? 'bi-exclamation-circle-fill' : 'bi-x-circle-fill'}`}></i>
                            {residente.status.charAt(0).toUpperCase() + residente.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all hover:scale-110"
                              title="Visualizar"
                              onClick={() => handleVisualizar(residente)}
                            >
                              <i className="bi bi-eye text-lg"></i>
                            </button>
                            <button 
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110"
                              title="Histórico"
                              onClick={() => handleVerHistorico(residente)}
                            >
                              <i className="bi bi-clock-history text-lg"></i>
                            </button>
                            <button 
                              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all hover:scale-110"
                              title="Editar"
                              onClick={() => handleEditar(residente)}
                            >
                              <i className="bi bi-pencil text-lg"></i>
                            </button>
                            <button 
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110"
                              title="Inativar"
                              onClick={() => handleDeletar(residente.id, residente.nome_completo)}
                            >
                              <i className="bi bi-trash text-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="lg:hidden space-y-3 p-4">
                {paginacao.dados.map((residente) => (
                  <div key={residente.id} className="bg-slate-900/40 rounded-xl border border-slate-700/50 p-4 hover:border-amber-500/30 transition-all">
                    {/* Header do Card */}
                    <div className="flex items-start gap-3 mb-3 pb-3 border-b border-slate-700/50">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/20 flex-shrink-0">
                        {residente.nome_completo.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{residente.nome_completo}</h3>
                        <p className="text-xs text-slate-400">ID: #{residente.id}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 border rounded-md text-xs font-semibold ${getBadgeStatus(residente.status)}`}>
                          <i className={`bi ${residente.status === 'ativo' ? 'bi-check-circle-fill' : residente.status === 'suspenso' ? 'bi-exclamation-circle-fill' : 'bi-x-circle-fill'} text-xs`}></i>
                          {residente.status.charAt(0).toUpperCase() + residente.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <i className="bi bi-credit-card text-amber-400 w-4"></i>
                        <span className="text-slate-300 font-mono text-xs">{formatarCPF(residente.cpf)}</span>
                      </div>
                      {residente.telefone && (
                        <div className="flex items-center gap-2 text-sm">
                          <i className="bi bi-telephone text-amber-400 w-4"></i>
                          <span className="text-slate-300 text-xs">{residente.telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <i className="bi bi-calendar text-amber-400 w-4"></i>
                        <span className="text-slate-300 text-xs">{calcularIdade(residente.data_nascimento)}</span>
                      </div>
                      {residente.numero_quarto && (
                        <div className="flex items-center gap-2 text-sm">
                          <i className="bi bi-door-closed text-amber-400 w-4"></i>
                          <span className="text-slate-300 text-xs">Quarto {residente.numero_quarto}</span>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                      <button 
                        className="flex-1 px-3 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all text-sm font-medium"
                        onClick={() => handleVisualizar(residente)}
                      >
                        <i className="bi bi-eye"></i> Ver
                      </button>
                      <button 
                        className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all text-sm font-medium"
                        onClick={() => handleVerHistorico(residente)}
                      >
                        <i className="bi bi-clock-history"></i> Histórico
                      </button>
                      <button 
                        className="px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                        onClick={() => handleEditar(residente)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        onClick={() => handleDeletar(residente.id, residente.nome_completo)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-700/50 bg-slate-900/40">
                <div className="text-sm text-slate-400 text-center sm:text-left">
                  <span className="font-medium text-white">{paginacao.dados.length}</span> de <span className="font-medium text-white">{paginacao.total}</span> residentes
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className={`px-3 py-2 rounded-lg transition-all ${paginacao.paginaAtual === 1 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700/50 text-white hover:bg-slate-700'}`}
                    onClick={() => mudarPagina(paginacao.paginaAtual - 1)}
                    disabled={paginacao.paginaAtual === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {[...Array(paginacao.paginas)].map((_, index) => {
                    const numeroPagina = index + 1
                    if (
                      numeroPagina === 1 ||
                      numeroPagina === paginacao.paginas ||
                      (numeroPagina >= paginacao.paginaAtual - 1 && numeroPagina <= paginacao.paginaAtual + 1)
                    ) {
                      return (
                        <button 
                          key={numeroPagina}
                          className={`px-3 py-2 rounded-lg transition-all font-medium ${paginacao.paginaAtual === numeroPagina ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-700/50 text-white hover:bg-slate-700'}`}
                          onClick={() => mudarPagina(numeroPagina)}
                        >
                          {numeroPagina}
                        </button>
                      )
                    } else if (
                      numeroPagina === paginacao.paginaAtual - 2 ||
                      numeroPagina === paginacao.paginaAtual + 2
                    ) {
                      return <span key={numeroPagina} className="px-2 text-slate-500">...</span>
                    }
                    return null
                  })}
                  <button 
                    className={`px-3 py-2 rounded-lg transition-all ${paginacao.paginaAtual === paginacao.paginas ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700/50 text-white hover:bg-slate-700'}`}
                    onClick={() => mudarPagina(paginacao.paginaAtual + 1)}
                    disabled={paginacao.paginaAtual === paginacao.paginas}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Visualizar */}
      {showVisualizarModal && residenteSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFecharModals}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-person-circle"></i>
                Detalhes do Residente
              </h3>
              <button onClick={handleFecharModals} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-400">Nome Completo</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.nome_completo}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">CPF</label>
                  <p className="text-white font-medium mt-1">{formatarCPF(residenteSelecionado.cpf)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">RG</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.rg || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Data de Nascimento</label>
                  <p className="text-white font-medium mt-1">{formatarData(residenteSelecionado.data_nascimento)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Idade</label>
                  <p className="text-white font-medium mt-1">{calcularIdade(residenteSelecionado.data_nascimento)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Sexo</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.sexo || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Estado Civil</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.estado_civil || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getBadgeStatus(residenteSelecionado.status)}`}>
                      {residenteSelecionado.status}
                    </span>
                  </p>
                </div>
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-telephone-fill text-blue-400"></i>
                    Contato
                  </h4>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Telefone</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.telefone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.email || '-'}</p>
                </div>
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-geo-alt-fill text-blue-400"></i>
                    Endereço
                  </h4>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Logradouro</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.logradouro || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Número</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.numero || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Bairro</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.bairro || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Cidade</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.cidade || '-'}</p>
                </div>
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-person-badge-fill text-blue-400"></i>
                    Responsável
                  </h4>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Nome</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.nome_responsavel || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Parentesco</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.parentesco_responsavel || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Telefone</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.telefone_responsavel || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white font-medium mt-1">{residenteSelecionado.email_responsavel || '-'}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={handleFecharModals} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditarModal && residenteSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFecharModals}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-pencil-square"></i>
                Editar Residente
              </h3>
              <button onClick={handleFecharModals} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados Pessoais */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="bi bi-person-fill text-amber-400"></i>
                    Dados Pessoais
                  </h4>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.nome_completo || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, nome_completo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CPF *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.cpf || ''}
                    onChange={(e) => handleCampoChange('cpf', e.target.value)}
                    maxLength="14"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">RG</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.rg || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, rg: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data de Nascimento *</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.data_nascimento?.split('T')[0] || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, data_nascimento: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sexo</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.sexo || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, sexo: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Estado Civil</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.estado_civil || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, estado_civil: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.status || 'ativo'}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, status: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
                </div>

                {/* Contato */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-telephone-fill text-amber-400"></i>
                    Contato
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.telefone || ''}
                    onChange={(e) => handleCampoChange('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.email || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-geo-alt-fill text-amber-400"></i>
                    Endereço
                  </h4>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logradouro</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.logradouro || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, logradouro: e.target.value})}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Número</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.numero || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, numero: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Complemento</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.complemento || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, complemento: e.target.value})}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bairro</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.bairro || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, bairro: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.cidade || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, cidade: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.estado || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, estado: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CEP</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.cep || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, cep: e.target.value})}
                    placeholder="00000-000"
                  />
                </div>

                {/* Informações de Acomodação */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-house-fill text-amber-400"></i>
                    Informações de Acomodação
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Número do Quarto</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.numero_quarto || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, numero_quarto: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data de Entrada</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.data_entrada?.split('T')[0] || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, data_entrada: e.target.value})}
                  />
                </div>

                {/* Responsável */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-person-badge-fill text-amber-400"></i>
                    Responsável Legal
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Responsável *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.nome_responsavel || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, nome_responsavel: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Parentesco</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.parentesco_responsavel || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, parentesco_responsavel: e.target.value})}
                    placeholder="Ex: Filho(a), Cônjuge, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone do Responsável *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="(00) 00000-0000"
                    value={residenteSelecionado.telefone_responsavel || ''}
                    onChange={(e) => handleCampoChange('telefone_responsavel', e.target.value)}
                    maxLength="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email do Responsável</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.email_responsavel || ''}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, email_responsavel: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={handleFecharModals} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleSalvarEdicao} className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg shadow-lg shadow-amber-500/30 transition-all">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico de Consultas */}
      {showHistoricoModal && residenteSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFecharModals}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <i className="bi bi-journal-medical"></i>
                  Histórico de Consultas Médicas
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  <i className="bi bi-person-fill-check mr-2"></i>
                  {residenteSelecionado.nome_completo}
                </p>
              </div>
              <button onClick={handleFecharModals} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistorico ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-slate-400">Carregando histórico...</p>
                </div>
              ) : historicoConsultas.length === 0 ? (
                <div className="text-center py-20">
                  <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
                  <h4 className="text-xl font-semibold text-white mb-2">Nenhuma consulta encontrada</h4>
                  <p className="text-slate-400">Este residente ainda não possui histórico de consultas médicas.</p>
                </div>
              ) : (
                <>
                  {/* Estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <i className="bi bi-calendar-check-fill text-2xl text-blue-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Total</p>
                          <h3 className="text-2xl font-bold text-white">{historicoConsultas.length}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <i className="bi bi-check-circle-fill text-2xl text-emerald-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Realizadas</p>
                          <h3 className="text-2xl font-bold text-white">
                            {historicoConsultas.filter(c => c.status === 'realizada').length}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <i className="bi bi-clock-fill text-2xl text-amber-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Pendentes</p>
                          <h3 className="text-2xl font-bold text-white">
                            {historicoConsultas.filter(c => c.status === 'pendente').length}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <i className="bi bi-x-circle-fill text-2xl text-red-400"></i>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Canceladas</p>
                          <h3 className="text-2xl font-bold text-white">
                            {historicoConsultas.filter(c => c.status === 'cancelado').length}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Consultas */}
                  <div className="space-y-4">
                    {historicoConsultas.map((consulta, index) => (
                      <div key={consulta.id || index} className="bg-slate-700/30 rounded-xl border border-slate-600/50 overflow-hidden hover:border-slate-500/50 transition-all">
                        {/* Header da Consulta */}
                        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-slate-600/50 px-5 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <i className="bi bi-calendar-event text-2xl text-blue-400"></i>
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">
                                  Consulta #{historicoConsultas.length - index}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                  <span className="flex items-center gap-1">
                                    <i className="bi bi-calendar3"></i>
                                    {formatarData(consulta.data_consulta)}
                                  </span>
                                  {consulta.hora_consulta && (
                                    <span className="flex items-center gap-1">
                                      <i className="bi bi-clock"></i>
                                      {consulta.hora_consulta}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              consulta.status === 'realizada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              consulta.status === 'confirmado' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                              consulta.status === 'cancelado' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              consulta.status === 'pendente' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}>
                              <i className={`bi ${
                                consulta.status === 'realizada' ? 'bi-check-circle-fill' :
                                consulta.status === 'confirmado' ? 'bi-check2-circle' :
                                consulta.status === 'cancelado' ? 'bi-x-circle-fill' :
                                consulta.status === 'pendente' ? 'bi-clock-fill' :
                                'bi-circle'
                              } mr-1`}></i>
                              {consulta.status?.toUpperCase() || 'INDEFINIDO'}
                            </span>
                          </div>
                        </div>

                        {/* Corpo da Consulta */}
                        <div className="p-5 space-y-4">
                          {/* Profissional */}
                          {consulta.profissional_nome && (
                            <div className="flex items-start gap-3 pb-4 border-b border-slate-600/50">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-person-badge text-xl text-purple-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-purple-400 mb-1">Profissional</h5>
                                <p className="text-white font-medium">{consulta.profissional_nome}</p>
                                {consulta.especialidade && (
                                  <p className="text-xs text-slate-400 mt-1">{consulta.especialidade}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tipo de Consulta */}
                          {consulta.tipo_consulta && (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-clipboard-pulse text-xl text-cyan-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-cyan-400 mb-1">Tipo de Atendimento</h5>
                                <p className="text-slate-300">{consulta.tipo_consulta}</p>
                              </div>
                            </div>
                          )}

                          {/* Queixa Principal */}
                          {consulta.queixa_principal && (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-chat-left-text text-xl text-emerald-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-emerald-400 mb-1">Queixa Principal</h5>
                                <p className="text-slate-300">{consulta.queixa_principal}</p>
                              </div>
                            </div>
                          )}

                          {/* Diagnóstico e CID */}
                          {(consulta.diagnostico || consulta.cid) && (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-clipboard2-pulse text-xl text-yellow-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-yellow-400 mb-1">Diagnóstico</h5>
                                <p className="text-slate-300">{consulta.diagnostico || 'Não informado'}</p>
                                {consulta.cid && (
                                  <div className="mt-2">
                                    <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
                                      CID-10: {consulta.cid}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Sinais Vitais */}
                          {consulta.sinais_vitais && (() => {
                            const sinais = parseSinaisVitais(consulta.sinais_vitais)
                            const temSinais = sinais && Object.values(sinais).some(v => v)
                            
                            return temSinais && (
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                  <i className="bi bi-heart-pulse text-xl text-red-400"></i>
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-semibold text-red-400 mb-2">Sinais Vitais</h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {sinais.pressao_arterial && (
                                      <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                                        <span className="text-xs text-slate-400 block">PA</span>
                                        <span className="text-white font-medium">{sinais.pressao_arterial}</span>
                                      </div>
                                    )}
                                    {sinais.frequencia_cardiaca && (
                                      <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                                        <span className="text-xs text-slate-400 block">FC</span>
                                        <span className="text-white font-medium">{sinais.frequencia_cardiaca}</span>
                                      </div>
                                    )}
                                    {sinais.temperatura && (
                                      <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                                        <span className="text-xs text-slate-400 block">Temperatura</span>
                                        <span className="text-white font-medium">{sinais.temperatura}°C</span>
                                      </div>
                                    )}
                                    {sinais.saturacao_oxigenio && (
                                      <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
                                        <span className="text-xs text-slate-400 block">SpO2</span>
                                        <span className="text-white font-medium">{sinais.saturacao_oxigenio}%</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })()}

                          {/* Tratamento */}
                          {consulta.tratamento && (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-prescription2 text-xl text-purple-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-purple-400 mb-1">Tratamento</h5>
                                <p className="text-slate-300 whitespace-pre-wrap">{consulta.tratamento}</p>
                              </div>
                            </div>
                          )}

                          {/* Medicamentos */}
                          {consulta.medicamentos && (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-capsule text-xl text-pink-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-pink-400 mb-1">Medicamentos</h5>
                                <p className="text-slate-300 whitespace-pre-wrap">{consulta.medicamentos}</p>
                              </div>
                            </div>
                          )}

                          {/* Observações */}
                          {consulta.observacoes && (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center flex-shrink-0">
                                <i className="bi bi-file-text text-xl text-slate-400"></i>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-semibold text-slate-400 mb-1">Observações</h5>
                                <p className="text-slate-300 whitespace-pre-wrap">{consulta.observacoes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-slate-800 px-6 py-4 border-t border-slate-700">
              <button
                onClick={handleFecharModals}
                className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListagemResidentes
