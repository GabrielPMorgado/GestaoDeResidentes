-- Script SQL para adicionar colunas de recuperação de senha na tabela usuarios
-- Execute este script no MySQL Workbench ou via linha de comando

USE sistema_residencial;

-- Adicionar coluna token_recuperacao
ALTER TABLE usuarios 
ADD COLUMN token_recuperacao VARCHAR(255) NULL AFTER ultimo_acesso;

-- Adicionar coluna token_recuperacao_expira
ALTER TABLE usuarios 
ADD COLUMN token_recuperacao_expira DATETIME NULL AFTER token_recuperacao;

-- Verificar se as colunas foram criadas
DESCRIBE usuarios;
