const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_key_aqui_mude_em_producao';

// Middleware para verificar autenticação
const verificarAutenticacao = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar se é admin
const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ 
      erro: 'Acesso negado. Apenas administradores.' 
    });
  }
  next();
};

// Middleware para verificar acesso a agendamentos
const verificarAcessoAgendamento = (req, res, next) => {
  // Admin tem acesso total
  if (req.usuario.tipo === 'admin') {
    return next();
  }

  // Profissional só pode ver seus próprios agendamentos
  if (req.usuario.tipo === 'profissional') {
    req.filtrarPorProfissional = req.usuario.profissional_id;
    return next();
  }

  return res.status(403).json({ erro: 'Acesso negado' });
};

module.exports = {
  verificarAutenticacao,
  verificarAdmin,
  verificarAcessoAgendamento
};
