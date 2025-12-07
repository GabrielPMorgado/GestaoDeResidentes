import { useState } from 'react'
import { criarResidente } from '../../api/axios'
import { formatarCPF, formatarTelefone, formatarCEP } from '../../utils/formatters'
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
    { number: 1, title: 'Dados Pessoais', icon: 'bi-person', description: 'Informações básicas' },
    { number: 2, title: 'Endereço', icon: 'bi-geo-alt', description: 'Localização' },
    { number: 3, title: 'Responsável', icon: 'bi-people', description: 'Contato de emergência' }
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
      case 'telefone':
      case 'telefone_responsavel':
        return !value ? 'Telefone é obrigatório' : ''
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : ''
      case 'email_responsavel':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : ''
      case 'cep':
        return !/^\d{5}-?\d{3}$/.test(value) ? 'CEP inválido' : ''
      case 'logradouro':
      case 'numero':
      case 'bairro':
      case 'cidade':
        return !value.trim() ? 'Campo obrigatório' : ''
      case 'estado':
        return !value ? 'Estado é obrigatório' : ''
      case 'nome_responsavel':
        return value.trim().length < 3 ? 'Nome do responsável deve ter pelo menos 3 caracteres' : ''
      default:
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
        const emailError = validateField('email_responsavel', formData.email_responsavel)
        if (emailError) stepErrors.email_responsavel = emailError
      }
    }
    
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

  const nextStep = () => {
    const stepErrors = validateStep(currentStep)
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }))
      })
      showError('Por favor, corrija os erros antes de continuar')
      return
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleReset = () => {
    setFormData({
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
    setErrors({})
    setTouched({})
    setCurrentStep(1)
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
      await criarResidente(formData)
      success('Residente cadastrado com sucesso!')
      handleReset()
    } catch (error) {
      console.error('Erro ao cadastrar residente:', error)
      showError(error.response?.data?.error || 'Erro ao cadastrar residente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-person-plus text-xl sm:text-2xl text-white"></i>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Cadastro de Residentes</h1>
              <p className="text-xs sm:text-sm text-slate-400">Preencha todos os campos obrigatórios (*)</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className={`relative flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-xl transition-all ${
                  currentStep === step.number
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20'
                    : currentStep > step.number
                    ? 'bg-emerald-600/20 border border-emerald-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    currentStep === step.number
                      ? 'bg-white text-blue-600'
                      : currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <i className="bi bi-check-lg text-lg sm:text-xl"></i>
                  ) : (
                    <i className={`bi ${step.icon} text-sm sm:text-base`}></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      currentStep >= step.number ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm hidden xs:block ${
                      currentStep === step.number ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-8 w-16 h-0.5 bg-slate-700 -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/50 p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo"
                      name="nome_completo"
                      icon="bi-person"
                      required
                      placeholder="Digite o nome completo"
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                  </div>

                  <Input
                    label="CPF"
                    name="cpf"
                    icon="bi-card-text"
                    required
                    placeholder="000.000.000-00"
                    maxLength="14"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="RG"
                    name="rg"
                    icon="bi-card-heading"
                    placeholder="00.000.000-0"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Data de Nascimento"
                    name="data_nascimento"
                    type="date"
                    icon="bi-calendar"
                    required
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Select
                    label="Sexo"
                    name="sexo"
                    icon="bi-gender-ambiguous"
                    required
                    options={[
                      { value: 'masculino', label: 'Masculino' },
                      { value: 'feminino', label: 'Feminino' },
                      { value: 'outro', label: 'Outro' }
                    ]}
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Select
                    label="Estado Civil"
                    name="estado_civil"
                    icon="bi-heart"
                    options={[
                      { value: 'solteiro', label: 'Solteiro(a)' },
                      { value: 'casado', label: 'Casado(a)' },
                      { value: 'divorciado', label: 'Divorciado(a)' },
                      { value: 'viuvo', label: 'Viúvo(a)' },
                      { value: 'outro', label: 'Outro' }
                    ]}
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Telefone"
                    name="telefone"
                    icon="bi-telephone"
                    required
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    icon="bi-envelope"
                    required
                    placeholder="email@exemplo.com"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Input
                    label="CEP"
                    name="cep"
                    icon="bi-mailbox"
                    required
                    placeholder="00000-000"
                    maxLength="9"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <div></div>

                  <div className="md:col-span-2">
                    <Input
                      label="Logradouro"
                      name="logradouro"
                      icon="bi-signpost"
                      required
                      placeholder="Rua, Avenida, etc"
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                  </div>

                  <Input
                    label="Número"
                    name="numero"
                    icon="bi-hash"
                    required
                    placeholder="123"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Complemento"
                    name="complemento"
                    icon="bi-building"
                    placeholder="Apto, Bloco, etc"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Bairro"
                    name="bairro"
                    icon="bi-map"
                    required
                    placeholder="Nome do bairro"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Cidade"
                    name="cidade"
                    icon="bi-building"
                    required
                    placeholder="Nome da cidade"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Select
                    label="Estado"
                    name="estado"
                    icon="bi-geo-alt"
                    required
                    options={[
                      { value: 'AC', label: 'Acre' },
                      { value: 'AL', label: 'Alagoas' },
                      { value: 'AP', label: 'Amapá' },
                      { value: 'AM', label: 'Amazonas' },
                      { value: 'BA', label: 'Bahia' },
                      { value: 'CE', label: 'Ceará' },
                      { value: 'DF', label: 'Distrito Federal' },
                      { value: 'ES', label: 'Espírito Santo' },
                      { value: 'GO', label: 'Goiás' },
                      { value: 'MA', label: 'Maranhão' },
                      { value: 'MT', label: 'Mato Grosso' },
                      { value: 'MS', label: 'Mato Grosso do Sul' },
                      { value: 'MG', label: 'Minas Gerais' },
                      { value: 'PA', label: 'Pará' },
                      { value: 'PB', label: 'Paraíba' },
                      { value: 'PR', label: 'Paraná' },
                      { value: 'PE', label: 'Pernambuco' },
                      { value: 'PI', label: 'Piauí' },
                      { value: 'RJ', label: 'Rio de Janeiro' },
                      { value: 'RN', label: 'Rio Grande do Norte' },
                      { value: 'RS', label: 'Rio Grande do Sul' },
                      { value: 'RO', label: 'Rondônia' },
                      { value: 'RR', label: 'Roraima' },
                      { value: 'SC', label: 'Santa Catarina' },
                      { value: 'SP', label: 'São Paulo' },
                      { value: 'SE', label: 'Sergipe' },
                      { value: 'TO', label: 'Tocantins' }
                    ]}
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Responsável */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome do Responsável"
                      name="nome_responsavel"
                      icon="bi-person-check"
                      required
                      placeholder="Nome completo do responsável"
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                  </div>

                  <Input
                    label="Parentesco"
                    name="parentesco_responsavel"
                    icon="bi-people"
                    placeholder="Ex: Filho(a), Cônjuge"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <Input
                    label="Telefone do Responsável"
                    name="telefone_responsavel"
                    icon="bi-telephone"
                    required
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                    formData={formData}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Email do Responsável"
                      name="email_responsavel"
                      type="email"
                      icon="bi-envelope"
                      placeholder="email@exemplo.com"
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                  </div>

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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700">
              <div className="order-2 sm:order-1">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm sm:text-base font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Voltar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm sm:text-base font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  <span className="hidden xs:inline">Limpar</span>
                  <span className="xs:hidden">Limpar</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Próximo</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        <span className="hidden xs:inline">Finalizar Cadastro</span>
                        <span className="xs:hidden">Finalizar</span>
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
