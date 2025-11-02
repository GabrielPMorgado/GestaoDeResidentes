const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const { validarCriarAgendamento, validarAtualizarAgendamento } = require('../middlewares/validacaoAgendamento');

// Rotas CRUD
router.post('/', validarCriarAgendamento, agendamentoController.criar);              // Criar agendamento
router.get('/', agendamentoController.listar);                                       // Listar todos
router.get('/estatisticas/geral', agendamentoController.estatisticas);               // Estatísticas
router.get('/disponibilidade', agendamentoController.verificarDisponibilidade);      // Verificar disponibilidade
router.get('/residente/:residente_id', agendamentoController.buscarPorResidente);    // Buscar por residente
router.get('/profissional/:profissional_id', agendamentoController.buscarPorProfissional); // Buscar por profissional
router.get('/:id', agendamentoController.buscarPorId);                               // Buscar por ID
router.put('/:id', validarAtualizarAgendamento, agendamentoController.atualizar);    // Atualizar
router.delete('/:id', agendamentoController.deletar);                                // Deletar
router.patch('/:id/cancelar', agendamentoController.cancelar);                       // Cancelar
router.patch('/:id/confirmar', agendamentoController.confirmar);                     // Confirmar

module.exports = router;
