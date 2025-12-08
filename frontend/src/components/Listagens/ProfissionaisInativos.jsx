import { useState, useMemo } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { listarProfissionais, atualizarProfissional, deletarProfissionalPermanente } from '../../api/axios'
import { useProfissionaisInativos, useReativarProfissional } from '../../hooks'

function ProfissionaisInativos() {
  const { success, error: showError } = useNotification()
  const { data: profissionaisData = [], isLoading: loading } = useProfissionaisInativos()
  const reativarMutation = useReativarProfissional()
  
  const [filtros, setFiltros] = useState({
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
        p.especialidade?.toLowerCase().includes(busca)
      )
    }
    
    return dados
  }, [profissionaisData, filtros.busca])

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

  const handleReativar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o profissional "${nome}"?`)) {
      return
    }
    
    try {
      await reativarMutation.mutateAsync(id)
      success('Profissional reativado com sucesso! A lista será atualizada automaticamente.')
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
        // React Query irá atualizar automaticamente
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl blur opacity-50"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-xl">
                      <i className="bi bi-person-slash text-3xl text-white"></i>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-1">
                      Profissionais Inativos
                    </h1>
                    <p className="text-slate-400 flex items-center gap-2">
                      <i className="bi bi-info-circle"></i>
                      Gerenciar profissionais que foram inativados no sistema
                    </p>
                  </div>
                </div>
                
                {/* Badge de total */}
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-2xl px-6 py-3 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                          <i className="bi bi-people text-xl text-slate-300"></i>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Inativos</p>
                          <h3 className="text-2xl font-black text-white">{paginacao.total}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Premium */}
        <div className="relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <i className="bi bi-search text-white text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-white">Buscar Profissionais</h3>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="bi bi-search text-slate-400"></i>
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 transition-all font-medium"
                placeholder="Digite o nome, CPF ou especialidade do profissional..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, pagina: 1 })}
              />
            </div>
          </div>
        </div>

        {/* Tabela Premium */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full blur-xl opacity-50"></div>
                  <svg className="relative animate-spin h-14 w-14 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-slate-300 font-medium mt-6">Carregando profissionais inativos...</p>
              </div>
            ) : profissionais.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-slate-700/30 flex items-center justify-center mb-4">
                  <i className="bi bi-inbox text-4xl text-slate-500"></i>
                </div>
                <p className="text-slate-300 font-medium mb-2">Nenhum profissional inativo encontrado</p>
                <p className="text-slate-500 text-sm">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">Especialidade</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">Registro</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">Telefone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-200 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-200 uppercase tracking-wider" style={{minWidth: '280px'}}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginacao.dados.map((profissional) => (
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
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <button
                              className="group relative px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-emerald-500/20"
                              onClick={() => handleReativar(profissional.id, profissional.nome_completo)}
                              title="Reativar"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                              <i className="bi bi-arrow-clockwise relative"></i>
                              <span className="relative">Reativar</span>
                            </button>
                            <button
                              className="group relative px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-red-500/20"
                              onClick={() => handleDeletarPermanente(profissional.id, profissional.nome_completo)}
                              title="Deletar Permanentemente"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                              <i className="bi bi-trash3 relative"></i>
                              <span className="relative">Deletar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação Premium */}
              {paginacao.paginas > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-t border-slate-700/50">
                  <div className="text-sm font-medium text-slate-300">
                    Mostrando {paginacao.dados.length} de {paginacao.total} profissionais inativos
                  </div>

                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-2 rounded-xl font-medium transition-all ${paginacao.paginaAtual === 1 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700/50 text-white hover:bg-slate-600/70 hover:scale-105'}`}
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
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${paginacao.paginaAtual === numeroPagina ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg' : 'bg-slate-700/50 text-white hover:bg-slate-600/70 hover:scale-105'}`}
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
                      className={`px-3 py-2 rounded-xl font-medium transition-all ${paginacao.paginaAtual === paginacao.paginas ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700/50 text-white hover:bg-slate-600/70 hover:scale-105'}`}
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
    </div>
  )
}

export default ProfissionaisInativos
