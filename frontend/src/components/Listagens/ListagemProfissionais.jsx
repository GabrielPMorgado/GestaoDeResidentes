import { useState, useEffect } from 'react'
import { listarProfissionais, deletarProfissional, obterEstatisticasProfissionais, atualizarProfissional, listarHistoricoConsultasProfissional } from '../../api/api'
import './ListagemProfissionais.css'

function ListagemProfissionais() {
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  
  // Modals
  const [showVisualizarModal, setShowVisualizarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null)
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  
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

  // Visualizar profissional
  const handleVisualizar = async (profissional) => {
    setProfissionalSelecionado(profissional)
    setShowVisualizarModal(true)
  }

  // Editar profissional
  const handleEditar = async (profissional) => {
    setProfissionalSelecionado(profissional)
    setShowEditarModal(true)
  }

  // Salvar edição
  const handleSalvarEdicao = async () => {
    try {
      const response = await atualizarProfissional(profissionalSelecionado.id, profissionalSelecionado)
      
      if (response.success) {
        alert('✅ Profissional atualizado com sucesso!')
        setShowEditarModal(false)
        carregarProfissionais()
      } else {
        throw new Error(response.message || 'Erro ao atualizar profissional')
      }
    } catch (err) {
      console.error('Erro ao atualizar profissional:', err)
      alert('❌ ' + (err.message || 'Erro ao atualizar profissional'))
    }
  }

  // Ver histórico de consultas
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
    setProfissionalSelecionado(null)
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
  }, [filtros])

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
                  className="form-control"
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
                                onClick={() => handleVisualizar(profissional)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-info"
                                title="Histórico"
                                onClick={() => handleVerHistorico(profissional)}
                              >
                                <i className="bi bi-clock-history"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning"
                                title="Editar"
                                onClick={() => handleEditar(profissional)}
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

      {/* Modal Visualizar */}
      {showVisualizarModal && profissionalSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleFecharModals}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title w-100 text-center">
                  <i className="bi bi-person-badge me-2"></i>
                  Detalhes do Profissional
                </h5>
                <button type="button" className="btn-close btn-close-white position-absolute end-0 me-3" onClick={handleFecharModals}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-12 text-center">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-person-fill me-2"></i>
                      Dados Pessoais
                    </h6>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label text-muted small d-block text-center">Nome Completo</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.nome_completo}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small d-block text-center">CPF</label>
                    <p className="fw-bold text-center">{formatarCPF(profissionalSelecionado.cpf)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Profissão</label>
                    <p className="text-center"><span className={getBadgeProfissao(profissionalSelecionado.profissao)}>{profissionalSelecionado.profissao}</span></p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Status</label>
                    <p className="text-center"><span className={getBadgeStatus(profissionalSelecionado.status)}>{profissionalSelecionado.status}</span></p>
                  </div>
                  
                  <div className="col-md-12 mt-4 text-center">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-briefcase-fill me-2"></i>
                      Informações Profissionais
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Registro Profissional</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.registro_profissional || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Especialidade</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.especialidade || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Cargo</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.cargo || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Departamento</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.departamento || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Data de Admissão</label>
                    <p className="fw-bold text-center">{formatarData(profissionalSelecionado.data_admissao)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Salário</label>
                    <p className="fw-bold text-center">
                      {profissionalSelecionado.salario 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profissionalSelecionado.salario)
                        : '-'
                      }
                    </p>
                  </div>
                  
                  <div className="col-md-12 mt-4 text-center">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-telephone-fill me-2"></i>
                      Contato
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Telefone</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.telefone || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small d-block text-center">Email</label>
                    <p className="fw-bold text-center">{profissionalSelecionado.email || '-'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer justify-content-center">
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
      {showEditarModal && profissionalSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleFecharModals}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar Profissional
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
                        value={profissionalSelecionado.nome_completo}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, nome_completo: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">CPF *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profissionalSelecionado.cpf}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, cpf: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Profissão *</label>
                      <select
                        className="form-select"
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
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Registro Profissional</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profissionalSelecionado.registro_profissional || ''}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, registro_profissional: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Especialidade</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profissionalSelecionado.especialidade || ''}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, especialidade: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Cargo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profissionalSelecionado.cargo || ''}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, cargo: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Departamento</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profissionalSelecionado.departamento || ''}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, departamento: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telefone *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profissionalSelecionado.telefone || ''}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, telefone: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profissionalSelecionado.email || ''}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, email: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={profissionalSelecionado.status}
                        onChange={(e) => setProfissionalSelecionado({...profissionalSelecionado, status: e.target.value})}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="licenca">Licença</option>
                        <option value="ferias">Férias</option>
                      </select>
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
      {showHistoricoModal && profissionalSelecionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleFecharModals}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Histórico de Consultas - {profissionalSelecionado.nome_completo}
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
                    <p className="mt-3 text-muted">Nenhuma consulta registrada para este profissional</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Data</th>
                          <th>Residente</th>
                          <th>CPF Residente</th>
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
                              <strong>{consulta.residente?.nome_completo || '-'}</strong>
                              <div className="small text-muted">{consulta.residente?.email || ''}</div>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatarCPF(consulta.residente?.cpf)}
                              </small>
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

export default ListagemProfissionais
