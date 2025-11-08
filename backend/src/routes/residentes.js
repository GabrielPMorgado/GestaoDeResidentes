const express = require('express');
const router = express.Router();
const residenteController = require('../controllers/residenteController');
const { validarCriarResidente, validarAtualizarResidente } = require('../middlewares/validacaoResidente');

// Rotas CRUD
router.post('/', validarCriarResidente, residenteController.criar);           // Criar residente
router.get('/', residenteController.listar);                                  // Listar todos
router.get('/estatisticas', residenteController.estatisticas);                // Estatísticas
router.get('/:id', residenteController.buscarPorId);                          // Buscar por ID
router.get('/cpf/:cpf', residenteController.buscarPorCpf);                    // Buscar por CPF
router.put('/:id', validarAtualizarResidente, residenteController.atualizar); // Atualizar
router.delete('/:id/permanente', residenteController.deletarPermanente);      // Deletar permanentemente
router.delete('/:id', residenteController.deletar);                           // Deletar (inativar)

module.exports = router;
