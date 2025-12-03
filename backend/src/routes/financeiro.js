const express = require('express')
const router = express.Router()
const financeiroController = require('../controllers/financeiroController')

// Despesas Gerais
router.post('/despesas', financeiroController.criarDespesa)
router.get('/despesas', financeiroController.listarDespesas)
router.get('/despesas/:id', financeiroController.obterDespesa)
router.put('/despesas/:id', financeiroController.atualizarDespesa)
router.delete('/despesas/:id', financeiroController.excluirDespesa)

// Mensalidades
router.post('/mensalidades', financeiroController.criarMensalidade)
router.get('/mensalidades', financeiroController.listarMensalidades)
router.get('/mensalidades/:id', financeiroController.obterMensalidade)
router.put('/mensalidades/:id', financeiroController.atualizarMensalidade)
router.post('/mensalidades/:id/pagar', financeiroController.pagarMensalidade)

// Salários
router.post('/salarios', financeiroController.criarSalario)
router.get('/salarios', financeiroController.listarSalarios)
router.get('/salarios/:id', financeiroController.obterSalario)
router.put('/salarios/:id', financeiroController.atualizarSalario)
router.post('/salarios/:id/pagar', financeiroController.pagarSalario)

// Relatórios
router.get('/resumo', financeiroController.obterResumoFinanceiro)
router.get('/transacoes', financeiroController.obterTransacoes)

module.exports = router
