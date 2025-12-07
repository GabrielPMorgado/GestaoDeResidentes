-- Verificar agendamentos e seus profissionais associados
SELECT 
    a.id,
    a.profissional_id,
    a.residente_id,
    a.data_agendamento,
    a.hora_inicio,
    a.tipo_atendimento,
    a.status,
    p.nome_completo AS profissional_nome,
    r.nome_completo AS residente_nome
FROM agendamentos a
LEFT JOIN profissionais p ON a.profissional_id = p.id
LEFT JOIN residentes r ON a.residente_id = r.id
ORDER BY a.data_agendamento DESC, a.hora_inicio DESC
LIMIT 20;

-- Ver quantos agendamentos existem por profissional
SELECT 
    profissional_id,
    p.nome_completo,
    COUNT(*) as total_agendamentos
FROM agendamentos a
LEFT JOIN profissionais p ON a.profissional_id = p.id
GROUP BY profissional_id, p.nome_completo;

-- Ver todos os profissionais
SELECT id, nome_completo, cpf, profissao, status 
FROM profissionais 
WHERE status = 'ativo';

-- Ver usuários de profissionais
SELECT 
    u.id,
    u.email,
    u.tipo,
    u.profissional_id,
    p.nome_completo
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional' AND u.ativo = true;
