const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const { validarCriarAgendamento, validarAtualizarAgendamento } = require('../middlewares/validacaoAgendamento');
const { verificarAutenticacao, verificarAcessoAgendamento } = require('../middlewares/auth');

// Aplicar autenticação em todas as rotas
router.use(verificarAutenticacao);

// Rotas CRUD
router.post('/', verificarAcessoAgendamento, validarCriarAgendamento, agendamentoController.criar);              // Criar agendamento
router.get('/', verificarAcessoAgendamento, agendamentoController.listar);                                       // Listar todos
router.get('/estatisticas/geral', verificarAcessoAgendamento, agendamentoController.estatisticas);               // Estatísticas
router.get('/disponibilidade', verificarAcessoAgendamento, agendamentoController.verificarDisponibilidade);      // Verificar disponibilidade
router.get('/residente/:residente_id', verificarAcessoAgendamento, agendamentoController.buscarPorResidente);    // Buscar por residente
router.get('/profissional/:profissional_id', verificarAcessoAgendamento, agendamentoController.buscarPorProfissional); // Buscar por profissional
router.get('/:id', verificarAcessoAgendamento, agendamentoController.buscarPorId);                               // Buscar por ID
router.put('/:id', verificarAcessoAgendamento, validarAtualizarAgendamento, agendamentoController.atualizar);    // Atualizar
router.delete('/:id', verificarAcessoAgendamento, agendamentoController.deletar);                                // Deletar
router.patch('/:id/cancelar', verificarAcessoAgendamento, agendamentoController.cancelar);                       // Cancelar
router.patch('/:id/confirmar', verificarAcessoAgendamento, agendamentoController.confirmar);                     // Confirmar

module.exports = router;
