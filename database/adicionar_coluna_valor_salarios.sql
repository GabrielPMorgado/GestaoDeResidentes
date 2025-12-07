-- ============================================
-- ADICIONAR COLUNA VALOR EM PAGAMENTOS_SALARIOS
-- Execute este script se a tabela já existir sem a coluna valor
-- ============================================

USE sistema_residencial;

-- Verificar se a coluna não existe e adicionar
ALTER TABLE pagamentos_salarios 
ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
AFTER profissional_id;

-- Atualizar valores existentes (se houver registros)
-- UPDATE pagamentos_salarios SET valor = 0.00 WHERE valor IS NULL;

SELECT 'Coluna valor adicionada com sucesso!' AS resultado;
