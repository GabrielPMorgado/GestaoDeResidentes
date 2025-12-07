-- SCRIPT RÁPIDO: Criar múltiplos usuários recepcionistas
-- Execute este script se precisar de vários recepcionistas

-- 1. Garantir que o tipo 'recepcionista' existe
ALTER TABLE usuarios 
MODIFY COLUMN tipo ENUM('admin', 'profissional', 'recepcionista') NOT NULL DEFAULT 'profissional';

-- 2. Criar usuários recepcionistas
-- Senha padrão para todos: 123456
-- IMPORTANTE: Altere as senhas após o primeiro login em produção!

INSERT INTO usuarios (email, senha, tipo, ativo, criado_em, atualizado_em) VALUES
-- Recepcionista 1
('maria.recepcao@sistema.com', '$2a$10$kxTzALviJdl77QXdt5beXu80ybHZ8XqSQn1vjcuA./iO1we6.zJN.', 'recepcionista', 1, NOW(), NOW()),

-- Recepcionista 2
('ana.recepcao@sistema.com', '$2a$10$kxTzALviJdl77QXdt5beXu80ybHZ8XqSQn1vjcuA./iO1we6.zJN.', 'recepcionista', 1, NOW(), NOW()),

-- Recepcionista 3
('joao.recepcao@sistema.com', '$2a$10$kxTzALviJdl77QXdt5beXu80ybHZ8XqSQn1vjcuA./iO1we6.zJN.', 'recepcionista', 1, NOW(), NOW());

-- 3. Verificar usuários criados
SELECT 
  id,
  email,
  tipo,
  ativo,
  DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i') as criado_em
FROM usuarios 
WHERE tipo = 'recepcionista'
ORDER BY criado_em DESC;

-- ==========================================
-- CREDENCIAIS PADRÃO PARA TESTE:
-- ==========================================
-- Email: maria.recepcao@sistema.com | Senha: 123456
-- Email: ana.recepcao@sistema.com   | Senha: 123456
-- Email: joao.recepcao@sistema.com  | Senha: 123456
-- ==========================================

-- 4. [OPCIONAL] Desativar um recepcionista específico
-- UPDATE usuarios SET ativo = 0, atualizado_em = NOW() WHERE email = 'maria.recepcao@sistema.com';

-- 5. [OPCIONAL] Reativar um recepcionista
-- UPDATE usuarios SET ativo = 1, atualizado_em = NOW() WHERE email = 'maria.recepcao@sistema.com';

-- 6. [OPCIONAL] Alterar senha de um recepcionista
-- Primeiro gere o hash usando: node backend/gerar-hash.js nova_senha
-- Depois execute:
-- UPDATE usuarios SET senha = 'NOVO_HASH_AQUI', atualizado_em = NOW() WHERE email = 'maria.recepcao@sistema.com';

-- 7. [OPCIONAL] Excluir um recepcionista
-- DELETE FROM usuarios WHERE email = 'maria.recepcao@sistema.com';

-- 8. Estatísticas de usuários por tipo
SELECT 
  tipo,
  COUNT(*) as total,
  SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as ativos,
  SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) as inativos
FROM usuarios
GROUP BY tipo;
