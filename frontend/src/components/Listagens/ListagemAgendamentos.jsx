import { useState, useEffect } from 'react'
import './ListagemAgendamentos.css'
import {
  listarAgendamentos,
  obterEstatisticasAgendamentos,
  confirmarAgendamento,
  cancelarAgendamento,
  buscarAgendamentoPorId,
  atualizarAgendamento
} from '../../api/api'

function ListagemAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [estatisticas, setEstatisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    status: '',
    tipo_atendimento: '',
    data_inicio: '',
    data_fim: '',
    busca: ''
  })
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(10)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalItens, setTotalItens] = useState(0)
  const [detalhesModal, setDetalhesModal] = useState(null)
  const [editarModal, setEditarModal] = useState(null)

  useEffect(() => {
    carregarDados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, itensPorPagina, filtros])

  const carregarDados = async () => {
    try {
      setLoading(true)

      const params = {
        page: paginaAtual,
        limit: itensPorPagina,
        ...filtros
      }

      const [agendamentosRes, estatisticasRes] = await Promise.all([
        listarAgendamentos(params),
        obterEstatisticasAgendamentos()
      ])

      console.log('Agendamentos Response:', agendamentosRes)
      console.log('Estatísticas Response:', estatisticasRes)

      if (agendamentosRes.success) {
        setAgendamentos(agendamentosRes.data?.agendamentos || [])
        setPaginaAtual(agendamentosRes.data?.pagination?.paginaAtual || 1)
        setTotalPaginas(agendamentosRes.data?.pagination?.totalPaginas || 1)
        setTotalItens(agendamentosRes.data?.pagination?.totalItens || 0)
      }

      if (estatisticasRes.success) {
        setEstatisticas(estatisticasRes.data)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      alert('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }))
    setPaginaAtual(1)
  }

  const limparFiltros = () => {
    setFiltros({
      status: '',
      tipo_atendimento: '',
      data_inicio: '',
      data_fim: '',
      busca: ''
    })
    setPaginaAtual(1)
  }

  const handleConfirmar = async (id) => {
    if (!window.confirm('Deseja confirmar este agendamento?')) return

    try {
      const response = await confirmarAgendamento(id)
      console.log('Resposta confirmar:', response)
      
      if (response.success) {
        alert('✅ Agendamento confirmado com sucesso!')
        carregarDados()
      } else {
        throw new Error(response.message || 'Erro ao confirmar agendamento')
      }
    } catch (error) {
      console.error('Erro ao confirmar:', error)
      alert('❌ ' + (error.message || 'Erro ao confirmar agendamento'))
    }
  }

  const handleCancelar = async (id) => {
    const motivo = window.prompt('Digite o motivo do cancelamento:')
    if (!motivo) return

    const canceladoPor = window.prompt('Cancelado por (nome):')
    if (!canceladoPor) return

    try {
      const response = await cancelarAgendamento(id, {
        motivo_cancelamento: motivo,
        cancelado_por: canceladoPor
      })
      
      if (response.success) {
        alert('✅ Agendamento cancelado com sucesso!')
        carregarDados()
      } else {
        throw new Error(response.message || 'Erro ao cancelar agendamento')
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      alert('❌ ' + (error.message || 'Erro ao cancelar agendamento'))
    }
  }

  const verDetalhes = async (id) => {
    try {
      const response = await buscarAgendamentoPorId(id)
      if (response.success) {
        setDetalhesModal(response.data)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
      alert('Erro ao buscar detalhes do agendamento')
    }
  }

  const abrirModalEditar = async (id) => {
    try {
      const response = await buscarAgendamentoPorId(id)
      if (response.success) {
        setEditarModal(response.data)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error)
      alert('Erro ao buscar agendamento para edição')
    }
  }

  const handleSalvarEdicao = async () => {
    try {
      const dados = {
        data_agendamento: editarModal.data_agendamento,
        hora_inicio: editarModal.hora_inicio,
        hora_fim: editarModal.hora_fim,
        tipo_atendimento: editarModal.tipo_atendimento,
        observacoes: editarModal.observacoes
      }
      
      await atualizarAgendamento(editarModal.id, dados)
      alert('✅ Agendamento atualizado com sucesso!')
      setEditarModal(null)
      carregarDados()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      alert('❌ ' + (error.message || 'Erro ao atualizar agendamento'))
    }
  }

  const handleIniciarAtendimento = async (id) => {
    if (!window.confirm('Deseja iniciar este atendimento?')) return

    try {
      const response = await atualizarAgendamento(id, { status: 'em_andamento' })
      
      if (response.success) {
        alert('✅ Atendimento iniciado!')
        carregarDados()
      } else {
        throw new Error(response.message || 'Erro ao iniciar atendimento')
      }
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
      alert('❌ ' + (error.message || 'Erro ao iniciar atendimento'))
    }
  }

  const handleConcluirAtendimento = async (id) => {
    if (!window.confirm('Deseja concluir este atendimento?')) return

    try {
      const response = await atualizarAgendamento(id, { status: 'concluido' })
      
      if (response.success) {
        alert('✅ Atendimento concluído!')
        carregarDados()
      } else {
        throw new Error(response.message || 'Erro ao concluir atendimento')
      }
    } catch (error) {
      console.error('Erro ao concluir atendimento:', error)
      alert('❌ ' + (error.message || 'Erro ao concluir atendimento'))
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      agendado: 'bg-primary',
      confirmado: 'bg-success',
      em_andamento: 'bg-warning text-dark',
      concluido: 'bg-secondary',
      cancelado: 'bg-danger'
    }
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    }
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>
  }

  const getTipoAtendimentoBadge = (tipo) => {
    const badges = {
      consulta: 'bg-info',
      fisioterapia: 'bg-success',
      psicologia: 'bg-warning text-dark',
      nutricao: 'bg-danger',
      outro: 'bg-secondary'
    }
    const labels = {
      consulta: 'Consulta',
      fisioterapia: 'Fisioterapia',
      psicologia: 'Psicologia',
      nutricao: 'Nutrição',
      outro: 'Outro'
    }
    return <span className={`badge ${badges[tipo]}`}>{labels[tipo]}</span>
  }

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const formatarHora = (hora) => {
    return hora?.substring(0, 5) || ''
  }

  if (loading && agendamentos.length === 0) {
    return (
      <div className="listagem-agendamentos">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="listagem-agendamentos">
      <div className="container-fluid">
        {/* Cabeçalho */}
        <div className="page-header">
          <h2>
            <i className="bi bi-calendar-check me-2"></i>
            Agendamentos
          </h2>
          <p className="text-muted">Gerencie os agendamentos dos residentes</p>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h3>{estatisticas.total || 0}</h3>
                  <p>Total de Agendamentos</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card agendado">
                <div className="stat-icon">
                  <i className="bi bi-calendar-plus"></i>
                </div>
                <div className="stat-info">
                  <h3>{estatisticas.agendados || 0}</h3>
                  <p>Agendados</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card confirmado">
                <div className="stat-icon">
                  <i className="bi bi-calendar-check-fill"></i>
                </div>
                <div className="stat-info">
                  <h3>{estatisticas.confirmados || 0}</h3>
                  <p>Confirmados</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card concluido">
                <div className="stat-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="stat-info">
                  <h3>{estatisticas.concluidos || 0}</h3>
                  <p>Concluídos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={filtros.status}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos</option>
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Tipo</label>
                <select
                  className="form-select"
                  name="tipo_atendimento"
                  value={filtros.tipo_atendimento}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos</option>
                  <option value="consulta">Consulta</option>
                  <option value="fisioterapia">Fisioterapia</option>
                  <option value="psicologia">Psicologia</option>
                  <option value="nutricao">Nutrição</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Data Início</label>
                <input
                  type="date"
                  className="form-control"
                  name="data_inicio"
                  value={filtros.data_inicio}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Data Fim</label>
                <input
                  type="date"
                  className="form-control"
                  name="data_fim"
                  value={filtros.data_fim}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Buscar</label>
                <input
                  type="text"
                  className="form-control"
                  name="busca"
                  value={filtros.busca}
                  onChange={handleFiltroChange}
                  placeholder="Residente ou profissional..."
                />
              </div>
              <div className="col-md-1 d-flex align-items-end">
                <button
                  className="btn btn-secondary w-100"
                  onClick={limparFiltros}
                  title="Limpar filtros"
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Residente</th>
                    <th>Profissional</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <i className="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                        <span className="text-muted">Nenhum agendamento encontrado</span>
                      </td>
                    </tr>
                  ) : (
                    agendamentos.map(agendamento => (
                      <tr key={agendamento.id}>
                        <td>{formatarData(agendamento.data_agendamento)}</td>
                        <td>
                          {formatarHora(agendamento.hora_inicio)} - {formatarHora(agendamento.hora_fim)}
                        </td>
                        <td>{agendamento.Residente?.nome_completo || 'N/A'}</td>
                        <td>{agendamento.Profissional?.nome_completo || 'N/A'}</td>
                        <td>{getTipoAtendimentoBadge(agendamento.tipo_atendimento)}</td>
                        <td>{getStatusBadge(agendamento.status)}</td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => verDetalhes(agendamento.id)}
                              title="Ver detalhes"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            
                            {agendamento.status === 'agendado' && (
                              <>
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => abrirModalEditar(agendamento.id)}
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleConfirmar(agendamento.id)}
                                  title="Confirmar"
                                >
                                  <i className="bi bi-check-circle"></i>
                                </button>
                              </>
                            )}
                            
                            {agendamento.status === 'confirmado' && (
                              <button
                                className="btn btn-outline-info"
                                onClick={() => handleIniciarAtendimento(agendamento.id)}
                                title="Iniciar Atendimento"
                              >
                                <i className="bi bi-play-circle"></i>
                              </button>
                            )}
                            
                            {agendamento.status === 'em_andamento' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleConcluirAtendimento(agendamento.id)}
                                title="Concluir"
                              >
                                <i className="bi bi-check2-circle"></i>
                              </button>
                            )}
                            
                            {(agendamento.status === 'agendado' || agendamento.status === 'confirmado') && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancelar(agendamento.id)}
                                title="Cancelar"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="pagination-container">
                <div className="items-per-page">
                  <label>Itens por página:</label>
                  <select
                    className="form-select form-select-sm"
                    value={itensPorPagina}
                    onChange={(e) => {
                      setItensPorPagina(Number(e.target.value))
                      setPaginaAtual(1)
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <div className="pagination-info">
                  Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a{' '}
                  {Math.min(paginaAtual * itensPorPagina, totalItens)} de {totalItens} registros
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPaginaAtual(1)}
                        disabled={paginaAtual === 1}
                      >
                        <i className="bi bi-chevron-double-left"></i>
                      </button>
                    </li>
                    <li className={`page-item ${paginaAtual === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                        disabled={paginaAtual === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">{paginaAtual}</span>
                    </li>
                    <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                        disabled={paginaAtual === totalPaginas}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                    <li className={`page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPaginaAtual(totalPaginas)}
                        disabled={paginaAtual === totalPaginas}
                      >
                        <i className="bi bi-chevron-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {detalhesModal && (
        <div className="modal-overlay" onClick={() => setDetalhesModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>
                <i className="bi bi-info-circle me-2"></i>
                Detalhes do Agendamento
              </h5>
              <button className="btn-close" onClick={() => setDetalhesModal(null)}></button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <strong>Residente:</strong>
                <span>{detalhesModal.Residente?.nome_completo}</span>
              </div>
              <div className="detail-group">
                <strong>Profissional:</strong>
                <span>{detalhesModal.Profissional?.nome_completo} - {detalhesModal.Profissional?.profissao}</span>
              </div>
              <div className="detail-group">
                <strong>Data:</strong>
                <span>{formatarData(detalhesModal.data_agendamento)}</span>
              </div>
              <div className="detail-group">
                <strong>Horário:</strong>
                <span>{formatarHora(detalhesModal.hora_inicio)} às {formatarHora(detalhesModal.hora_fim)}</span>
              </div>
              <div className="detail-group">
                <strong>Tipo:</strong>
                <span>{getTipoAtendimentoBadge(detalhesModal.tipo_atendimento)}</span>
              </div>
              <div className="detail-group">
                <strong>Status:</strong>
                <span>{getStatusBadge(detalhesModal.status)}</span>
              </div>
              {detalhesModal.observacoes && (
                <div className="detail-group">
                  <strong>Observações:</strong>
                  <span>{detalhesModal.observacoes}</span>
                </div>
              )}
              {detalhesModal.status === 'cancelado' && (
                <>
                  <div className="detail-group">
                    <strong>Cancelado por:</strong>
                    <span>{detalhesModal.cancelado_por}</span>
                  </div>
                  <div className="detail-group">
                    <strong>Motivo:</strong>
                    <span>{detalhesModal.motivo_cancelamento}</span>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetalhesModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setEditarModal(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Editar Agendamento
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditarModal(null)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small">Residente</label>
                      <p className="fw-bold">{editarModal.Residente?.nome_completo}</p>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small">Profissional</label>
                      <p className="fw-bold">{editarModal.Profissional?.nome_completo}</p>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Data *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editarModal.data_agendamento}
                        onChange={(e) => setEditarModal({...editarModal, data_agendamento: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Hora Início *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={editarModal.hora_inicio}
                        onChange={(e) => setEditarModal({...editarModal, hora_inicio: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Hora Fim *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={editarModal.hora_fim}
                        onChange={(e) => setEditarModal({...editarModal, hora_fim: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Tipo de Atendimento *</label>
                      <select
                        className="form-select"
                        value={editarModal.tipo_atendimento}
                        onChange={(e) => setEditarModal({...editarModal, tipo_atendimento: e.target.value})}
                      >
                        <option value="consulta">Consulta</option>
                        <option value="fisioterapia">Fisioterapia</option>
                        <option value="psicologia">Psicologia</option>
                        <option value="nutricao">Nutrição</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Observações</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editarModal.observacoes || ''}
                        onChange={(e) => setEditarModal({...editarModal, observacoes: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditarModal(null)}>
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
    </div>
  )
}

export default ListagemAgendamentos
