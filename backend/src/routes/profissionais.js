const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const { validarCriarProfissional, validarAtualizarProfissional } = require('../middlewares/validacaoProfissional');

// Rota para criar novo profissional
router.post('/', validarCriarProfissional, profissionalController.criar);

// Rota para listar todos os profissionais (com paginação e filtros)
router.get('/', (req, res, next) => {
  next();
}, profissionalController.listar);

// Rota para buscar profissional por ID
router.get('/:id', profissionalController.buscarPorId);

// Rota para buscar profissional por CPF
router.get('/cpf/:cpf', profissionalController.buscarPorCpf);

// Rota para atualizar profissional
router.put('/:id', validarAtualizarProfissional, profissionalController.atualizar);

// Rota para reativar profissional
router.put('/:id/reativar', profissionalController.reativar);

// Rota para deletar profissional permanentemente (hard delete)
router.delete('/:id/permanente', profissionalController.deletarPermanente);

// Rota para deletar profissional (soft delete)
router.delete('/:id', profissionalController.deletar);

// Rota para estatísticas
router.get('/estatisticas/geral', profissionalController.estatisticas);

// Rota para relatório de despesas
router.get('/relatorio/despesas', profissionalController.relatorioDespesas);

// Rota para folha de pagamento
router.get('/relatorio/folha-pagamento', profissionalController.folhaPagamento);

module.exports = router;
