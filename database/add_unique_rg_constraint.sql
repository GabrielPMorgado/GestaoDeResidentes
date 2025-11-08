-- ============================================
-- Adicionar constraint UNIQUE para RG
-- Garante que RG não seja duplicado
-- ============================================

USE sistema_residencial;

-- Adicionar UNIQUE constraint para RG na tabela de residentes
ALTER TABLE residentes
ADD UNIQUE INDEX idx_unique_rg (rg);

-- Adicionar UNIQUE constraint para RG na tabela de profissionais
ALTER TABLE profissionais
ADD UNIQUE INDEX idx_unique_rg (rg);

-- Verificar as constraints criadas
SHOW INDEX FROM residentes WHERE Key_name = 'idx_unique_rg';
SHOW INDEX FROM profissionais WHERE Key_name = 'idx_unique_rg';

-- ============================================
-- NOTA IMPORTANTE:
-- Se já existirem RGs duplicados no banco, 
-- este script falhará. Nesse caso, execute 
-- primeiro o script de limpeza:
-- 
-- SELECT rg, COUNT(*) as total 
-- FROM residentes 
-- WHERE rg IS NOT NULL 
-- GROUP BY rg 
-- HAVING COUNT(*) > 1;
-- 
-- SELECT rg, COUNT(*) as total 
-- FROM profissionais 
-- WHERE rg IS NOT NULL 
-- GROUP BY rg 
-- HAVING COUNT(*) > 1;
-- ============================================
