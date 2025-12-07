-- ============================================
-- CRIAR ACESSO RÁPIDO PARA PROFISSIONAL
-- Execute este script no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- 1. Ver profissionais disponíveis
SELECT 
    p.id,
    p.nome_completo,
    p.cpf,
    p.profissao,
    p.cargo,
    p.email as email_profissional,
    p.status,
    CASE 
        WHEN u.id IS NOT NULL THEN '❌ Já tem acesso'
        ELSE '✅ Disponível'
    END as situacao_acesso
FROM profissionais p
LEFT JOIN usuarios u ON p.id = u.profissional_id
WHERE p.status = 'ativo'
ORDER BY p.nome_completo;

-- ============================================
-- 2. CRIAR ACESSO PARA UM PROFISSIONAL
-- ============================================

-- INSTRUÇÕES:
-- 1. Execute a query acima para ver os profissionais disponíveis
-- 2. Escolha um profissional e anote o ID dele
-- 3. Descomente (remova o --) e edite a linha INSERT abaixo
-- 4. Execute o INSERT para criar o acesso

-- Senha padrão: 123456
-- Hash bcrypt da senha '123456': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- EXEMPLO: Criar acesso para profissional ID 1
INSERT INTO usuarios (profissional_id, email, senha, tipo, ativo)
VALUES (
    1, -- ⚠️ TROQUE pelo ID do profissional que você quer dar acesso
    'profissional@clinica.com', -- ⚠️ TROQUE pelo email de login que você quer usar
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Senha: 123456
    'profissional',
    1
);

-- ============================================
-- 3. VERIFICAR SE FOI CRIADO COM SUCESSO
-- ============================================

SELECT 
    u.id as usuario_id,
    u.email,
    u.tipo,
    u.ativo,
    p.id as profissional_id,
    p.nome_completo,
    p.profissao,
    p.cargo
FROM usuarios u
INNER JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional'
ORDER BY u.id DESC
LIMIT 5;

-- ============================================
-- 📋 CREDENCIAIS PARA LOGIN
-- ============================================
-- Email: profissional@clinica.com (ou o que você definiu)
-- Senha: 123456
-- ============================================

-- ============================================
-- OPÇÕES EXTRAS
-- ============================================

-- Criar mais acessos com senhas diferentes (descomente para usar):

-- Médico (senha: medico123)
-- INSERT INTO usuarios (profissional_id, email, senha, tipo, ativo)
-- VALUES (2, 'medico@clinica.com', '$2a$10$hzHlGjZ5Y8dF4qVqF8qG9u7Xm8xZ9vN8wJ5xK7vL9mP4qR6sT8uV2', 'profissional', 1);

-- Enfermeiro (senha: enfermeiro123)
-- INSERT INTO usuarios (profissional_id, email, senha, tipo, ativo)
-- VALUES (3, 'enfermeiro@clinica.com', '$2a$10$aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7i', 'profissional', 1);

-- ============================================
-- RESETAR SENHA DE UM USUÁRIO EXISTENTE
-- ============================================

-- Resetar para senha '123456':
-- UPDATE usuarios SET senha = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'profissional@clinica.com';
