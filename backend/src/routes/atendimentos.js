const express = require('express')
const router = express.Router()
const { verificarAutenticacao } = require('../middlewares/auth')
const atendimentoController = require('../controllers/atendimentoController')

// Rotas protegidas por autenticação
router.use(verificarAutenticacao)

// Salvar rascunho de atendimento
router.post('/rascunho', atendimentoController.salvarRascunho)

// Listar rascunhos do profissional
router.get('/rascunhos', atendimentoController.listarRascunhos)

// Buscar rascunho específico
router.get('/rascunho/:id', atendimentoController.buscarRascunho)

// Deletar rascunho
router.delete('/rascunho/:id', atendimentoController.deletarRascunho)

module.exports = router
