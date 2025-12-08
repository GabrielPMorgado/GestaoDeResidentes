import { useState, useMemo } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { listarResidentes, atualizarResidente, deletarResidentePermanente } from '../../api/axios'
import { useResidentesInativos, useReativarResidente } from '../../hooks'

function ResidentesInativos() {
  const { success, error: showError } = useNotification()
  const { data: residentesData = [], isLoading: loading } = useResidentesInativos()
  const reativarMutation = useReativarResidente()
  
  const [filtros, setFiltros] = useState({
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
    
    return dados
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

  const handleReativar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o residente "${nome}"?`)) {
      return
    }
    
    try {
      await reativarMutation.mutateAsync(id)
      success('Residente reativado com sucesso! A lista será atualizada automaticamente.')
    } catch (err) {
      showError(err.message || 'Erro ao reativar residente')
    }
  }

  const handleDeletarPermanente = async (id, nome) => {
    if (!window.confirm(`⚠️ ATENÇÃO! Tem certeza que deseja DELETAR PERMANENTEMENTE o residente "${nome}"?\n\nEsta ação NÃO PODE SER DESFEITA e irá remover:\n- Todos os agendamentos\n- Todo o histórico de consultas\n- Todos os dados do residente\n\nDeseja continuar?`)) {
      return
    }
    
    const confirmacao = window.prompt('Para confirmar, digite: DELETAR')
    
    if (confirmacao !== 'DELETAR') {
      showError('Operação cancelada. Confirmação incorreta.')
      return
    }
    
    try {
      const response = await deletarResidentePermanente(id)
      
      if (response.success) {
        success('Residente deletado permanentemente do sistema!')
        // React Query irá atualizar automaticamente
      } else {
        throw new Error(response.message || 'Erro ao deletar residente')
      }
    } catch (err) {
      showError(err.message || 'Erro ao deletar residente permanentemente')
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header com Badge */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Residentes Inativos</h1>
            <p className="text-slate-400 text-sm">Gerencie residentes que foram inativados no sistema</p>
          </div>
          <div className="px-4 py-2 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2">
              <i className="bi bi-people text-slate-400"></i>
              <span className="text-sm text-slate-300 font-semibold">{paginacao.total} {paginacao.total === 1 ? 'Inativo' : 'Inativos'}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="bi bi-search text-slate-400"></i>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-600/50 transition-all"
              placeholder="Buscar por nome, CPF ou RG..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, pagina: 1 })}
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="animate-spin h-12 w-12 text-slate-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Carregando residentes...</p>
            </div>
          ) : residentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mb-3">
                <i className="bi bi-inbox text-3xl text-slate-500"></i>
              </div>
              <p className="text-slate-300 font-medium mb-1">Nenhum residente inativo</p>
              <p className="text-slate-500 text-sm">Não há residentes inativos no momento</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Residente</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Idade</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Entrada</th>
                      <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {paginacao.dados.map((residente) => (
                      <tr key={residente.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-sm">
                              {residente.nome_completo.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{residente.nome_completo}</div>
                              {residente.email && (
                                <div className="text-xs text-slate-400 mt-0.5">{residente.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatarCPF(residente.cpf)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {calcularIdade(residente.data_nascimento)} anos
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {residente.telefone || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatarData(residente.data_entrada)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-medium"
                              onClick={() => handleReativar(residente.id, residente.nome_completo)}
                              title="Reativar residente"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                              <span>Reativar</span>
                            </button>
                            <button
                              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-medium"
                              onClick={() => handleDeletarPermanente(residente.id, residente.nome_completo)}
                              title="Deletar permanentemente"
                            >
                              <i className="bi bi-trash3"></i>
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
                <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400">
                    Mostrando <span className="font-semibold text-slate-300">{paginacao.dados.length}</span> de <span className="font-semibold text-slate-300">{paginacao.total}</span> residentes
                  </div>

                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${paginacao.paginaAtual === 1 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700/50 text-white hover:bg-slate-700'}`}
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
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${paginacao.paginaAtual === numeroPagina ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
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
                          <span key={numeroPagina} className="px-2 text-slate-600">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                    
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${paginacao.paginaAtual === paginacao.paginas ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700/50 text-white hover:bg-slate-700'}`}
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

export default ResidentesInativos
