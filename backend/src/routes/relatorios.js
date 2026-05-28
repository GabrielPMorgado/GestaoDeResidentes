const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { verificarAutenticacao, verificarAdmin } = require('../middlewares/auth');

// Todas as rotas de relatórios requerem autenticação
router.use(verificarAutenticacao);

/**
 * @route   GET /api/relatorios/residentes
 * @desc    Relatório detalhado de residentes
 * @access  Private
 * @query   status, sexo, data_inicio, data_fim
 */
router.get('/residentes', relatorioController.relatorioResidentes);

/**
 * @route   GET /api/relatorios/profissionais
 * @desc    Relatório detalhado de profissionais
 * @access  Private (Admin)
 * @query   status, profissao, departamento, data_inicio, data_fim
 */
router.get('/profissionais', verificarAdmin, relatorioController.relatorioProfissionais);

/**
 * @route   GET /api/relatorios/agendamentos
 * @desc    Relatório de agendamentos
 * @access  Private
 * @query   status, tipo_atendimento, profissional_id, data_inicio, data_fim
 */
router.get('/agendamentos', relatorioController.relatorioAgendamentos);

/**
 * @route   GET /api/relatorios/financeiro
 * @desc    Relatório financeiro completo
 * @access  Private (Admin)
 * @query   data_inicio, data_fim, tipo
 */
router.get('/financeiro', verificarAdmin, relatorioController.relatorioFinanceiro);

/**
 * @route   GET /api/relatorios/geral
 * @desc    Relatório consolidado geral
 * @access  Private (Admin)
 * @query   data_inicio, data_fim
 */
router.get('/geral', verificarAdmin, relatorioController.relatorioGeral);

module.exports = router;
