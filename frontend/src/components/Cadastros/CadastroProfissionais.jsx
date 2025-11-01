import { useState } from 'react'
import { criarProfissional } from '../../api/api'
import './CadastroProfissionais.css'

function CadastroProfissionais() {
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: '',
    estado_civil: '',
    telefone: '',
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
    
    // Contato de Emergência
    nome_emergencia: '',
    parentesco_emergencia: '',
    telefone_emergencia: '',
    
    // Documentação
    titulo_eleitor: '',
    numero_pis: '',
    carteira_trabalho: '',
    
    observacoes: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      console.error('Erro ao cadastrar profissional:', err)
      setError(err.message || 'Erro ao cadastrar profissional. Verifique os dados e tente novamente.')
      alert('❌ ' + (err.message || 'Erro ao cadastrar profissional'))
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
      nome_emergencia: '',
      parentesco_emergencia: '',
      telefone_emergencia: '',
      titulo_eleitor: '',
      numero_pis: '',
      carteira_trabalho: '',
      observacoes: ''
    })
    setError(null)
    setCurrentStep(1)
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
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
                Preencha os dados do profissional em {currentStep}/4 etapas
              </p>
            </div>
            <div className="step-counter">
              <span className="badge bg-primary fs-5">Etapa {currentStep} de 4</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps mb-4 mt-4">
            <div className="row">
              <div className="col-md-3">
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
              <div className="col-md-3">
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
              <div className="col-md-3">
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
              <div className="col-md-3">
                <div className={`step-item ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
                  <div className="step-number">4</div>
                  <div className="step-info">
                    <span className="step-title">Documentos</span>
                    <span className="step-desc">Emergência e docs</span>
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
                        className="form-control form-control-lg"
                        id="nome_completo"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        placeholder="Digite o nome completo"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="data_nascimento" className="form-label">
                        <i className="bi bi-calendar-event me-1"></i>
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        id="data_nascimento"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="cpf" className="form-label">
                        <i className="bi bi-card-text me-1"></i>
                        CPF *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        required
                      />
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
                        Sexo *
                      </label>
                      <select
                        className="form-select form-select-lg"
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
                    </div>

                    <div className="col-md-4">
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

                    <div className="col-md-4">
                      <label htmlFor="telefone" className="form-label">
                        <i className="bi bi-telephone me-1"></i>
                        Telefone Fixo
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 0000-0000"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="celular" className="form-label">
                        <i className="bi bi-phone me-1"></i>
                        Celular *
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        id="celular"
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="email" className="form-label">
                        <i className="bi bi-envelope me-1"></i>
                        E-mail *
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@exemplo.com"
                        required
                      />
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
                    <div className="col-md-3">
                      <label htmlFor="cep" className="form-label">
                        <i className="bi bi-mailbox me-1"></i>
                        CEP
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="cep"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                      />
                    </div>

                    <div className="col-md-7">
                      <label htmlFor="logradouro" className="form-label">
                        <i className="bi bi-signpost me-1"></i>
                        Logradouro
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="logradouro"
                        name="logradouro"
                        value={formData.logradouro}
                        onChange={handleChange}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>

                    <div className="col-md-2">
                      <label htmlFor="numero" className="form-label">
                        <i className="bi bi-hash me-1"></i>
                        Número
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="numero"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="123"
                      />
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
                        className="form-control form-control-lg"
                        id="bairro"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Nome do bairro"
                      />
                    </div>

                    <div className="col-md-8">
                      <label htmlFor="cidade" className="form-label">
                        <i className="bi bi-building-fill me-1"></i>
                        Cidade
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Nome da cidade"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="estado" className="form-label">
                        <i className="bi bi-map me-1"></i>
                        Estado
                      </label>
                      <select
                        className="form-select form-select-lg"
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
                        className="form-select form-select-lg"
                        id="profissao"
                        name="profissao"
                        value={formData.profissao}
                        onChange={handleChange}
                        required
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
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="registro_profissional" className="form-label">
                        <i className="bi bi-award me-1"></i>
                        Registro Profissional
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="registro_profissional"
                        name="registro_profissional"
                        value={formData.registro_profissional}
                        onChange={handleChange}
                        placeholder="CRM, COREN, CRO, etc."
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="especialidade" className="form-label">
                        <i className="bi bi-mortarboard me-1"></i>
                        Especialidade
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="especialidade"
                        name="especialidade"
                        value={formData.especialidade}
                        onChange={handleChange}
                        placeholder="Ex: Geriatria, Cardiologia, etc."
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="data_admissao" className="form-label">
                        <i className="bi bi-calendar-check me-1"></i>
                        Data de Admissão *
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        id="data_admissao"
                        name="data_admissao"
                        value={formData.data_admissao}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="cargo" className="form-label">
                        <i className="bi bi-person-badge-fill me-1"></i>
                        Cargo *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="cargo"
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleChange}
                        placeholder="Ex: Enfermeiro Chefe"
                        required
                      />
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
                        Turno de Trabalho *
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="turno"
                        name="turno"
                        value={formData.turno}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="manha">Manhã (6h-14h)</option>
                        <option value="tarde">Tarde (14h-22h)</option>
                        <option value="noite">Noite (22h-6h)</option>
                        <option value="integral">Integral (8h-18h)</option>
                        <option value="plantao_12h">Plantão 12h</option>
                        <option value="plantao_24h">Plantão 24h</option>
                      </select>
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

          {/* Step 4 - Documentos e Emergência */}
          {currentStep === 4 && (
            <div className="form-step active">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-4">
                  <h4 className="mb-4">
                    <i className="bi bi-file-earmark-text text-warning me-2"></i>
                    Documentação
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="titulo_eleitor" className="form-label">
                        <i className="bi bi-person-vcard me-1"></i>
                        Título de Eleitor
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="titulo_eleitor"
                        name="titulo_eleitor"
                        value={formData.titulo_eleitor}
                        onChange={handleChange}
                        placeholder="0000 0000 0000"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="numero_pis" className="form-label">
                        <i className="bi bi-credit-card-2-front me-1"></i>
                        PIS/PASEP
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="numero_pis"
                        name="numero_pis"
                        value={formData.numero_pis}
                        onChange={handleChange}
                        placeholder="000.00000.00-0"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="carteira_trabalho" className="form-label">
                        <i className="bi bi-journal-bookmark me-1"></i>
                        Carteira de Trabalho
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="carteira_trabalho"
                        name="carteira_trabalho"
                        value={formData.carteira_trabalho}
                        onChange={handleChange}
                        placeholder="0000000"
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
                {currentStep < 4 ? (
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
