/**
 * Utilitários de formatação para formulários
 */

/**
 * Formata CPF (000.000.000-00)
 */
export const formatarCPF = (valor) => {
  if (!valor) return ''
  const cpfLimpo = valor.replace(/\D/g, '')
  if (cpfLimpo.length <= 11) {
    return cpfLimpo
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return cpfLimpo.slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/**
 * Formata telefone celular ((00) 00000-0000)
 */
export const formatarCelular = (valor) => {
  if (!valor) return ''
  const numeroLimpo = valor.replace(/\D/g, '')
  if (numeroLimpo.length <= 11) {
    return numeroLimpo
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
  }
  return numeroLimpo.slice(0, 11)
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
}

/**
 * Formata telefone fixo ((00) 0000-0000)
 */
export const formatarTelefone = (valor) => {
  if (!valor) return ''
  const numeroLimpo = valor.replace(/\D/g, '')
  if (numeroLimpo.length <= 10) {
    return numeroLimpo
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
  }
  return numeroLimpo.slice(0, 10)
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
}

/**
 * Formata CEP (00000-000)
 */
export const formatarCEP = (valor) => {
  if (!valor) return ''
  const cepLimpo = valor.replace(/\D/g, '')
  if (cepLimpo.length <= 8) {
    return cepLimpo.replace(/(\d{5})(\d)/, '$1-$2')
  }
  return cepLimpo.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

/**
 * Remove formatação (retorna apenas números)
 */
export const removerFormatacao = (valor) => {
  return valor ? valor.replace(/\D/g, '') : ''
}

/**
 * Formata valor monetário
 */
export const formatarMoeda = (valor) => {
  if (!valor) return ''
  const valorLimpo = valor.replace(/\D/g, '')
  const valorNumerico = parseFloat(valorLimpo) / 100
  return valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
