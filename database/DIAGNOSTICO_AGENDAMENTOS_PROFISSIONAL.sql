-- =====================================================
-- SCRIPT DE DIAGNÓSTICO: AGENDAMENTOS DE PROFISSIONAIS
-- =====================================================

-- 1. Listar todos os profissionais ativos
SELECT '=== PROFISSIONAIS ATIVOS ===' AS info;
SELECT 
    id, 
    nome_completo, 
    cpf, 
    profissao, 
    departamento,
    status
FROM profissionais 
WHERE status = 'ativo'
ORDER BY nome_completo;

-- 2. Listar usuários do tipo profissional
SELECT '=== USUÁRIOS PROFISSIONAIS ===' AS info;
SELECT 
    u.id AS usuario_id,
    u.email,
    u.profissional_id,
    p.nome_completo AS profissional_nome,
    u.ativo,
    u.ultimo_acesso
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional'
ORDER BY p.nome_completo;

-- 3. Contar agendamentos por profissional
SELECT '=== TOTAL DE AGENDAMENTOS POR PROFISSIONAL ===' AS info;
SELECT 
    p.id,
    p.nome_completo,
    COUNT(a.id) as total_agendamentos,
    SUM(CASE WHEN a.status = 'agendado' THEN 1 ELSE 0 END) as agendados,
    SUM(CASE WHEN a.status = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
    SUM(CASE WHEN a.status = 'realizado' THEN 1 ELSE 0 END) as realizados,
    SUM(CASE WHEN a.status = 'cancelado' THEN 1 ELSE 0 END) as cancelados
FROM profissionais p
LEFT JOIN agendamentos a ON a.profissional_id = p.id
WHERE p.status = 'ativo'
GROUP BY p.id, p.nome_completo
ORDER BY total_agendamentos DESC;

-- 4. Listar todos os agendamentos com detalhes
SELECT '=== DETALHES DOS AGENDAMENTOS ===' AS info;
SELECT 
    a.id,
    a.data_agendamento,
    a.hora_inicio,
    a.hora_fim,
    a.tipo_atendimento,
    a.status,
    p.nome_completo AS profissional,
    r.nome_completo AS residente,
    a.profissional_id,
    a.residente_id
FROM agendamentos a
LEFT JOIN profissionais p ON a.profissional_id = p.id
LEFT JOIN residentes r ON a.residente_id = r.id
ORDER BY a.data_agendamento DESC, a.hora_inicio DESC
LIMIT 50;

-- 5. Verificar se existem agendamentos sem profissional ou residente
SELECT '=== AGENDAMENTOS COM PROBLEMAS ===' AS info;
SELECT 
    a.id,
    a.profissional_id,
    a.residente_id,
    a.data_agendamento,
    a.status,
    CASE 
        WHEN a.profissional_id IS NULL THEN 'SEM PROFISSIONAL'
        WHEN a.residente_id IS NULL THEN 'SEM RESIDENTE'
        ELSE 'OK'
    END as problema
FROM agendamentos a
WHERE a.profissional_id IS NULL OR a.residente_id IS NULL;

-- 6. Exemplo de INSERT caso não existam agendamentos
SELECT '=== SCRIPT PARA CRIAR AGENDAMENTO DE TESTE ===' AS info;
SELECT CONCAT(
    'INSERT INTO agendamentos ',
    '(residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim, tipo_atendimento, status, local, observacoes) ',
    'VALUES (',
    '(SELECT id FROM residentes WHERE status = "ativo" LIMIT 1), ',
    '(SELECT id FROM profissionais WHERE status = "ativo" LIMIT 1), ',
    'CURDATE() + INTERVAL 1 DAY, ',
    '"14:00:00", "15:00:00", "consulta", "agendado", "Consultório 1", "Agendamento de teste");'
) AS script_insert;
