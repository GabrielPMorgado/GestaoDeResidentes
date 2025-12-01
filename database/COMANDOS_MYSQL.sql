-- ============================================
-- GUIA DE COMANDOS MYSQL
-- Sistema de Gerenciamento Residencial
-- ============================================

-- ============================================
-- 1. CONECTAR AO MYSQL
-- ============================================

-- No terminal/PowerShell:
-- mysql -u root -p
-- (Digite a senha quando solicitado)

-- ============================================
-- 2. COMANDOS BÁSICOS
-- ============================================

-- Listar todos os bancos de dados
SHOW DATABASES;

-- Selecionar o banco de dados
USE sistema_residencial;

-- Listar todas as tabelas
SHOW TABLES;

-- Ver estrutura de uma tabela
DESCRIBE residentes;
DESCRIBE profissionais;
DESCRIBE agendamentos;
DESCRIBE historico_consultas;

-- Ou use:
SHOW COLUMNS FROM residentes;

-- ============================================
-- 3. CONSULTAR RESIDENTES
-- ============================================

-- Listar TODOS os residentes
SELECT * FROM residentes;

-- Listar apenas residentes ATIVOS
SELECT * FROM residentes WHERE status = 'ativo';

-- Listar residentes INATIVOS
SELECT * FROM residentes WHERE status = 'inativo';

-- Buscar residente por NOME (parcial)
SELECT * FROM residentes WHERE nome_completo LIKE '%João%';

-- Buscar residente por CPF
SELECT * FROM residentes WHERE cpf = '123.456.789-00';

-- Buscar residentes por CIDADE
SELECT * FROM residentes WHERE cidade = 'São Paulo';

-- Buscar residentes por ESTADO
SELECT * FROM residentes WHERE estado = 'SP';

-- Buscar residentes por SEXO
SELECT * FROM residentes WHERE sexo = 'masculino';

-- Buscar residentes por ESTADO CIVIL
SELECT * FROM residentes WHERE estado_civil = 'casado';

-- Contar total de residentes ativos
SELECT COUNT(*) AS total FROM residentes WHERE status = 'ativo';

-- Listar residentes ordenados por nome
SELECT * FROM residentes ORDER BY nome_completo ASC;

-- Listar últimos 10 residentes cadastrados
SELECT * FROM residentes ORDER BY data_cadastro DESC LIMIT 10;

-- Buscar residentes com múltiplos filtros
SELECT * FROM residentes 
WHERE status = 'ativo' 
  AND estado = 'SP' 
  AND sexo = 'feminino';

-- ============================================
-- 4. CONSULTAR PROFISSIONAIS
-- ============================================

-- Listar TODOS os profissionais
SELECT * FROM profissionais;

-- Listar apenas profissionais ATIVOS
SELECT * FROM profissionais WHERE status = 'ativo';

-- Listar profissionais INATIVOS
SELECT * FROM profissionais WHERE status = 'inativo';

-- Buscar profissional por NOME
SELECT * FROM profissionais WHERE nome_completo LIKE '%Maria%';

-- Buscar profissional por CPF
SELECT * FROM profissionais WHERE cpf = '987.654.321-00';

-- Buscar profissionais por PROFISSÃO
SELECT * FROM profissionais WHERE profissao = 'Médico';

-- Buscar profissionais por DEPARTAMENTO
SELECT * FROM profissionais WHERE departamento = 'Clínico';

-- Buscar profissionais por TURNO
SELECT * FROM profissionais WHERE turno = 'Manhã';

-- Buscar profissionais por ESPECIALIDADE
SELECT * FROM profissionais WHERE especialidade = 'Geriatria';

-- Buscar profissionais com salário acima de R$ 5.000
SELECT * FROM profissionais WHERE salario > 5000;

-- Buscar profissionais com salário entre R$ 3.000 e R$ 10.000
SELECT * FROM profissionais WHERE salario BETWEEN 3000 AND 10000;

-- Listar profissionais com salário (ordenado do maior para o menor)
SELECT nome_completo, profissao, salario 
FROM profissionais 
WHERE status = 'ativo' 
ORDER BY salario DESC;

-- Contar profissionais por profissão
SELECT profissao, COUNT(*) AS total 
FROM profissionais 
WHERE status = 'ativo' 
GROUP BY profissao;

-- Contar profissionais por departamento
SELECT departamento, COUNT(*) AS total 
FROM profissionais 
WHERE status = 'ativo' 
GROUP BY departamento;

-- Média salarial por departamento
SELECT departamento, AVG(salario) AS media_salarial 
FROM profissionais 
WHERE status = 'ativo' AND salario IS NOT NULL
GROUP BY departamento;

-- Total da folha de pagamento
SELECT SUM(salario) AS folha_total 
FROM profissionais 
WHERE status = 'ativo';

-- ============================================
-- 5. CONSULTAR AGENDAMENTOS (COM NOMES)
-- ============================================

-- ⭐ Listar TODOS os agendamentos COM NOMES
SELECT 
  a.id,
  a.data_agendamento,
  a.hora_inicio,
  a.hora_fim,
  r.nome_completo AS nome_residente,
  r.cpf AS cpf_residente,
  p.nome_completo AS nome_profissional,
  p.profissao,
  a.tipo_atendimento,
  a.titulo,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
ORDER BY a.data_agendamento DESC, a.hora_inicio;

-- ⭐ Agendamentos de HOJE com NOMES COMPLETOS
SELECT 
  a.id AS 'ID',
  a.hora_inicio AS 'Hora Início',
  a.hora_fim AS 'Hora Fim',
  r.nome_completo AS 'Residente/Paciente',
  r.telefone AS 'Telefone Residente',
  p.nome_completo AS 'Profissional',
  p.profissao AS 'Profissão',
  a.tipo_atendimento AS 'Tipo',
  a.titulo AS 'Título',
  a.local AS 'Local',
  a.status AS 'Status'
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = CURDATE()
ORDER BY a.hora_inicio;

-- ⭐ Agendamentos de AMANHÃ com NOMES
SELECT 
  a.hora_inicio,
  a.hora_fim,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  a.tipo_atendimento,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
ORDER BY a.hora_inicio;

-- ⭐ Agendamentos da SEMANA com NOMES
SELECT 
  DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') AS data,
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS hora,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  p.profissao,
  a.tipo_atendimento,
  a.titulo,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY a.data_agendamento, a.hora_inicio;

-- ⭐ Agendamentos do MÊS ATUAL com NOMES
SELECT 
  DATE_FORMAT(a.data_agendamento, '%d/%m') AS dia,
  a.hora_inicio,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  a.tipo_atendimento,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE MONTH(a.data_agendamento) = MONTH(CURDATE()) 
  AND YEAR(a.data_agendamento) = YEAR(CURDATE())
ORDER BY a.data_agendamento, a.hora_inicio;

-- ⭐ Buscar agendamentos por NOME DO RESIDENTE
SELECT 
  a.data_agendamento,
  a.hora_inicio,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  a.tipo_atendimento,
  a.titulo,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE r.nome_completo LIKE '%João%'
ORDER BY a.data_agendamento DESC;

-- ⭐ Buscar agendamentos por NOME DO PROFISSIONAL
SELECT 
  a.data_agendamento,
  a.hora_inicio,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  a.tipo_atendimento,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE p.nome_completo LIKE '%Maria%'
ORDER BY a.data_agendamento DESC;

-- ⭐ Buscar agendamentos por STATUS com NOMES
SELECT 
  a.data_agendamento,
  a.hora_inicio,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  a.tipo_atendimento,
  a.titulo
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.status = 'agendado'
ORDER BY a.data_agendamento, a.hora_inicio;

-- ⭐ Buscar agendamentos CONFIRMADOS de HOJE
SELECT 
  a.hora_inicio AS 'Horário',
  r.nome_completo AS 'Paciente',
  r.telefone AS 'Telefone',
  p.nome_completo AS 'Profissional',
  a.tipo_atendimento AS 'Tipo',
  a.local AS 'Sala/Local'
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = CURDATE()
  AND a.status IN ('confirmado', 'agendado')
ORDER BY a.hora_inicio;

-- Contar agendamentos por status
SELECT status, COUNT(*) AS total 
FROM agendamentos 
GROUP BY status;

-- Contar agendamentos por tipo de atendimento
SELECT tipo_atendimento, COUNT(*) AS total 
FROM agendamentos 
GROUP BY tipo_atendimento;

-- ============================================
-- 6. CONSULTAS COM JOINS AVANÇADAS
-- ============================================

-- ⭐ AGENDA COMPLETA - Visão detalhada com TODOS os dados
SELECT 
  a.id AS 'ID Agendamento',
  DATE_FORMAT(a.data_agendamento, '%d/%m/%Y - %W') AS 'Data',
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS 'Início',
  DATE_FORMAT(a.hora_fim, '%H:%i') AS 'Fim',
  r.id AS 'ID Residente',
  r.nome_completo AS 'Residente/Paciente',
  r.telefone AS 'Tel. Residente',
  r.nome_responsavel AS 'Responsável',
  r.telefone_responsavel AS 'Tel. Responsável',
  p.id AS 'ID Profissional',
  p.nome_completo AS 'Profissional',
  p.profissao AS 'Profissão',
  p.especialidade AS 'Especialidade',
  p.celular AS 'Tel. Profissional',
  a.tipo_atendimento AS 'Tipo Atendimento',
  a.titulo AS 'Título',
  a.descricao AS 'Descrição',
  a.local AS 'Local',
  a.status AS 'Status',
  a.observacoes AS 'Observações'
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento >= CURDATE()
ORDER BY a.data_agendamento, a.hora_inicio;

-- ⭐ RELATÓRIO DO DIA - Para imprimir ou enviar
SELECT 
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS 'Horário',
  CONCAT(
    r.nome_completo, 
    ' (Tel: ', COALESCE(r.telefone, 'Não informado'), ')'
  ) AS 'Paciente',
  CONCAT(
    p.nome_completo, 
    ' - ', 
    p.profissao,
    CASE WHEN p.especialidade IS NOT NULL 
         THEN CONCAT(' (', p.especialidade, ')') 
         ELSE '' 
    END
  ) AS 'Profissional',
  a.tipo_atendimento AS 'Tipo',
  COALESCE(a.local, 'A definir') AS 'Local',
  a.status AS 'Status'
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = CURDATE()
ORDER BY a.hora_inicio;

-- Contar agendamentos por residente
SELECT 
  r.nome_completo,
  COUNT(a.id) AS total_agendamentos
FROM residentes r
LEFT JOIN agendamentos a ON r.id = a.residente_id
GROUP BY r.id, r.nome_completo
ORDER BY total_agendamentos DESC;

-- Contar agendamentos por profissional
SELECT 
  p.nome_completo,
  p.profissao,
  COUNT(a.id) AS total_atendimentos
FROM profissionais p
LEFT JOIN agendamentos a ON p.id = a.profissional_id
GROUP BY p.id, p.nome_completo, p.profissao
ORDER BY total_atendimentos DESC;

-- ============================================
-- 7. HISTÓRICO DE CONSULTAS
-- ============================================

-- Listar TODO o histórico
SELECT * FROM historico_consultas;

-- Histórico de um residente específico
SELECT * FROM historico_consultas WHERE residente_id = 1;

-- Histórico de um profissional específico
SELECT * FROM historico_consultas WHERE profissional_id = 1;

-- Histórico com NOMES (join)
SELECT 
  hc.id,
  hc.data_consulta,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  p.profissao,
  hc.diagnostico,
  hc.data_retorno
FROM historico_consultas hc
INNER JOIN residentes r ON hc.residente_id = r.id
INNER JOIN profissionais p ON hc.profissional_id = p.id
ORDER BY hc.data_consulta DESC;

-- Histórico do MÊS ATUAL
SELECT * FROM historico_consultas 
WHERE MONTH(data_consulta) = MONTH(CURDATE()) 
  AND YEAR(data_consulta) = YEAR(CURDATE());

-- ============================================
-- 8. CONSULTAS ESTATÍSTICAS
-- ============================================

-- Total de residentes, profissionais e agendamentos
SELECT 
  (SELECT COUNT(*) FROM residentes WHERE status = 'ativo') AS total_residentes,
  (SELECT COUNT(*) FROM profissionais WHERE status = 'ativo') AS total_profissionais,
  (SELECT COUNT(*) FROM agendamentos WHERE status != 'cancelado') AS total_agendamentos;

-- Distribuição de residentes por estado
SELECT estado, COUNT(*) AS total 
FROM residentes 
WHERE status = 'ativo' AND estado IS NOT NULL
GROUP BY estado 
ORDER BY total DESC;

-- Distribuição de residentes por cidade
SELECT cidade, COUNT(*) AS total 
FROM residentes 
WHERE status = 'ativo' AND cidade IS NOT NULL
GROUP BY cidade 
ORDER BY total DESC 
LIMIT 10;

-- Profissionais por turno
SELECT turno, COUNT(*) AS total 
FROM profissionais 
WHERE status = 'ativo'
GROUP BY turno;

-- Taxa de ocupação (agendamentos vs horários disponíveis)
SELECT 
  DATE(data_agendamento) AS data,
  COUNT(*) AS total_agendamentos,
  COUNT(CASE WHEN status = 'concluido' THEN 1 END) AS concluidos,
  COUNT(CASE WHEN status = 'cancelado' THEN 1 END) AS cancelados,
  COUNT(CASE WHEN status = 'falta' THEN 1 END) AS faltas
FROM agendamentos
WHERE data_agendamento >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(data_agendamento)
ORDER BY data DESC;

-- ============================================
-- 9. RELATÓRIOS FINANCEIROS
-- ============================================

-- Folha de pagamento por departamento
SELECT 
  departamento,
  COUNT(*) AS total_funcionarios,
  SUM(salario) AS folha_total,
  AVG(salario) AS salario_medio,
  MIN(salario) AS menor_salario,
  MAX(salario) AS maior_salario
FROM profissionais
WHERE status = 'ativo' AND salario IS NOT NULL
GROUP BY departamento
ORDER BY folha_total DESC;

-- Folha de pagamento por profissão
SELECT 
  profissao,
  COUNT(*) AS total,
  SUM(salario) AS folha_total,
  AVG(salario) AS salario_medio
FROM profissionais
WHERE status = 'ativo' AND salario IS NOT NULL
GROUP BY profissao
ORDER BY folha_total DESC;

-- Total geral da folha de pagamento
SELECT 
  COUNT(*) AS total_funcionarios,
  SUM(salario) AS folha_mensal,
  SUM(salario) * 12 AS folha_anual
FROM profissionais
WHERE status = 'ativo' AND salario IS NOT NULL;

-- ============================================
-- 10. BUSCA AVANÇADA
-- ============================================

-- Buscar em múltiplos campos (residente)
SELECT * FROM residentes 
WHERE nome_completo LIKE '%João%' 
   OR cpf LIKE '%123%' 
   OR telefone LIKE '%11%';

-- Buscar residentes sem email cadastrado
SELECT * FROM residentes WHERE email IS NULL OR email = '';

-- Buscar profissionais sem salário cadastrado
SELECT * FROM profissionais WHERE salario IS NULL;

-- Buscar agendamentos sem observações
SELECT * FROM agendamentos WHERE observacoes IS NULL OR observacoes = '';

-- Residentes cadastrados nos últimos 30 dias
SELECT * FROM residentes 
WHERE data_cadastro >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY data_cadastro DESC;

-- Profissionais admitidos no último ano
SELECT * FROM profissionais 
WHERE data_admissao >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
ORDER BY data_admissao DESC;

-- ============================================
-- 11. ATUALIZAR DADOS
-- ============================================

-- ATENÇÃO: Use com cuidado! Sempre teste com SELECT antes de UPDATE

-- Atualizar status de residente
UPDATE residentes SET status = 'inativo' WHERE id = 1;

-- Atualizar salário de profissional
UPDATE profissionais SET salario = 6000.00 WHERE id = 1;

-- Cancelar agendamento
UPDATE agendamentos SET status = 'cancelado' WHERE id = 1;

-- Atualizar múltiplos campos
UPDATE profissionais 
SET status = 'ferias', observacoes = 'Férias de dezembro'
WHERE id = 1;

-- ============================================
-- 12. DELETAR DADOS
-- ============================================

-- ATENÇÃO: DELETE é permanente! Use com extremo cuidado!

-- Deletar residente (use inativação ao invés de delete)
-- DELETE FROM residentes WHERE id = 1;

-- Melhor opção: INATIVAR ao invés de deletar
UPDATE residentes SET status = 'inativo' WHERE id = 1;

-- ============================================
-- 13. BACKUP E EXPORTAÇÃO
-- ============================================

-- Exportar tabela para CSV (no terminal MySQL):
-- SELECT * FROM residentes 
-- INTO OUTFILE '/tmp/residentes.csv'
-- FIELDS TERMINATED BY ','
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n';

-- Backup completo do banco (no terminal do sistema):
-- mysqldump -u root -p sistema_residencial > backup_sistema.sql

-- Restaurar backup:
-- mysql -u root -p sistema_residencial < backup_sistema.sql

-- ============================================
-- 14. COMANDOS ÚTEIS DE MANUTENÇÃO
-- ============================================

-- Ver tamanho das tabelas
SELECT 
  table_name AS Tabela,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamanho (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'sistema_residencial'
ORDER BY (data_length + index_length) DESC;

-- Ver índices de uma tabela
SHOW INDEX FROM profissionais;

-- Ver última consulta executada (precisa ter query log habilitado)
SHOW VARIABLES LIKE 'general_log%';

-- Ver conexões ativas
SHOW PROCESSLIST;

-- Ver variáveis do MySQL
SHOW VARIABLES;

-- Ver status do servidor
SHOW STATUS;

-- ============================================
-- 15. EXEMPLOS PRÁTICOS DO DIA A DIA
-- ============================================

-- ⭐ Ver agenda de HOJE de um profissional específico (DETALHADA)
SELECT 
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS 'Horário',
  DATE_FORMAT(a.hora_fim, '%H:%i') AS 'Até',
  r.nome_completo AS 'Paciente',
  r.telefone AS 'Telefone',
  r.nome_responsavel AS 'Responsável',
  a.tipo_atendimento AS 'Tipo',
  a.titulo AS 'Motivo',
  a.local AS 'Local',
  a.status AS 'Status',
  a.observacoes AS 'Obs'
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE p.nome_completo LIKE '%Maria%'  -- Troque pelo nome do profissional
  AND a.data_agendamento = CURDATE()
ORDER BY a.hora_inicio;

-- ⭐ Ver agenda de um profissional por ID
SELECT 
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS hora,
  r.nome_completo AS paciente,
  r.telefone,
  a.tipo_atendimento,
  a.titulo,
  a.status
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
WHERE a.profissional_id = 1  -- Troque pelo ID do profissional
  AND a.data_agendamento = CURDATE()
ORDER BY a.hora_inicio;

-- ⭐ Ver TODOS os agendamentos de um RESIDENTE específico
SELECT 
  DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') AS data,
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS hora,
  p.nome_completo AS profissional,
  p.profissao,
  a.tipo_atendimento,
  a.titulo,
  a.status
FROM agendamentos a
INNER JOIN profissionais p ON a.profissional_id = p.id
INNER JOIN residentes r ON a.residente_id = r.id
WHERE r.nome_completo LIKE '%João%'  -- Troque pelo nome do residente
ORDER BY a.data_agendamento DESC, a.hora_inicio;

-- ⭐ Listar agendamentos pendentes (para ligar e confirmar)
SELECT 
  r.nome_completo AS 'Paciente',
  r.telefone AS 'Telefone',
  r.telefone_responsavel AS 'Tel. Responsável',
  DATE_FORMAT(a.data_agendamento, '%d/%m/%Y') AS 'Data',
  DATE_FORMAT(a.hora_inicio, '%H:%i') AS 'Horário',
  p.nome_completo AS 'Profissional',
  a.tipo_atendimento AS 'Tipo'
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.status = 'agendado'
  AND a.data_agendamento >= CURDATE()
ORDER BY a.data_agendamento, a.hora_inicio;

-- Próximos aniversariantes (residentes)
SELECT 
  nome_completo,
  DATE_FORMAT(data_nascimento, '%d/%m') AS aniversario,
  YEAR(CURDATE()) - YEAR(data_nascimento) AS idade
FROM residentes
WHERE MONTH(data_nascimento) = MONTH(CURDATE())
  AND status = 'ativo'
ORDER BY DAY(data_nascimento);

-- Profissionais em aniversário de admissão (tempo de casa)
SELECT 
  nome_completo,
  profissao,
  data_admissao,
  YEAR(CURDATE()) - YEAR(data_admissao) AS anos_de_servico
FROM profissionais
WHERE MONTH(data_admissao) = MONTH(CURDATE())
  AND status = 'ativo'
ORDER BY anos_de_servico DESC;

-- Relatório diário completo
SELECT 
  'Residentes Ativos' AS Tipo, 
  COUNT(*) AS Total 
FROM residentes WHERE status = 'ativo'
UNION ALL
SELECT 
  'Profissionais Ativos', 
  COUNT(*) 
FROM profissionais WHERE status = 'ativo'
UNION ALL
SELECT 
  'Agendamentos Hoje', 
  COUNT(*) 
FROM agendamentos WHERE data_agendamento = CURDATE()
UNION ALL
SELECT 
  'Agendamentos Pendentes', 
  COUNT(*) 
FROM agendamentos 
WHERE data_agendamento >= CURDATE() AND status IN ('agendado', 'confirmado');

-- ============================================
-- FIM DO GUIA
-- ============================================

-- DICA: Sempre teste suas consultas com SELECT antes de fazer UPDATE ou DELETE!
-- DICA: Use LIMIT para testar consultas que podem retornar muitos resultados
-- DICA: Faça backup regularmente do banco de dados

-- Exemplos com LIMIT:
SELECT * FROM residentes LIMIT 10;
SELECT * FROM profissionais WHERE status = 'ativo' LIMIT 5;
