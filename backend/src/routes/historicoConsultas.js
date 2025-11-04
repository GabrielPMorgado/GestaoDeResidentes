const express = require('express')
const router = express.Router()
const historicoConsultaController = require('../controllers/historicoConsultaController')

// Rotas de histórico de consultas
router.get('/residente/:residente_id', historicoConsultaController.listarHistoricoResidente)
router.post('/', historicoConsultaController.criarHistoricoConsulta)
router.get('/:id', historicoConsultaController.obterHistoricoConsulta)
router.put('/:id', historicoConsultaController.atualizarHistoricoConsulta)
router.delete('/:id', historicoConsultaController.deletarHistoricoConsulta)

module.exports = router
