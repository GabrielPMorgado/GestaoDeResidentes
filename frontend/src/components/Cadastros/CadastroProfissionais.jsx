import { useState } from 'react'
import { criarProfissional } from '../../api/api'
import './CadastroProfissionais.css'
import { formatarCPF, formatarCelular, formatarCEP } from '../../utils/formatters'

function CadastroProfissionais() {
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: '',
    celular: '',
    email: '',
    
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Dados Profissionais
    profissao: '',
    registro_profissional: '', // CRM, COREN, CRO, etc.
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
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  // Validação do Step 1 - Dados Pessoais (simplificada)
  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.nome_completo || formData.nome_completo.trim().length < 3) {
      newErrors.nome_completo = 'Nome completo é obrigatório (mínimo 3 caracteres)'
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório'
    }
    else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }

    return newErrors
  }

  // Validação do Step 2 - Endereço (opcional - sem validações obrigatórias)
  const validateStep2 = () => {
    return {}
  }

  // Validação do Step 3 - Dados Profissionais (apenas profissao obrigatória)
  const validateStep3 = () => {
    const newErrors = {}

    if (!formData.profissao || formData.profissao.trim().length < 3) {
      newErrors.profissao = 'Profissão é obrigatória'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    let formattedValue = value
    
    if (name === 'cpf') {
      formattedValue = formatarCPF(value)
    } else if (name === 'celular') {
      formattedValue = formatarCelular(value)
    } else if (name === 'cep') {
      formattedValue = formatarCEP(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
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
      
      // Navegar para o primeiro step com erro
      if (Object.keys(step1Errors).length > 0) {
        setCurrentStep(1)
      } else if (Object.keys(step2Errors).length > 0) {
        setCurrentStep(2)
      } else if (Object.keys(step3Errors).length > 0) {
        setCurrentStep(3)
      }
      
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await criarProfissional(formData)
      
      if (response.success) {
        alert('✅ Profissional cadastrado com sucesso!')
        handleReset()
        setCurrentStep(1)
      } else {
        throw new Error(response.message || 'Erro ao cadastrar profissional')
      }
    } catch (err) {
      const mensagemErro = err.response?.data?.message || err.message || 'Erro ao cadastrar profissional. Verifique os dados e tente novamente.'
      setError(mensagemErro)
      alert('❌ ERRO: ' + mensagemErro + '\n\nCampos obrigatórios: Nome Completo, CPF e Profissão')
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
    setError(null)
    setErrors({})
    setCurrentStep(1)
  }

  const nextStep = () => {
    // Validar o step atual antes de avançar
    let stepErrors = {}
    
    if (currentStep === 1) {
      stepErrors = validateStep1()
    } else if (currentStep === 2) {
      stepErrors = validateStep2()
    } else if (currentStep === 3) {
      stepErrors = validateStep3()
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      // Mostrar todos os erros
      const mensagensErro = Object.values(stepErrors).join('\n')
      alert('❌ Corrija os seguintes erros:\n\n' + mensagensErro)
      
      // Scroll para o topo para ver os campos com erro
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      setErrors({})
      // Scroll para o topo ao avançar
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
      // Scroll para o topo ao voltar
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="cadastro-profissionais">
      <div className="container-fluid">
        <div className="cadastro-header mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-2">
                <i className="bi bi-person-badge text-primary me-2"></i>
                Cadastro de Profissionais
              </h2>
              <p className="text-muted mb-0">
                Preencha os dados do profissional em {currentStep}/3 etapas
              </p>
            </div>
            <div className="step-counter">
              <span className="badge bg-primary fs-5">Etapa {currentStep} de 3</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps mb-4 mt-4">
            <div className="row">
              <div className="col-md-4">
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
              <div className="col-md-4">
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
              <div className="col-md-4">
                <div className={`step-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                  <div className="step-number">
                    {currentStep > 3 ? <i className="bi bi-check-lg"></i> : '3'}
                  </div>
                  <div className="step-info">
                    <span className="step-title">Dados Profissionais</span>
                    <span className="step-desc">Cargo e especialidade</span>
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
                    <div className="col-md-8">
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
                      />
                      {errors.nome_completo && (
                        <div className="invalid-feedback">{errors.nome_completo}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="data_nascimento" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        className={`form-control form-control-lg ${errors.data_nascimento ? 'is-invalid' : ''}`}
                        id="data_nascimento"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleChange}
                      />
                      {errors.data_nascimento && (
                        <div className="invalid-feedback">{errors.data_nascimento}</div>
                      )}
                    </div>

                    <div className="col-md-4">
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

                    <div className="col-md-4">
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

                    <div className="col-md-4">
                      <label htmlFor="sexo" className="form-label">
                        <i className="bi bi-gender-ambiguous me-1"></i>
                        Sexo
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.sexo ? 'is-invalid' : ''}`}
                        id="sexo"
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
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

                    <div className="col-md-4">
                      <label htmlFor="celular" className="form-label">
                        <i className="bi bi-phone me-1"></i>
                        Celular
                      </label>
                      <input
                        type="tel"
                        className={`form-control form-control-lg ${errors.celular ? 'is-invalid' : ''}`}
                        id="celular"
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        maxLength="15"
                      />
                      {errors.celular && (
                        <div className="invalid-feedback">{errors.celular}</div>
                      )}
                    </div>

                    <div className="col-md-4">
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
                        placeholder="email@exemplo.com"
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
                    Endereço Residencial (Opcional)
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label htmlFor="cep" className="form-label">
                        <i className="bi bi-mailbox me-1"></i>
                        CEP
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cep ? 'is-invalid' : ''}`}
                        id="cep"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                      />
                      {errors.cep && (
                        <div className="invalid-feedback">{errors.cep}</div>
                      )}
                    </div>

                    <div className="col-md-7">
                      <label htmlFor="logradouro" className="form-label">
                        <i className="bi bi-signpost me-1"></i>
                        Logradouro
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.logradouro ? 'is-invalid' : ''}`}
                        id="logradouro"
                        name="logradouro"
                        value={formData.logradouro}
                        onChange={handleChange}
                        placeholder="Rua, Avenida, etc."
                      />
                      {errors.logradouro && (
                        <div className="invalid-feedback">{errors.logradouro}</div>
                      )}
                    </div>

                    <div className="col-md-2">
                      <label htmlFor="numero" className="form-label">
                        <i className="bi bi-hash me-1"></i>
                        Número
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.numero ? 'is-invalid' : ''}`}
                        id="numero"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="123"
                      />
                      {errors.numero && (
                        <div className="invalid-feedback">{errors.numero}</div>
                      )}
                    </div>

                    <div className="col-md-6">
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

                    <div className="col-md-6">
                      <label htmlFor="bairro" className="form-label">
                        <i className="bi bi-pin-map me-1"></i>
                        Bairro
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.bairro ? 'is-invalid' : ''}`}
                        id="bairro"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Nome do bairro"
                      />
                      {errors.bairro && (
                        <div className="invalid-feedback">{errors.bairro}</div>
                      )}
                    </div>

                    <div className="col-md-8">
                      <label htmlFor="cidade" className="form-label">
                        <i className="bi bi-building-fill me-1"></i>
                        Cidade
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cidade ? 'is-invalid' : ''}`}
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Nome da cidade"
                      />
                      {errors.cidade && (
                        <div className="invalid-feedback">{errors.cidade}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="estado" className="form-label">
                        <i className="bi bi-map me-1"></i>
                        Estado
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.estado ? 'is-invalid' : ''}`}
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
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

          {/* Step 3 - Dados Profissionais */}
          {currentStep === 3 && (
            <div className="form-step active">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="mb-4">
                    <i className="bi bi-briefcase-fill text-info me-2"></i>
                    Dados Profissionais
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="profissao" className="form-label">
                        <i className="bi bi-person-workspace me-1"></i>
                        Profissão *
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.profissao ? 'is-invalid' : ''}`}
                        id="profissao"
                        name="profissao"
                        value={formData.profissao}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="medico">Médico(a)</option>
                        <option value="enfermeiro">Enfermeiro(a)</option>
                        <option value="tecnico_enfermagem">Técnico(a) de Enfermagem</option>
                        <option value="fisioterapeuta">Fisioterapeuta</option>
                        <option value="nutricionista">Nutricionista</option>
                        <option value="psicologo">Psicólogo(a)</option>
                        <option value="farmaceutico">Farmacêutico(a)</option>
                        <option value="cuidador">Cuidador(a)</option>
                        <option value="administrativo">Administrativo</option>
                        <option value="recepcionista">Recepcionista</option>
                        <option value="auxiliar_limpeza">Auxiliar de Limpeza</option>
                        <option value="cozinheiro">Cozinheiro(a)</option>
                        <option value="seguranca">Segurança</option>
                        <option value="outro">Outro</option>
                      </select>
                      {errors.profissao && (
                        <div className="invalid-feedback">{errors.profissao}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="registro_profissional" className="form-label">
                        <i className="bi bi-award me-1"></i>
                        Registro Profissional
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.registro_profissional ? 'is-invalid' : ''}`}
                        id="registro_profissional"
                        name="registro_profissional"
                        value={formData.registro_profissional}
                        onChange={handleChange}
                        placeholder="CRM, COREN, CRO, etc."
                      />
                      {errors.registro_profissional && (
                        <div className="invalid-feedback">{errors.registro_profissional}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="especialidade" className="form-label">
                        <i className="bi bi-mortarboard me-1"></i>
                        Especialidade
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.especialidade ? 'is-invalid' : ''}`}
                        id="especialidade"
                        name="especialidade"
                        value={formData.especialidade}
                        onChange={handleChange}
                        placeholder="Ex: Geriatria, Cardiologia, etc."
                      />
                      {errors.especialidade && (
                        <div className="invalid-feedback">{errors.especialidade}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="data_admissao" className="form-label">
                        <i className="bi bi-calendar-check me-1"></i>
                        Data de Admissão
                      </label>
                      <input
                        type="date"
                        className={`form-control form-control-lg ${errors.data_admissao ? 'is-invalid' : ''}`}
                        id="data_admissao"
                        name="data_admissao"
                        value={formData.data_admissao}
                        onChange={handleChange}
                      />
                      {errors.data_admissao && (
                        <div className="invalid-feedback">{errors.data_admissao}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="cargo" className="form-label">
                        <i className="bi bi-person-badge-fill me-1"></i>
                        Cargo
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.cargo ? 'is-invalid' : ''}`}
                        id="cargo"
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleChange}
                        placeholder="Ex: Enfermeiro Chefe"
                      />
                      {errors.cargo && (
                        <div className="invalid-feedback">{errors.cargo}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="departamento" className="form-label">
                        <i className="bi bi-diagram-3 me-1"></i>
                        Departamento
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="enfermaria">Enfermaria</option>
                        <option value="clinica">Clínica Médica</option>
                        <option value="administracao">Administração</option>
                        <option value="cozinha">Cozinha/Nutrição</option>
                        <option value="limpeza">Limpeza e Higiene</option>
                        <option value="seguranca">Segurança</option>
                        <option value="recepcao">Recepção</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="turno" className="form-label">
                        <i className="bi bi-clock me-1"></i>
                        Turno de Trabalho
                      </label>
                      <select
                        className={`form-select form-select-lg ${errors.turno ? 'is-invalid' : ''}`}
                        id="turno"
                        name="turno"
                        value={formData.turno}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="manha">Manhã (6h-14h)</option>
                        <option value="tarde">Tarde (14h-22h)</option>
                        <option value="noite">Noite (22h-6h)</option>
                        <option value="integral">Integral (8h-18h)</option>
                        <option value="plantao_12h">Plantão 12h</option>
                        <option value="plantao_24h">Plantão 24h</option>
                      </select>
                      {errors.turno && (
                        <div className="invalid-feedback">{errors.turno}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="salario" className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>
                        Salário Base
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="salario"
                        name="salario"
                        value={formData.salario}
                        onChange={handleChange}
                        placeholder="R$ 0,00"
                      />
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
                <button type="button" className="btn btn-outline-danger btn-lg" onClick={handleReset} disabled={loading}>
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
                        Cadastrando...
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

        {/* Mensagem de Erro */}
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default CadastroProfissionais
