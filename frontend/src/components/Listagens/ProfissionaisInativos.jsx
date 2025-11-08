import { useState, useEffect } from 'react'
import { listarProfissionais, atualizarProfissional, deletarProfissionalPermanente } from '../../api/api'
import './ListagemProfissionais.css'

function ProfissionaisInativos() {
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filtros
  const [filtros, setFiltros] = useState({
    status: 'inativo',
    busca: '',
    pagina: 1,
    limite: 10
  })

  // Paginação
  const [paginacao, setPaginacao] = useState({
    total: 0,
    paginas: 0,
    paginaAtual: 1
  })

  // Carregar profissionais inativos
  const carregarProfissionais = async () => {
    setLoading(true)
    setError(null)
    
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
      console.error('Erro ao carregar profissionais:', err)
      setError(err.message || 'Erro ao carregar profissionais')
      setProfissionais([])
      setPaginacao({ total: 0, paginas: 0, paginaAtual: 1 })
    } finally {
      setLoading(false)
    }
  }

  // Reativar profissional
  const handleReativar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o profissional "${nome}"?`)) {
      return
    }
    
    try {
      const response = await atualizarProfissional(id, { status: 'ativo' })
      
      if (response.success) {
        alert('✅ Profissional reativado com sucesso!')
        carregarProfissionais()
      } else {
        throw new Error(response.message || 'Erro ao reativar profissional')
      }
    } catch (err) {
      console.error('Erro ao reativar profissional:', err)
      alert('❌ ' + (err.message || 'Erro ao reativar profissional'))
    }
  }

  // Deletar profissional permanentemente
  const handleDeletarPermanente = async (id, nome) => {
    // Primeira confirmação
    if (!window.confirm(`⚠️ ATENÇÃO! Tem certeza que deseja DELETAR PERMANENTEMENTE o profissional "${nome}"?\n\nEsta ação NÃO PODE SER DESFEITA e irá remover:\n- Todos os agendamentos\n- Todo o histórico de consultas\n- Todos os dados do profissional\n\nDeseja continuar?`)) {
      return
    }
    
    // Segunda confirmação - usuário precisa digitar "DELETAR"
    const confirmacao = window.prompt('Para confirmar, digite: DELETAR')
    
    if (confirmacao !== 'DELETAR') {
      alert('❌ Operação cancelada. Confirmação incorreta.')
      return
    }
    
    try {
      console.log(`Tentando deletar profissional ID: ${id}`)
      const response = await deletarProfissionalPermanente(id)
      
      console.log('Resposta da deleção:', response)
      
      if (response.success) {
        alert('✅ Profissional deletado permanentemente do sistema!')
        carregarProfissionais()
      } else {
        throw new Error(response.message || 'Erro ao deletar profissional')
      }
    } catch (err) {
      console.error('Erro ao deletar profissional:', err)
      alert('❌ ' + (err.message || 'Erro ao deletar profissional permanentemente'))
    }
  }

  // Mudar página
  const mudarPagina = (novaPagina) => {
    setFiltros(prev => ({ ...prev, pagina: novaPagina }))
  }

  // Formatar CPF
  const formatarCPF = (cpf) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // useEffect para carregar dados
  useEffect(() => {
    carregarProfissionais()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pagina, filtros.limite])

  return (
    <div className="listagem-profissionais">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-person-slash text-secondary me-2"></i>
              Profissionais Inativos
            </h2>
            <p className="text-muted mb-0">Lista de profissionais que foram inativados no sistema</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card stats-card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="stats-icon bg-secondary bg-opacity-10 text-secondary rounded-circle p-3 me-3">
                    <i className="bi bi-person-slash fs-4"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Total de Inativos</p>
                    <h3 className="mb-0">{paginacao.total}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label small text-muted">Buscar por nome ou CPF</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Digite o nome ou CPF..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, pagina: 1 })}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button 
                  className="btn btn-primary w-100"
                  onClick={carregarProfissionais}
                >
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-3 text-muted">Carregando profissionais inativos...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            ) : profissionais.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Nenhum profissional inativo encontrado</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Especialidade</th>
                        <th>Registro</th>
                        <th>Telefone</th>
                        <th>Status</th>
                        <th className="text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profissionais.map((profissional) => (
                        <tr key={profissional.id}>
                          <td className="text-muted">#{profissional.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle bg-secondary bg-opacity-10 text-secondary me-2">
                                {profissional.nome_completo.charAt(0)}
                              </div>
                              <div>
                                <strong>{profissional.nome_completo}</strong>
                                {profissional.email && (
                                  <div className="small text-muted">{profissional.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{formatarCPF(profissional.cpf)}</td>
                          <td>
                            <span className="badge bg-info">
                              {profissional.especialidade}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {profissional.registro_profissional}
                            </small>
                          </td>
                          <td>{profissional.telefone || '-'}</td>
                          <td>
                            <span className="badge bg-secondary">
                              Inativo
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm btn-outline-success"
                                title="Reativar"
                                onClick={() => handleReativar(profissional.id, profissional.nome_completo)}
                              >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Reativar
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                title="Deletar Permanentemente"
                                onClick={() => handleDeletarPermanente(profissional.id, profissional.nome_completo)}
                              >
                                <i className="bi bi-trash3 me-1"></i>
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
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Mostrando {profissionais.length} de {paginacao.total} profissionais inativos
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${paginacao.paginaAtual === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => mudarPagina(paginacao.paginaAtual - 1)}
                          disabled={paginacao.paginaAtual === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      {[...Array(paginacao.paginas)].map((_, index) => {
                        const numeroPagina = index + 1
                        if (
                          numeroPagina === 1 ||
                          numeroPagina === paginacao.paginas ||
                          (numeroPagina >= paginacao.paginaAtual - 1 && numeroPagina <= paginacao.paginaAtual + 1)
                        ) {
                          return (
                            <li 
                              key={numeroPagina} 
                              className={`page-item ${paginacao.paginaAtual === numeroPagina ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link"
                                onClick={() => mudarPagina(numeroPagina)}
                              >
                                {numeroPagina}
                              </button>
                            </li>
                          )
                        } else if (
                          numeroPagina === paginacao.paginaAtual - 2 ||
                          numeroPagina === paginacao.paginaAtual + 2
                        ) {
                          return <li key={numeroPagina} className="page-item disabled"><span className="page-link">...</span></li>
                        }
                        return null
                      })}
                      <li className={`page-item ${paginacao.paginaAtual === paginacao.paginas ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => mudarPagina(paginacao.paginaAtual + 1)}
                          disabled={paginacao.paginaAtual === paginacao.paginas}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfissionaisInativos
