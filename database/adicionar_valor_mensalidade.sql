-- Adicionar campo valor_mensalidade na tabela residentes
-- Execute este script no MySQL para adicionar o campo

ALTER TABLE residentes 
ADD COLUMN valor_mensalidade DECIMAL(10, 2) NULL 
COMMENT 'Valor da mensalidade do residente' 
AFTER status;

-- Verificar se a coluna foi adicionada
DESCRIBE residentes;
