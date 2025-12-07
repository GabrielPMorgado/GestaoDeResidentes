-- Criar usuário de teste para profissional (Dra. Fernanda - ID 1)
-- Email: teste@profissional.com
-- Senha: teste123

INSERT INTO usuarios (profissional_id, email, senha, tipo, ativo)
VALUES (
    1, 
    'teste@profissional.com', 
    '$2a$10$NRLyJqo1MZY6hZLIqNQC1eCh5D0BTybas0bAG6eR71ZdcfuskEQuW', 
    'profissional', 
    1
);

-- Verificar
SELECT 
    u.id,
    u.email,
    u.tipo,
    u.profissional_id,
    p.nome_completo as profissional_nome
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
WHERE u.email = 'teste@profissional.com';
