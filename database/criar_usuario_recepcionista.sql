-- Script para adicionar suporte a RECEPCIONISTA no sistema
-- Execute este script no banco de dados sistema_residencial

-- 1. Verificar se a coluna 'tipo' na tabela usuarios aceita o valor 'recepcionista'
-- Se a coluna tiver ENUM, precisamos alterar:
ALTER TABLE usuarios 
MODIFY COLUMN tipo ENUM('admin', 'profissional', 'recepcionista') NOT NULL DEFAULT 'profissional';

-- 2. Criar usuário recepcionista de teste
-- IMPORTANTE: Primeiro, gere a senha usando o arquivo backend/gerar-hash.js
-- Exemplo: node backend/gerar-hash.js 123456

-- Para criar um usuário recepcionista, você precisa do hash da senha
-- Execute o comando abaixo APÓS gerar o hash:

/*
INSERT INTO usuarios (email, senha, tipo, ativo, criado_em, atualizado_em)
VALUES (
  'recepcao@sistema.com',
  'COLE_O_HASH_AQUI', -- Hash gerado pelo gerar-hash.js
  'recepcionista',
  1,
  NOW(),
  NOW()
);
*/

-- 3. Verificar usuários recepcionistas criados
SELECT id, email, tipo, ativo, criado_em 
FROM usuarios 
WHERE tipo = 'recepcionista';

-- 4. Para testar, você pode criar temporariamente com senha simples (NÃO RECOMENDADO EM PRODUÇÃO):
-- A senha abaixo é '123456' hasheada com bcrypt

INSERT INTO usuarios (email, senha, tipo, ativo, criado_em, atualizado_em)
VALUES (
  'recepcao@teste.com',
  '$2a$10$kxTzALviJdl77QXdt5beXu80ybHZ8XqSQn1vjcuA./iO1we6.zJN.',
  'recepcionista',
  1,
  NOW(),
  NOW()
);

-- 5. Verificar se foi criado com sucesso
SELECT * FROM usuarios WHERE email = 'recepcao@teste.com';

-- ==========================================
-- INFORMAÇÕES DE LOGIN PARA TESTE:
-- ==========================================
-- Email: recepcao@teste.com
-- Senha: 123456
-- ==========================================

-- NOTA: Em produção, sempre use senhas fortes e gere o hash corretamente!
