-- ============================================
-- VERIFICAR ESTRUTURA DA TABELA PROFISSIONAIS
-- Execute este script no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- Ver estrutura da tabela
DESCRIBE profissionais;

-- Contar profissionais
SELECT COUNT(*) as total_profissionais FROM profissionais;

-- Ver primeiros 5 profissionais
SELECT id, nome_completo, cpf, profissao, cargo, departamento, status, data_cadastro 
FROM profissionais 
ORDER BY id ASC 
LIMIT 5;

-- Verificar se há problemas com timestamps
SELECT id, nome_completo, data_cadastro, data_atualizacao 
FROM profissionais 
WHERE data_cadastro IS NULL OR data_atualizacao IS NULL;
