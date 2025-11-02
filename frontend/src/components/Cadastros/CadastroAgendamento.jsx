import { useState, useEffect } from 'react'
import './CadastroAgendamento.css'
import { criarAgendamento, listarResidentes, listarProfissionais } from '../../api/api'

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
      
      console.log('Residentes Response:', residentesRes)
      console.log('Profissionais Response:', profissionaisRes)
      
      const residentesList = residentesRes.data?.residentes || []
      const profissionaisList = profissionaisRes.data?.profissionais || []
      
      console.log('Lista de Residentes:', residentesList)
      console.log('Lista de Profissionais:', profissionaisList)
      
      setResidentes(residentesList)
      setProfissionais(profissionaisList)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
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
    if (error) setError(null)
  }

  const validarFormulario = () => {
    if (!formData.residente_id) {
      setError('Selecione um residente')
      return false
    }
    if (!formData.profissional_id) {
      setError('Selecione um profissional')
      return false
    }
    if (!formData.data_agendamento) {
      setError('Informe a data do agendamento')
      return false
    }
    if (!formData.hora_inicio) {
      setError('Informe a hora de início')
      return false
    }
    if (!formData.hora_fim) {
      setError('Informe a hora de término')
      return false
    }
    if (!formData.tipo_atendimento) {
      setError('Selecione o tipo de atendimento')
      return false
    }
    if (!formData.titulo) {
      setError('Informe o título do agendamento')
      return false
    }
    
    // Validar se hora_fim > hora_inicio
    if (formData.hora_fim <= formData.hora_inicio) {
      setError('A hora de término deve ser posterior à hora de início')
      return false
    }
    
    // Validar se data não está no passado
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataAgendamento = new Date(formData.data_agendamento + 'T00:00:00')
    
    if (dataAgendamento < hoje) {
      setError('A data do agendamento não pode ser no passado')
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
      console.log('Agendamento criado:', response)
      
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
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
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
                        className="form-select"
                        name="residente_id"
                        value={formData.residente_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione o residente...</option>
                        {residentes.map(residente => (
                          <option key={residente.id} value={residente.id}>
                            {residente.nome_completo} - CPF: {residente.cpf}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Profissional */}
                    <div className="col-md-6">
                      <label className="form-label required">
                        <i className="bi bi-person-badge me-1"></i>
                        Profissional
                      </label>
                      <select
                        className="form-select"
                        name="profissional_id"
                        value={formData.profissional_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione o profissional...</option>
                        {profissionais.map(profissional => (
                          <option key={profissional.id} value={profissional.id}>
                            {profissional.nome_completo} - {profissional.profissao}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Data */}
                    <div className="col-md-4">
                      <label className="form-label required">
                        <i className="bi bi-calendar-event me-1"></i>
                        Data do Agendamento
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="data_agendamento"
                        value={formData.data_agendamento}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* Hora Início */}
                    <div className="col-md-4">
                      <label className="form-label required">
                        <i className="bi bi-clock me-1"></i>
                        Hora de Início
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="hora_inicio"
                        value={formData.hora_inicio}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Hora Fim */}
                    <div className="col-md-4">
                      <label className="form-label required">
                        <i className="bi bi-clock-fill me-1"></i>
                        Hora de Término
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="hora_fim"
                        value={formData.hora_fim}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Tipo de Atendimento */}
                    <div className="col-md-6">
                      <label className="form-label required">
                        <i className="bi bi-clipboard-pulse me-1"></i>
                        Tipo de Atendimento
                      </label>
                      <select
                        className="form-select"
                        name="tipo_atendimento"
                        value={formData.tipo_atendimento}
                        onChange={handleChange}
                        required
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
                        className="form-control"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        placeholder="Ex: Consulta de rotina, Sessão de fisioterapia..."
                        required
                      />
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
