import { useState, useEffect } from 'react'
import { criarAgendamento, listarResidentes, listarProfissionais } from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingSpinner } from '../Common'

function CadastroAgendamento() {
  const { success, error: showError } = useNotification()
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
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

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
      
      setResidentes(residentesRes.data?.residentes || [])
      setProfissionais(profissionaisRes.data?.profissionais || [])
    } catch {
      showError('Erro ao carregar dados')
    } finally {
      setLoadingData(false)
    }
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'residente_id':
        return !value ? 'Selecione um residente' : ''
      case 'profissional_id':
        return !value ? 'Selecione um profissional' : ''
      case 'data_agendamento':
        if (!value) return 'Informe a data'
        const dataAgendamento = new Date(value)
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        return dataAgendamento < hoje ? 'Data não pode ser no passado' : ''
      case 'hora_inicio':
        return !value ? 'Informe a hora de início' : ''
      case 'hora_fim':
        if (!value) return 'Informe a hora de término'
        if (formData.hora_inicio && value <= formData.hora_inicio) {
          return 'Deve ser posterior ao início'
        }
        return ''
      case 'tipo_atendimento':
        return !value ? 'Selecione o tipo' : ''
      case 'titulo':
        return value.trim().length < 3 ? 'Mínimo 3 caracteres' : ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const fields = ['residente_id', 'profissional_id', 'data_agendamento', 'hora_inicio', 'hora_fim', 'tipo_atendimento', 'titulo']
    const newErrors = {}
    
    fields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      fields.forEach(field => setTouched(prev => ({ ...prev, [field]: true })))
      showError('Por favor, corrija os erros no formulário')
      return
    }
    
    setLoading(true)

    try {
      await criarAgendamento(formData)
      success('Agendamento criado com sucesso!')
      handleReset()
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      residente_id: '', profissional_id: '', data_agendamento: '', hora_inicio: '',
      hora_fim: '', tipo_atendimento: '', titulo: '', descricao: '', local: '', observacoes: ''
    })
    setErrors({})
    setTouched({})
  }

  const InputField = ({ label, name, type = 'text', required = false, icon, ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`bi ${icon} text-slate-400`}></i>
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-900/50 border ${
            errors[name] && touched[name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-600 focus:ring-blue-500'
          } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
          {...props}
        />
      </div>
      {errors[name] && touched[name] && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <i className="bi bi-exclamation-circle text-xs"></i>
          {errors[name]}
        </p>
      )}
    </div>
  )

  const SelectField = ({ label, name, options, required = false, icon, placeholder = 'Selecione...' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <i className={`bi ${icon} text-slate-400`}></i>
          </div>
        )}
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-900/50 border ${
            errors[name] && touched[name]
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-600 focus:ring-blue-500'
          } rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <i className="bi bi-chevron-down text-slate-400"></i>
        </div>
      </div>
      {errors[name] && touched[name] && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <i className="bi bi-exclamation-circle text-xs"></i>
          {errors[name]}
        </p>
      )}
    </div>
  )

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dados..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <i className="bi bi-calendar-plus text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Novo Agendamento</h1>
              <p className="text-slate-400">Agende consultas e atendimentos para residentes</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Pessoas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Residente"
                name="residente_id"
                icon="bi-person"
                required
                placeholder="Selecione o residente"
                options={residentes.map(r => ({
                  value: r.id,
                  label: r.nome_completo
                }))}
              />

              <SelectField
                label="Profissional"
                name="profissional_id"
                icon="bi-person-badge"
                required
                placeholder="Selecione o profissional"
                options={profissionais.map(p => ({
                  value: p.id,
                  label: `${p.nome_completo} - ${p.profissao}`
                }))}
              />
            </div>

            {/* Data e Horários */}
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-clock text-amber-400"></i>
                Data e Horário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Data"
                  name="data_agendamento"
                  type="date"
                  icon="bi-calendar"
                  required
                />

                <InputField
                  label="Hora Início"
                  name="hora_inicio"
                  type="time"
                  icon="bi-clock"
                  required
                />

                <InputField
                  label="Hora Término"
                  name="hora_fim"
                  type="time"
                  icon="bi-clock-fill"
                  required
                />
              </div>
            </div>

            {/* Detalhes do Atendimento */}
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-file-earmark-text text-blue-400"></i>
                Detalhes do Atendimento
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Tipo de Atendimento"
                    name="tipo_atendimento"
                    icon="bi-grid"
                    required
                    options={[
                      { value: 'Consulta Médica', label: 'Consulta Médica' },
                      { value: 'Enfermagem', label: 'Enfermagem' },
                      { value: 'Fisioterapia', label: 'Fisioterapia' },
                      { value: 'Psicologia', label: 'Psicologia' },
                      { value: 'Nutrição', label: 'Nutrição' },
                      { value: 'Exame', label: 'Exame' },
                      { value: 'Procedimento', label: 'Procedimento' },
                      { value: 'Outro', label: 'Outro' }
                    ]}
                  />

                  <InputField
                    label="Local"
                    name="local"
                    icon="bi-geo-alt"
                    placeholder="Sala, consultório, etc"
                  />
                </div>

                <InputField
                  label="Título"
                  name="titulo"
                  icon="bi-card-heading"
                  required
                  placeholder="Título do agendamento"
                />

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Descreva o motivo do agendamento..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="observacoes" className="block text-sm font-medium text-slate-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Informações adicionais..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <i className="bi bi-arrow-clockwise"></i>
                <span>Limpar</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    <span>Criar Agendamento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CadastroAgendamento
