-- ============================================
-- DIAGNÓSTICO COMPLETO DA TABELA PROFISSIONAIS
-- Execute este script no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- 1. Verificar se a tabela existe
SHOW TABLES LIKE 'profissionais';

-- 2. Ver estrutura completa da tabela
DESCRIBE profissionais;

-- 3. Contar total de registros
SELECT COUNT(*) as total_profissionais FROM profissionais;

-- 4. Ver todos os profissionais (limitado a 10)
SELECT * FROM profissionais LIMIT 10;

-- 5. Verificar status dos profissionais
SELECT status, COUNT(*) as quantidade 
FROM profissionais 
GROUP BY status;

-- 6. Verificar profissões
SELECT profissao, COUNT(*) as quantidade 
FROM profissionais 
GROUP BY profissao;

-- 7. Verificar departamentos
SELECT departamento, COUNT(*) as quantidade 
FROM profissionais 
GROUP BY departamento;

-- 8. Verificar registros com problemas de data
SELECT id, nome_completo, data_cadastro, data_atualizacao
FROM profissionais
WHERE data_cadastro IS NULL OR data_atualizacao IS NULL;

-- 9. Verificar campos obrigatórios NULL
SELECT 
  id,
  nome_completo,
  CASE WHEN nome_completo IS NULL THEN 'NULL' ELSE 'OK' END as nome_status,
  CASE WHEN cpf IS NULL THEN 'NULL' ELSE 'OK' END as cpf_status,
  CASE WHEN profissao IS NULL THEN 'NULL' ELSE 'OK' END as profissao_status,
  CASE WHEN cargo IS NULL THEN 'NULL' ELSE 'OK' END as cargo_status
FROM profissionais
WHERE nome_completo IS NULL OR cpf IS NULL OR profissao IS NULL OR cargo IS NULL;

-- 10. Ver índices da tabela
SHOW INDEX FROM profissionais;
