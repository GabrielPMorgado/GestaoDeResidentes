-- Adicionar coluna salario na tabela profissionais (caso não exista)
-- Este script pode ser executado caso a coluna não tenha sido criada na estrutura inicial

ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS salario DECIMAL(10, 2) COMMENT 'Salário base do profissional';

-- Adicionar índice para otimizar consultas de relatórios
CREATE INDEX IF NOT EXISTS idx_profissionais_salario ON profissionais(salario);
CREATE INDEX IF NOT EXISTS idx_profissionais_ativo_salario ON profissionais(ativo, salario);

-- Comentário da tabela
ALTER TABLE profissionais COMMENT = 'Tabela de profissionais da instituição com informações completas incluindo dados financeiros';
