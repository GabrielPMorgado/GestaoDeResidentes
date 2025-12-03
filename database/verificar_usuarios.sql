-- Execute este script para verificar se a tabela usuarios existe

USE sistema_residencial;

-- Verificar se a tabela usuarios existe
SELECT 
  COUNT(*) as tabela_existe 
FROM information_schema.tables 
WHERE table_schema = 'sistema_residencial' 
  AND table_name = 'usuarios';

-- Verificar se existe o usuário admin
SELECT 
  id,
  email,
  tipo,
  ativo,
  profissional_id,
  criado_em
FROM usuarios 
WHERE email = 'admin@sistema.com';
