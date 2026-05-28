/**
 * Script para redefinir senha do administrador
 * 
 * Uso: node reset-admin-password.js
 * 
 * Este script permite redefinir a senha do usuário administrador do sistema.
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');
const sequelize = require('./src/config/db');
const Usuario = require('./src/models/Usuario');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetAdminPassword() {
  try {
    console.log('\n========================================');
    console.log('   REDEFINIÇÃO DE SENHA DO ADMIN');
    console.log('========================================\n');

    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('✓ Conectado ao banco de dados\n');

    // Buscar usuário admin
    const admin = await Usuario.findOne({ 
      where: { tipo: 'admin' },
      order: [['id', 'ASC']] // Pega o primeiro admin criado
    });

    if (!admin) {
      console.log('✗ Nenhum usuário administrador encontrado!');
      console.log('\nDeseja criar um novo usuário administrador? (s/n)');
      
      const resposta = await question('> ');
      
      if (resposta.toLowerCase() === 's') {
        await criarNovoAdmin();
      }
      
      rl.close();
      process.exit(0);
    }

    console.log('Usuário administrador encontrado:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Tipo: ${admin.tipo}`);
    console.log(`  Status: ${admin.ativo ? 'Ativo' : 'Inativo'}\n`);

    // Perguntar nova senha
    const novaSenha = await question('Digite a nova senha (mínimo 6 caracteres): ');
    
    if (novaSenha.length < 6) {
      console.log('\n✗ A senha deve ter pelo menos 6 caracteres!');
      rl.close();
      process.exit(1);
    }

    const confirmarSenha = await question('Confirme a nova senha: ');
    
    if (novaSenha !== confirmarSenha) {
      console.log('\n✗ As senhas não coincidem!');
      rl.close();
      process.exit(1);
    }

    // Fazer hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha no banco
    await sequelize.query(
      'UPDATE usuarios SET senha = ?, ativo = 1 WHERE id = ?',
      {
        replacements: [senhaHash, admin.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('\n✓ Senha do administrador redefinida com sucesso!');
    console.log('\nCredenciais de acesso:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Senha: ${novaSenha}\n`);
    console.log('⚠ Anote essas informações em um local seguro!\n');

  } catch (error) {
    console.error('\n✗ Erro ao redefinir senha:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

async function criarNovoAdmin() {
  try {
    console.log('\n--- Criando novo usuário administrador ---\n');

    const email = await question('Digite o email do admin: ');
    
    if (!email.includes('@')) {
      console.log('✗ Email inválido!');
      return;
    }

    const senha = await question('Digite a senha (mínimo 6 caracteres): ');
    
    if (senha.length < 6) {
      console.log('✗ A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    const confirmarSenha = await question('Confirme a senha: ');
    
    if (senha !== confirmarSenha) {
      console.log('✗ As senhas não coincidem!');
      return;
    }

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar usuário admin
    await sequelize.query(
      'INSERT INTO usuarios (email, senha, tipo, nivel_acesso, ativo, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      {
        replacements: [email, senhaHash, 'admin', 'total', 1],
        type: sequelize.QueryTypes.INSERT
      }
    );

    console.log('\n✓ Usuário administrador criado com sucesso!');
    console.log('\nCredenciais de acesso:');
    console.log(`  Email: ${email}`);
    console.log(`  Senha: ${senha}\n`);
    console.log('⚠ Anote essas informações em um local seguro!\n');

  } catch (error) {
    console.error('\n✗ Erro ao criar administrador:', error.message);
  }
}

// Executar o script
resetAdminPassword();
