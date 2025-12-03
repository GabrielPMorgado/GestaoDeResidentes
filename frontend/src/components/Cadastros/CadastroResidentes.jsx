import { useState } from 'react'
import { criarResidente } from '../../api/api'
import { formatarCPF, formatarTelefone, formatarCEP } from '../../utils/formatters'
import { useNotification } from '../../contexts/NotificationContext'

// Componente Input fora para evitar recria��o
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

// Componente Select fora para evitar recria��o
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

function CadastroResidentes() {
  const { success, error: showError } = useNotification()
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: '',
    estado_civil: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    nome_responsavel: '',
    parentesco_responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',
    observacoes: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const steps = [
    { number: 1, title: 'Dados Pessoais', icon: 'bi-person', description: 'Informa��es b�sicas' },
    { number: 2, title: 'Endere�o', icon: 'bi-geo-alt', description: 'Localiza��o' },
    { number: 3, title: 'Respons�vel', icon: 'bi-people', description: 'Contato de emerg�ncia' }
  ]

  // Valida��es em tempo real
  const validateField = (name, value) => {
    switch (name) {
      case 'nome_completo':
      
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

  return value.trim().length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : ''
      case 'cpf':
      
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

  return value.replace(/\D/g, '').length !== 11 ? 'CPF deve ter 11 d�gitos' : ''
      case 'data_nascimento':
      
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

  return !value ? 'Data de nascimento � obrigat�ria' : ''
      case 'sexo':
      
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

  return !value ? 'Sexo � obrigat�rio' : ''
      case 'telefone':
      case 'telefone_responsavel':
      
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

  return !value ? 'Telefone � obrigat�rio' : ''
      case 'email':
      
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

  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inv�lido' : ''
      case 'email_responsavel':
      
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

  return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inv�lido' : ''
      case 'cep':
      
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

  return !/^\d{5}-?\d{3}$/.test(value) ? 'CEP inv�lido' : ''
      case 'logradouro':
      case 'numero':
      case 'bairro':
      case 'cidade':
      
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

  return !value.trim() ? 'Campo obrigat�rio' : ''
      case 'estado':
      
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

  return !value ? 'Estado � obrigat�rio' : ''
      case 'nome_responsavel':
      
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

  return value.trim().length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : ''
      default:
      
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

  return ''
    }
  }

  const validateStep = (step) => {
    const stepErrors = {}
    
    if (step === 1) {
      const fields = ['nome_completo', 'cpf', 'data_nascimento', 'sexo', 'telefone', 'email']
      fields.forEach(field => {
        const error = validateField(field, formData[field])
        if (error) stepErrors[field] = error
      })
    } else if (step === 2) {
      const fields = ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado']
      fields.forEach(field => {
        const error = validateField(field, formData[field])
        if (error) stepErrors[field] = error
      })
    } else if (step === 3) {
      const fields = ['nome_responsavel', 'telefone_responsavel']
      fields.forEach(field => {
        const error = validateField(field, formData[field])
        if (error) stepErrors[field] = error
      })
      if (formData.email_responsavel) {
        const error = validateField('email_responsavel', formData.email_responsavel)
        if (error) stepErrors.email_responsavel = error
      }
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

  return stepErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    let formattedValue = value
    if (name === 'cpf') formattedValue = formatarCPF(value)
    else if (name === 'telefone' || name === 'telefone_responsavel') formattedValue = formatarTelefone(value)
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
      showError('Por favor, corrija os erros no formul�rio')
      
      // Ir para o primeiro step com erro
      if (Object.keys(validateStep(1)).length > 0) setCurrentStep(1)
      else if (Object.keys(validateStep(2)).length > 0) setCurrentStep(2)
      else setCurrentStep(3)
    
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

  return
    }
    
    setLoading(true)

    try {
      await criarResidente(formData)
      success('Residente cadastrado com sucesso!')
      handleReset()
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao cadastrar residente')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      nome_completo: '', cpf: '', rg: '', data_nascimento: '', sexo: '', estado_civil: '',
      telefone: '', email: '', cep: '', logradouro: '', numero: '', complemento: '',
      bairro: '', cidade: '', estado: '', nome_responsavel: '', parentesco_responsavel: '',
      telefone_responsavel: '', email_responsavel: '', observacoes: ''
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
      showError('Por favor, corrija os erros antes de avan�ar')
    
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

  return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const Input = ({ label, name, type = 'text', required = false, icon, ...props }) => (
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

  const Select = ({ label, name, options, required = false, icon }) => (
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <i className="bi bi-person-plus text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cadastro de Residentes</h1>
              <p className="text-slate-400">Preencha todos os campos obrigat�rios (*)</p>
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
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20'
                    : currentStep > step.number
                    ? 'bg-emerald-600/20 border border-emerald-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    currentStep === step.number
                      ? 'bg-white text-blue-600'
                      : currentStep > step.number
                      ? 'bg-emerald-500 text-white'
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
                      currentStep === step.number ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                
                {/* Connector Line */}
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

                  <Select
                    label="Estado Civil"
                    name="estado_civil"
                    icon="bi-heart"
                    options={[
                      { value: 'Solteiro', label: 'Solteiro(a)' },
                      { value: 'Casado', label: 'Casado(a)' },
                      { value: 'Divorciado', label: 'Divorciado(a)' },
                      { value: 'Viuvo', label: 'Vi�vo(a)' }
                    ]}
                  />

                  <Input
                    label="Telefone"
                    name="telefone"
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

            {/* Step 2: Endere�o */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="CEP"
                    name="cep"
                    icon="bi-mailbox"
                    required
                    placeholder="00000-000"
                    maxLength="9"
                  />

                  <div></div>

                  <div className="md:col-span-2">
                    <Input
                      label="Logradouro"
                      name="logradouro"
                      icon="bi-signpost"
                      required
                      placeholder="Rua, Avenida, etc"
                    />
                  </div>

                  <Input
                    label="N�mero"
                    name="numero"
                    icon="bi-hash"
                    required
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
                    required
                    placeholder="Nome do bairro"
                  />

                  <Input
                    label="Cidade"
                    name="cidade"
                    icon="bi-building"
                    required
                    placeholder="Nome da cidade"
                  />

                  <Select
                    label="Estado"
                    name="estado"
                    icon="bi-geo-alt"
                    required
                    options={[
                      { value: 'AC', label: 'Acre' },
                      { value: 'AL', label: 'Alagoas' },
                      { value: 'AP', label: 'Amap�' },
                      { value: 'AM', label: 'Amazonas' },
                      { value: 'BA', label: 'Bahia' },
                      { value: 'CE', label: 'Cear�' },
                      { value: 'DF', label: 'Distrito Federal' },
                      { value: 'ES', label: 'Esp�rito Santo' },
                      { value: 'GO', label: 'Goi�s' },
                      { value: 'MA', label: 'Maranh�o' },
                      { value: 'MT', label: 'Mato Grosso' },
                      { value: 'MS', label: 'Mato Grosso do Sul' },
                      { value: 'MG', label: 'Minas Gerais' },
                      { value: 'PA', label: 'Par�' },
                      { value: 'PB', label: 'Para�ba' },
                      { value: 'PR', label: 'Paran�' },
                      { value: 'PE', label: 'Pernambuco' },
                      { value: 'PI', label: 'Piau�' },
                      { value: 'RJ', label: 'Rio de Janeiro' },
                      { value: 'RN', label: 'Rio Grande do Norte' },
                      { value: 'RS', label: 'Rio Grande do Sul' },
                      { value: 'RO', label: 'Rond�nia' },
                      { value: 'RR', label: 'Roraima' },
                      { value: 'SC', label: 'Santa Catarina' },
                      { value: 'SP', label: 'S�o Paulo' },
                      { value: 'SE', label: 'Sergipe' },
                      { value: 'TO', label: 'Tocantins' }
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Respons�vel */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome do Respons�vel"
                      name="nome_responsavel"
                      icon="bi-person-check"
                      required
                      placeholder="Nome completo do respons�vel"
                    />
                  </div>

                  <Input
                    label="Parentesco"
                    name="parentesco_responsavel"
                    icon="bi-people"
                    placeholder="Ex: Filho(a), C�njuge"
                  />

                  <Input
                    label="Telefone do Respons�vel"
                    name="telefone_responsavel"
                    icon="bi-telephone"
                    required
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Email do Respons�vel"
                      name="email_responsavel"
                      type="email"
                      icon="bi-envelope"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="observacoes" className="block text-sm font-medium text-slate-300 mb-2">
                      Observa��es
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Informa��es adicionais relevantes..."
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
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <span>Pr�ximo</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default CadastroResidentes

