-- ============================================
-- GERENCIAR SENHAS DE USUÁRIOS
-- Execute este script no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- 1. Ver todos os usuários e seus profissionais
SELECT 
    u.id,
    u.email,
    u.tipo,
    u.ativo,
    u.ultimo_acesso,
    p.nome_completo as profissional_nome,
    p.profissao
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
ORDER BY u.tipo, u.id;

-- 2. Ver apenas profissionais que têm acesso
SELECT 
    u.id as usuario_id,
    u.email,
    u.ativo,
    p.id as profissional_id,
    p.nome_completo,
    p.profissao,
    p.status
FROM usuarios u
INNER JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional'
ORDER BY p.nome_completo;

-- 3. Resetar senha de um usuário específico
-- Troque 'email@exemplo.com' pelo email do usuário
-- Troque '$2a$10$HASH_AQUI' pelo hash da nova senha
-- Para gerar o hash, use o arquivo gerar-hash.js no backend

-- Exemplo: Resetar senha para '123456'
-- UPDATE usuarios 
-- SET senha = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
-- WHERE email = 'email@exemplo.com';

-- 4. Ativar/Desativar usuário
-- UPDATE usuarios SET ativo = 1 WHERE email = 'email@exemplo.com'; -- Ativar
-- UPDATE usuarios SET ativo = 0 WHERE email = 'email@exemplo.com'; -- Desativar

-- 5. Ver profissionais SEM acesso ao sistema
SELECT 
    p.id,
    p.nome_completo,
    p.profissao,
    p.email as email_profissional,
    p.status
FROM profissionais p
LEFT JOIN usuarios u ON p.id = u.profissional_id
WHERE u.id IS NULL
  AND p.status = 'ativo'
ORDER BY p.nome_completo;

-- 6. Criar acesso manualmente para um profissional
-- IMPORTANTE: Use o arquivo gerar-hash.js para gerar o hash da senha
-- Exemplo abaixo usa senha '123456' (hash já gerado)

-- INSERT INTO usuarios (profissional_id, email, senha, tipo, ativo)
-- VALUES (
--     1, -- ID do profissional
--     'medico@clinica.com', -- Email para login
--     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash da senha '123456'
--     'profissional', -- Tipo de usuário
--     1 -- Ativo (1) ou Inativo (0)
-- );
