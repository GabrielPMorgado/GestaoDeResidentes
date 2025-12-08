const Profissional = require('../models/Profissional');
const Residente = require('../models/Residente');
const Agendamento = require('../models/Agendamento');
const HistoricoConsulta = require('../models/HistoricoConsulta');
const { Op } = require('sequelize');

// Criar novo profissional
exports.criar = async (req, res) => {
  try {
    const { cpf, rg } = req.body;

    // Verificar se CPF já existe em profissionais
    const profissionalExistente = await Profissional.findOne({ 
      where: { cpf } 
    });
    
    if (profissionalExistente) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado como profissional!'
      });
    }

    // Verificar se CPF já existe em residentes
    const residenteExistente = await Residente.findOne({ 
      where: { cpf } 
    });
    
    if (residenteExistente) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado como residente!'
      });
    }

    // Verificar se RG já existe em profissionais (se fornecido)
    if (rg) {
      const rgExistenteProfissional = await Profissional.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como profissional!'
        });
      }

      // Verificar se RG já existe em residentes
      const rgExistenteResidente = await Residente.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como residente!'
        });
      }
    }

    const profissional = await Profissional.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Profissional cadastrado com sucesso!',
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    
    // Tratamento de erro de constraint única
    if (error.name === 'SequelizeUniqueConstraintError') {
      const campo = error.errors[0]?.path || 'campo';
      return res.status(400).json({
        success: false,
        message: `${campo.toUpperCase()} já cadastrado no sistema!`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar profissional',
      error: error.message
    });
  }
};

// Listar todos os profissionais
exports.listar = async (req, res) => {
  try {
    const { status, busca, profissao, departamento, page = 1, limit = 10 } = req.query;
    
    
    // Filtros
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (profissao) {
      where.profissao = profissao;
    }
    
    if (departamento) {
      where.departamento = departamento;
    }
    
    if (busca) {
      where[Op.or] = [
        { nome_completo: { [Op.like]: `%${busca}%` } },
        { cpf: { [Op.like]: `%${busca}%` } },
        { celular: { [Op.like]: `%${busca}%` } },
        { cargo: { [Op.like]: `%${busca}%` } }
      ];
    }
    
    console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
    
    // Paginação
    const offset = (page - 1) * limit;
    
    console.log('🔢 Paginação: offset=', offset, 'limit=', parseInt(limit));
    
    const { count, rows } = await Profissional.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']],
      attributes: { exclude: ['senha'] }
    });
    
    console.log('✅ Profissionais encontrados:', count);
    console.log('📄 Primeiros IDs:', rows.slice(0, 3).map(r => r.id));
    
    res.json({
      success: true,
      data: {
        profissionais: rows,
        pagination: {
          totalItens: count,
          paginaAtual: parseInt(page),
          itensPorPagina: parseInt(limit),
          totalPaginas: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao listar profissionais:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar profissionais',
      error: error.message,
      details: error.stack
    });
  }
};

// Buscar profissional por ID
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar profissional',
      error: error.message
    });
  }
};

// Buscar profissional por CPF
exports.buscarPorCpf = async (req, res) => {
  try {
    const { cpf } = req.params;
    const profissional = await Profissional.findOne({ where: { cpf } });
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar profissional',
      error: error.message
    });
  }
};

// Atualizar profissional
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { cpf, rg } = req.body;
    
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    // Verificar se o CPF está sendo alterado
    if (cpf && cpf !== profissional.cpf) {
      // Verificar se o novo CPF já existe em outros profissionais
      const cpfExistenteProfissional = await Profissional.findOne({ 
        where: { 
          cpf,
          id: { [Op.ne]: id } // Excluir o próprio profissional
        } 
      });
      
      if (cpfExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado como profissional!'
        });
      }

      // Verificar se o novo CPF já existe em residentes
      const cpfExistenteResidente = await Residente.findOne({ 
        where: { cpf } 
      });
      
      if (cpfExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado como residente!'
        });
      }
    }

    // Verificar se o RG está sendo alterado
    if (rg && rg !== profissional.rg) {
      // Verificar se o novo RG já existe em outros profissionais
      const rgExistenteProfissional = await Profissional.findOne({ 
        where: { 
          rg,
          id: { [Op.ne]: id } // Excluir o próprio profissional
        } 
      });
      
      if (rgExistenteProfissional) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como profissional!'
        });
      }

      // Verificar se o novo RG já existe em residentes
      const rgExistenteResidente = await Residente.findOne({ 
        where: { rg } 
      });
      
      if (rgExistenteResidente) {
        return res.status(400).json({
          success: false,
          message: 'RG já cadastrado como residente!'
        });
      }
    }
    
    await profissional.update(req.body);
    
    res.json({
      success: true,
      message: 'Profissional atualizado com sucesso!',
      data: profissional
    });
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const campo = error.errors[0]?.path || 'campo';
      return res.status(400).json({
        success: false,
        message: `${campo.toUpperCase()} já cadastrado no sistema!`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar profissional',
      error: error.message
    });
  }
};

// Deletar profissional (soft delete - apenas altera status)
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    await profissional.update({ status: 'inativo' });
    
    res.json({
      success: true,
      message: 'Profissional inativado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao inativar profissional',
      error: error.message
    });
  }
};

// Reativar profissional
exports.reativar = async (req, res) => {
  try {
    const { id } = req.params;
    const profissional = await Profissional.findByPk(id);
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    if (profissional.status === 'ativo') {
      return res.status(400).json({
        success: false,
        message: 'Profissional já está ativo'
      });
    }
    
    await profissional.update({ status: 'ativo' });
    
    res.json({
      success: true,
      message: 'Profissional reativado com sucesso!',
      profissional
    });
  } catch (error) {
    console.error('Erro ao reativar profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reativar profissional',
      error: error.message
    });
  }
};

// Deletar profissional permanentemente (hard delete - remove do banco)
exports.deletarPermanente = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== DELETAR PROFISSIONAL PERMANENTE ===');
    console.log('ID recebido:', id);
    
    const profissional = await Profissional.findByPk(id);
    console.log('Profissional encontrado:', profissional ? 'SIM' : 'NÃO');
    
    if (!profissional) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }
    
    // Primeiro, deletar todos os históricos de consulta relacionados
    console.log('Deletando históricos de consulta do profissional...');
    const historicoDeletados = await HistoricoConsulta.destroy({
      where: { profissional_id: id }
    });
    console.log('Históricos deletados:', historicoDeletados);
    
    // Depois, deletar todos os agendamentos relacionados
    console.log('Deletando agendamentos do profissional...');
    const agendamentosDeletados = await Agendamento.destroy({
      where: { profissional_id: id }
    });
    console.log('Agendamentos deletados:', agendamentosDeletados);
    
    // Por fim, deletar o profissional permanentemente do banco de dados
    console.log('Deletando profissional...');
    await profissional.destroy();
    console.log('Profissional deletado com sucesso!');
    
    res.json({
      success: true,
      message: 'Profissional e todos os registros relacionados foram deletados permanentemente do sistema!'
    });
  } catch (error) {
    console.error('ERRO COMPLETO ao deletar profissional permanentemente:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar profissional permanentemente',
      error: error.message
    });
  }
};;

// Estatísticas
exports.estatisticas = async (req, res) => {
  try {
    const total = await Profissional.count();
    const ativos = await Profissional.count({ where: { status: 'ativo' } });
    const inativos = await Profissional.count({ where: { status: 'inativo' } });
    const ferias = await Profissional.count({ where: { status: 'ferias' } });
    const licenca = await Profissional.count({ where: { status: 'licenca' } });
    
    // Contar por profissão
    const porProfissao = await Profissional.findAll({
      attributes: [
        'profissao',
        [require('sequelize').fn('COUNT', require('sequelize').col('profissao')), 'total']
      ],
      group: ['profissao'],
      order: [[require('sequelize').literal('total'), 'DESC']]
    });
    
    // Contar por departamento
    const porDepartamento = await Profissional.findAll({
      attributes: [
        'departamento',
        [require('sequelize').fn('COUNT', require('sequelize').col('departamento')), 'total']
      ],
      where: {
        departamento: { [Op.ne]: null }
      },
      group: ['departamento'],
      order: [[require('sequelize').literal('total'), 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        total,
        ativos,
        inativos,
        ferias,
        licenca,
        porProfissao,
        porDepartamento
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};

// Relatório de Despesas com Profissionais
exports.relatorioDespesas = async (req, res) => {
  try {
    const { mes, ano, departamento, status } = req.query;

    // Construir filtros
    const where = {};
    
    if (departamento) {
      where.departamento = departamento;
    }
    
    if (status === 'ativos') {
      where.status = 'ativo';
    } else if (status === 'inativos') {
      where.status = 'inativo';
    }

    // Buscar profissionais com salários
    const profissionais = await Profissional.findAll({
      where: {
        ...where,
        salario: { [Op.ne]: null }
      },
      attributes: [
        'id',
        'nome_completo',
        'cpf',
        'profissao',
        'cargo',
        'departamento',
        'salario',
        'status',
        'data_admissao'
      ],
      order: [['salario', 'DESC']]
    });

    // Calcular estatísticas
    const totalProfissionais = profissionais.length;
    const folhaPagamentoTotal = profissionais.reduce((sum, p) => sum + parseFloat(p.salario || 0), 0);
    const salarioMedio = totalProfissionais > 0 ? folhaPagamentoTotal / totalProfissionais : 0;
    const salarioMaior = profissionais.length > 0 ? parseFloat(profissionais[0].salario) : 0;
    const salarioMenor = profissionais.length > 0 ? parseFloat(profissionais[profissionais.length - 1].salario) : 0;

    // Agrupar por departamento
    const despesasPorDepartamento = {};
    profissionais.forEach(prof => {
      const dept = prof.departamento || 'Não informado';
      if (!despesasPorDepartamento[dept]) {
        despesasPorDepartamento[dept] = {
          departamento: dept,
          quantidadeProfissionais: 0,
          totalDespesas: 0,
          profissionais: []
        };
      }
      despesasPorDepartamento[dept].quantidadeProfissionais++;
      despesasPorDepartamento[dept].totalDespesas += parseFloat(prof.salario || 0);
      despesasPorDepartamento[dept].profissionais.push({
        id: prof.id,
        nome: prof.nome_completo,
        cargo: prof.cargo,
        salario: parseFloat(prof.salario)
      });
    });

    // Agrupar por cargo
    const despesasPorCargo = {};
    profissionais.forEach(prof => {
      const cargo = prof.cargo || 'Não informado';
      if (!despesasPorCargo[cargo]) {
        despesasPorCargo[cargo] = {
          cargo: cargo,
          quantidade: 0,
          totalDespesas: 0,
          salarioMedio: 0
        };
      }
      despesasPorCargo[cargo].quantidade++;
      despesasPorCargo[cargo].totalDespesas += parseFloat(prof.salario || 0);
    });

    // Calcular média salarial por cargo
    Object.values(despesasPorCargo).forEach(cargo => {
      cargo.salarioMedio = cargo.totalDespesas / cargo.quantidade;
    });

    res.json({
      success: true,
      data: {
        resumo: {
          totalProfissionais,
          folhaPagamentoTotal: parseFloat(folhaPagamentoTotal.toFixed(2)),
          salarioMedio: parseFloat(salarioMedio.toFixed(2)),
          salarioMaior: parseFloat(salarioMaior.toFixed(2)),
          salarioMenor: parseFloat(salarioMenor.toFixed(2))
        },
        despesasPorDepartamento: Object.values(despesasPorDepartamento).sort((a, b) => b.totalDespesas - a.totalDespesas),
        despesasPorCargo: Object.values(despesasPorCargo).sort((a, b) => b.totalDespesas - a.totalDespesas),
        profissionais: profissionais.map(p => ({
          id: p.id,
          nome_completo: p.nome_completo,
          cpf: p.cpf,
          profissao: p.profissao,
          cargo: p.cargo,
          departamento: p.departamento,
          salario: parseFloat(p.salario),
          status: p.status,
          data_admissao: p.data_admissao
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de despesas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de despesas',
      error: error.message
    });
  }
};

// Folha de Pagamento Mensal
exports.folhaPagamento = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes || new Date().getMonth() + 1;
    const anoAtual = ano || new Date().getFullYear();

    // Buscar apenas profissionais ativos
    const profissionais = await Profissional.findAll({
      where: {
        status: 'ativo',
        salario: { [Op.ne]: null }
      },
      attributes: [
        'id',
        'nome_completo',
        'cpf',
        'cargo',
        'departamento',
        'salario',
        'data_admissao'
      ],
      order: [['departamento', 'ASC'], ['nome_completo', 'ASC']]
    });

    const folha = profissionais.map(prof => ({
      id: prof.id,
      nome: prof.nome_completo,
      cpf: prof.cpf,
      cargo: prof.cargo,
      departamento: prof.departamento || 'Não informado',
      salarioBruto: parseFloat(prof.salario),
      // Simulação de descontos (pode ser ajustado conforme necessidade)
      inss: parseFloat((prof.salario * 0.11).toFixed(2)),
      irrf: parseFloat((prof.salario * 0.075).toFixed(2)),
      salarioLiquido: parseFloat((prof.salario * 0.815).toFixed(2))
    }));

    const totalBruto = folha.reduce((sum, item) => sum + item.salarioBruto, 0);
    const totalDescontos = folha.reduce((sum, item) => sum + item.inss + item.irrf, 0);
    const totalLiquido = folha.reduce((sum, item) => sum + item.salarioLiquido, 0);

    res.json({
      success: true,
      data: {
        mesReferencia: `${mesAtual}/${anoAtual}`,
        mes: mesAtual,
        ano: anoAtual,
        quantidadeFuncionarios: folha.length,
        totais: {
          salarioBruto: parseFloat(totalBruto.toFixed(2)),
          totalDescontos: parseFloat(totalDescontos.toFixed(2)),
          salarioLiquido: parseFloat(totalLiquido.toFixed(2))
        },
        folha
      }
    });
  } catch (error) {
    console.error('Erro ao gerar folha de pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar folha de pagamento',
      error: error.message
    });
  }
};
