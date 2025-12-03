/**
 * Funções de validação
 */

// Validar CPF
const validarCPF = (cpf) => {
  if (!cpf) return false;
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

// Validar email
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar telefone brasileiro
const validarTelefone = (telefone) => {
  if (!telefone) return false;
  const cleaned = telefone.replace(/[^\d]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Validar data
const validarData = (data) => {
  const date = new Date(data);
  return date instanceof Date && !isNaN(date);
};

// Validar data de nascimento (não pode ser futura)
const validarDataNascimento = (data) => {
  if (!validarData(data)) return false;
  const nascimento = new Date(data);
  const hoje = new Date();
  return nascimento < hoje;
};

// Validar horário
const validarHorario = (horario) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return regex.test(horario);
};

// Validar se horário de fim é maior que início
const validarIntervaloDeTempo = (inicio, fim) => {
  if (!inicio || !fim) return false;
  return fim > inicio;
};

// Validar valor monetário
const validarValor = (valor) => {
  return typeof valor === 'number' && valor >= 0;
};

// Sanitizar string (remover caracteres especiais)
const sanitizarString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  validarCPF,
  validarEmail,
  validarTelefone,
  validarData,
  validarDataNascimento,
  validarHorario,
  validarIntervaloDeTempo,
  validarValor,
  sanitizarString
};
