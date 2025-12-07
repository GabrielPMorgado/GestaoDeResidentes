-- Verificar usuários profissionais e resetar senha
SELECT 
    u.id,
    u.email,
    u.profissional_id,
    p.nome_completo,
    u.ativo
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional';

-- Se você quer criar/resetar senha para 'senha123':
-- Hash bcrypt para 'senha123': $2b$10$YourHashHere

-- Para resetar a senha do profissional@clinica.com para 'senha123'
-- Execute o comando no backend:
-- node gerar-hash.js senha123

-- Depois atualize:
-- UPDATE usuarios 
-- SET senha = 'COLE_O_HASH_AQUI'
-- WHERE email = 'profissional@clinica.com';
