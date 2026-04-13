/**
 * Script para sincronizar todos os modelos com o banco de dados
 * Cria automaticamente todas as tabelas necessárias
 * 
 * USO: node sync-database.js         (sincroniza sem perder dados)
 *      node sync-database.js --force  (APAGA tudo e recria - CUIDADO!)
 */

const sequelize = require('./src/config/db');

// Importar modelos COM os relacionamentos configurados
const {
  Residente,
  Profissional,
  Usuario,
  Agendamento,
  HistoricoConsulta,
  DespesaGeral,
  PagamentoMensalidade,
  PagamentoSalario
} = require('./src/models');

async function syncDatabase() {
  try {
    const forceMode = process.argv.includes('--force');
    
    console.log('🔄 Iniciando sincronização do banco de dados...\n');
    
    if (forceMode) {
      console.log('⚠️  MODO FORCE ATIVADO - Todas as tabelas serão recriadas!\n');
    }

    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!\n');

    // Sincronizar modelos
    console.log('📊 Sincronizando modelos...\n');
    
    await sequelize.sync({ force: forceMode, alter: !forceMode });
    
    console.log('✅ Todos os modelos foram sincronizados com sucesso!\n');
    console.log('📋 Tabelas sincronizadas:');
    console.log('   1. residentes');
    console.log('   2. profissionais');
    console.log('   3. usuarios');
    console.log('   4. agendamentos');
    console.log('   5. historico_consultas');
    console.log('   6. despesas_gerais');
    console.log('   7. pagamentos_mensalidades');
    console.log('   8. pagamentos_salarios');
    console.log('\n✅ Banco de dados pronto para uso!\n');

  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error.message);
    console.error('\n💡 Verifique:');
    console.error('   - Se o MySQL está rodando');
    console.error('   - Se as credenciais no .env estão corretas');
    console.error('   - Se o banco "sistema_residencial" existe');
  } finally {
    await sequelize.close();
    process.exit();
  }
}

syncDatabase();
