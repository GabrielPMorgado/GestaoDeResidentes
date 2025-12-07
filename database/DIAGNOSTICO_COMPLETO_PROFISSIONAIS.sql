-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO: Agendamentos para Profissionais
-- =====================================================

-- PASSO 1: Ver todos os profissionais ativos
SELECT '=== PROFISSIONAIS ATIVOS ===' as '';
SELECT id, nome_completo, profissao, cpf, status 
FROM profissionais 
WHERE status = 'ativo'
ORDER BY nome_completo;

-- PASSO 2: Ver usuários profissionais e seus IDs
SELECT '=== USUÁRIOS PROFISSIONAIS ===' as '';
SELECT 
    u.id as usuario_id,
    u.email,
    u.profissional_id,
    p.nome_completo as nome_profissional,
    p.profissao,
    u.ativo
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional'
ORDER BY p.nome_completo;

-- PASSO 3: Ver todos os agendamentos existentes
SELECT '=== TODOS OS AGENDAMENTOS ===' as '';
SELECT 
    a.id,
    a.profissional_id,
    a.residente_id,
    a.data_agendamento,
    a.hora_inicio,
    a.status,
    p.nome_completo as profissional,
    r.nome_completo as residente
FROM agendamentos a
LEFT JOIN profissionais p ON a.profissional_id = p.id
LEFT JOIN residentes r ON a.residente_id = r.id
ORDER BY a.data_agendamento DESC, a.hora_inicio;

-- PASSO 4: Ver quantos agendamentos cada profissional tem
SELECT '=== CONTAGEM POR PROFISSIONAL ===' as '';
SELECT 
    p.id,
    p.nome_completo,
    COUNT(a.id) as total_agendamentos,
    SUM(CASE WHEN a.status = 'agendado' THEN 1 ELSE 0 END) as agendados,
    SUM(CASE WHEN a.status = 'confirmado' THEN 1 ELSE 0 END) as confirmados
FROM profissionais p
LEFT JOIN agendamentos a ON a.profissional_id = p.id
WHERE p.status = 'ativo'
GROUP BY p.id, p.nome_completo
ORDER BY total_agendamentos DESC;

-- PASSO 5: Identificar agendamentos sem profissional
SELECT '=== AGENDAMENTOS SEM PROFISSIONAL ===' as '';
SELECT 
    a.id,
    a.data_agendamento,
    a.hora_inicio,
    a.status,
    r.nome_completo as residente
FROM agendamentos a
LEFT JOIN residentes r ON a.residente_id = r.id
WHERE a.profissional_id IS NULL;

-- =====================================================
-- CORREÇÕES (Execute apenas se necessário)
-- =====================================================

-- OPÇÃO 1: Se os agendamentos NÃO têm profissional_id, atribuir ao primeiro profissional ativo
-- Descomente as linhas abaixo se necessário:

-- UPDATE agendamentos 
-- SET profissional_id = (SELECT id FROM profissionais WHERE status = 'ativo' ORDER BY id LIMIT 1)
-- WHERE profissional_id IS NULL;

-- OPÇÃO 2: Distribuir agendamentos entre vários profissionais
-- Primeiro, veja os IDs dos profissionais ativos:
SELECT '=== IDs DOS PROFISSIONAIS PARA DISTRIBUIÇÃO ===' as '';
SELECT id, nome_completo FROM profissionais WHERE status = 'ativo' ORDER BY id;

-- Depois, atribua manualmente cada agendamento:
-- UPDATE agendamentos SET profissional_id = 1 WHERE id = 1;
-- UPDATE agendamentos SET profissional_id = 2 WHERE id = 2;
-- etc...

-- OPÇÃO 3: Criar novos agendamentos de teste para profissionais específicos
-- Substitua os IDs conforme necessário

-- Para o Profissional ID 1:
-- INSERT INTO agendamentos 
-- (residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim, tipo_atendimento, status, local, observacoes)
-- VALUES 
-- ((SELECT id FROM residentes WHERE status = 'ativo' LIMIT 1), 
--  1, -- <-- ID do Profissional
--  CURDATE() + INTERVAL 1 DAY, '09:00:00', '10:00:00', 'consulta', 'agendado', 'Consultório 1', 'Consulta de rotina');

-- Para o Profissional ID 2:
-- INSERT INTO agendamentos 
-- (residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim, tipo_atendimento, status, local, observacoes)
-- VALUES 
-- ((SELECT id FROM residentes WHERE status = 'ativo' LIMIT 1 OFFSET 1), 
--  2, -- <-- ID do Profissional
--  CURDATE() + INTERVAL 2 DAY, '10:00:00', '11:00:00', 'consulta', 'agendado', 'Consultório 2', 'Avaliação médica');

-- VERIFICAÇÃO FINAL: Ver agendamentos por profissional específico
-- Substitua X pelo profissional_id que deseja verificar:
SELECT '=== AGENDAMENTOS DO PROFISSIONAL X ===' as '';
-- SELECT 
--     a.id,
--     a.data_agendamento,
--     a.hora_inicio,
--     a.status,
--     r.nome_completo as residente,
--     a.tipo_atendimento,
--     a.local
-- FROM agendamentos a
-- LEFT JOIN residentes r ON a.residente_id = r.id
-- WHERE a.profissional_id = X  -- <-- Substitua X pelo ID
-- ORDER BY a.data_agendamento, a.hora_inicio;
