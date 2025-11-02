-- ============================================
-- Tabela para Agendamentos
-- Sistema de Gerenciamento Residencial
-- ============================================

USE sistema_residencial;

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relacionamentos
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  
  -- Dados do Agendamento
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  tipo_atendimento ENUM(
    'consulta_medica',
    'fisioterapia',
    'psicologia',
    'nutricao',
    'enfermagem',
    'terapia_ocupacional',
    'assistencia_social',
    'outro'
  ) NOT NULL,
  
  -- Detalhes
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  observacoes TEXT,
  local VARCHAR(200),
  
  -- Status
  status ENUM('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta') DEFAULT 'agendado',
  motivo_cancelamento TEXT,
  
  -- Informações Administrativas
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chaves Estrangeiras
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  -- Índices para melhorar performance
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_data (data_agendamento),
  INDEX idx_status (status),
  INDEX idx_tipo (tipo_atendimento),
  INDEX idx_data_hora (data_agendamento, hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Comentários das Colunas
-- ============================================
ALTER TABLE agendamentos 
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID único do agendamento',
  MODIFY COLUMN residente_id INT NOT NULL COMMENT 'ID do residente',
  MODIFY COLUMN profissional_id INT NOT NULL COMMENT 'ID do profissional',
  MODIFY COLUMN data_agendamento DATE NOT NULL COMMENT 'Data do agendamento',
  MODIFY COLUMN hora_inicio TIME NOT NULL COMMENT 'Hora de início',
  MODIFY COLUMN hora_fim TIME NOT NULL COMMENT 'Hora de término',
  MODIFY COLUMN tipo_atendimento ENUM(
    'consulta_medica',
    'fisioterapia',
    'psicologia',
    'nutricao',
    'enfermagem',
    'terapia_ocupacional',
    'assistencia_social',
    'outro'
  ) NOT NULL COMMENT 'Tipo de atendimento',
  MODIFY COLUMN titulo VARCHAR(200) NOT NULL COMMENT 'Título do agendamento',
  MODIFY COLUMN descricao TEXT COMMENT 'Descrição detalhada',
  MODIFY COLUMN observacoes TEXT COMMENT 'Observações adicionais',
  MODIFY COLUMN local VARCHAR(200) COMMENT 'Local do atendimento',
  MODIFY COLUMN status ENUM('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta') DEFAULT 'agendado' COMMENT 'Status do agendamento',
  MODIFY COLUMN motivo_cancelamento TEXT COMMENT 'Motivo do cancelamento',
  MODIFY COLUMN data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  MODIFY COLUMN data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização';

-- ============================================
-- Dados de Exemplo (Opcional)
-- ============================================
INSERT INTO agendamentos (
  residente_id, profissional_id,
  data_agendamento, hora_inicio, hora_fim,
  tipo_atendimento, titulo, descricao, local, status
) VALUES 
(1, 1, '2025-11-05', '09:00:00', '09:30:00', 'consulta_medica', 
 'Consulta Médica Geriátrica', 'Consulta de rotina para avaliação geral de saúde', 'Consultório 1', 'agendado'),
(1, 1, '2025-11-06', '14:00:00', '14:45:00', 'fisioterapia', 
 'Sessão de Fisioterapia', 'Fisioterapia motora para recuperação', 'Sala de Fisioterapia', 'confirmado'),
(2, 1, '2025-11-07', '10:00:00', '11:00:00', 'psicologia', 
 'Atendimento Psicológico', 'Sessão de psicoterapia individual', 'Consultório 2', 'agendado');

-- ============================================
-- Consultas Úteis
-- ============================================

-- Ver todos os agendamentos
-- SELECT a.*, r.nome_completo as residente, p.nome_completo as profissional
-- FROM agendamentos a
-- JOIN residentes r ON a.residente_id = r.id
-- JOIN profissionais p ON a.profissional_id = p.id
-- ORDER BY a.data_agendamento DESC, a.hora_inicio;

-- Agendamentos de hoje
-- SELECT a.*, r.nome_completo as residente, p.nome_completo as profissional
-- FROM agendamentos a
-- JOIN residentes r ON a.residente_id = r.id
-- JOIN profissionais p ON a.profissional_id = p.id
-- WHERE a.data_agendamento = CURDATE()
-- ORDER BY a.hora_inicio;

-- Agendamentos por residente
-- SELECT a.*, p.nome_completo as profissional, p.profissao
-- FROM agendamentos a
-- JOIN profissionais p ON a.profissional_id = p.id
-- WHERE a.residente_id = 1
-- ORDER BY a.data_agendamento DESC;

-- Agendamentos por profissional
-- SELECT a.*, r.nome_completo as residente
-- FROM agendamentos a
-- JOIN residentes r ON a.residente_id = r.id
-- WHERE a.profissional_id = 1
-- ORDER BY a.data_agendamento DESC;

-- Estatísticas de agendamentos
-- SELECT 
--   COUNT(*) as total,
--   SUM(CASE WHEN status = 'agendado' THEN 1 ELSE 0 END) as agendados,
--   SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
--   SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluidos,
--   SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelados
-- FROM agendamentos;

-- Horários disponíveis de um profissional em uma data
-- SELECT hora_inicio, hora_fim 
-- FROM agendamentos 
-- WHERE profissional_id = 1 
--   AND data_agendamento = '2025-11-05'
--   AND status NOT IN ('cancelado')
-- ORDER BY hora_inicio;
