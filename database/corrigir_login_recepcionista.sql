-- SCRIPT DE CORREÇÃO RÁPIDA
-- Execute este script se você já criou o usuário mas não consegue fazer login

-- 1. Verificar usuários existentes
SELECT id, email, tipo, ativo, LEFT(senha, 20) as senha_inicio
FROM usuarios 
WHERE email = 'recepcao@teste.com';

-- 2. Deletar usuário antigo (se existir com hash errado)
DELETE FROM usuarios WHERE email = 'recepcao@teste.com';

-- 3. Garantir que o tipo 'recepcionista' existe
ALTER TABLE usuarios 
MODIFY COLUMN tipo ENUM('admin', 'profissional', 'recepcionista') NOT NULL DEFAULT 'profissional';

-- 4. Criar usuário recepcionista com hash CORRETO
-- Senha: 123456
INSERT INTO usuarios (email, senha, tipo, ativo, criado_em, atualizado_em)
VALUES (
  'recepcao@teste.com',
  '$2a$10$kxTzALviJdl77QXdt5beXu80ybHZ8XqSQn1vjcuA./iO1we6.zJN.',
  'recepcionista',
  1,
  NOW(),
  NOW()
);

-- 5. Verificar criação
SELECT id, email, tipo, ativo, LEFT(senha, 30) as senha_hash
FROM usuarios 
WHERE email = 'recepcao@teste.com';

-- ==========================================
-- CREDENCIAIS PARA TESTE:
-- ==========================================
-- Email: recepcao@teste.com
-- Senha: 123456
-- ==========================================

-- Se ainda não funcionar, verifique:
-- 1. Backend está rodando?
-- 2. Porta 3000 disponível?
-- 3. JWT_SECRET configurado no .env?
