// Validação de CPF simplificada - apenas verifica se tem 11 dígitos
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.length === 11;
};

// Middleware de validação para criar profissional
exports.validarCriarProfissional = (req, res, next) => {
  const { 
    nome_completo, 
    cpf, 
    profissao
  } = req.body;
  
  // Apenas 3 campos obrigatórios: nome, cpf e profissao
  if (!nome_completo || !cpf || !profissao) {
    return res.status(400).json({
      success: false,
      message: 'Preencha os campos obrigatórios: Nome Completo, CPF e Profissão',
      campos_obrigatorios: [
        'nome_completo',
        'cpf',
        'profissao'
      ]
    });
  }
  
  // Validar CPF
  if (!validarCPF(cpf)) {
    return res.status(400).json({
      success: false,
      message: 'CPF deve ter 11 dígitos'
    });
  }
  
  next();
};

// Middleware de validação para atualizar profissional
exports.validarAtualizarProfissional = (req, res, next) => {
  const { cpf, data_nascimento, sexo, status, email, data_admissao } = req.body;
  
  // Validar CPF se fornecido
  if (cpf && !validarCPF(cpf)) {
    return res.status(400).json({
      success: false,
      message: 'CPF inválido'
    });
  }
  
  // Validar data de nascimento se fornecida
  if (data_nascimento) {
    const dataNascimento = new Date(data_nascimento);
    const hoje = new Date();
    
    if (dataNascimento > hoje) {
      return res.status(400).json({
        success: false,
        message: 'Data de nascimento não pode ser futura'
      });
    }
  }
  
  // Validar sexo se fornecido
  if (sexo && !['masculino', 'feminino', 'outro'].includes(sexo)) {
    return res.status(400).json({
      success: false,
      message: 'Sexo inválido. Valores permitidos: masculino, feminino, outro'
    });
  }
  
  // Validar status se fornecido
  if (status && !['ativo', 'inativo', 'licenca', 'ferias'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status inválido. Valores permitidos: ativo, inativo, licenca, ferias'
    });
  }
  
  // Validar email se fornecido
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'E-mail inválido'
      });
    }
  }
  
  // Validar data de admissão se fornecida
  if (data_admissao) {
    const dataAdmissao = new Date(data_admissao);
    const hoje = new Date();
    
    if (dataAdmissao > hoje) {
      return res.status(400).json({
        success: false,
        message: 'Data de admissão não pode ser futura'
      });
    }
  }
  
  next();
};
