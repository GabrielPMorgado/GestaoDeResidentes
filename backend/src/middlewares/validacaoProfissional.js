// Validação de CPF
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

// Middleware de validação para criar profissional
exports.validarCriarProfissional = (req, res, next) => {
  const { 
    nome_completo, 
    data_nascimento, 
    cpf, 
    sexo, 
    celular,
    email,
    profissao,
    data_admissao,
    cargo,
    turno
  } = req.body;
  
  // Campos obrigatórios
  if (!nome_completo || !data_nascimento || !cpf || !sexo || !celular || !email || 
      !profissao || !data_admissao || !cargo || !turno) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios não preenchidos',
      campos_obrigatorios: [
        'nome_completo',
        'data_nascimento',
        'cpf',
        'sexo',
        'celular',
        'email',
        'profissao',
        'data_admissao',
        'cargo',
        'turno'
      ]
    });
  }
  
  // Validar CPF
  if (!validarCPF(cpf)) {
    return res.status(400).json({
      success: false,
      message: 'CPF inválido'
    });
  }
  
  // Validar data de nascimento
  const dataNascimento = new Date(data_nascimento);
  const hoje = new Date();
  
  if (dataNascimento > hoje) {
    return res.status(400).json({
      success: false,
      message: 'Data de nascimento não pode ser futura'
    });
  }
  
  // Validar idade mínima (18 anos) para profissional
  const idade = hoje.getFullYear() - dataNascimento.getFullYear();
  if (idade < 18) {
    return res.status(400).json({
      success: false,
      message: 'Profissional deve ter pelo menos 18 anos'
    });
  }
  
  // Validar sexo
  if (!['masculino', 'feminino', 'outro'].includes(sexo)) {
    return res.status(400).json({
      success: false,
      message: 'Sexo inválido. Valores permitidos: masculino, feminino, outro'
    });
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'E-mail inválido'
    });
  }
  
  // Validar data de admissão
  const dataAdmissao = new Date(data_admissao);
  if (dataAdmissao > hoje) {
    return res.status(400).json({
      success: false,
      message: 'Data de admissão não pode ser futura'
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
