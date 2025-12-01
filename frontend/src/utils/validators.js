/**
 * Funções de validação para formulários
 */

/**
 * Valida CPF
 */
export const validarCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '')
  
  if (cpfLimpo.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false
  
  // Validação do primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false
  
  return true
}

/**
 * Valida e-mail
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida telefone (mínimo 10 dígitos)
 */
export const validarTelefone = (telefone) => {
  const numeroLimpo = telefone.replace(/\D/g, '')
  return numeroLimpo.length >= 10
}

/**
 * Valida CEP (formato 00000-000)
 */
export const validarCEP = (cep) => {
  const regex = /^\d{5}-?\d{3}$/
  return regex.test(cep)
}

/**
 * Valida data (não pode ser futura para nascimento)
 */
export const validarDataNascimento = (data) => {
  const dataNasc = new Date(data)
  const hoje = new Date()
  return dataNasc <= hoje
}

/**
 * Valida se data não está no passado
 */
export const validarDataFutura = (data) => {
  const dataAgendamento = new Date(data + 'T00:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  dataAgendamento.setHours(0, 0, 0, 0)
  return dataAgendamento >= hoje
}

/**
 * Valida nome (mínimo 3 caracteres)
 */
export const validarNome = (nome) => {
  return nome && nome.trim().length >= 3
}

/**
 * Valida campo obrigatório
 */
export const validarObrigatorio = (valor) => {
  return valor !== null && valor !== undefined && valor.toString().trim().length > 0
}
