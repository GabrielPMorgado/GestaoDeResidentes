// Script para gerar hash bcrypt da senha admin123
const bcrypt = require('bcryptjs');

async function gerarHash() {
  const senha = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(senha, salt);
  
  console.log('\n=== HASH GERADO ===');
  console.log('Senha:', senha);
  console.log('Hash:', hash);
  console.log('\n=== EXECUTE NO MYSQL ===');
  console.log(`UPDATE usuarios SET senha = '${hash}' WHERE email = 'admin@sistema.com';`);
  console.log('\n');
  
  // Testar se o hash funciona
  const teste = await bcrypt.compare(senha, hash);
  console.log('Teste de validação:', teste ? '✓ Hash válido' : '✗ Hash inválido');
}

gerarHash();
