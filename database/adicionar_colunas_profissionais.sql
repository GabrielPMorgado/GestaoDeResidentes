-- ============================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA PROFISSIONAIS
-- Execute este script no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- Verificar estrutura atual
DESCRIBE profissionais;

-- Adicionar coluna estado_civil se não existir
ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro') NULL
AFTER sexo;

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20) NULL
AFTER estado_civil;

ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS titulo_eleitor VARCHAR(20) NULL
AFTER telefone_emergencia;

ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS numero_pis VARCHAR(20) NULL
AFTER titulo_eleitor;

ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS carteira_trabalho VARCHAR(20) NULL
AFTER numero_pis;

-- Verificar estrutura após alterações
DESCRIBE profissionais;

SELECT 'Colunas adicionadas com sucesso!' AS resultado;
