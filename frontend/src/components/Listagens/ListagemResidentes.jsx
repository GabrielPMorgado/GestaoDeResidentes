import { useState, useEffect } from 'react'
import { listarResidentes, deletarResidente, obterEstatisticas, atualizarResidente, listarHistoricoConsultas } from '../../api/api'
import './ListagemResidentes.css'

function ListagemResidentes() {
  const [residentes, setResidentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  
  // Modals
  const [showVisualizarModal, setShowVisualizarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [residenteSelecionado, setResidenteSelecionado] = useState(null)
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  
  // Filtros
  const [filtros, setFiltros] = useState({
    status: '',
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

  // Carregar residentes
  const carregarResidentes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Carregando residentes com filtros:', {
        status: filtros.status,
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      const response = await listarResidentes({
        status: filtros.status,
        busca: filtros.busca,
        page: filtros.pagina,
        limit: filtros.limite
      })
      
      console.log('Resposta da API:', response)
      
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

  // Carregar estatísticas
  const carregarEstatisticas = async () => {
    try {
      const response = await obterEstatisticas()
      if (response.success && response.data) {
        setEstatisticas(response.data)
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  // Deletar residente
  const handleDeletar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja inativar o residente "${nome}"?`)) {
      return
    }
    
    try {
      const response = await deletarResidente(id)
      
      if (response.success) {
        alert('✅ Residente inativado com sucesso!')
        carregarResidentes()
        carregarEstatisticas()
      } else {
        throw new Error(response.message || 'Erro ao inativar residente')
      }
    } catch (err) {
      console.error('Erro ao inativar residente:', err)
      alert('❌ ' + (err.message || 'Erro ao inativar residente'))
    }
  }

  // Visualizar residente
  const handleVisualizar = async (residente) => {
    setResidenteSelecionado(residente)
    setShowVisualizarModal(true)
  }

  // Editar residente
  const handleEditar = async (residente) => {
    setResidenteSelecionado(residente)
    setShowEditarModal(true)
  }

  // Salvar edição
  const handleSalvarEdicao = async () => {
    try {
      const response = await atualizarResidente(residenteSelecionado.id, residenteSelecionado)
      
      if (response.success) {
        alert('✅ Residente atualizado com sucesso!')
        setShowEditarModal(false)
        carregarResidentes()
      } else {
        throw new Error(response.message || 'Erro ao atualizar residente')
      }
    } catch (err) {
      console.error('Erro ao atualizar residente:', err)
      alert('❌ ' + (err.message || 'Erro ao atualizar residente'))
    }
  }

  // Ver histórico de consultas
  const handleVerHistorico = async (residente) => {
    setResidenteSelecionado(residente)
    setShowHistoricoModal(true)
    setLoadingHistorico(true)
    
    try {
      const response = await listarHistoricoConsultas(residente.id)
      
      if (response.success) {
        setHistoricoConsultas(response.data?.consultas || [])
      } else {
        throw new Error(response.message || 'Erro ao carregar histórico')
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
      setHistoricoConsultas([])
    } finally {
      setLoadingHistorico(false)
    }
  }

  // Fechar modals
  const handleFecharModals = () => {
    setShowVisualizarModal(false)
    setShowEditarModal(false)
    setShowHistoricoModal(false)
    setResidenteSelecionado(null)
    setHistoricoConsultas([])
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    setFiltros(prev => ({ ...prev, pagina: 1 }))
  }

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      status: '',
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

  // Badge de status
  const getBadgeStatus = (status) => {
    const badges = {
      ativo: 'badge bg-success',
      inativo: 'badge bg-secondary',
      suspenso: 'badge bg-warning text-dark'
    }
    return badges[status] || 'badge bg-secondary'
  }

  // useEffect para carregar dados
  useEffect(() => {
    carregarResidentes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pagina, filtros.limite])

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  return (
    <div className="listagem-residentes">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-people-fill text-primary me-2"></i>
              Listagem de Residentes
            </h2>
            <p className="text-muted mb-0">Gerenciamento completo dos residentes cadastrados</p>
          </div>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => window.location.href = '#/cadastro-residentes'}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Novo Residente
          </button>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card stats-card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                      <i className="bi bi-people-fill fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Total de Residentes</p>
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
                    <div className="stats-icon bg-success bg-opacity-10 text-success rounded-circle p-3 me-3">
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
                    <div className="stats-icon bg-secondary bg-opacity-10 text-secondary rounded-circle p-3 me-3">
                      <i className="bi bi-x-circle-fill fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Inativos</p>
                      <h3 className="mb-0">{estatisticas?.inativos || 0}</h3>
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
                      <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Suspensos</p>
                      <h3 className="mb-0">{estatisticas.suspensos || 0}</h3>
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
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="suspenso">Suspenso</option>
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label">Buscar</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome, CPF ou quarto..."
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
              <div className="col-md-2">
                <label className="form-label">&nbsp;</label>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={aplicarFiltros}
                  >
                    <i className="bi bi-search"></i>
                  </button>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={limparFiltros}
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
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-3 text-muted">Carregando residentes...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            ) : residentes.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Nenhum residente encontrado</p>
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
                        <th>Quarto</th>
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
                              <div className="avatar-circle bg-primary bg-opacity-10 text-primary me-2">
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
                          <td>
                            {residente.numero_quarto ? (
                              <span className="badge bg-info">
                                Quarto {residente.numero_quarto}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{formatarData(residente.data_entrada)}</td>
                          <td>
                            <span className={getBadgeStatus(residente.status)}>
                              {residente.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                title="Visualizar"
                                onClick={() => handleVisualizar(residente)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-info"
                                title="Histórico"
                                onClick={() => handleVerHistorico(residente)}
                              >
                                <i className="bi bi-clock-history"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning"
                                title="Editar"
                                onClick={() => handleEditar(residente)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
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
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Mostrando {residentes.length} de {paginacao.total} residentes
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

      {/* Modal Visualizar */}
      {showVisualizarModal && residenteSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleFecharModals}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Detalhes do Residente
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleFecharModals}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-person-fill me-2"></i>
                      Dados Pessoais
                    </h6>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label text-muted small">Nome Completo</label>
                    <p className="fw-bold">{residenteSelecionado.nome_completo}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">CPF</label>
                    <p className="fw-bold">{formatarCPF(residenteSelecionado.cpf)}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">RG</label>
                    <p className="fw-bold">{residenteSelecionado.rg || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Data de Nascimento</label>
                    <p className="fw-bold">{formatarData(residenteSelecionado.data_nascimento)}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Idade</label>
                    <p className="fw-bold">{calcularIdade(residenteSelecionado.data_nascimento)}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Sexo</label>
                    <p className="fw-bold">{residenteSelecionado.sexo || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Estado Civil</label>
                    <p className="fw-bold">{residenteSelecionado.estado_civil || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Status</label>
                    <p><span className={getBadgeStatus(residenteSelecionado.status)}>{residenteSelecionado.status}</span></p>
                  </div>
                  
                  <div className="col-md-12 mt-4">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-telephone-fill me-2"></i>
                      Contato
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Telefone</label>
                    <p className="fw-bold">{residenteSelecionado.telefone || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Email</label>
                    <p className="fw-bold">{residenteSelecionado.email || '-'}</p>
                  </div>
                  
                  <div className="col-md-12 mt-4">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      Endereço
                    </h6>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label text-muted small">Logradouro</label>
                    <p className="fw-bold">{residenteSelecionado.logradouro || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Número</label>
                    <p className="fw-bold">{residenteSelecionado.numero || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Bairro</label>
                    <p className="fw-bold">{residenteSelecionado.bairro || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Cidade</label>
                    <p className="fw-bold">{residenteSelecionado.cidade || '-'}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small">Estado</label>
                    <p className="fw-bold">{residenteSelecionado.estado || '-'}</p>
                  </div>
                  
                  <div className="col-md-12 mt-4">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-person-badge-fill me-2"></i>
                      Responsável / Contato de Emergência
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Nome do Responsável</label>
                    <p className="fw-bold">{residenteSelecionado.nome_responsavel || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Parentesco</label>
                    <p className="fw-bold">{residenteSelecionado.parentesco_responsavel || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Telefone do Responsável</label>
                    <p className="fw-bold">{residenteSelecionado.telefone_responsavel || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Email do Responsável</label>
                    <p className="fw-bold">{residenteSelecionado.email_responsavel || '-'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleFecharModals}>
                  <i className="bi bi-x-circle me-2"></i>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditarModal && residenteSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleFecharModals}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar Residente
                </h5>
                <button type="button" className="btn-close" onClick={handleFecharModals}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Nome Completo *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={residenteSelecionado.nome_completo}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, nome_completo: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">CPF *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={residenteSelecionado.cpf}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, cpf: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">RG</label>
                      <input
                        type="text"
                        className="form-control"
                        value={residenteSelecionado.rg || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, rg: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Data de Nascimento *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={residenteSelecionado.data_nascimento?.split('T')[0] || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, data_nascimento: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Sexo</label>
                      <select
                        className="form-select"
                        value={residenteSelecionado.sexo || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, sexo: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telefone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={residenteSelecionado.telefone || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, telefone: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={residenteSelecionado.email || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, email: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={residenteSelecionado.status}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, status: e.target.value})}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="suspenso">Suspenso</option>
                      </select>
                    </div>
                    
                    {/* Seção Responsável / Contato de Emergência */}
                    <div className="col-md-12 mt-4">
                      <h6 className="text-warning mb-3">
                        <i className="bi bi-person-badge-fill me-2"></i>
                        Responsável / Contato de Emergência
                      </h6>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nome do Responsável *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={residenteSelecionado.nome_responsavel || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, nome_responsavel: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Parentesco</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Filho(a), Cônjuge, Irmão(ã)"
                        value={residenteSelecionado.parentesco_responsavel || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, parentesco_responsavel: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telefone do Responsável *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="(00) 00000-0000"
                        value={residenteSelecionado.telefone_responsavel || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, telefone_responsavel: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email do Responsável</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email@exemplo.com"
                        value={residenteSelecionado.email_responsavel || ''}
                        onChange={(e) => setResidenteSelecionado({...residenteSelecionado, email_responsavel: e.target.value})}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleFecharModals}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button type="button" className="btn btn-warning" onClick={handleSalvarEdicao}>
                  <i className="bi bi-check-circle me-2"></i>
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico de Consultas */}
      {showHistoricoModal && residenteSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleFecharModals}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Histórico de Consultas - {residenteSelecionado.nome_completo}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleFecharModals}></button>
              </div>
              <div className="modal-body">
                {loadingHistorico ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3 text-muted">Carregando histórico...</p>
                  </div>
                ) : historicoConsultas.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <p className="mt-3 text-muted">Nenhuma consulta registrada</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Data</th>
                          <th>Profissional</th>
                          <th>Especialidade</th>
                          <th>Tipo</th>
                          <th>Diagnóstico</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoConsultas.map((consulta) => (
                          <tr key={consulta.id}>
                            <td>{formatarData(consulta.data_consulta)}</td>
                            <td>
                              <strong>{consulta.profissional?.nome_completo}</strong>
                              <div className="small text-muted">{consulta.profissional?.registro_profissional}</div>
                            </td>
                            <td>
                              <span className="badge bg-primary">{consulta.profissional?.especialidade}</span>
                            </td>
                            <td>{consulta.tipo_consulta || '-'}</td>
                            <td>
                              <div className="text-truncate" style={{maxWidth: '200px'}} title={consulta.diagnostico}>
                                {consulta.diagnostico || '-'}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-success">{consulta.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleFecharModals}>
                  <i className="bi bi-x-circle me-2"></i>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListagemResidentes
