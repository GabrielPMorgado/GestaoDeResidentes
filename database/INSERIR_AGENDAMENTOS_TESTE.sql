-- =====================================================
-- INSERIR AGENDAMENTOS DE TESTE
-- =====================================================

-- Primeiro, vamos verificar se existem residentes e profissionais
SELECT 'RESIDENTES DISPONÍVEIS:' as info;
SELECT id, nome_completo, cpf FROM residentes WHERE status = 'ativo' LIMIT 5;

SELECT 'PROFISSIONAIS DISPONÍVEIS:' as info;
SELECT id, nome_completo, cpf, profissao FROM profissionais WHERE status = 'ativo' LIMIT 5;

SELECT 'USUÁRIOS PROFISSIONAIS:' as info;
SELECT u.id, u.email, u.profissional_id, p.nome_completo 
FROM usuarios u
LEFT JOIN profissionais p ON u.profissional_id = p.id
WHERE u.tipo = 'profissional' AND u.ativo = true;

-- Inserir agendamentos de teste para os próximos dias
-- Substitua os IDs conforme necessário

-- IMPORTANTE: Execute as linhas abaixo DEPOIS de verificar os IDs acima

-- Exemplo 1: Agendamento para hoje às 14h
INSERT INTO agendamentos 
(residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim, tipo_atendimento, status, local, observacoes)
VALUES 
(1, 1, CURDATE(), '14:00:00', '15:00:00', 'consulta', 'agendado', 'Consultório 1', 'Consulta de rotina');

-- Exemplo 2: Agendamento para amanhã às 10h
INSERT INTO agendamentos 
(residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim, tipo_atendimento, status, local, observacoes)
VALUES 
(2, 1, CURDATE() + INTERVAL 1 DAY, '10:00:00', '11:00:00', 'consulta', 'agendado', 'Consultório 2', 'Consulta especializada');

-- Exemplo 3: Agendamento confirmado
INSERT INTO agendamentos 
(residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim, tipo_atendimento, status, local, observacoes)
VALUES 
(3, 1, CURDATE() + INTERVAL 2 DAY, '15:00:00', '16:00:00', 'exame', 'confirmado', 'Sala de Exames', 'Exame de rotina');

-- Verificar agendamentos inseridos
SELECT 'AGENDAMENTOS INSERIDOS:' as info;
SELECT 
    a.id,
    a.data_agendamento,
    a.hora_inicio,
    a.tipo_atendimento,
    a.status,
    r.nome_completo as residente,
    p.nome_completo as profissional
FROM agendamentos a
LEFT JOIN residentes r ON a.residente_id = r.id
LEFT JOIN profissionais p ON a.profissional_id = p.id
ORDER BY a.data_agendamento DESC, a.hora_inicio DESC
LIMIT 10;
