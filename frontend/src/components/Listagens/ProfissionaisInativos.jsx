import { useState, useEffect } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { listarProfissionais, atualizarProfissional, deletarProfissionalPermanente } from '../../api/api'

function ProfissionaisInativos() {
  const { success, error: showError } = useNotification()
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [filtros, setFiltros] = useState({
    status: 'inativo',
    busca: '',
    pagina: 1,
    limite: 10
  })

  const [paginacao, setPaginacao] = useState({
    total: 0,
    paginas: 0,
    paginaAtual: 1
  })

  const carregarProfissionais = async () => {
    setLoading(true)
    
    try {
      const response = await listarProfissionais({
        status: 'inativo',
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      if (response && response.success) {
        setProfissionais(response.data?.profissionais || [])
        setPaginacao({
          total: response.data?.pagination?.totalItens || 0,
          paginas: response.data?.pagination?.totalPaginas || 0,
          paginaAtual: response.data?.pagination?.paginaAtual || 1
        })
      } else {
        throw new Error(response?.message || 'Erro ao carregar profissionais')
      }
    } catch (err) {
      showError(err.message || 'Erro ao carregar profissionais')
      setProfissionais([])
      setPaginacao({ total: 0, paginas: 0, paginaAtual: 1 })
    } finally {
      setLoading(false)
    }
  }

  const handleReativar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o profissional "${nome}"?`)) {
      return
    }
    
    try {
      const response = await atualizarProfissional(id, { status: 'ativo' })
      
      if (response.success) {
        success('Profissional reativado com sucesso!')
        carregarProfissionais()
      } else {
        throw new Error(response.message || 'Erro ao reativar profissional')
      }
    } catch (err) {
      showError(err.message || 'Erro ao reativar profissional')
    }
  }

  const handleDeletarPermanente = async (id, nome) => {
    if (!window.confirm(`⚠️ ATENÇÃO! Tem certeza que deseja DELETAR PERMANENTEMENTE o profissional "${nome}"?\n\nEsta ação NÃO PODE SER DESFEITA e irá remover:\n- Todos os agendamentos\n- Todo o histórico de consultas\n- Todos os dados do profissional\n\nDeseja continuar?`)) {
      return
    }
    
    const confirmacao = window.prompt('Para confirmar, digite: DELETAR')
    
    if (confirmacao !== 'DELETAR') {
      showError('Operação cancelada. Confirmação incorreta.')
      return
    }
    
    try {
      const response = await deletarProfissionalPermanente(id)
      
      if (response.success) {
        success('Profissional deletado permanentemente do sistema!')
        carregarProfissionais()
      } else {
        throw new Error(response.message || 'Erro ao deletar profissional')
      }
    } catch (err) {
      showError(err.message || 'Erro ao deletar profissional permanentemente')
    }
  }

  const mudarPagina = (novaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: novaPagina }))
  }

  const formatarCPF = (cpf) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  useEffect(() => {
    carregarProfissionais()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pagina, filtros.limite])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/30">
              <i className="bi bi-person-slash text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profissionais Inativos</h1>
              <p className="text-slate-400">Lista de profissionais que foram inativados no sistema</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                <i className="bi bi-person-slash text-2xl text-slate-400"></i>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total de Inativos</p>
                <h3 className="text-2xl font-bold text-white">{paginacao.total}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="bi bi-funnel text-slate-400"></i>
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-10">
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar por nome ou CPF</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="Digite o nome ou CPF..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, pagina: 1 })}
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg shadow-lg shadow-slate-500/30 transition-all flex items-center justify-center gap-2"
                onClick={carregarProfissionais}
              >
                <i className="bi bi-search"></i>
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-12 w-12 text-slate-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando profissionais inativos...</p>
            </div>
          ) : profissionais.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="bi bi-inbox text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400">Nenhum profissional inativo encontrado</p>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Especialidade</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Registro</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Telefone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {profissionais.map((profissional) => (
                      <tr key={profissional.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          #{profissional.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-semibold shadow-lg">
                              {profissional.nome_completo.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{profissional.nome_completo}</div>
                              {profissional.email && (
                                <div className="text-xs text-slate-400">{profissional.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatarCPF(profissional.cpf)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 border rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                            {profissional.especialidade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {profissional.registro_profissional}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {profissional.telefone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 border rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border-slate-500/20">
                            Inativo
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="px-4 py-2 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-all flex items-center gap-2"
                              onClick={() => handleReativar(profissional.id, profissional.nome_completo)}
                              title="Reativar"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                              Reativar
                            </button>
                            <button
                              className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all flex items-center gap-2"
                              onClick={() => handleDeletarPermanente(profissional.id, profissional.nome_completo)}
                              title="Deletar Permanentemente"
                            >
                              <i className="bi bi-trash3"></i>
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {paginacao.paginas > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400">
                    Mostrando {profissionais.length} de {paginacao.total} profissionais inativos
                  </div>

                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 rounded-lg transition-colors ${paginacao.paginaAtual === 1 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
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
                            className={`px-4 py-1 rounded-lg transition-colors ${paginacao.paginaAtual === numeroPagina ? 'bg-slate-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            onClick={() => mudarPagina(numeroPagina)}
                          >
                            {numeroPagina}
                          </button>
                        )
                      } else if (
                        numeroPagina === paginacao.paginaAtual - 2 ||
                        numeroPagina === paginacao.paginaAtual + 2
                      ) {
                        return (
                          <span key={numeroPagina} className="px-2 py-1 text-slate-500">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                    
                    <button
                      className={`px-3 py-1 rounded-lg transition-colors ${paginacao.paginaAtual === paginacao.paginas ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                      onClick={() => mudarPagina(paginacao.paginaAtual + 1)}
                      disabled={paginacao.paginaAtual === paginacao.paginas}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfissionaisInativos
