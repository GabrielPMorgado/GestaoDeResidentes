/**
 * Script de Teste de Recuperação de Senha
 * 
 * Como usar:
 * 1. Certifique-se de que o backend está rodando
 * 2. Execute: node test-recuperacao.js
 */

const http = require('http');
const readline = require('readline');

const API_HOST = 'localhost';
const API_PORT = 3001;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

function httpRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject({ statusCode: res.statusCode, data: response });
          }
        } catch (e) {
          reject({ statusCode: res.statusCode, message: body });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testarRecuperacao() {
  console.log('\n🔐 === TESTE DE RECUPERAÇÃO DE SENHA ===\n');
  
  try {
    // Solicitar email
    const email = await question('Digite o email para recuperação: ');
    
    if (!email) {
      console.log('❌ Email é obrigatório!');
      rl.close();
      return;
    }
    
    console.log('\n📧 Enviando solicitação de recuperação...\n');
    
    // Enviar solicitação
    const response = await httpRequest('/auth/recuperar-senha', 'POST', {
      email: email.trim()
    });
    
    console.log('✅ Resposta do servidor:', response.mensagem);
    console.log('\n⚠️  IMPORTANTE: Verifique o console do BACKEND para obter o link de recuperação!');
    console.log('    O link aparecerá como: http://localhost:5173/redefinir-senha?token=...\n');
    
    // Perguntar se quer testar a redefinição
    const temToken = await question('\nVocê já copiou o token do console do backend? (s/n): ');
    
    if (temToken.toLowerCase() === 's') {
      const token = await question('Cole o token aqui: ');
      const novaSenha = await question('Digite a nova senha (min 6 caracteres): ');
      
      if (novaSenha.length < 6) {
        console.log('❌ A senha deve ter no mínimo 6 caracteres!');
        rl.close();
        return;
      }
      
      console.log('\n🔄 Redefinindo senha...\n');
      
      const resetResponse = await httpRequest('/auth/redefinir-senha', 'POST', {
        token: token.trim(),
        novaSenha: novaSenha
      });
      
      console.log('✅', resetResponse.mensagem);
      console.log('\n🎉 Senha redefinida com sucesso! Você já pode fazer login.\n');
    } else {
      console.log('\n📋 Próximos passos:');
      console.log('1. Copie o link do console do backend');
      console.log('2. Abra o link no navegador');
      console.log('3. Digite e confirme a nova senha');
      console.log('4. Faça login com a nova senha\n');
    }
    
  } catch (error) {
    console.log('\n❌ Erro:', error.data?.erro || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  O backend não está respondendo!');
      console.log('   Certifique-se de que o servidor está rodando na porta 3001.');
      console.log('   Execute: cd backend && npm start\n');
    } else if (error.statusCode === 400 && error.data?.erro?.includes('Token')) {
      console.log('\n💡 Dica: O token pode ter expirado ou já foi usado.');
      console.log('   Solicite um novo token executando este script novamente.\n');
    }
  }
  
  rl.close();
}

// Executar teste
testarRecuperacao().catch(console.error);
