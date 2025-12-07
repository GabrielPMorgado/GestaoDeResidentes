-- Criar tabela para armazenar rascunhos de atendimento
-- Permite que profissionais salvem progresso sem finalizar o atendimento

CREATE TABLE IF NOT EXISTS rascunhos_atendimento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agendamento_id INT NOT NULL,
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  data_atendimento DATE NOT NULL,
  hora_atendimento TIME NOT NULL,
  
  -- Procedimentos (JSON)
  procedimentos TEXT,
  
  -- Diagnóstico
  diagnostico_principal TEXT,
  diagnosticos_secundarios TEXT,
  cid_principal VARCHAR(10),
  cids_secundarios VARCHAR(255),
  observacoes_clinicas TEXT,
  
  -- Evolução
  evolucao TEXT,
  condutas TEXT,
  plano_cuidado TEXT,
  
  -- Relatório
  relatorio TEXT,
  
  -- Controle
  status VARCHAR(20) DEFAULT 'rascunho',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chaves estrangeiras
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_agendamento (agendamento_id),
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar comentário à tabela
ALTER TABLE rascunhos_atendimento COMMENT = 'Armazena rascunhos de atendimentos clínicos não finalizados';

-- Verificar se a tabela foi criada com sucesso
SELECT 
  'Tabela rascunhos_atendimento criada com sucesso!' as status,
  COUNT(*) as total_registros
FROM rascunhos_atendimento;
