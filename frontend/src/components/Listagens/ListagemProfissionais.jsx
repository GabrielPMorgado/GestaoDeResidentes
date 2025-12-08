import { useState, useMemo } from 'react'
import { atualizarProfissional, listarHistoricoConsultasProfissional, buscarAgendamentosPorProfissional } from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { useProfissionaisAtivos, useInativarProfissional } from '../../hooks'

function ListagemProfissionais() {
  const { success, error: showError } = useNotification()
  
  // React Query - Cache automático
  const { data: profissionaisData = [], isLoading: loading } = useProfissionaisAtivos()
  const inativarMutation = useInativarProfissional()
  
  const [showVisualizarModal, setShowVisualizarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null)
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [agendamentos, setAgendamentos] = useState([])
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false)
  
  const [filtros, setFiltros] = useState({
    status: '',
    profissao: '',
    departamento: '',
    busca: '',
    pagina: 1,
    limite: 10
  })

  // Processar dados com memoização
  const profissionais = useMemo(() => {
    let dados = Array.isArray(profissionaisData) ? profissionaisData : []
    
    // Aplicar filtros
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      dados = dados.filter(p => 
        p.nome_completo?.toLowerCase().includes(busca) ||
        p.cpf?.includes(busca) ||
        p.profissao?.toLowerCase().includes(busca)
      )
    }
    
    if (filtros.profissao) {
      dados = dados.filter(p => p.profissao === filtros.profissao)
    }
    
    if (filtros.departamento) {
      dados = dados.filter(p => p.departamento === filtros.departamento)
    }
    
    // Ordenar alfabeticamente
    return dados.sort((a, b) => {
      const nomeA = (a.nome_completo || '').toLowerCase()
      const nomeB = (b.nome_completo || '').toLowerCase()
      return nomeA.localeCompare(nomeB, 'pt-BR')
    })
  }, [profissionaisData, filtros.busca, filtros.profissao, filtros.departamento])

  const paginacao = useMemo(() => {
    const total = profissionais.length
    const paginas = Math.ceil(total / filtros.limite)
    const inicio = (filtros.pagina - 1) * filtros.limite
    const fim = inicio + filtros.limite
    const dados = profissionais.slice(inicio, fim)
    
    return {
      total,
      paginas,
      paginaAtual: filtros.pagina,
      dados
    }
  }, [profissionais, filtros.pagina, filtros.limite])

  const estatisticas = useMemo(() => {
    const total = profissionaisData.length
    const porProfissao = {}
    
    profissionaisData.forEach(p => {
      const prof = p.profissao || 'Não especificado'
      porProfissao[prof] = (porProfissao[prof] || 0) + 1
    })
    
    return {
      total,
      ativos: total,
      porProfissao
    }
  }, [profissionaisData])

  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja inativar o profissional "${nome}"?`)) return
    
    try {
      await inativarMutation.mutateAsync(id)
      success('Profissional inativado com sucesso!')
    } catch (err) {
      showError(err.message || 'Erro ao inativar profissional')
    }
  }

  const handleVisualizar = async (profissional) => {
    setProfissionalSelecionado(profissional)
    setShowVisualizarModal(true)
    setLoadingAgendamentos(true)
    setAgendamentos([])
    
    try {
      console.log('🔍 Buscando agendamentos para profissional ID:', profissional.id)
      const response = await buscarAgendamentosPorProfissional(profissional.id)
      console.log('📋 Resposta da API:', response)
      
      if (response.success) {
        const dados = response.data || []
        console.log('✅ Agendamentos encontrados:', dados.length, dados)
        setAgendamentos(dados)
      } else {
        console.log('⚠️ API retornou sem sucesso:', response)
        setAgendamentos([])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos:', error)
      setAgendamentos([])
    } finally {
      setLoadingAgendamentos(false)
    }
  }

  const handleEditar = (profissional) => {
    setProfissionalSelecionado(profissional)
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
    
    if (campo === 'telefone') {
      valorFormatado = valor.replace(/\D/g, '')
      if (valorFormatado.length <= 11) {
        valorFormatado = valorFormatado.replace(/^(\d{2})(\d)/g, '($1) $2')
        valorFormatado = valorFormatado.replace(/(\d)(\d{4})$/, '$1-$2')
      }
    }
    
    setProfissionalSelecionado({...profissionalSelecionado, [campo]: valorFormatado})
  }

  const handleSalvarEdicao = async () => {
    try {
      const response = await atualizarProfissional(profissionalSelecionado.id, profissionalSelecionado)
      
      if (response.success) {
        success('Profissional atualizado com sucesso!')
        setShowEditarModal(false)
        carregarProfissionais()
      } else {
        throw new Error(response.message || 'Erro ao atualizar')
      }
    } catch (err) {
      showError(err.message || 'Erro ao atualizar profissional')
    }
  }

  const handleVerHistorico = async (profissional) => {
    setProfissionalSelecionado(profissional)
    setShowHistoricoModal(true)
    setLoadingHistorico(true)
    
    try {
      const response = await listarHistoricoConsultasProfissional(profissional.id)
      
      if (response.success) {
        setHistoricoConsultas(response.data?.consultas || [])
      } else {
        throw new Error(response.message || 'Erro ao carregar histórico')
      }
    } catch {
      setHistoricoConsultas([])
    } finally {
      setLoadingHistorico(false)
    }
  }

  const handleFecharModals = () => {
    setShowVisualizarModal(false)
    setShowEditarModal(false)
    setShowHistoricoModal(false)
    setProfissionalSelecionado(null)
    setHistoricoConsultas([])
    setAgendamentos([])
  }

  const aplicarFiltros = () => {
    setFiltros(prev => ({ ...prev, pagina: 1 }))
  }

  const limparFiltros = () => {
    setFiltros({
      status: '',
      profissao: '',
      departamento: '',
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

  const getBadgeStatus = (status) => {
    const badges = {
      ativo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      inativo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      licenca: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      ferias: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
    return badges[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  const getBadgeProfissao = (profissao) => {
    const badges = {
      medico: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      enfermeiro: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      fisioterapeuta: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      psicologo: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      nutricionista: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      cuidador: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
    return badges[profissao] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="bi bi-person-badge-fill text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Listagem de Profissionais</h1>
              <p className="text-slate-400">Gerenciamento completo dos profissionais cadastrados</p>
            </div>
          </div>

          {/* Estatísticas */}
          {estatisticas && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="bi bi-people-fill text-2xl text-emerald-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.total || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <i className="bi bi-check-circle-fill text-2xl text-blue-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Ativos</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.ativos || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <i className="bi bi-calendar-check text-2xl text-cyan-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Licença</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.licenca || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <i className="bi bi-umbrella text-2xl text-amber-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Férias</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.ferias || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-funnel text-emerald-400"></i>
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select 
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="licenca">Licença</option>
                <option value="ferias">Férias</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Profissão</label>
              <select 
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.profissao}
                onChange={(e) => setFiltros(prev => ({ ...prev, profissao: e.target.value }))}
              >
                <option value="">Todas</option>
                <option value="medico">Médico</option>
                <option value="enfermeiro">Enfermeiro</option>
                <option value="fisioterapeuta">Fisioterapeuta</option>
                <option value="psicologo">Psicólogo</option>
                <option value="nutricionista">Nutricionista</option>
                <option value="cuidador">Cuidador</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Departamento</label>
              <select 
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.departamento}
                onChange={(e) => setFiltros(prev => ({ ...prev, departamento: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="clinica">Clínica</option>
                <option value="enfermaria">Enfermaria</option>
                <option value="administracao">Administração</option>
                <option value="nutricao">Nutrição</option>
                <option value="fisioterapia">Fisioterapia</option>
                <option value="psicologia">Psicologia</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nome, CPF ou cargo..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Por pág</label>
              <select 
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filtros.limite}
                onChange={(e) => setFiltros(prev => ({ ...prev, limite: parseInt(e.target.value), pagina: 1 }))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end gap-2">
              <button 
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                onClick={aplicarFiltros}
              >
                <i className="bi bi-search"></i>
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
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
              <svg className="animate-spin h-12 w-12 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando profissionais...</p>
            </div>
          ) : profissionais.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">Nenhum profissional encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Profissão</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Departamento</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {profissionais.map((profissional) => (
                      <tr key={profissional.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">#{profissional.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                              {profissional.nome_completo.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{profissional.nome_completo}</div>
                              {profissional.email && (
                                <div className="text-sm text-slate-400">{profissional.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatarCPF(profissional.cpf)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getBadgeProfissao(profissional.profissao)}`}>
                            {profissional.profissao}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{profissional.cargo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{profissional.departamento || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getBadgeStatus(profissional.status)}`}>
                            {profissional.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Visualizar"
                              onClick={() => handleVisualizar(profissional)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              title="Histórico"
                              onClick={() => handleVerHistorico(profissional)}
                            >
                              <i className="bi bi-clock-history"></i>
                            </button>
                            <button 
                              className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Editar"
                              onClick={() => handleEditar(profissional)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Inativar"
                              onClick={() => handleDeletar(profissional.id, profissional.nome_completo)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  Mostrando {profissionais.length} de {paginacao.total} profissionais
                </div>
                <div className="flex gap-2">
                  <button 
                    className={`px-4 py-2 rounded-lg transition-colors ${paginacao.paginaAtual === 1 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
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
                          className={`px-4 py-2 rounded-lg transition-colors ${paginacao.paginaAtual === numeroPagina ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
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
                    className={`px-4 py-2 rounded-lg transition-colors ${paginacao.paginaAtual === paginacao.paginas ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
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
      {showVisualizarModal && profissionalSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFecharModals}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-person-badge"></i>
                Detalhes do Profissional
              </h3>
              <button onClick={handleFecharModals} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-400">Nome Completo</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.nome_completo}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">CPF</label>
                  <p className="text-white font-medium mt-1">{formatarCPF(profissionalSelecionado.cpf)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Profissão</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getBadgeProfissao(profissionalSelecionado.profissao)}`}>
                      {profissionalSelecionado.profissao}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getBadgeStatus(profissionalSelecionado.status)}`}>
                      {profissionalSelecionado.status}
                    </span>
                  </p>
                </div>
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-briefcase-fill text-emerald-400"></i>
                    Informações Profissionais
                  </h4>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Registro</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.registro_profissional || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Especialidade</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.especialidade || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Cargo</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.cargo || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Departamento</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.departamento || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Admissão</label>
                  <p className="text-white font-medium mt-1">{formatarData(profissionalSelecionado.data_admissao)}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Salário</label>
                  <p className="text-white font-medium mt-1">
                    {profissionalSelecionado.salario 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profissionalSelecionado.salario)
                      : '-'
                    }
                  </p>
                </div>
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-telephone-fill text-emerald-400"></i>
                    Contato
                  </h4>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Telefone</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.telefone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white font-medium mt-1">{profissionalSelecionado.email || '-'}</p>
                </div>
                
                {/* Seção de Agendamentos */}
                <div className="col-span-full">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-6 pt-4 border-t border-slate-700">
                    <i className="bi bi-calendar-check-fill text-emerald-400"></i>
                    Agendamentos
                  </h4>
                </div>
                
                <div className="col-span-full">
                  {loadingAgendamentos ? (
                    <div className="flex justify-center py-8">
                      <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : agendamentos.length === 0 ? (
                    <div className="text-center py-8 bg-slate-900/50 rounded-xl border border-slate-700">
                      <i className="bi bi-calendar-x text-4xl text-slate-600 mb-2"></i>
                      <p className="text-slate-400">Nenhum agendamento encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {agendamentos.map((agendamento) => (
                        <div key={agendamento.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                  agendamento.status === 'agendado' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  agendamento.status === 'confirmado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  agendamento.status === 'em_atendimento' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                  agendamento.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  agendamento.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }`}>
                                  {agendamento.status === 'agendado' ? 'Agendado' :
                                   agendamento.status === 'confirmado' ? 'Confirmado' :
                                   agendamento.status === 'em_atendimento' ? 'Em Atendimento' :
                                   agendamento.status === 'concluido' ? 'Concluído' :
                                   agendamento.status === 'cancelado' ? 'Cancelado' :
                                   agendamento.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {agendamento.tipo_atendimento || 'Consulta'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-white font-medium mb-1">
                                <i className="bi bi-person text-emerald-400"></i>
                                <span>{agendamento.residente?.nome_completo || agendamento.Residente?.nome_completo || 'Residente não identificado'}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-400">
                                <div className="flex items-center gap-1">
                                  <i className="bi bi-calendar3"></i>
                                  <span>{new Date(agendamento.data_agendamento || agendamento.data_consulta).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {agendamento.hora_inicio && (
                                  <div className="flex items-center gap-1">
                                    <i className="bi bi-clock"></i>
                                    <span>{agendamento.hora_inicio}</span>
                                    {agendamento.hora_fim && <span> - {agendamento.hora_fim}</span>}
                                  </div>
                                )}
                              </div>
                              {agendamento.observacoes && (
                                <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                                  {agendamento.observacoes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
      {showEditarModal && profissionalSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFecharModals}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-pencil-square"></i>
                Editar Profissional
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
                    value={profissionalSelecionado.nome_completo || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, nome_completo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CPF *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.cpf || ''}
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
                    value={profissionalSelecionado.rg || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, rg: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.data_nascimento?.split('T')[0] || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, data_nascimento: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sexo</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.sexo || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, sexo: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                {/* Dados Profissionais */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-briefcase-fill text-amber-400"></i>
                    Dados Profissionais
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Profissão *</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.profissao || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, profissao: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="medico">Médico</option>
                    <option value="enfermeiro">Enfermeiro</option>
                    <option value="fisioterapeuta">Fisioterapeuta</option>
                    <option value="psicologo">Psicólogo</option>
                    <option value="nutricionista">Nutricionista</option>
                    <option value="cuidador">Cuidador</option>
                    <option value="assistente_social">Assistente Social</option>
                    <option value="terapeuta_ocupacional">Terapeuta Ocupacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cargo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.cargo || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, cargo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Especialidade</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.especialidade || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, especialidade: e.target.value})}
                    placeholder="Ex: Cardiologia, Geriatria..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Registro Profissional</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.registro_profissional || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, registro_profissional: e.target.value})}
                    placeholder="CRM, COREN, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Departamento</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.departamento || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, departamento: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data de Admissão</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.data_admissao?.split('T')[0] || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, data_admissao: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.status || 'ativo'}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, status: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="licenca">Licença</option>
                    <option value="ferias">Férias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Salário</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.salario || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, salario: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                {/* Contato */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-telephone-fill text-amber-400"></i>
                    Contato
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.telefone || ''}
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
                    value={profissionalSelecionado.email || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, email: e.target.value})}
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
                    value={profissionalSelecionado.logradouro || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, logradouro: e.target.value})}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Número</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.numero || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, numero: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bairro</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.bairro || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, bairro: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.cidade || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, cidade: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CEP</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={profissionalSelecionado.cep || ''}
                    onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, cep: e.target.value})}
                    placeholder="00000-000"
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

      {/* Modal Histórico */}
      {showHistoricoModal && profissionalSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFecharModals}>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="bi bi-clock-history"></i>
                Histórico - {profissionalSelecionado.nome_completo}
              </h3>
              <button onClick={handleFecharModals} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-6">
              {loadingHistorico ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin h-12 w-12 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-slate-400">Carregando histórico...</p>
                </div>
              ) : historicoConsultas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">Nenhuma consulta registrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Residente</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">CPF</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Diagnóstico</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {historicoConsultas.map((consulta) => (
                        <tr key={consulta.id} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4 text-sm text-slate-300">{formatarData(consulta.data_consulta)}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{consulta.residente?.nome_completo || '-'}</div>
                            <div className="text-sm text-slate-400">{consulta.residente?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{formatarCPF(consulta.residente?.cpf)}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{consulta.tipo_consulta || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{consulta.diagnostico || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                              {consulta.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={handleFecharModals} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListagemProfissionais
