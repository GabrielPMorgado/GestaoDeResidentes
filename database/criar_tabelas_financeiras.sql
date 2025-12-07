-- ============================================
-- CRIAR TABELAS FINANCEIRAS
-- Execute este script no MySQL Workbench
-- ============================================

USE sistema_residencial;

-- ============================================
-- TABELA: despesas_gerais
-- ============================================
CREATE TABLE IF NOT EXISTS despesas_gerais (
  id INT PRIMARY KEY AUTO_INCREMENT,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  data_despesa DATE NOT NULL,
  status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: pagamentos_mensalidades
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos_mensalidades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residente_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  mes_referencia INT NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INT NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status ENUM('pendente', 'pago', 'atrasado', 'cancelado') DEFAULT 'pendente',
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  INDEX idx_residente (residente_id),
  INDEX idx_mes_ano (mes_referencia, ano_referencia),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: pagamentos_salarios
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos_salarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profissional_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0.00,
  descontos DECIMAL(10, 2) DEFAULT 0.00,
  mes_referencia INT NOT NULL CHECK (mes_referencia BETWEEN 1 AND 12),
  ano_referencia INT NOT NULL,
  data_pagamento DATE NOT NULL,
  status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  INDEX idx_profissional (profissional_id),
  INDEX idx_mes_ano (mes_referencia, ano_referencia),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERIR DADOS DE EXEMPLO
-- ============================================

-- Despesas Gerais
INSERT INTO despesas_gerais (descricao, valor, categoria, data_despesa, status, metodo_pagamento) VALUES
('Conta de Luz - Dezembro/2024', 850.00, 'Utilidades', '2024-12-05', 'pago', 'Transferência'),
('Conta de Água - Dezembro/2024', 320.00, 'Utilidades', '2024-12-08', 'pago', 'Débito'),
('Material de Limpeza', 450.00, 'Manutenção', '2024-12-10', 'pago', 'Dinheiro'),
('Manutenção Elevador', 1200.00, 'Manutenção', '2024-12-15', 'pendente', NULL),
('Internet e Telefone', 280.00, 'Utilidades', '2024-12-20', 'pendente', NULL);

-- Mensalidades (exemplo com 3 residentes)
INSERT INTO pagamentos_mensalidades (residente_id, valor, mes_referencia, ano_referencia, data_vencimento, data_pagamento, status, metodo_pagamento)
SELECT 
  id,
  3500.00,
  12,
  2024,
  '2024-12-10',
  CASE 
    WHEN id % 3 = 0 THEN '2024-12-08'
    WHEN id % 3 = 1 THEN '2024-12-09'
    ELSE NULL
  END,
  CASE 
    WHEN id % 3 = 0 THEN 'pago'
    WHEN id % 3 = 1 THEN 'pago'
    ELSE 'pendente'
  END,
  CASE 
    WHEN id % 3 = 0 THEN 'Transferência'
    WHEN id % 3 = 1 THEN 'Cartão'
    ELSE NULL
  END
FROM residentes 
WHERE ativo = 1
LIMIT 5;

-- Salários (exemplo com profissionais)
INSERT INTO pagamentos_salarios (profissional_id, valor, bonus, descontos, mes_referencia, ano_referencia, data_pagamento, status, metodo_pagamento)
SELECT 
  id,
  salario,
  CASE WHEN cargo LIKE '%coordenador%' THEN 500.00 ELSE 0.00 END,
  CASE WHEN id % 2 = 0 THEN 150.00 ELSE 0.00 END,
  12,
  2024,
  '2024-12-05',
  'pago',
  'Transferência'
FROM profissionais 
WHERE ativo = 1
LIMIT 5;

-- ============================================
-- VERIFICAR DADOS INSERIDOS
-- ============================================

SELECT 'Despesas Gerais' AS Tabela, COUNT(*) AS Total FROM despesas_gerais
UNION ALL
SELECT 'Mensalidades', COUNT(*) FROM pagamentos_mensalidades
UNION ALL
SELECT 'Salários', COUNT(*) FROM pagamentos_salarios;

-- ============================================
-- CONSULTAS ÚTEIS
-- ============================================

-- Ver resumo financeiro do mês atual
SELECT 
  'RECEITAS' AS Tipo,
  SUM(valor) AS Total
FROM pagamentos_mensalidades 
WHERE status = 'pago' 
  AND mes_referencia = MONTH(CURDATE()) 
  AND ano_referencia = YEAR(CURDATE())
UNION ALL
SELECT 
  'DESPESAS - Salários',
  SUM(valor + bonus - descontos)
FROM pagamentos_salarios 
WHERE status = 'pago' 
  AND mes_referencia = MONTH(CURDATE()) 
  AND ano_referencia = YEAR(CURDATE())
UNION ALL
SELECT 
  'DESPESAS - Gerais',
  SUM(valor)
FROM despesas_gerais 
WHERE status = 'pago' 
  AND MONTH(data_despesa) = MONTH(CURDATE()) 
  AND YEAR(data_despesa) = YEAR(CURDATE());

-- Ver mensalidades por residente
SELECT 
  r.nome_completo,
  pm.mes_referencia,
  pm.ano_referencia,
  pm.valor,
  pm.status,
  pm.data_vencimento,
  pm.data_pagamento
FROM pagamentos_mensalidades pm
INNER JOIN residentes r ON pm.residente_id = r.id
ORDER BY pm.ano_referencia DESC, pm.mes_referencia DESC, r.nome_completo;

-- Ver salários por profissional
SELECT 
  p.nome_completo,
  p.cargo,
  ps.mes_referencia,
  ps.ano_referencia,
  ps.valor AS salario_base,
  ps.bonus,
  ps.descontos,
  (ps.valor + ps.bonus - ps.descontos) AS total_liquido,
  ps.status,
  ps.data_pagamento
FROM pagamentos_salarios ps
INNER JOIN profissionais p ON ps.profissional_id = p.id
ORDER BY ps.ano_referencia DESC, ps.mes_referencia DESC, p.nome_completo;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
