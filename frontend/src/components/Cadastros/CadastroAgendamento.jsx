import { useState, useEffect } from 'react'
import './CadastroAgendamento.css'
import { criarAgendamento, listarResidentes, listarProfissionais } from '../../api/api'
import { formatarCPF } from '../../utils/formatters'
import { validarDataFutura, validarObrigatorio } from '../../utils/validators'

function CadastroAgendamento() {

  const [formData, setFormData] = useState({
    residente_id: '',
    profissional_id: '',
    data_agendamento: '',
    hora_inicio: '',
    hora_fim: '',
    tipo_atendimento: '',
    titulo: '',
    descricao: '',
    local: '',
    observacoes: ''
  })

  const [residentes, setResidentes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  // Carregar residentes e profissionais ao montar o componente
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const [residentesRes, profissionaisRes] = await Promise.all([
        listarResidentes({ status: 'ativo', limit: 1000 }),
        listarProfissionais({ status: 'ativo', limit: 1000 })
      ])
      
      const residentesList = residentesRes.data?.residentes || []
      const profissionaisList = profissionaisRes.data?.profissionais || []
      
      setResidentes(residentesList)
      setProfissionais(profissionaisList)
    } catch (err) {
      setError('Erro ao carregar residentes e profissionais')
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro do campo específico quando usuário digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
    if (error) setError(null)
  }

  const validarFormulario = () => {
    const newErrors = {}
    
    if (!validarObrigatorio(formData.residente_id)) {
      newErrors.residente_id = 'Selecione um residente'
    }
    if (!validarObrigatorio(formData.profissional_id)) {
      newErrors.profissional_id = 'Selecione um profissional'
    }
    if (!validarObrigatorio(formData.data_agendamento)) {
      newErrors.data_agendamento = 'Informe a data do agendamento'
    } else if (!validarDataFutura(formData.data_agendamento)) {
      newErrors.data_agendamento = 'A data do agendamento não pode ser no passado'
    }
    
    if (!validarObrigatorio(formData.hora_inicio)) {
      newErrors.hora_inicio = 'Informe a hora de início'
    }
    if (!validarObrigatorio(formData.hora_fim)) {
      newErrors.hora_fim = 'Informe a hora de término'
    } else if (formData.hora_inicio && formData.hora_fim <= formData.hora_inicio) {
      newErrors.hora_fim = 'A hora de término deve ser posterior à hora de início'
    }
    
    if (!validarObrigatorio(formData.tipo_atendimento)) {
      newErrors.tipo_atendimento = 'Selecione o tipo de atendimento'
    }
    if (!formData.titulo || formData.titulo.trim().length < 3) {
      newErrors.titulo = 'Informe o título do agendamento (mínimo 3 caracteres)'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      const primeiroErro = Object.values(newErrors)[0]
      setError(primeiroErro)
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validarFormulario()) {
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      const response = await criarAgendamento(formData)
      
      alert('✅ Agendamento criado com sucesso!')
      
      // Limpar formulário após sucesso
      setFormData({
        residente_id: '',
        profissional_id: '',
        data_agendamento: '',
        hora_inicio: '',
        hora_fim: '',
        tipo_atendimento: '',
        titulo: '',
        descricao: '',
        local: '',
        observacoes: ''
      })
      setErrors({})
    } catch (err) {
      const mensagem = err.message || 'Erro ao criar agendamento. Tente novamente.'
      setError(mensagem)
      alert('❌ ' + mensagem)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      residente_id: '',
      profissional_id: '',
      data_agendamento: '',
      hora_inicio: '',
      hora_fim: '',
      tipo_atendimento: '',
      titulo: '',
      descricao: '',
      local: '',
      observacoes: ''
    })
    setError(null)
    setErrors({})
  }

  if (loadingData) {
    return (
      <div className="cadastro-agendamento">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando dados...</p>
        </div>
      </div>
    )
  }

  // Verificar se há residentes e profissionais cadastrados
  if (residentes.length === 0 || profissionais.length === 0) {
    return (
      <div className="cadastro-agendamento">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-header">
                <h2>
                  <i className="bi bi-calendar-plus me-2"></i>
                  Novo Agendamento
                </h2>
              </div>
              <div className="alert alert-warning d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                <div>
                  <strong>Atenção!</strong>
                  <p className="mb-0 mt-1">
                    {residentes.length === 0 && profissionais.length === 0 && 
                      'Não há residentes nem profissionais ativos cadastrados. Por favor, cadastre residentes e profissionais antes de criar agendamentos.'}
                    {residentes.length === 0 && profissionais.length > 0 && 
                      'Não há residentes ativos cadastrados. Por favor, cadastre residentes antes de criar agendamentos.'}
                    {residentes.length > 0 && profissionais.length === 0 && 
                      'Não há profissionais ativos cadastrados. Por favor, cadastre profissionais antes de criar agendamentos.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cadastro-agendamento">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-header">
              <h2>
                <i className="bi bi-calendar-plus me-2"></i>
                Novo Agendamento
              </h2>
              <p className="text-muted">Agende um atendimento para o residente</p>
            </div>

            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Residente */}
                    <div className="col-md-6">
                      <label className="form-label required">
                        <i className="bi bi-person me-1"></i>
                        Residente
                      </label>
                      <select
                        className={`form-select ${errors.residente_id ? 'is-invalid' : ''}`}
                        name="residente_id"
                        value={formData.residente_id}
                        onChange={handleChange}
                      >
                        <option value="">Selecione o residente...</option>
                        {residentes.map(residente => (
                          <option key={residente.id} value={residente.id}>
                            {residente.nome_completo} - CPF: {formatarCPF(residente.cpf)}
                          </option>
                        ))}
                      </select>
                      {errors.residente_id && (
                        <div className="invalid-feedback">{errors.residente_id}</div>
                      )}
                    </div>

                    {/* Profissional */}
                    <div className="col-md-6">
                      <label className="form-label required">
                        <i className="bi bi-person-badge me-1"></i>
                        Profissional
                      </label>
                      <select
                        className={`form-select ${errors.profissional_id ? 'is-invalid' : ''}`}
                        name="profissional_id"
                        value={formData.profissional_id}
                        onChange={handleChange}
                      >
                        <option value="">Selecione o profissional...</option>
                        {profissionais.map(profissional => (
                          <option key={profissional.id} value={profissional.id}>
                            {profissional.nome_completo} - {profissional.profissao}
                          </option>
                        ))}
                      </select>
                      {errors.profissional_id && (
                        <div className="invalid-feedback">{errors.profissional_id}</div>
                      )}
                    </div>

                    {/* Data */}
                    <div className="col-md-4">
                      <label className="form-label required">
                        <i className="bi bi-calendar-event me-1"></i>
                        Data do Agendamento
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.data_agendamento ? 'is-invalid' : ''}`}
                        name="data_agendamento"
                        value={formData.data_agendamento}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.data_agendamento && (
                        <div className="invalid-feedback">{errors.data_agendamento}</div>
                      )}
                    </div>

                    {/* Hora Início */}
                    <div className="col-md-4">
                      <label className="form-label required">
                        <i className="bi bi-clock me-1"></i>
                        Hora de Início
                      </label>
                      <input
                        type="time"
                        className={`form-control ${errors.hora_inicio ? 'is-invalid' : ''}`}
                        name="hora_inicio"
                        value={formData.hora_inicio}
                        onChange={handleChange}
                      />
                      {errors.hora_inicio && (
                        <div className="invalid-feedback">{errors.hora_inicio}</div>
                      )}
                    </div>

                    {/* Hora Fim */}
                    <div className="col-md-4">
                      <label className="form-label required">
                        <i className="bi bi-clock-fill me-1"></i>
                        Hora de Término
                      </label>
                      <input
                        type="time"
                        className={`form-control ${errors.hora_fim ? 'is-invalid' : ''}`}
                        name="hora_fim"
                        value={formData.hora_fim}
                        onChange={handleChange}
                      />
                      {errors.hora_fim && (
                        <div className="invalid-feedback">{errors.hora_fim}</div>
                      )}
                    </div>

                    {/* Tipo de Atendimento */}
                    <div className="col-md-6">
                      <label className="form-label required">
                        <i className="bi bi-clipboard-pulse me-1"></i>
                        Tipo de Atendimento
                      </label>
                      <select
                        className={`form-select ${errors.tipo_atendimento ? 'is-invalid' : ''}`}
                        name="tipo_atendimento"
                        value={formData.tipo_atendimento}
                        onChange={handleChange}
                      >
                        <option value="">Selecione o tipo...</option>
                        <option value="consulta_medica">Consulta Médica</option>
                        <option value="fisioterapia">Fisioterapia</option>
                        <option value="psicologia">Psicologia</option>
                        <option value="nutricao">Nutrição</option>
                        <option value="enfermagem">Enfermagem</option>
                        <option value="terapia_ocupacional">Terapia Ocupacional</option>
                        <option value="assistencia_social">Assistência Social</option>
                        <option value="outro">Outro</option>
                      </select>
                      {errors.tipo_atendimento && (
                        <div className="invalid-feedback">{errors.tipo_atendimento}</div>
                      )}
                    </div>

                    {/* Local */}
                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-geo-alt me-1"></i>
                        Local
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="local"
                        value={formData.local}
                        onChange={handleChange}
                        placeholder="Ex: Consultório 1, Sala de Fisioterapia..."
                      />
                    </div>

                    {/* Título */}
                    <div className="col-md-12">
                      <label className="form-label required">
                        <i className="bi bi-card-heading me-1"></i>
                        Título do Agendamento
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        placeholder="Ex: Consulta de rotina, Sessão de fisioterapia..."
                      />
                      {errors.titulo && (
                        <div className="invalid-feedback">{errors.titulo}</div>
                      )}
                    </div>

                    {/* Descrição */}
                    <div className="col-md-12">
                      <label className="form-label">
                        <i className="bi bi-card-text me-1"></i>
                        Descrição
                      </label>
                      <textarea
                        className="form-control"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Descrição detalhada do atendimento..."
                      ></textarea>
                    </div>

                    {/* Observações */}
                    <div className="col-md-12">
                      <label className="form-label">
                        <i className="bi bi-chat-left-text me-1"></i>
                        Observações
                      </label>
                      <textarea
                        className="form-control"
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Informações adicionais sobre o agendamento..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Limpar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Agendando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Agendar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CadastroAgendamento
