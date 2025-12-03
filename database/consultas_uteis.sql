-- ============================================
-- CONSULTAS ÚTEIS - SISTEMA RESIDENCIAL
-- Execute no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- ============================================
-- 1. CONSULTAS DE RESIDENTES
-- ============================================

-- Ver todos os residentes ativos
SELECT id, nome_completo, cpf, telefone, status, data_cadastro
FROM residentes
WHERE status = 'ativo'
ORDER BY nome_completo;

-- Ver residente específico com detalhes completos
SELECT * FROM residentes WHERE id = 1;

-- Buscar residente por nome
SELECT id, nome_completo, cpf, telefone
FROM residentes
WHERE nome_completo LIKE '%João%';

-- Contar residentes por status
SELECT status, COUNT(*) as total
FROM residentes
GROUP BY status;

-- Residentes com responsável
SELECT 
    r.id,
    r.nome_completo as residente,
    r.telefone as tel_residente,
    r.nome_responsavel as responsavel,
    r.parentesco_responsavel as parentesco,
    r.telefone_responsavel as tel_responsavel
FROM residentes r
WHERE r.status = 'ativo'
ORDER BY r.nome_completo;

-- ============================================
-- 2. CONSULTAS DE PROFISSIONAIS
-- ============================================

-- Ver todos os profissionais ativos
SELECT id, nome_completo, especialidade, celular, registro_profissional, status
FROM profissionais
WHERE status = 'ativo'
ORDER BY especialidade, nome_completo;

-- Profissionais por especialidade
SELECT especialidade, COUNT(*) as quantidade
FROM profissionais
WHERE status = 'ativo'
GROUP BY especialidade
ORDER BY quantidade DESC;

-- Buscar profissional específico
SELECT * FROM profissionais WHERE nome_completo LIKE '%Fernanda%';

-- ============================================
-- 3. CONSULTAS DE AGENDAMENTOS
-- ============================================

-- Agendamentos do dia (hoje)
SELECT 
    a.id,
    r.nome_completo as residente,
    p.nome_completo as profissional,
    p.especialidade,
    a.titulo,
    a.data_agendamento,
    a.hora_inicio,
    a.hora_fim,
    a.tipo_atendimento,
    a.status
FROM agendamentos a
JOIN residentes r ON a.residente_id = r.id
JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = CURDATE()
ORDER BY a.hora_inicio;

-- Próximos agendamentos (próximos 7 dias)
SELECT 
    a.id,
    r.nome_completo as residente,
    p.nome_completo as profissional,
    a.titulo,
    a.data_agendamento,
    a.hora_inicio,
    a.status
FROM agendamentos a
JOIN residentes r ON a.residente_id = r.id
JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND a.status != 'cancelado'
ORDER BY a.data_agendamento, a.hora_inicio;

-- Agendamentos por residente específico
SELECT 
    a.data_agendamento,
    a.hora_inicio,
    p.nome_completo as profissional,
    a.titulo,
    a.tipo_atendimento,
    a.status
FROM agendamentos a
JOIN profissionais p ON a.profissional_id = p.id
WHERE a.residente_id = 1
ORDER BY a.data_agendamento DESC;

-- Agendamentos por status
SELECT status, COUNT(*) as total
FROM agendamentos
GROUP BY status;

-- ============================================
-- 4. CONSULTAS DE HISTÓRICO
-- ============================================

-- Histórico de consultas de um residente
SELECT 
    h.id,
    h.data_consulta,
    p.nome_completo as profissional,
    p.especialidade,
    h.tipo_atendimento,
    h.diagnostico,
    h.prescricao,
    h.observacoes
FROM historico_consultas h
JOIN profissionais p ON h.profissional_id = p.id
WHERE h.residente_id = 1
ORDER BY h.data_consulta DESC;

-- Últimas 10 consultas realizadas
SELECT 
    h.data_consulta,
    r.nome_completo as residente,
    p.nome_completo as profissional,
    h.tipo_atendimento,
    h.diagnostico
FROM historico_consultas h
JOIN residentes r ON h.residente_id = r.id
JOIN profissionais p ON h.profissional_id = p.id
ORDER BY h.data_consulta DESC
LIMIT 10;

-- ============================================
-- 5. CONSULTAS FINANCEIRAS - MENSALIDADES
-- ============================================

-- Mensalidades pendentes
SELECT 
    pm.id,
    r.nome_completo as residente,
    pm.valor,
    CONCAT(pm.mes_referencia, '/', pm.ano_referencia) as mes_ano,
    pm.data_vencimento,
    pm.status,
    DATEDIFF(CURDATE(), pm.data_vencimento) as dias_atraso
FROM pagamentos_mensalidades pm
JOIN residentes r ON pm.residente_id = r.id
WHERE pm.status = 'pendente'
ORDER BY pm.data_vencimento;

-- Mensalidades pagas no mês atual
SELECT 
    r.nome_completo as residente,
    pm.valor,
    pm.data_pagamento,
    pm.metodo_pagamento
FROM pagamentos_mensalidades pm
JOIN residentes r ON pm.residente_id = r.id
WHERE pm.status = 'pago'
  AND pm.mes_referencia = MONTH(CURDATE())
  AND pm.ano_referencia = YEAR(CURDATE())
ORDER BY pm.data_pagamento DESC;

-- Total de receitas por mês
SELECT 
    CONCAT(mes_referencia, '/', ano_referencia) as mes_ano,
    COUNT(*) as qtd_pagamentos,
    SUM(valor) as total_recebido
FROM pagamentos_mensalidades
WHERE status = 'pago'
GROUP BY ano_referencia, mes_referencia
ORDER BY ano_referencia DESC, mes_referencia DESC;

-- Inadimplência por residente
SELECT 
    r.nome_completo as residente,
    r.telefone,
    r.nome_responsavel as responsavel,
    r.telefone_responsavel as tel_responsavel,
    COUNT(pm.id) as mensalidades_pendentes,
    SUM(pm.valor) as valor_devido
FROM residentes r
JOIN pagamentos_mensalidades pm ON r.id = pm.residente_id
WHERE pm.status = 'pendente'
  AND pm.data_vencimento < CURDATE()
GROUP BY r.id, r.nome_completo, r.telefone, r.nome_responsavel, r.telefone_responsavel
ORDER BY valor_devido DESC;

-- ============================================
-- 6. CONSULTAS FINANCEIRAS - SALÁRIOS
-- ============================================

-- Salários pendentes do mês atual
SELECT 
    p.nome_completo as profissional,
    p.especialidade,
    ps.valor as salario_base,
    ps.bonus,
    ps.descontos,
    (ps.valor + ps.bonus - ps.descontos) as valor_liquido,
    CONCAT(ps.mes_referencia, '/', ps.ano_referencia) as mes_ano,
    ps.status
FROM pagamentos_salarios ps
JOIN profissionais p ON ps.profissional_id = p.id
WHERE ps.status = 'pendente'
  AND ps.mes_referencia = MONTH(CURDATE())
  AND ps.ano_referencia = YEAR(CURDATE())
ORDER BY valor_liquido DESC;

-- Folha de pagamento total por mês
SELECT 
    CONCAT(mes_referencia, '/', ano_referencia) as mes_ano,
    COUNT(*) as qtd_profissionais,
    SUM(valor) as total_salarios,
    SUM(bonus) as total_bonus,
    SUM(descontos) as total_descontos,
    SUM(valor + bonus - descontos) as folha_liquida
FROM pagamentos_salarios
WHERE status = 'pago'
GROUP BY ano_referencia, mes_referencia
ORDER BY ano_referencia DESC, mes_referencia DESC;

-- Histórico salarial de um profissional
SELECT 
    CONCAT(ps.mes_referencia, '/', ps.ano_referencia) as mes_ano,
    ps.valor as salario_base,
    ps.bonus,
    ps.descontos,
    (ps.valor + ps.bonus - ps.descontos) as valor_liquido,
    ps.status,
    ps.data_pagamento
FROM pagamentos_salarios ps
WHERE ps.profissional_id = 1
ORDER BY ps.ano_referencia DESC, ps.mes_referencia DESC;

-- ============================================
-- 7. CONSULTAS FINANCEIRAS - DESPESAS GERAIS
-- ============================================

-- Despesas pendentes
SELECT 
    id,
    descricao,
    categoria,
    valor,
    data_despesa,
    DATEDIFF(CURDATE(), data_despesa) as dias_pendente
FROM despesas_gerais
WHERE status = 'pendente'
ORDER BY data_despesa;

-- Despesas por categoria no mês atual
SELECT 
    categoria,
    COUNT(*) as quantidade,
    SUM(valor) as total
FROM despesas_gerais
WHERE MONTH(data_despesa) = MONTH(CURDATE())
  AND YEAR(data_despesa) = YEAR(CURDATE())
GROUP BY categoria
ORDER BY total DESC;

-- Total de despesas por mês
SELECT 
    DATE_FORMAT(data_despesa, '%m/%Y') as mes_ano,
    COUNT(*) as qtd_despesas,
    SUM(valor) as total_gasto
FROM despesas_gerais
WHERE status = 'pago'
GROUP BY DATE_FORMAT(data_despesa, '%Y-%m')
ORDER BY data_despesa DESC;

-- ============================================
-- 8. RESUMO FINANCEIRO COMPLETO
-- ============================================

-- Resumo do mês atual
SELECT 
    'Receitas (Mensalidades)' as tipo,
    SUM(valor) as valor,
    COUNT(*) as quantidade
FROM pagamentos_mensalidades
WHERE status = 'pago'
  AND mes_referencia = MONTH(CURDATE())
  AND ano_referencia = YEAR(CURDATE())

UNION ALL

SELECT 
    'Despesas (Salários)' as tipo,
    SUM(valor + bonus - descontos) as valor,
    COUNT(*) as quantidade
FROM pagamentos_salarios
WHERE status = 'pago'
  AND mes_referencia = MONTH(CURDATE())
  AND ano_referencia = YEAR(CURDATE())

UNION ALL

SELECT 
    'Despesas (Gerais)' as tipo,
    SUM(valor) as valor,
    COUNT(*) as quantidade
FROM despesas_gerais
WHERE status = 'pago'
  AND MONTH(data_despesa) = MONTH(CURDATE())
  AND YEAR(data_despesa) = YEAR(CURDATE());

-- Saldo mensal (receitas - despesas)
SELECT 
    CONCAT(m.mes, '/', m.ano) as periodo,
    COALESCE(receitas, 0) as receitas,
    COALESCE(despesas_salarios, 0) as salarios,
    COALESCE(despesas_gerais, 0) as despesas_gerais,
    COALESCE(receitas, 0) - COALESCE(despesas_salarios, 0) - COALESCE(despesas_gerais, 0) as saldo
FROM (
    SELECT DISTINCT mes_referencia as mes, ano_referencia as ano
    FROM pagamentos_mensalidades
    WHERE ano_referencia = YEAR(CURDATE())
) m
LEFT JOIN (
    SELECT mes_referencia, ano_referencia, SUM(valor) as receitas
    FROM pagamentos_mensalidades
    WHERE status = 'pago'
    GROUP BY ano_referencia, mes_referencia
) r ON m.mes = r.mes_referencia AND m.ano = r.ano_referencia
LEFT JOIN (
    SELECT mes_referencia, ano_referencia, SUM(valor + bonus - descontos) as despesas_salarios
    FROM pagamentos_salarios
    WHERE status = 'pago'
    GROUP BY ano_referencia, mes_referencia
) s ON m.mes = s.mes_referencia AND m.ano = s.ano_referencia
LEFT JOIN (
    SELECT MONTH(data_despesa) as mes, YEAR(data_despesa) as ano, SUM(valor) as despesas_gerais
    FROM despesas_gerais
    WHERE status = 'pago'
    GROUP BY YEAR(data_despesa), MONTH(data_despesa)
) d ON m.mes = d.mes AND m.ano = d.ano
ORDER BY m.ano DESC, m.mes DESC;

-- ============================================
-- 9. ESTATÍSTICAS GERAIS
-- ============================================

-- Dashboard geral
SELECT 'Total de Residentes Ativos' as metrica, COUNT(*) as valor FROM residentes WHERE status = 'ativo'
UNION ALL
SELECT 'Total de Profissionais Ativos', COUNT(*) FROM profissionais WHERE status = 'ativo'
UNION ALL
SELECT 'Agendamentos Hoje', COUNT(*) FROM agendamentos WHERE data_agendamento = CURDATE() AND status != 'cancelado'
UNION ALL
SELECT 'Agendamentos Próximos 7 Dias', COUNT(*) FROM agendamentos 
WHERE data_agendamento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status != 'cancelado'
UNION ALL
SELECT 'Mensalidades Pendentes', COUNT(*) FROM pagamentos_mensalidades WHERE status = 'pendente'
UNION ALL
SELECT 'Despesas Pendentes', COUNT(*) FROM despesas_gerais WHERE status = 'pendente';

-- ============================================
-- 10. CONSULTAS DE MANUTENÇÃO
-- ============================================

-- Ver estrutura de uma tabela
DESCRIBE residentes;
DESCRIBE profissionais;
DESCRIBE agendamentos;

-- Contar registros em todas as tabelas
SELECT 'residentes' as tabela, COUNT(*) as total FROM residentes
UNION ALL
SELECT 'profissionais', COUNT(*) FROM profissionais
UNION ALL
SELECT 'agendamentos', COUNT(*) FROM agendamentos
UNION ALL
SELECT 'historico_consultas', COUNT(*) FROM historico_consultas
UNION ALL
SELECT 'despesas_gerais', COUNT(*) FROM despesas_gerais
UNION ALL
SELECT 'pagamentos_mensalidades', COUNT(*) FROM pagamentos_mensalidades
UNION ALL
SELECT 'pagamentos_salarios', COUNT(*) FROM pagamentos_salarios;

-- Ver últimos registros inseridos
SELECT 'residente' as tipo, id, nome_completo as nome, data_cadastro as data
FROM residentes
ORDER BY data_cadastro DESC LIMIT 5;
