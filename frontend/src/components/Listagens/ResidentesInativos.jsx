import { useState, useEffect } from 'react'
import { listarResidentes, atualizarResidente } from '../../api/api'
import './ListagemResidentes.css'

function ResidentesInativos() {
  const [residentes, setResidentes] = useState([])
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

  // Carregar residentes inativos
  const carregarResidentes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await listarResidentes({
        status: 'inativo',
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      if (response && response.success) {
        setResidentes(response.data?.residentes || [])
        setPaginacao({
          total: response.data?.pagination?.totalItens || 0,
          paginas: response.data?.pagination?.totalPaginas || 0,
          paginaAtual: response.data?.pagination?.paginaAtual || 1
        })
      } else {
        throw new Error(response?.message || 'Erro ao carregar residentes')
      }
    } catch (err) {
      console.error('Erro ao carregar residentes:', err)
      setError(err.message || 'Erro ao carregar residentes')
      setResidentes([])
      setPaginacao({ total: 0, paginas: 0, paginaAtual: 1 })
    } finally {
      setLoading(false)
    }
  }

  // Reativar residente
  const handleReativar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o residente "${nome}"?`)) {
      return
    }
    
    try {
      const response = await atualizarResidente(id, { status: 'ativo' })
      
      if (response.success) {
        alert('✅ Residente reativado com sucesso!')
        carregarResidentes()
      } else {
        throw new Error(response.message || 'Erro ao reativar residente')
      }
    } catch (err) {
      console.error('Erro ao reativar residente:', err)
      alert('❌ ' + (err.message || 'Erro ao reativar residente'))
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

  // Formatar data
  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Calcular idade
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

  // useEffect para carregar dados
  useEffect(() => {
    carregarResidentes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pagina, filtros.limite])

  return (
    <div className="listagem-residentes">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-person-x-fill text-secondary me-2"></i>
              Residentes Inativos
            </h2>
            <p className="text-muted mb-0">Lista de residentes que foram inativados no sistema</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card stats-card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="stats-icon bg-secondary bg-opacity-10 text-secondary rounded-circle p-3 me-3">
                    <i className="bi bi-person-x-fill fs-4"></i>
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
                  onClick={carregarResidentes}
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
                <p className="mt-3 text-muted">Carregando residentes inativos...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            ) : residentes.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Nenhum residente inativo encontrado</p>
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
                        <th>Idade</th>
                        <th>Telefone</th>
                        <th>Data Entrada</th>
                        <th>Status</th>
                        <th className="text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residentes.map((residente) => (
                        <tr key={residente.id}>
                          <td className="text-muted">#{residente.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle bg-secondary bg-opacity-10 text-secondary me-2">
                                {residente.nome_completo.charAt(0)}
                              </div>
                              <div>
                                <strong>{residente.nome_completo}</strong>
                                {residente.email && (
                                  <div className="small text-muted">{residente.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{formatarCPF(residente.cpf)}</td>
                          <td>{calcularIdade(residente.data_nascimento)}</td>
                          <td>{residente.telefone || '-'}</td>
                          <td>{formatarData(residente.data_entrada)}</td>
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
                                onClick={() => handleReativar(residente.id, residente.nome_completo)}
                              >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Reativar
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
                    Mostrando {residentes.length} de {paginacao.total} residentes inativos
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

export default ResidentesInativos
