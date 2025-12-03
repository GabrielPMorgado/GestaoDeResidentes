import { useState, useEffect } from 'react'
import { listarResidentes, deletarResidente, obterEstatisticas, atualizarResidente } from '../../api/api'
import { useNotification } from '../../contexts/NotificationContext'

function ListagemResidentes({ onVerHistorico }) {
  const { success, error: showError } = useNotification()
  const [residentes, setResidentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [estatisticas, setEstatisticas] = useState(null)
  
  const [showVisualizarModal, setShowVisualizarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [residenteSelecionado, setResidenteSelecionado] = useState(null)
  
  const [filtros, setFiltros] = useState({
    status: '',
    busca: '',
    pagina: 1,
    limite: 10
  })

  const [paginacao, setPaginacao] = useState({
    total: 0,
    paginas: 0,
    paginaAtual: 1
  })

  useEffect(() => {
    carregarResidentes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarResidentes = async () => {
    setLoading(true)
    
    try {
      const response = await listarResidentes({
        status: filtros.status,
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      if (response && response.success) {
        const residentesOrdenados = (response.data?.residentes || []).sort((a, b) => {
          const nomeA = (a.nome_completo || '').toLowerCase()
          const nomeB = (b.nome_completo || '').toLowerCase()
          return nomeA.localeCompare(nomeB, 'pt-BR')
        })
        setResidentes(residentesOrdenados)
        setPaginacao({
          total: response.data?.pagination?.totalItens || 0,
          paginas: response.data?.pagination?.totalPaginas || 0,
          paginaAtual: response.data?.pagination?.paginaAtual || 1
        })
      } else {
        throw new Error(response?.message || 'Erro ao carregar residentes')
      }
    } catch (err) {
      showError(err.message || 'Erro ao carregar residentes')
      setResidentes([])
      setPaginacao({ total: 0, paginas: 0, paginaAtual: 1 })
    } finally {
      setLoading(false)
    }
  }

  const carregarEstatisticas = async () => {
    try {
      const response = await obterEstatisticas()
      if (response.success && response.data) {
        setEstatisticas(response.data)
      }
    } catch {
      // Silenciar erro
    }
  }

  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja inativar o residente "${nome}"?`)) return
    
    try {
      const response = await deletarResidente(id)
      
      if (response.success) {
        success('Residente inativado com sucesso!')
        carregarResidentes()
        carregarEstatisticas()
      } else {
        throw new Error(response.message || 'Erro ao inativar')
      }
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
      const response = await atualizarResidente(residenteSelecionado.id, residenteSelecionado)
      
      if (response.success) {
        success('Residente atualizado com sucesso!')
        setShowEditarModal(false)
        carregarResidentes()
      } else {
        throw new Error(response.message || 'Erro ao atualizar')
      }
    } catch (err) {
      showError(err.message || 'Erro ao atualizar residente')
    }
  }

  const handleVerHistorico = (residente) => {
    if (onVerHistorico) {
      onVerHistorico(residente)
    }
  }

  const handleFecharModals = () => {
    setShowVisualizarModal(false)
    setShowEditarModal(false)
    setResidenteSelecionado(null)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="bi bi-people-fill text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Listagem de Residentes</h1>
              <p className="text-slate-400">Gerenciamento completo dos residentes cadastrados</p>
            </div>
          </div>

          {/* Estatísticas */}
          {estatisticas && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <i className="bi bi-people-fill text-2xl text-blue-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.total || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="bi bi-check-circle-fill text-2xl text-emerald-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Ativos</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.ativos || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                    <i className="bi bi-x-circle-fill text-2xl text-slate-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Inativos</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.inativos || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <i className="bi bi-exclamation-triangle-fill text-2xl text-amber-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Suspensos</p>
                    <h3 className="text-2xl font-bold text-white">{estatisticas?.suspensos || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-funnel text-blue-400"></i>
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select 
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome, CPF ou quarto..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Por página</label>
              <select 
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
              <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando residentes...</p>
            </div>
          ) : residentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">Nenhum residente encontrado</p>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Idade</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Quarto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Entrada</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {residentes.map((residente) => (
                      <tr key={residente.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">#{residente.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {residente.nome_completo.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{residente.nome_completo}</div>
                              {residente.email && (
                                <div className="text-sm text-slate-400">{residente.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatarCPF(residente.cpf)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{calcularIdade(residente.data_nascimento)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {residente.numero_quarto ? (
                            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-medium">
                              Quarto {residente.numero_quarto}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatarData(residente.data_entrada)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getBadgeStatus(residente.status)}`}>
                            {residente.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Visualizar"
                              onClick={() => handleVisualizar(residente)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              title="Histórico"
                              onClick={() => handleVerHistorico(residente)}
                            >
                              <i className="bi bi-clock-history"></i>
                            </button>
                            <button 
                              className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Editar"
                              onClick={() => handleEditar(residente)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Inativar"
                              onClick={() => handleDeletar(residente.id, residente.nome_completo)}
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
                  Mostrando {residentes.length} de {paginacao.total} residentes
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
                          className={`px-4 py-2 rounded-lg transition-colors ${paginacao.paginaAtual === numeroPagina ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.nome_completo}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, nome_completo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CPF *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.cpf}
                    onChange={(e) => handleCampoChange('cpf', e.target.value)}
                    maxLength="14"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={residenteSelecionado.status}
                    onChange={(e) => setResidenteSelecionado({...residenteSelecionado, status: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
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
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mt-4">
                    <i className="bi bi-person-badge-fill text-amber-400"></i>
                    Responsável
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
    </div>
  )
}

export default ListagemResidentes
