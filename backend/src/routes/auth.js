const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Usuario, Profissional } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_key_aqui_mude_em_producao';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ 
        erro: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const usuario = await Usuario.findOne({
      where: { email, ativo: true },
      include: [{
        model: Profissional,
        as: 'profissional',
        attributes: ['id', 'nome_completo', 'profissao', 'departamento', 'status']
      }]
    });

    if (!usuario) {
      return res.status(401).json({ 
        erro: 'Email ou senha inválidos' 
      });
    }

    // Validar senha
    const senhaValida = await usuario.validarSenha(senha);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        erro: 'Email ou senha inválidos' 
      });
    }
    // Atualizar último acesso
    await usuario.update({ ultimo_acesso: new Date() });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        tipo: usuario.tipo,
        profissional_id: usuario.profissional_id
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        profissional_id: usuario.profissional_id,
        profissional: usuario.profissional
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      erro: 'Erro ao realizar login',
      detalhes: error.message 
    });
  }
});

// Verificar token
router.get('/verificar', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Profissional,
        as: 'profissional',
        attributes: ['id', 'nome_completo', 'profissao', 'departamento', 'status']
      }]
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Usuário inválido ou inativo' });
    }

    res.json({
      valido: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        profissional: usuario.profissional
      }
    });

  } catch (error) {
    res.status(401).json({ erro: 'Token inválido' });
  }
});

// Criar usuário admin (apenas para setup inicial)
router.post('/criar-admin', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se já existe admin
    const adminExiste = await Usuario.findOne({ where: { tipo: 'admin' } });
    if (adminExiste) {
      return res.status(400).json({ 
        erro: 'Já existe um usuário administrador' 
      });
    }

    const admin = await Usuario.create({
      email,
      senha,
      tipo: 'admin',
      ativo: true
    });

    res.status(201).json({ 
      mensagem: 'Administrador criado com sucesso',
      usuario: {
        id: admin.id,
        email: admin.email,
        tipo: admin.tipo
      }
    });

  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ 
      erro: 'Erro ao criar administrador',
      detalhes: error.message 
    });
  }
});

// Criar acesso para profissional (apenas admin)
router.post('/criar-acesso-profissional', async (req, res) => {
  try {
    const { profissional_id, email, senha } = req.body;

    // Verificar se profissional existe
    const profissional = await Profissional.findByPk(profissional_id);
    if (!profissional) {
      return res.status(404).json({ erro: 'Profissional não encontrado' });
    }

    // Verificar se já existe usuário para este profissional
    const usuarioExiste = await Usuario.findOne({ 
      where: { profissional_id } 
    });
    
    if (usuarioExiste) {
      return res.status(400).json({ 
        erro: 'Este profissional já possui acesso ao sistema' 
      });
    }

    const usuario = await Usuario.create({
      profissional_id,
      email,
      senha,
      tipo: 'profissional',
      ativo: true
    });

    res.status(201).json({ 
      mensagem: 'Acesso criado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        profissional: {
          id: profissional.id,
          nome: profissional.nome_completo
        }
      }
    });

  } catch (error) {
    console.error('Erro ao criar acesso:', error);
    res.status(500).json({ 
      erro: 'Erro ao criar acesso',
      detalhes: error.message 
    });
  }
});

// Listar todos os usuários (apenas admin)
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'email', 'tipo', 'ativo', 'ultimo_acesso', 'criado_em'],
      include: [{
        model: Profissional,
        as: 'profissional',
        attributes: ['id', 'nome_completo', 'profissao', 'departamento']
      }],
      order: [['criado_em', 'DESC']]
    });

    res.json(usuarios);

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ 
      erro: 'Erro ao listar usuários',
      detalhes: error.message 
    });
  }
});

// Ativar/Desativar usuário (apenas admin)
router.patch('/usuarios/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await usuario.update({ ativo });

    res.json({ 
      mensagem: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      erro: 'Erro ao atualizar status do usuário',
      detalhes: error.message 
    });
  }
});

module.exports = router;
