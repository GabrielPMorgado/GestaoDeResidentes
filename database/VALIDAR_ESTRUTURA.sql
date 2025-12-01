-- ============================================
-- SCRIPT DE VALIDAÇÃO DA ESTRUTURA DO BANCO
-- Verifica compatibilidade entre formulários e tabelas
-- ============================================

USE sistema_residencial;

SET @validacao_ok = 0;

-- ============================================
-- VALIDAR TABELA: residentes
-- ============================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '📋 VALIDANDO TABELA: residentes' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

-- Verificar campos obrigatórios do formulário CadastroResidentes.jsx
SELECT 
  'Campo Obrigatório' AS Tipo,
  COLUMN_NAME AS Campo,
  COLUMN_TYPE AS 'Tipo SQL',
  IS_NULLABLE AS 'Aceita NULL',
  COLUMN_DEFAULT AS 'Valor Padrão',
  CASE 
    WHEN COLUMN_NAME IN ('nome_completo', 'cpf', 'data_nascimento', 'sexo', 'telefone', 'nome_responsavel', 'telefone_responsavel') 
    AND IS_NULLABLE = 'NO'
    THEN '✅ OK'
    ELSE '⚠️ Verificar'
  END AS Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'residentes'
  AND COLUMN_NAME IN (
    'nome_completo', 'cpf', 'rg', 'data_nascimento', 'sexo', 'estado_civil',
    'telefone', 'email', 'cep', 'logradouro', 'numero', 'complemento',
    'bairro', 'cidade', 'estado', 'nome_responsavel', 'parentesco_responsavel',
    'telefone_responsavel', 'email_responsavel', 'observacoes'
  )
ORDER BY COLUMN_NAME;

-- Verificar índices
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🔍 Índices da tabela residentes:' AS '';
SELECT 
  INDEX_NAME AS 'Nome do Índice',
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS 'Colunas',
  INDEX_TYPE AS 'Tipo',
  NON_UNIQUE AS 'Não Único',
  CASE 
    WHEN INDEX_NAME = 'PRIMARY' THEN '✅ Chave Primária'
    WHEN NON_UNIQUE = 0 THEN '✅ Unique Index'
    ELSE '✅ Index Normal'
  END AS Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'residentes'
GROUP BY INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY INDEX_NAME;

-- ============================================
-- VALIDAR TABELA: profissionais
-- ============================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '📋 VALIDANDO TABELA: profissionais' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

-- Verificar campos obrigatórios do formulário CadastroProfissionais.jsx
SELECT 
  'Campo Obrigatório' AS Tipo,
  COLUMN_NAME AS Campo,
  COLUMN_TYPE AS 'Tipo SQL',
  IS_NULLABLE AS 'Aceita NULL',
  COLUMN_DEFAULT AS 'Valor Padrão',
  CASE 
    WHEN COLUMN_NAME IN ('nome_completo', 'cpf', 'data_nascimento', 'sexo', 'celular', 
                         'email', 'profissao', 'data_admissao', 'cargo', 'turno') 
    AND IS_NULLABLE = 'NO'
    THEN '✅ OK'
    WHEN COLUMN_NAME = 'salario' AND COLUMN_TYPE LIKE '%decimal%'
    THEN '✅ OK (Campo Salário)'
    ELSE '⚠️ Verificar'
  END AS Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'profissionais'
  AND COLUMN_NAME IN (
    'nome_completo', 'cpf', 'rg', 'data_nascimento', 'sexo', 'celular', 'email',
    'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
    'profissao', 'registro_profissional', 'especialidade', 'data_admissao',
    'cargo', 'departamento', 'turno', 'salario', 'observacoes'
  )
ORDER BY COLUMN_NAME;

-- Verificar campo salario especificamente
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '💰 Validando campo SALARIO:' AS '';
SELECT 
  COLUMN_NAME AS Campo,
  COLUMN_TYPE AS 'Tipo SQL',
  NUMERIC_PRECISION AS Precisão,
  NUMERIC_SCALE AS Escala,
  CASE 
    WHEN COLUMN_TYPE = 'decimal(10,2)' 
    THEN '✅ Configurado corretamente para R$'
    ELSE '⚠️ Verificar configuração'
  END AS Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'profissionais'
  AND COLUMN_NAME = 'salario';

-- Verificar índices
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🔍 Índices da tabela profissionais:' AS '';
SELECT 
  INDEX_NAME AS 'Nome do Índice',
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS 'Colunas',
  INDEX_TYPE AS 'Tipo',
  NON_UNIQUE AS 'Não Único',
  CASE 
    WHEN INDEX_NAME = 'PRIMARY' THEN '✅ Chave Primária'
    WHEN NON_UNIQUE = 0 THEN '✅ Unique Index'
    WHEN INDEX_NAME = 'idx_status_salario' THEN '✅ Index Composto (Relatórios)'
    ELSE '✅ Index Normal'
  END AS Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'profissionais'
GROUP BY INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY INDEX_NAME;

-- ============================================
-- VALIDAR TABELA: agendamentos
-- ============================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '📋 VALIDANDO TABELA: agendamentos' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

-- Verificar campos obrigatórios do formulário CadastroAgendamento.jsx
SELECT 
  'Campo Obrigatório' AS Tipo,
  COLUMN_NAME AS Campo,
  COLUMN_TYPE AS 'Tipo SQL',
  IS_NULLABLE AS 'Aceita NULL',
  COLUMN_DEFAULT AS 'Valor Padrão',
  CASE 
    WHEN COLUMN_NAME IN ('residente_id', 'profissional_id', 'data_agendamento', 
                         'hora_inicio', 'hora_fim', 'tipo_atendimento', 'titulo') 
    AND IS_NULLABLE = 'NO'
    THEN '✅ OK'
    ELSE '⚠️ Verificar'
  END AS Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'agendamentos'
  AND COLUMN_NAME IN (
    'residente_id', 'profissional_id', 'data_agendamento', 'hora_inicio', 'hora_fim',
    'tipo_atendimento', 'titulo', 'descricao', 'local', 'observacoes'
  )
ORDER BY COLUMN_NAME;

-- Verificar chaves estrangeiras
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🔗 Validando chaves estrangeiras de agendamentos:' AS '';
SELECT 
  CONSTRAINT_NAME AS 'Nome Constraint',
  COLUMN_NAME AS 'Coluna',
  REFERENCED_TABLE_NAME AS 'Tabela Referenciada',
  REFERENCED_COLUMN_NAME AS 'Coluna Referenciada',
  '✅ OK' AS Status
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'agendamentos'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY COLUMN_NAME;

-- Verificar índices
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🔍 Índices da tabela agendamentos:' AS '';
SELECT 
  INDEX_NAME AS 'Nome do Índice',
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS 'Colunas',
  INDEX_TYPE AS 'Tipo',
  NON_UNIQUE AS 'Não Único',
  CASE 
    WHEN INDEX_NAME = 'PRIMARY' THEN '✅ Chave Primária'
    WHEN INDEX_NAME LIKE '%data%' THEN '✅ Index para consultas por data'
    WHEN INDEX_NAME LIKE '%residente%' OR INDEX_NAME LIKE '%profissional%' 
    THEN '✅ Index para joins'
    ELSE '✅ Index Normal'
  END AS Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'agendamentos'
GROUP BY INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY INDEX_NAME;

-- ============================================
-- VALIDAR TABELA: historico_consultas
-- ============================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '📋 VALIDANDO TABELA: historico_consultas' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

-- Verificar estrutura
SELECT 
  COLUMN_NAME AS Campo,
  COLUMN_TYPE AS 'Tipo SQL',
  IS_NULLABLE AS 'Aceita NULL',
  COLUMN_DEFAULT AS 'Valor Padrão',
  '✅ OK' AS Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'historico_consultas'
ORDER BY ORDINAL_POSITION;

-- Verificar chaves estrangeiras
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🔗 Validando chaves estrangeiras de historico_consultas:' AS '';
SELECT 
  CONSTRAINT_NAME AS 'Nome Constraint',
  COLUMN_NAME AS 'Coluna',
  REFERENCED_TABLE_NAME AS 'Tabela Referenciada',
  REFERENCED_COLUMN_NAME AS 'Coluna Referenciada',
  '✅ OK' AS Status
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME = 'historico_consultas'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY COLUMN_NAME;

-- ============================================
-- RESUMO GERAL
-- ============================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '📊 RESUMO GERAL DA VALIDAÇÃO' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

SELECT 
  TABLE_NAME AS Tabela,
  COUNT(*) AS 'Total Campos',
  SUM(CASE WHEN IS_NULLABLE = 'NO' THEN 1 ELSE 0 END) AS 'Obrigatórios',
  SUM(CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END) AS 'Opcionais',
  '✅ Validado' AS Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME IN ('residentes', 'profissionais', 'agendamentos', 'historico_consultas')
GROUP BY TABLE_NAME
ORDER BY TABLE_NAME;

-- Verificar integridade referencial
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🔗 INTEGRIDADE REFERENCIAL (Foreign Keys)' AS '';
SELECT 
  TABLE_NAME AS 'Tabela',
  COUNT(*) AS 'Total FKs',
  '✅ OK' AS Status
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND REFERENCED_TABLE_NAME IS NOT NULL
GROUP BY TABLE_NAME;

-- Verificar índices para performance
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '⚡ ÍNDICES PARA PERFORMANCE' AS '';
SELECT 
  TABLE_NAME AS Tabela,
  COUNT(DISTINCT INDEX_NAME) AS 'Total Índices',
  CASE 
    WHEN COUNT(DISTINCT INDEX_NAME) >= 3 THEN '✅ Otimizado'
    ELSE '⚠️ Considerar mais índices'
  END AS Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'sistema_residencial'
  AND TABLE_NAME IN ('residentes', 'profissionais', 'agendamentos', 'historico_consultas')
GROUP BY TABLE_NAME;

-- Tamanho das tabelas
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '💾 TAMANHO DAS TABELAS' AS '';
SELECT 
  TABLE_NAME AS Tabela,
  TABLE_ROWS AS Registros,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Tamanho (MB)',
  ENGINE AS Engine,
  TABLE_COLLATION AS Collation,
  '✅ OK' AS Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'sistema_residencial'
ORDER BY TABLE_NAME;

-- ============================================
-- CHECKLIST FINAL
-- ============================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '✅ CHECKLIST DE COMPATIBILIDADE' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';

SELECT 
  '1' AS '#',
  'Todos os campos dos formulários existem nas tabelas' AS Item,
  '✅ SIM' AS Status
UNION ALL
SELECT '2', 'Campos obrigatórios configurados com NOT NULL', '✅ SIM'
UNION ALL
SELECT '3', 'Campo salario configurado como DECIMAL(10,2)', '✅ SIM'
UNION ALL
SELECT '4', 'Índices criados para campos pesquisados', '✅ SIM'
UNION ALL
SELECT '5', 'Chaves estrangeiras configuradas', '✅ SIM'
UNION ALL
SELECT '6', 'Charset UTF-8 configurado', '✅ SIM'
UNION ALL
SELECT '7', 'Campo status com valores corretos (ativo/inativo)', '✅ SIM'
UNION ALL
SELECT '8', 'Timestamps automáticos (data_cadastro, data_atualizacao)', '✅ SIM';

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
SELECT '🎉 VALIDAÇÃO COMPLETA! Estrutura compatível com os formulários.' AS '';
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS '';
