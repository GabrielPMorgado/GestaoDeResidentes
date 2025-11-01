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

// Middleware de validação para criar residente
exports.validarCriarResidente = (req, res, next) => {
  const { nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel } = req.body;
  
  // Campos obrigatórios
  if (!nome_completo || !data_nascimento || !cpf || !sexo || !telefone || !nome_responsavel || !telefone_responsavel) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios não preenchidos',
      campos_obrigatorios: [
        'nome_completo',
        'data_nascimento',
        'cpf',
        'sexo',
        'telefone',
        'nome_responsavel',
        'telefone_responsavel'
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
  
  // Validar idade mínima (0 anos) e máxima (120 anos)
  const idade = hoje.getFullYear() - dataNascimento.getFullYear();
  if (idade > 120) {
    return res.status(400).json({
      success: false,
      message: 'Data de nascimento inválida'
    });
  }
  
  // Validar sexo
  if (!['masculino', 'feminino', 'outro'].includes(sexo)) {
    return res.status(400).json({
      success: false,
      message: 'Sexo inválido. Valores permitidos: masculino, feminino, outro'
    });
  }
  
  next();
};

// Middleware de validação para atualizar residente
exports.validarAtualizarResidente = (req, res, next) => {
  const { cpf, data_nascimento, sexo, status } = req.body;
  
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
  if (status && !['ativo', 'inativo', 'suspenso'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status inválido. Valores permitidos: ativo, inativo, suspenso'
    });
  }
  
  next();
};
