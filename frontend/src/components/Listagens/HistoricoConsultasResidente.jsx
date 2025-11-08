import { useState, useEffect } from 'react'
import { listarHistoricoConsultas, listarAgendamentos } from '../../api/api'

function HistoricoConsultasResidente({ residenteId, residenteNome, onVoltar }) {
  const [historicoConsultas, setHistoricoConsultas] = useState([])
  const [consultasFiltradas, setConsultasFiltradas] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [filtroDia, setFiltroDia] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    carregarHistorico()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenteId])

  useEffect(() => {
    aplicarFiltros()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicoConsultas, filtroDia, filtroMes, filtroAno, filtroStatus])

  const carregarHistorico = async () => {
    setLoading(true)
    
    try {
      // Buscar tanto consultas do histórico quanto agendamentos
      const [historicoResponse, agendamentosResponse] = await Promise.all([
        listarHistoricoConsultas(residenteId),
        listarAgendamentos({ residente_id: residenteId })
      ])
      
      let todasConsultas = []
      
      // Adicionar histórico de consultas
      if (historicoResponse.success) {
        todasConsultas = [...(historicoResponse.data?.consultas || [])]
      }
      
      // Adicionar agendamentos (incluindo cancelados)
      if (agendamentosResponse.success) {
        const agendamentos = agendamentosResponse.data?.agendamentos || []
        const agendamentosFormatados = agendamentos.map(ag => ({
          id: `ag-${ag.id}`,
          data_consulta: ag.data,
          profissional: ag.Profissional,
          tipo_consulta: ag.tipo_atendimento,
          diagnostico: ag.observacoes || '-',
          status: ag.status,
          origem: 'agendamento'
        }))
        todasConsultas = [...todasConsultas, ...agendamentosFormatados]
      }
      
      // Ordenar por data (mais recente primeiro)
      todasConsultas.sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))
      
      setHistoricoConsultas(todasConsultas)
      setConsultasFiltradas(todasConsultas)
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
      setHistoricoConsultas([])
      setConsultasFiltradas([])
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let consultasFiltro = [...historicoConsultas]

    // Filtro por data
    if (filtroDia || filtroMes || filtroAno) {
      consultasFiltro = consultasFiltro.filter(consulta => {
        const dataConsulta = new Date(consulta.data_consulta)
        const dia = dataConsulta.getDate()
        const mes = dataConsulta.getMonth() + 1
        const ano = dataConsulta.getFullYear()

        const matchDia = !filtroDia || dia === parseInt(filtroDia)
        const matchMes = !filtroMes || mes === parseInt(filtroMes)
        const matchAno = !filtroAno || ano === parseInt(filtroAno)

        return matchDia && matchMes && matchAno
      })
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      consultasFiltro = consultasFiltro.filter(c => c.status === filtroStatus)
    }

    setConsultasFiltradas(consultasFiltro)
  }

  const limparFiltros = () => {
    setFiltroDia('')
    setFiltroMes('')
    setFiltroAno('')
    setFiltroStatus('todos')
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3 text-muted h5">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Cabeçalho Premium */}
      <div className="bg-white shadow-sm mb-4">
        <div className="container-fluid">
          <div className="row align-items-center py-4 px-3">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-clock-history text-primary fs-2"></i>
                </div>
                <div>
                  <h3 className="mb-1 fw-bold text-dark">
                    Histórico de Consultas Médicas
                  </h3>
                  <p className="mb-0 text-muted d-flex align-items-center">
                    <i className="bi bi-person-fill-check me-2 text-primary"></i>
                    <span className="fw-semibold">{residenteNome}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <button className="btn btn-outline-primary" onClick={onVoltar}>
                <i className="bi bi-arrow-left-circle me-2"></i>
                Voltar à Listagem
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* Filtros Avançados */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-sliders me-2"></i>
                Filtros Avançados
              </h5>
              <button className="btn btn-sm btn-light" onClick={limparFiltros}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Limpar Filtros
              </button>
            </div>
          </div>
          
          <div className="card-body bg-light">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary mb-1">
                  <i className="bi bi-calendar-day me-1"></i>
                  Dia
                </label>
                <select 
                  className="form-select form-select-sm shadow-sm"
                  value={filtroDia}
                  onChange={(e) => setFiltroDia(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary mb-1">
                  <i className="bi bi-calendar-month me-1"></i>
                  Mês
                </label>
                <select 
                  className="form-select form-select-sm shadow-sm"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="1">📅 Janeiro</option>
                  <option value="2">📅 Fevereiro</option>
                  <option value="3">📅 Março</option>
                  <option value="4">📅 Abril</option>
                  <option value="5">📅 Maio</option>
                  <option value="6">📅 Junho</option>
                  <option value="7">📅 Julho</option>
                  <option value="8">📅 Agosto</option>
                  <option value="9">📅 Setembro</option>
                  <option value="10">📅 Outubro</option>
                  <option value="11">📅 Novembro</option>
                  <option value="12">📅 Dezembro</option>
                </select>
              </div>
              
              <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary mb-1">
                  <i className="bi bi-calendar-year me-1"></i>
                  Ano
                </label>
                <select 
                  className="form-select form-select-sm shadow-sm"
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary mb-1">
                  <i className="bi bi-filter-circle me-1"></i>
                  Status da Consulta
                </label>
                <select 
                  className="form-select form-select-sm shadow-sm"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="todos">📋 Todos os Status</option>
                  <option value="realizada">✅ Realizadas</option>
                  <option value="confirmado">✔️ Confirmadas</option>
                  <option value="pendente">⏳ Pendentes</option>
                  <option value="cancelado">❌ Canceladas</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary mb-1">
                  <i className="bi bi-graph-up me-1"></i>
                  Resultados
                </label>
                <div className="alert alert-info mb-0 py-2 text-center shadow-sm">
                  <strong className="fs-5">{consultasFiltradas.length}</strong>
                  <small className="d-block text-muted">consulta(s)</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {consultasFiltradas.length === 0 ? (
          <div className="text-center py-5">
            <div className="card shadow-sm border-0 py-5">
              <div className="card-body">
                <div className="mb-4">
                  <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                </div>
                <h4 className="fw-bold text-dark mb-3">
                  <i className="bi bi-search me-2"></i>
                  Nenhuma consulta encontrada
                </h4>
                <p className="text-muted mb-0 lead">
                  {historicoConsultas.length === 0 
                    ? '📋 Este residente ainda não possui histórico de atendimentos médicos.'
                    : '🔍 Nenhuma consulta corresponde aos filtros selecionados. Tente ajustar os critérios de busca.'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas Premium */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s' }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-primary bg-gradient rounded-3 p-3 shadow">
                          <i className="bi bi-calendar-check-fill text-white fs-1"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0 fw-bold text-primary">{consultasFiltradas.length}</h2>
                        <p className="mb-0 text-muted small fw-semibold">TOTAL DE CONSULTAS</p>
                      </div>
                    </div>
                    <div className="progress mt-3" style={{ height: '4px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s' }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-success bg-gradient rounded-3 p-3 shadow">
                          <i className="bi bi-check-circle-fill text-white fs-1"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0 fw-bold text-success">
                          {consultasFiltradas.filter(c => c.status === 'realizada' || c.status === 'confirmado').length}
                        </h2>
                        <p className="mb-0 text-muted small fw-semibold">REALIZADAS</p>
                      </div>
                    </div>
                    <div className="progress mt-3" style={{ height: '4px' }}>
                      <div className="progress-bar bg-success" style={{ 
                        width: `${(consultasFiltradas.filter(c => c.status === 'realizada' || c.status === 'confirmado').length / consultasFiltradas.length) * 100}%` 
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s' }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-danger bg-gradient rounded-3 p-3 shadow">
                          <i className="bi bi-x-circle-fill text-white fs-1"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0 fw-bold text-danger">
                          {consultasFiltradas.filter(c => c.status === 'cancelado').length}
                        </h2>
                        <p className="mb-0 text-muted small fw-semibold">CANCELADAS</p>
                      </div>
                    </div>
                    <div className="progress mt-3" style={{ height: '4px' }}>
                      <div className="progress-bar bg-danger" style={{ 
                        width: `${(consultasFiltradas.filter(c => c.status === 'cancelado').length / consultasFiltradas.length) * 100}%` 
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s' }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-warning bg-gradient rounded-3 p-3 shadow">
                          <i className="bi bi-clock-fill text-white fs-1"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h2 className="mb-0 fw-bold text-warning">
                          {consultasFiltradas.filter(c => c.status === 'pendente').length}
                        </h2>
                        <p className="mb-0 text-muted small fw-semibold">PENDENTES</p>
                      </div>
                    </div>
                    <div className="progress mt-3" style={{ height: '4px' }}>
                      <div className="progress-bar bg-warning" style={{ 
                        width: `${(consultasFiltradas.filter(c => c.status === 'pendente').length / consultasFiltradas.length) * 100}%` 
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline de Consultas Premium */}
            <div className="row g-4">
              {consultasFiltradas.map((consulta, index) => (
                <div key={consulta.id} className="col-12" style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}>
                  <div className="card border-0 shadow hover-lift" style={{ transition: 'all 0.3s', borderRadius: '12px' }}>
                    {/* Header Colorido */}
                    <div className="card-header border-0 bg-gradient text-white" style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px 12px 0 0'
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-white bg-opacity-25 rounded-3 p-3">
                            <i className="bi bi-calendar-event-fill fs-3"></i>
                          </div>
                          <div>
                            <h5 className="mb-0 fw-bold">{formatarData(consulta.data_consulta)}</h5>
                            <small className="text-white-50 text-capitalize fw-semibold">
                              {new Date(consulta.data_consulta).toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </small>
                          </div>
                        </div>
                        <span className={`badge ${
                          consulta.status === 'realizada' ? 'bg-success' :
                          consulta.status === 'confirmado' ? 'bg-info' :
                          consulta.status === 'cancelado' ? 'bg-danger' :
                          consulta.status === 'pendente' ? 'bg-warning text-dark' :
                          'bg-secondary'
                        } px-4 py-2 fs-6 shadow`}>
                          <i className={`bi ${
                            consulta.status === 'realizada' ? 'bi-check-circle-fill' :
                            consulta.status === 'confirmado' ? 'bi-check2-circle' :
                            consulta.status === 'cancelado' ? 'bi-x-circle-fill' :
                            consulta.status === 'pendente' ? 'bi-clock-fill' :
                            'bi-circle'
                          } me-2`}></i>
                          {consulta.status?.toUpperCase() || 'INDEFINIDO'}
                        </span>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      {/* Profissional */}
                      <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                        <div className="bg-primary bg-gradient rounded-3 p-3 shadow-sm">
                          <i className="bi bi-person-circle text-white fs-1"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="mb-2 fw-bold text-dark">
                            <i className="bi bi-person-badge-fill text-primary me-2"></i>
                            {consulta.profissional?.nome_completo || 'Profissional não informado'}
                          </h5>
                          <div className="d-flex gap-2 flex-wrap">
                            <span className="badge bg-light text-dark border shadow-sm px-3 py-2">
                              <i className="bi bi-card-text me-1"></i>
                              <strong>Registro:</strong> {consulta.profissional?.registro_profissional || '-'}
                            </span>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary shadow-sm px-3 py-2">
                              <i className="bi bi-hospital me-1"></i>
                              <strong>Especialidade:</strong> {consulta.profissional?.especialidade || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes em Cards */}
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card bg-info bg-opacity-10 border-info border-start border-4 shadow-sm h-100">
                            <div className="card-body">
                              <div className="d-flex gap-3 align-items-start">
                                <i className="bi bi-clipboard-pulse-fill text-info fs-2 mt-1"></i>
                                <div className="flex-grow-1">
                                  <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                    Tipo de Atendimento
                                  </small>
                                  <p className="mb-0 fw-semibold fs-6 text-dark">
                                    {consulta.tipo_consulta || 'Não especificado'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card bg-secondary bg-opacity-10 border-secondary border-start border-4 shadow-sm h-100">
                            <div className="card-body">
                              <div className="d-flex gap-3 align-items-start">
                                <i className="bi bi-file-text-fill text-secondary fs-2 mt-1"></i>
                                <div className="flex-grow-1">
                                  <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                    Observações Médicas
                                  </small>
                                  <p className="mb-0 fw-semibold fs-6 text-dark">
                                    {consulta.diagnostico || 'Sem observações registradas'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      {consulta.origem === 'agendamento' && (
                        <div className="mt-3 pt-3 border-top">
                          <span className="badge bg-light text-dark border shadow-sm px-3 py-2">
                            <i className="bi bi-calendar3-fill me-2"></i>
                            Origem: <strong>Agendamento</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HistoricoConsultasResidente
