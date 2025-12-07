export const formatarCPF = (valor) => {
  if (!valor) return '';
  const cpfLimpo = valor.replace(/\D/g, '');
  return cpfLimpo
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatarCelular = (valor) => {
  if (!valor) return '';
  const numeroLimpo = valor.replace(/\D/g, '');
  return numeroLimpo
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2');
};

export const formatarTelefone = (valor) => {
  if (!valor) return '';
  const numeroLimpo = valor.replace(/\D/g, '');
  return numeroLimpo
    .slice(0, 10)
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2');
};

export const formatarCEP = (valor) => {
  if (!valor) return '';
  const cepLimpo = valor.replace(/\D/g, '');
  return cepLimpo.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
};

export const formatarDataNascimento = (data) => {
  if (!data) return '';
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
};
