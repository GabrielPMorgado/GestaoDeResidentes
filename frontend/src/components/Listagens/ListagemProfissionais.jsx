import { useState, useEffect } from 'react'
import { listarProfissionais, deletarProfissional, obterEstatisticasProfissionais } from '../../api/api'
import './ListagemProfissionais.css'

function ListagemProfissionais() {
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  
  // Filtros
  const [filtros, setFiltros] = useState({
    status: '',
    profissao: '',
    departamento: '',
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

  // Carregar profissionais
  const carregarProfissionais = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Carregando profissionais com filtros:', {
        status: filtros.status,
        profissao: filtros.profissao,
        departamento: filtros.departamento,
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      const response = await listarProfissionais({
        status: filtros.status,
        profissao: filtros.profissao,
        departamento: filtros.departamento,
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      console.log('Resposta da API:', response)
      
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

  // Carregar estatísticas
  const carregarEstatisticas = async () => {
    try {
      const response = await obterEstatisticasProfissionais()
      if (response.success && response.data) {
        setEstatisticas(response.data)
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  // Deletar profissional
  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja inativar o profissional "${nome}"?`)) {
      return
    }
    
    try {
      const response = await deletarProfissional(id)
      
      if (response.success) {
        alert('✅ Profissional inativado com sucesso!')
        carregarProfissionais()
        carregarEstatisticas()
      } else {
        throw new Error(response.message || 'Erro ao inativar profissional')
      }
    } catch (err) {
      console.error('Erro ao inativar profissional:', err)
      alert('❌ ' + (err.message || 'Erro ao inativar profissional'))
    }
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    setFiltros(prev => ({ ...prev, pagina: 1 }))
  }

  // Limpar filtros
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

  // Badge de status
  const getBadgeStatus = (status) => {
    const badges = {
      ativo: 'badge bg-success',
      inativo: 'badge bg-secondary',
      licenca: 'badge bg-info',
      ferias: 'badge bg-warning text-dark'
    }
    return badges[status] || 'badge bg-secondary'
  }

  // Badge de profissão
  const getBadgeProfissao = (profissao) => {
    const badges = {
      medico: 'badge bg-primary',
      enfermeiro: 'badge bg-info',
      fisioterapeuta: 'badge bg-success',
      psicologo: 'badge bg-warning text-dark',
      nutricionista: 'badge bg-danger',
      cuidador: 'badge bg-secondary'
    }
    return badges[profissao] || 'badge bg-dark'
  }

  // useEffect para carregar dados
  useEffect(() => {
    carregarProfissionais()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pagina, filtros.limite])

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  return (
    <div className="listagem-profissionais">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-person-badge-fill text-success me-2"></i>
              Listagem de Profissionais
            </h2>
            <p className="text-muted mb-0">Gerenciamento completo dos profissionais cadastrados</p>
          </div>
          <button 
            className="btn btn-success btn-lg"
            onClick={() => window.location.href = '#/cadastro-profissionais'}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Novo Profissional
          </button>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card stats-card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
                      <i className="bi bi-people-fill fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Total de Profissionais</p>
                      <h3 className="mb-0">{estatisticas?.total || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stats-card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                      <i className="bi bi-check-circle-fill fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Ativos</p>
                      <h3 className="mb-0">{estatisticas?.ativos || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stats-card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-info bg-opacity-10 text-info rounded-circle p-3 me-3">
                      <i className="bi bi-calendar-check fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Em Licença</p>
                      <h3 className="mb-0">{estatisticas?.licenca || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stats-card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3">
                      <i className="bi bi-umbrella fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">De Férias</p>
                      <h3 className="mb-0">{estatisticas?.ferias || 0}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-funnel me-2"></i>
              Filtros
            </h5>
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="licenca">Em Licença</option>
                  <option value="ferias">De Férias</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Profissão</label>
                <select 
                  className="form-select"
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
                  <option value="assistente_social">Assistente Social</option>
                  <option value="terapeuta_ocupacional">Terapeuta Ocupacional</option>
                  <option value="farmaceutico">Farmacêutico</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Departamento</label>
                <select 
                  className="form-select"
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
              <div className="col-md-3">
                <label className="form-label">Buscar</label>
                <input
                  type="text"
                  className="form-select"
                  placeholder="Nome, CPF ou cargo..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Itens por página</label>
                <select 
                  className="form-select"
                  value={filtros.limite}
                  onChange={(e) => setFiltros(prev => ({ ...prev, limite: parseInt(e.target.value), pagina: 1 }))}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="col-md-1">
                <label className="form-label">&nbsp;</label>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={aplicarFiltros}
                    title="Aplicar filtros"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={limparFiltros}
                    title="Limpar filtros"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-3 text-muted">Carregando profissionais...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            ) : profissionais.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Nenhum profissional encontrado</p>
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
                        <th>Profissão</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th>Data Admissão</th>
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
                              <div className="avatar-circle bg-success bg-opacity-10 text-success me-2">
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
                            <span className={getBadgeProfissao(profissional.profissao)}>
                              {profissional.profissao}
                            </span>
                          </td>
                          <td>{profissional.cargo || '-'}</td>
                          <td>{profissional.departamento || '-'}</td>
                          <td>{formatarData(profissional.data_admissao)}</td>
                          <td>
                            <span className={getBadgeStatus(profissional.status)}>
                              {profissional.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                title="Visualizar"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning"
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
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
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Mostrando {profissionais.length} de {paginacao.total} profissionais
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
                        // Mostrar apenas 5 páginas por vez
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

export default ListagemProfissionais
