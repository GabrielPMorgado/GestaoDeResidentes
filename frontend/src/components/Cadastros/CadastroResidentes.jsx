import { useState } from 'react'
import './CadastroResidentes.css'
import { criarResidente } from '../../api/api'

function CadastroResidentes() {
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
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  // Validação do Step 1 - Dados Pessoais
  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.nome_completo || formData.nome_completo.trim().length < 3) {
      newErrors.nome_completo = 'Nome completo deve ter pelo menos 3 caracteres'
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório'
    }
    // Validação de CPF simplificada - apenas verifica se tem 11 dígitos
    else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }

    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória'
    }

    if (!formData.sexo) {
      newErrors.sexo = 'Sexo é obrigatório'
    }

    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório'
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    return newErrors
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório'
    } else if (!/^\d{5}-?\d{3}$/.test(formData.cep)) {
      newErrors.cep = 'CEP inválido (use formato: 00000-000)'
    }

    if (!formData.logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório'
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório'
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório'
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória'
    }

    if (!formData.estado) {
      newErrors.estado = 'Estado é obrigatório'
    }

    return newErrors
  }

  const validateStep3 = () => {
    const newErrors = {}

    if (!formData.nome_responsavel || formData.nome_responsavel.trim().length < 3) {
      newErrors.nome_responsavel = 'Nome do responsável é obrigatório'
    }

    if (!formData.telefone_responsavel) {
      newErrors.telefone_responsavel = 'Telefone do responsável é obrigatório'
    } else if (!/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(formData.telefone_responsavel) && !/^\d{10,11}$/.test(formData.telefone_responsavel)) {
      newErrors.telefone_responsavel = 'Telefone do responsável inválido'
    }

    if (formData.email_responsavel && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_responsavel)) {
      newErrors.email_responsavel = 'E-mail do responsável inválido'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    let formattedValue = value
    
    // Formatar CPF automaticamente
    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '') // Remove tudo que não é dígito
      if (formattedValue.length <= 11) {
        formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2')
        formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2')
        formattedValue = formattedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      }
    }
    
    // Formatar telefone automaticamente
    if (name === 'telefone' || name === 'telefone_responsavel') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length <= 11) {
        formattedValue = formattedValue.replace(/^(\d{2})(\d)/g, '($1) $2')
        formattedValue = formattedValue.replace(/(\d)(\d{4})$/, '$1-$2')
      }
    }
    
    // Formatar CEP automaticamente
    if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length <= 8) {
        formattedValue = formattedValue.replace(/^(\d{5})(\d)/, '$1-$2')
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar todos os steps antes de enviar
    const step1Errors = validateStep1()
    const step2Errors = validateStep2()
    const step3Errors = validateStep3()
    
    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      alert('❌ Por favor, corrija os erros no formulário antes de enviar.')
      // Voltar para o primeiro step com erro
      if (Object.keys(step1Errors).length > 0) {
        setCurrentStep(1)
      } else if (Object.keys(step2Errors).length > 0) {
        setCurrentStep(2)
      } else {
        setCurrentStep(3)
      }
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      const response = await criarResidente(formData)
      console.log('Residente cadastrado:', response)
      
      alert('✅ Residente cadastrado com sucesso!')
      
      // Limpar formulário após sucesso
      handleReset()
      setCurrentStep(1)
    } catch (err) {
      console.error('Erro ao cadastrar:', err)
      console.error('Detalhes do erro:', err.response?.data || err)
      const mensagemErro = err.response?.data?.message || err.message || 'Erro ao cadastrar residente. Tente novamente.'
      setError(mensagemErro)
      alert('❌ ' + mensagemErro)
    } finally {
      setLoading(false)
    }
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
    setError(null)
    setErrors({})
    setCurrentStep(1)
  }

  const nextStep = () => {
    // Validar step atual antes de avançar
    let stepErrors = {}
    
    if (currentStep === 1) {
      stepErrors = validateStep1()
    } else if (currentStep === 2) {
      stepErrors = validateStep2()
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      alert('❌ Por favor, corrija os erros antes de avançar.')
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  return (
    <div className="cadastro-residentes">
      <div className="container-fluid">
        {/* Header */}
        <div className="cadastro-header">
          <div className="row align-items-center mb-4">
            <div className="col">
              <h2 className="mb-1">
                <i className="bi bi-person-plus-fill me-3 text-primary"></i>
                Cadastro de Residentes
              </h2>
              <p className="text-muted mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Preencha todos os campos obrigatórios (*) para completar o cadastro
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps mb-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">
                    {currentStep > 1 ? <i className="bi bi-check-lg"></i> : '1'}
                  </div>
                  <div className="step-info">
                    <span className="step-title">Dados Pessoais</span>
                    <span className="step-desc">Informações básicas</span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">
                    {currentStep > 2 ? <i className="bi bi-check-lg"></i> : '2'}
                  </div>
                  <div className="step-info">
                    <span className="step-title">Endereço</span>
                    <span className="step-desc">Localização</span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-info">
                    <span className="step-title">Responsável</span>
                    <span className="step-desc">Contato emergencial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 - Dados Pessoais */}
          {currentStep === 1 && (
            <div className="form-step active">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">
                    <i className="bi bi-person-circle text-primary me-2"></i>
                    Dados Pessoais
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label htmlFor="nome_completo" className="form-label">
                        <i className="bi bi-person me-1"></i>
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.nome_completo ? 'is-invalid' : ''}`}
                        id="nome_completo"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        placeholder="Digite o nome completo"
                        required
                      />
                      {errors.nome_completo && (
                        <div className="invalid-feedback">{errors.nome_completo}</div>
                      )}
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="data_nascimento" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        className={`form-control form-control-lg ${errors.data_nascimento ? 'is-invalid' : ''}`}
                        id="data_nascimento"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleChange}
                        required
                      />
                      {errors.data_nascimento && (
                        <div className="invalid-feedback">{errors.data_nascimento}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <label htmlFor="cpf" className="form-label">
                        <i className="bi bi-card-text me-1"></i>
                        CPF *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cpf ? 'is-invalid' : ''}`}
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        maxLength="14"
                      />
                      {errors.cpf && (
                        <div className="invalid-feedback">{errors.cpf}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <label htmlFor="rg" className="form-label">
                        <i className="bi bi-card-heading me-1"></i>
                        RG
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="rg"
                        name="rg"
                        value={formData.rg}
                        onChange={handleChange}
                        placeholder="00.000.000-0"
                      />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <label htmlFor="sexo" className="form-label">
                        <i className="bi bi-gender-ambiguous me-1"></i>
                        Sexo *
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.sexo ? 'is-invalid' : ''}`}
                        id="sexo"
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outro">Outro</option>
                      </select>
                      {errors.sexo && (
                        <div className="invalid-feedback">{errors.sexo}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <label htmlFor="estado_civil" className="form-label">
                        <i className="bi bi-heart me-1"></i>
                        Estado Civil
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="estado_civil"
                        name="estado_civil"
                        value={formData.estado_civil}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="solteiro">Solteiro(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viuvo">Viúvo(a)</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <label htmlFor="telefone" className="form-label">
                        <i className="bi bi-telephone me-1"></i>
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        className={`form-control form-control-lg ${errors.telefone ? 'is-invalid' : ''}`}
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        maxLength="15"
                      />
                      {errors.telefone && (
                        <div className="invalid-feedback">{errors.telefone}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <label htmlFor="email" className="form-label">
                        <i className="bi bi-envelope me-1"></i>
                        E-mail
                      </label>
                      <input
                        type="email"
                        className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seuemail@exemplo.com"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Endereço */}
          {currentStep === 2 && (
            <div className="form-step active">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">
                    <i className="bi bi-geo-alt-fill text-success me-2"></i>
                    Endereço Residencial
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-12 col-sm-6 col-md-3">
                      <label htmlFor="cep" className="form-label">
                        <i className="bi bi-mailbox me-1"></i>
                        CEP *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cep ? 'is-invalid' : ''}`}
                        id="cep"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                        required
                      />
                      {errors.cep && (
                        <div className="invalid-feedback">{errors.cep}</div>
                      )}
                    </div>

                    <div className="col-12 col-md-7">
                      <label htmlFor="logradouro" className="form-label">
                        <i className="bi bi-signpost me-1"></i>
                        Logradouro *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.logradouro ? 'is-invalid' : ''}`}
                        id="logradouro"
                        name="logradouro"
                        value={formData.logradouro}
                        onChange={handleChange}
                        placeholder="Rua, Avenida, etc."
                        required
                      />
                      {errors.logradouro && (
                        <div className="invalid-feedback">{errors.logradouro}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-2">
                      <label htmlFor="numero" className="form-label">
                        <i className="bi bi-hash me-1"></i>
                        Número *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.numero ? 'is-invalid' : ''}`}
                        id="numero"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="123"
                        required
                      />
                      {errors.numero && (
                        <div className="invalid-feedback">{errors.numero}</div>
                      )}
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="complemento" className="form-label">
                        <i className="bi bi-building me-1"></i>
                        Complemento
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="complemento"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleChange}
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="bairro" className="form-label">
                        <i className="bi bi-map me-1"></i>
                        Bairro *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.bairro ? 'is-invalid' : ''}`}
                        id="bairro"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Nome do bairro"
                        required
                      />
                      {errors.bairro && (
                        <div className="invalid-feedback">{errors.bairro}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-8 col-md-8">
                      <label htmlFor="cidade" className="form-label">
                        <i className="bi bi-building-fill-check me-1"></i>
                        Cidade *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cidade ? 'is-invalid' : ''}`}
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Nome da cidade"
                        required
                      />
                      {errors.cidade && (
                        <div className="invalid-feedback">{errors.cidade}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-4 col-md-4">
                      <label htmlFor="estado" className="form-label">
                        <i className="bi bi-pin-map me-1"></i>
                        Estado *
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.estado ? 'is-invalid' : ''}`}
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                      >
                        <option value="">UF</option>
                        <option value="AC">AC</option>
                        <option value="AL">AL</option>
                        <option value="AP">AP</option>
                        <option value="AM">AM</option>
                        <option value="BA">BA</option>
                        <option value="CE">CE</option>
                        <option value="DF">DF</option>
                        <option value="ES">ES</option>
                        <option value="GO">GO</option>
                        <option value="MA">MA</option>
                        <option value="MT">MT</option>
                        <option value="MS">MS</option>
                        <option value="MG">MG</option>
                        <option value="PA">PA</option>
                        <option value="PB">PB</option>
                        <option value="PR">PR</option>
                        <option value="PE">PE</option>
                        <option value="PI">PI</option>
                        <option value="RJ">RJ</option>
                        <option value="RN">RN</option>
                        <option value="RS">RS</option>
                        <option value="RO">RO</option>
                        <option value="RR">RR</option>
                        <option value="SC">SC</option>
                        <option value="SP">SP</option>
                        <option value="SE">SE</option>
                        <option value="TO">TO</option>
                      </select>
                      {errors.estado && (
                        <div className="invalid-feedback">{errors.estado}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Responsável */}
          {currentStep === 3 && (
            <div className="form-step active">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">
                    <i className="bi bi-person-check-fill text-warning me-2"></i>
                    Contato de Emergência
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="nome_responsavel" className="form-label">
                        <i className="bi bi-person-badge me-1"></i>
                        Nome do Responsável *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.nome_responsavel ? 'is-invalid' : ''}`}
                        id="nome_responsavel"
                        name="nome_responsavel"
                        value={formData.nome_responsavel}
                        onChange={handleChange}
                        placeholder="Nome completo do responsável"
                      />
                      {errors.nome_responsavel && (
                        <div className="invalid-feedback">{errors.nome_responsavel}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 col-md-3">
                      <label htmlFor="parentesco_responsavel" className="form-label">
                        <i className="bi bi-people me-1"></i>
                        Parentesco
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="parentesco_responsavel"
                        name="parentesco_responsavel"
                        value={formData.parentesco_responsavel}
                        onChange={handleChange}
                        placeholder="Ex: Filho(a), Irmão(ã)"
                      />
                    </div>

                    <div className="col-12 col-sm-6 col-md-3">
                      <label htmlFor="telefone_responsavel" className="form-label">
                        <i className="bi bi-phone-vibrate me-1"></i>
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        className={`form-control form-control-lg ${errors.telefone_responsavel ? 'is-invalid' : ''}`}
                        id="telefone_responsavel"
                        name="telefone_responsavel"
                        value={formData.telefone_responsavel}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        maxLength="15"
                      />
                      {errors.telefone_responsavel && (
                        <div className="invalid-feedback">{errors.telefone_responsavel}</div>
                      )}
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="email_responsavel" className="form-label">
                        <i className="bi bi-envelope me-1"></i>
                        E-mail do Responsável
                      </label>
                      <input
                        type="email"
                        className={`form-control form-control-lg ${errors.email_responsavel ? 'is-invalid' : ''}`}
                        id="email_responsavel"
                        name="email_responsavel"
                        value={formData.email_responsavel}
                        onChange={handleChange}
                        placeholder="email@exemplo.com"
                      />
                      {errors.email_responsavel && (
                        <div className="invalid-feedback">{errors.email_responsavel}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="observacoes" className="form-label">
                        <i className="bi bi-chat-left-text me-1"></i>
                        Observações Adicionais
                      </label>
                      <textarea
                        className="form-control"
                        id="observacoes"
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Informações adicionais relevantes sobre o residente..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation mt-4">
            <div className="d-flex justify-content-between">
              <div>
                {currentStep > 1 && (
                  <button type="button" className="btn btn-outline-secondary btn-lg" onClick={prevStep}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Voltar
                  </button>
                )}
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-danger btn-lg" onClick={handleReset}>
                  <i className="bi bi-x-circle me-2"></i>
                  Limpar Tudo
                </button>
                {currentStep < 3 ? (
                  <button type="button" className="btn btn-primary btn-lg" onClick={nextStep}>
                    Próximo
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Finalizar Cadastro
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CadastroResidentes
