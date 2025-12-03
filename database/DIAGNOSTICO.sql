-- DIAGNÓSTICO COMPLETO DO SISTEMA DE AUTENTICAÇÃO

USE sistema_residencial;

-- 1. Verificar se a tabela usuarios existe
SELECT '=== 1. VERIFICANDO SE A TABELA USUARIOS EXISTE ===' as '';
SELECT 
  COUNT(*) as tabela_existe,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ Tabela existe'
    ELSE '✗ Tabela NÃO existe - Execute EXECUTAR_PRIMEIRO.sql'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'sistema_residencial' 
  AND table_name = 'usuarios';

-- 2. Verificar estrutura da tabela (se existir)
SELECT '=== 2. ESTRUTURA DA TABELA USUARIOS ===' as '';
DESCRIBE usuarios;

-- 3. Verificar se existe o usuário admin
SELECT '=== 3. VERIFICANDO USUÁRIO ADMIN ===' as '';
SELECT 
  id,
  email,
  tipo,
  ativo,
  profissional_id,
  LENGTH(senha) as tamanho_hash,
  criado_em,
  CASE 
    WHEN email = 'admin@sistema.com' THEN '✓ Email correto'
    ELSE '✗ Email incorreto'
  END as check_email,
  CASE 
    WHEN LENGTH(senha) = 60 THEN '✓ Hash bcrypt válido (60 caracteres)'
    ELSE '✗ Hash inválido'
  END as check_hash
FROM usuarios 
WHERE email = 'admin@sistema.com';

-- 4. Contar total de usuários
SELECT '=== 4. TOTAL DE USUÁRIOS NO SISTEMA ===' as '';
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- 5. Listar todos os usuários
SELECT '=== 5. LISTA DE TODOS OS USUÁRIOS ===' as '';
SELECT 
  id,
  email,
  tipo,
  ativo,
  profissional_id,
  ultimo_acesso,
  criado_em
FROM usuarios;
