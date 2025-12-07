const express = require('express')
const router = express.Router()
const historicoConsultaController = require('../controllers/historicoConsultaController')

// Rotas de histórico de consultas
// Rota com query parameter (deve vir ANTES das rotas com parâmetros de rota)
router.get('/', (req, res, next) => {
  const { residente_id, profissional_id } = req.query
  
  if (residente_id) {
    req.params.residente_id = residente_id
    return historicoConsultaController.listarHistoricoResidente(req, res, next)
  }
  
  if (profissional_id) {
    req.params.profissional_id = profissional_id
    return historicoConsultaController.listarHistoricoProfissional(req, res, next)
  }
  
  // Se não houver query params, retornar erro
  return res.status(400).json({
    success: false,
    message: 'Informe residente_id ou profissional_id como query parameter'
  })
})

router.get('/residente/:residente_id', historicoConsultaController.listarHistoricoResidente)
router.get('/profissional/:profissional_id', historicoConsultaController.listarHistoricoProfissional)
router.post('/', historicoConsultaController.criarHistoricoConsulta)
router.get('/:id', historicoConsultaController.obterHistoricoConsulta)
router.put('/:id', historicoConsultaController.atualizarHistoricoConsulta)
router.delete('/:id', historicoConsultaController.deletarHistoricoConsulta)

module.exports = router
