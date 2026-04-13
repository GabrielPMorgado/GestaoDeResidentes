
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Usuario, Profissional } = require('../models');
const { verificarAutenticacao } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');
const { JWT_SECRET } = require('../config/constants');

// Rate limiter específico para trocar senha (mais restritivo)
const trocarSenhaLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // Máximo 5 tentativas
  message: 'Muitas tentativas de troca de senha. Tente novamente em 15 minutos.'
});

// Redefinir senha usando token
router.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) {
      return res.status(400).json({ erro: 'Token e nova senha são obrigatórios' });
    }
    const usuario = await Usuario.findOne({ where: { token_recuperacao: token, ativo: true } });
    if (!usuario || !usuario.token_recuperacao_expira || usuario.token_recuperacao_expira < new Date()) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' });
    }
    usuario.senha = novaSenha;
    usuario.token_recuperacao = null;
    usuario.token_recuperacao_expira = null;
    await usuario.save();
    return res.json({ mensagem: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ erro: 'Erro ao redefinir senha', detalhes: error.message });
  }
});
// Recuperação de senha
router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }
    const usuario = await Usuario.findOne({ where: { email, ativo: true } });
    if (!usuario) {
      // Por segurança, não revelar se o e-mail existe ou não
      return res.status(200).json({ mensagem: 'Se o e-mail existir, enviaremos instruções para redefinir a senha.' });
    }
    // Gerar token seguro e expiração (1h)
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await usuario.update({ token_recuperacao: token, token_recuperacao_expira: expira });
    // Simular envio de e-mail
    const link = `http://localhost:5173/redefinir-senha?token=${token}`;
    console.log(`Simulando envio de e-mail para ${email} com link: ${link}`);
    return res.status(200).json({ mensagem: 'Se o e-mail existir, enviaremos instruções para redefinir a senha.' });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ erro: 'Erro ao processar recuperação de senha', detalhes: error.message });
  }
});

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
        nivel_acesso: usuario.nivel_acesso,
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
        nivel_acesso: usuario.nivel_acesso,
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
        nivel_acesso: usuario.nivel_acesso,
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
    const { profissional_id, email, senha, nivel_acesso } = req.body;

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
      nivel_acesso: nivel_acesso || 'operacional',
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
      attributes: ['id', 'email', 'tipo', 'nivel_acesso', 'ativo', 'ultimo_acesso', 'criado_em'],
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

// Trocar senha (requer autenticação)
router.post('/trocar-senha', verificarAutenticacao, trocarSenhaLimiter, async (req, res) => {
  try {
    const { senhaAtual, novaSenha, confirmarSenha } = req.body;

    // Validações básicas
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    if (novaSenha !== confirmarSenha) {
      return res.status(400).json({ erro: 'A nova senha e a confirmação não coincidem' });
    }

    // Validações de complexidade da senha
    if (novaSenha.length < 8) {
      return res.status(400).json({ erro: 'A nova senha deve ter no mínimo 8 caracteres' });
    }

    if (!/[A-Z]/.test(novaSenha)) {
      return res.status(400).json({ erro: 'A senha deve conter pelo menos uma letra maiúscula' });
    }

    if (!/[a-z]/.test(novaSenha)) {
      return res.status(400).json({ erro: 'A senha deve conter pelo menos uma letra minúscula' });
    }

    if (!/[0-9]/.test(novaSenha)) {
      return res.status(400).json({ erro: 'A senha deve conter pelo menos um número' });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(novaSenha)) {
      return res.status(400).json({ erro: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)' });
    }

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const senhaValida = await usuario.validarSenha(senhaAtual);
    if (!senhaValida) {
      console.warn(`Tentativa falha de troca de senha - Usuário ${usuario.id} (${usuario.email})`);
      return res.status(401).json({ erro: 'Senha atual incorreta' });
    }

    // Verificar se a nova senha é diferente da atual
    const senhaIgualAtual = await usuario.validarSenha(novaSenha);
    if (senhaIgualAtual) {
      return res.status(400).json({ erro: 'A nova senha não pode ser igual à senha atual' });
    }

    // Atualizar senha
    usuario.senha = novaSenha;
    await usuario.save();

    // Log de segurança
    console.log(`Senha alterada com sucesso - Usuário ${usuario.id} (${usuario.email}) em ${new Date().toISOString()}`);

    return res.json({ 
      mensagem: 'Senha alterada com sucesso!',
      requerRelogin: true 
    });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({ erro: 'Erro ao trocar senha', detalhes: error.message });
  }
});

// Editar usuário (email, tipo, nivel_acesso) - apenas admin
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, tipo, nivel_acesso } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Se mudou o email, verificar se já existe
    if (email && email !== usuario.email) {
      const emailExiste = await Usuario.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({ erro: 'Este email já está em uso' });
      }
    }

    const dadosAtualizar = {};
    if (email) dadosAtualizar.email = email;
    if (tipo) dadosAtualizar.tipo = tipo;
    if (nivel_acesso) dadosAtualizar.nivel_acesso = nivel_acesso;

    await usuario.update(dadosAtualizar);

    const usuarioAtualizado = await Usuario.findByPk(id, {
      attributes: ['id', 'email', 'tipo', 'nivel_acesso', 'ativo', 'ultimo_acesso', 'criado_em'],
      include: [{
        model: Profissional,
        as: 'profissional',
        attributes: ['id', 'nome_completo', 'profissao', 'departamento']
      }]
    });

    res.json({
      mensagem: 'Usuário atualizado com sucesso',
      usuario: usuarioAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar usuário',
      detalhes: error.message
    });
  }
});

// Redefinir senha de um usuário (admin redefine) 
router.post('/usuarios/:id/redefinir-senha', async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    usuario.senha = novaSenha;
    await usuario.save();

    console.log(`Senha redefinida pelo admin - Usuário ${usuario.id} (${usuario.email}) em ${new Date().toISOString()}`);

    res.json({ mensagem: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      erro: 'Erro ao redefinir senha',
      detalhes: error.message
    });
  }
});

// Excluir usuário (apenas admin)
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    if (usuario.tipo === 'admin') {
      return res.status(400).json({ erro: 'Não é possível excluir o administrador' });
    }

    await usuario.destroy();

    res.json({ mensagem: 'Usuário excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      erro: 'Erro ao excluir usuário',
      detalhes: error.message
    });
  }
});

module.exports = router;
