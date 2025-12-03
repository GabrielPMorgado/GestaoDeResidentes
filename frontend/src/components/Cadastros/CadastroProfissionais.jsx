import { useState } from 'react'
import { criarProfissional } from '../../api/api'
import { formatarCPF, formatarCelular, formatarCEP } from '../../utils/formatters'
import { useNotification } from '../../contexts/NotificationContext'

// Componente Input fora para evitar recriação
const Input = ({ label, name, type = 'text', required = false, icon, formData, errors, touched, handleChange, handleBlur, ...props }) => (
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
        value={formData[name] || ''}
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

// Componente Select fora para evitar recriação
const Select = ({ label, name, options, required = false, icon, formData, errors, touched, handleChange, handleBlur }) => (
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
        value={formData[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-900/50 border ${
          errors[name] && touched[name]
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-600 focus:ring-blue-500'
        } rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all appearance-none`}
      >
        <option value="">Selecione...</option>
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

function CadastroProfissionais() {
  const { success, error: showError } = useNotification()
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: '',
    celular: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    profissao: '',
    registro_profissional: '',
    especialidade: '',
    data_admissao: '',
    cargo: '',
    departamento: '',
    turno: '',
    salario: '',
    observacoes: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const steps = [
    { number: 1, title: 'Dados Pessoais', icon: 'bi-person-badge', description: 'Informações básicas' },
    { number: 2, title: 'Endereço', icon: 'bi-geo-alt', description: 'Localização' },
    { number: 3, title: 'Dados Profissionais', icon: 'bi-briefcase', description: 'Informações de trabalho' }
  ]

  const validateField = (name, value) => {
    switch (name) {
      case 'nome_completo':
        return value.trim().length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : ''
      case 'cpf':
        return value.replace(/\D/g, '').length !== 11 ? 'CPF deve ter 11 dígitos' : ''
      case 'data_nascimento':
        return !value ? 'Data de nascimento é obrigatória' : ''
      case 'sexo':
        return !value ? 'Sexo é obrigatório' : ''
      case 'celular':
        return !value ? 'Celular é obrigatório' : ''
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : ''
      case 'profissao':
        return value.trim().length < 3 ? 'Profissão deve ter pelo menos 3 caracteres' : ''
      case 'data_admissao':
        return !value ? 'Data de admissão é obrigatória' : ''
      default:
        return ''
    }
  }

  const validateStep = (step) => {
    const stepErrors = {}
    
    if (step === 1) {
      const fields = ['nome_completo', 'cpf', 'data_nascimento', 'sexo', 'celular', 'email']
      fields.forEach(field => {
        const error = validateField(field, formData[field])
        if (error) stepErrors[field] = error
      })
    } else if (step === 3) {
      const fields = ['profissao', 'data_admissao']
      fields.forEach(field => {
        const error = validateField(field, formData[field])
        if (error) stepErrors[field] = error
      })
    }
    
    return stepErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    let formattedValue = value
    if (name === 'cpf') formattedValue = formatarCPF(value)
    else if (name === 'celular') formattedValue = formatarCelular(value)
    else if (name === 'cep') formattedValue = formatarCEP(value)
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const allErrors = { ...validateStep(1), ...validateStep(2), ...validateStep(3) }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      showError('Por favor, corrija os erros no formulário')
      
      if (Object.keys(validateStep(1)).length > 0) setCurrentStep(1)
      else if (Object.keys(validateStep(2)).length > 0) setCurrentStep(2)
      else setCurrentStep(3)
      return
    }
    
    setLoading(true)

    try {
      await criarProfissional(formData)
      success('Profissional cadastrado com sucesso!')
      handleReset()
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao cadastrar profissional')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      nome_completo: '', cpf: '', rg: '', data_nascimento: '', sexo: '', celular: '',
      email: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '',
      cidade: '', estado: '', profissao: '', registro_profissional: '', especialidade: '',
      data_admissao: '', cargo: '', departamento: '', turno: '', salario: '', observacoes: ''
    })
    setErrors({})
    setTouched({})
    setCurrentStep(1)
  }

  const nextStep = () => {
    const stepErrors = validateStep(currentStep)
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      Object.keys(stepErrors).forEach(key => {
        setTouched(prev => ({ ...prev, [key]: true }))
      })
      showError('Por favor, corrija os erros antes de avançar')
      return
    }
    
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Wrappers que passam as props automaticamente
  const Input = (props) => (
    <Input 
      {...props} 
      formData={formData} 
      errors={errors} 
      touched={touched} 
      handleChange={handleChange} 
      handleBlur={handleBlur} 
    />
  )

  const Select = (props) => (
    <Select 
      {...props} 
      formData={formData} 
      errors={errors} 
      touched={touched} 
      handleChange={handleChange} 
      handleBlur={handleBlur} 
    />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
              <i className="bi bi-person-badge text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cadastro de Profissionais</h1>
              <p className="text-slate-400">Preencha todos os campos obrigatórios (*)</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-all ${
                  currentStep === step.number
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-lg shadow-emerald-500/20'
                    : currentStep > step.number
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    currentStep === step.number
                      ? 'bg-white text-emerald-600'
                      : currentStep > step.number
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <i className="bi bi-check-lg text-xl"></i>
                  ) : (
                    <i className={`bi ${step.icon}`}></i>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      currentStep >= step.number ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      currentStep === step.number ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-0.5 bg-slate-700 -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo"
                      name="nome_completo"
                      icon="bi-person"
                      required
                      placeholder="Digite o nome completo"
                    />
                  </div>

                  <Input
                    label="CPF"
                    name="cpf"
                    icon="bi-card-text"
                    required
                    placeholder="000.000.000-00"
                    maxLength="14"
                  />

                  <Input
                    label="RG"
                    name="rg"
                    icon="bi-card-heading"
                    placeholder="00.000.000-0"
                  />

                  <Input
                    label="Data de Nascimento"
                    name="data_nascimento"
                    type="date"
                    icon="bi-calendar"
                    required
                  />

                  <Select
                    label="Sexo"
                    name="sexo"
                    icon="bi-gender-ambiguous"
                    required
                    options={[
                      { value: 'M', label: 'Masculino' },
                      { value: 'F', label: 'Feminino' },
                      { value: 'Outro', label: 'Outro' }
                    ]}
                  />

                  <Input
                    label="Celular"
                    name="celular"
                    icon="bi-telephone"
                    required
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    icon="bi-envelope"
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="CEP"
                    name="cep"
                    icon="bi-mailbox"
                    placeholder="00000-000"
                    maxLength="9"
                  />

                  <div></div>

                  <div className="md:col-span-2">
                    <Input
                      label="Logradouro"
                      name="logradouro"
                      icon="bi-signpost"
                      placeholder="Rua, Avenida, etc"
                    />
                  </div>

                  <Input
                    label="Número"
                    name="numero"
                    icon="bi-hash"
                    placeholder="123"
                  />

                  <Input
                    label="Complemento"
                    name="complemento"
                    icon="bi-building"
                    placeholder="Apto, Bloco, etc"
                  />

                  <Input
                    label="Bairro"
                    name="bairro"
                    icon="bi-map"
                    placeholder="Nome do bairro"
                  />

                  <Input
                    label="Cidade"
                    name="cidade"
                    icon="bi-building"
                    placeholder="Nome da cidade"
                  />

                  <Select
                    label="Estado"
                    name="estado"
                    icon="bi-geo-alt"
                    options={[
                      { value: 'SP', label: 'São Paulo' },
                      { value: 'RJ', label: 'Rio de Janeiro' },
                      { value: 'MG', label: 'Minas Gerais' },
                      { value: 'ES', label: 'Espírito Santo' },
                      { value: 'BA', label: 'Bahia' },
                      { value: 'PR', label: 'Paraná' },
                      { value: 'SC', label: 'Santa Catarina' },
                      { value: 'RS', label: 'Rio Grande do Sul' }
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Dados Profissionais */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Profissão"
                    name="profissao"
                    icon="bi-briefcase"
                    required
                    placeholder="Ex: Médico, Enfermeiro, etc"
                  />

                  <Input
                    label="Registro Profissional"
                    name="registro_profissional"
                    icon="bi-shield-check"
                    placeholder="CRM, COREN, CRO, etc"
                  />

                  <Input
                    label="Especialidade"
                    name="especialidade"
                    icon="bi-award"
                    placeholder="Área de atuação"
                  />

                  <Input
                    label="Data de Admissão"
                    name="data_admissao"
                    type="date"
                    icon="bi-calendar-check"
                    required
                  />

                  <Input
                    label="Cargo"
                    name="cargo"
                    icon="bi-person-workspace"
                    placeholder="Função na instituição"
                  />

                  <Input
                    label="Departamento"
                    name="departamento"
                    icon="bi-building"
                    placeholder="Setor de trabalho"
                  />

                  <Select
                    label="Turno"
                    name="turno"
                    icon="bi-clock"
                    options={[
                      { value: 'Manhã', label: 'Manhã' },
                      { value: 'Tarde', label: 'Tarde' },
                      { value: 'Noite', label: 'Noite' },
                      { value: 'Integral', label: 'Integral' }
                    ]}
                  />

                  <Input
                    label="Salário"
                    name="salario"
                    type="number"
                    icon="bi-cash-coin"
                    placeholder="0.00"
                    step="0.01"
                  />

                  <div className="md:col-span-2">
                    <label htmlFor="observacoes" className="block text-sm font-medium text-slate-300 mb-2">
                      Observações
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Informações adicionais relevantes..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Voltar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  <span>Limpar</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
                  >
                    <span>Próximo</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        <span>Finalizar Cadastro</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CadastroProfissionais
