// Validação de CPF simplificada - apenas verifica se tem 11 dígitos
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.length === 11;
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
