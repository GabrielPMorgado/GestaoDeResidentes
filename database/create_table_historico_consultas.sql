-- ============================================
-- TABELA: historico_consultas
-- Descrição: Armazena o histórico de consultas dos residentes
-- ============================================

CREATE TABLE IF NOT EXISTS historico_consultas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  agendamento_id INT,
  data_consulta DATETIME NOT NULL,
  tipo_consulta VARCHAR(100),
  observacoes TEXT,
  diagnostico TEXT,
  prescricao TEXT,
  status VARCHAR(50) DEFAULT 'realizada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
  
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_data_consulta (data_consulta),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir alguns dados de exemplo
INSERT INTO historico_consultas (residente_id, profissional_id, data_consulta, tipo_consulta, observacoes, diagnostico, status) VALUES
(1, 1, '2025-10-15 10:00:00', 'Consulta de Rotina', 'Paciente apresentou boa evolução', 'Hipertensão controlada', 'realizada'),
(1, 2, '2025-10-20 14:30:00', 'Fisioterapia', 'Sessão de reabilitação motora', 'Melhora na mobilidade', 'realizada'),
(1, 1, '2025-10-25 09:00:00', 'Retorno', 'Ajuste de medicação', 'Pressão arterial estável', 'realizada');
