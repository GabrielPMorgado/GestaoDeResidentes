/**
 * Script para sincronizar todos os modelos com o banco de dados
 * Cria automaticamente todas as tabelas necessárias
 */

const sequelize = require('./src/config/db');

// Importar todos os modelos
const Residente = require('./src/models/Residente');
const Profissional = require('./src/models/Profissional');
const Agendamento = require('./src/models/Agendamento');
const HistoricoConsulta = require('./src/models/HistoricoConsulta');
const DespesaGeral = require('./src/models/DespesaGeral');
const PagamentoMensalidade = require('./src/models/PagamentoMensalidade');
const PagamentoSalario = require('./src/models/PagamentoSalario');

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronização do banco de dados...\n');

    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!\n');

    // Sincronizar modelos (force: true recria as tabelas)
    console.log('📊 Sincronizando modelos...\n');
    
    await sequelize.sync({ force: true, alter: false });
    
    console.log('✅ Todos os modelos foram sincronizados com sucesso!\n');
    console.log('📋 Tabelas criadas:');
    console.log('   1. residentes');
    console.log('   2. profissionais');
    console.log('   3. agendamentos');
    console.log('   4. historico_consultas');
    console.log('   5. despesas_gerais');
    console.log('   6. pagamentos_mensalidades');
    console.log('   7. pagamentos_salarios');
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
