-- ============================================
-- SCRIPT UNIFICADO - BANCO DE DADOS SISTEMA RESIDENCIAL
-- ============================================
-- Este script irá criar e atualizar todas as tabelas, colunas e dados necessários
-- Execute no MySQL Workbench, phpMyAdmin ou linha de comando MySQL
-- ============================================

-- Remover banco existente (CUIDADO!)
DROP DATABASE IF EXISTS sistema_residencial;
CREATE DATABASE sistema_residencial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_residencial;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================
-- CRIAÇÃO DAS TABELAS PRINCIPAIS
-- ============================================

-- Tabela: residentes
CREATE TABLE residentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rg VARCHAR(20),
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro'),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  nome_responsavel VARCHAR(200) NOT NULL,
  parentesco_responsavel VARCHAR(50),
  telefone_responsavel VARCHAR(20) NOT NULL,
  email_responsavel VARCHAR(100),
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
  valor_mensalidade DECIMAL(10, 2) NULL COMMENT 'Valor da mensalidade do residente',
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cpf (cpf),
  INDEX idx_nome (nome_completo),
  INDEX idx_status (status),
  INDEX idx_data_cadastro (data_cadastro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cadastro de residentes da instituição';

-- Tabela: profissionais
CREATE TABLE profissionais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rg VARCHAR(20),
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro') NULL,
  telefone VARCHAR(20) NULL,
  celular VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  profissao VARCHAR(100) NOT NULL,
  registro_profissional VARCHAR(50),
  especialidade VARCHAR(100),
  data_admissao DATE NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  departamento VARCHAR(100),
  turno VARCHAR(50) NOT NULL,
  salario DECIMAL(10, 2),
  nome_emergencia VARCHAR(200),
  parentesco_emergencia VARCHAR(50),
  telefone_emergencia VARCHAR(20),
  titulo_eleitor VARCHAR(20) NULL,
  numero_pis VARCHAR(20) NULL,
  carteira_trabalho VARCHAR(20) NULL,
  status ENUM('ativo', 'inativo', 'licenca', 'ferias') DEFAULT 'ativo',
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cpf_prof (cpf),
  INDEX idx_nome_prof (nome_completo),
  INDEX idx_profissao (profissao),
  INDEX idx_departamento (departamento),
  INDEX idx_status_prof (status),
  INDEX idx_data_admissao (data_admissao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cadastro de profissionais da instituição';

-- Tabela: usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  profissional_id INT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt da senha',
  tipo ENUM('admin', 'profissional') NOT NULL DEFAULT 'profissional',
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso DATETIME NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_tipo (tipo),
  INDEX idx_ativo (ativo),
  INDEX idx_profissional_id (profissional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários do sistema para autenticação';

-- Tabela: agendamentos
CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  tipo_atendimento ENUM('consulta_medica','fisioterapia','psicologia','nutricao','enfermagem','terapia_ocupacional','assistencia_social','outro') NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  observacoes TEXT,
  local VARCHAR(200),
  status ENUM('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta') DEFAULT 'agendado',
  motivo_cancelamento TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_data_agendamento (data_agendamento),
  INDEX idx_status (status),
  INDEX idx_tipo_atendimento (tipo_atendimento),
  INDEX idx_data_hora (data_agendamento, hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agendamentos de consultas e atendimentos';

-- Tabela: historico_consultas
CREATE TABLE historico_consultas (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  INDEX idx_data_consulta (data_consulta),
  INDEX idx_residente_hist (residente_id),
  INDEX idx_profissional_hist (profissional_id),
  INDEX idx_agendamento_hist (agendamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico de consultas e atendimentos realizados';

-- Tabela: despesas_gerais
CREATE TABLE despesas_gerais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  categoria ENUM('Alimentacao', 'Manutencao', 'Limpeza', 'Saude', 'Operacional', 'Outros') NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_despesa DATE NOT NULL,
  status ENUM('pendente', 'pago', 'vencido') DEFAULT 'pendente',
  data_pagamento DATE,
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_data_despesa (data_despesa),
  INDEX idx_categoria (categoria),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Despesas gerais da instituição';

-- Tabela: pagamentos_mensalidades
CREATE TABLE pagamentos_mensalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  residente_id INT NOT NULL,
  mes_referencia INT NOT NULL,
  ano_referencia INT NOT NULL,
  valor_mensalidade DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  metodo_pagamento VARCHAR(50),
  status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
  valor_pago DECIMAL(10, 2),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_mensalidade (residente_id, mes_referencia, ano_referencia),
  INDEX idx_mes_ano (mes_referencia, ano_referencia),
  INDEX idx_status_mens (status),
  INDEX idx_data_venc (data_vencimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagamentos de mensalidades dos residentes';

-- Tabela: pagamentos_salarios
CREATE TABLE pagamentos_salarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profissional_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  salario_base DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0.00,
  descontos DECIMAL(10, 2) DEFAULT 0.00,
  valor_liquido DECIMAL(10, 2) NOT NULL,
  mes_referencia INT NOT NULL,
  ano_referencia INT NOT NULL,
  data_pagamento DATE,
  metodo_pagamento VARCHAR(50),
  status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
  horas_trabalhadas DECIMAL(5, 2),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  UNIQUE KEY unique_salario (profissional_id, mes_referencia, ano_referencia),
  INDEX idx_mes_ano_sal (mes_referencia, ano_referencia),
  INDEX idx_status_sal (status),
  INDEX idx_data_pag_sal (data_pagamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagamentos de salários dos profissionais';

-- Tabela: rascunhos_atendimento
CREATE TABLE IF NOT EXISTS rascunhos_atendimento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agendamento_id INT NOT NULL,
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  data_atendimento DATE NOT NULL,
  hora_atendimento TIME NOT NULL,
  procedimentos TEXT,
  diagnostico_principal TEXT,
  diagnosticos_secundarios TEXT,
  cid_principal VARCHAR(10),
  cids_secundarios VARCHAR(255),
  observacoes_clinicas TEXT,
  evolucao TEXT,
  condutas TEXT,
  plano_cuidado TEXT,
  relatorio TEXT,
  status VARCHAR(20) DEFAULT 'rascunho',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  INDEX idx_agendamento (agendamento_id),
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Armazena rascunhos de atendimentos clínicos não finalizados';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INSERÇÃO DE DADOS INICIAIS
-- ============================================
-- Usuário admin padrão
INSERT INTO usuarios (email, senha, tipo, ativo) VALUES ('admin@sistema.com', '$2a$10$jCGMPZShJUOKxHRlecw32OFMIvwVdIHIEpzSh0gzTACXqQnOwt22G', 'admin', TRUE);

-- ============================================
-- CONSULTAS DE VERIFICAÇÃO
-- ============================================
SELECT '========================================' AS '';
SELECT 'BANCO DE DADOS CRIADO COM SUCESSO!' AS '';
SHOW TABLES;
SELECT 'Residentes cadastrados' AS Tipo, COUNT(*) AS Total FROM residentes UNION ALL SELECT 'Profissionais cadastrados', COUNT(*) FROM profissionais UNION ALL SELECT 'Usuários do sistema', COUNT(*) FROM usuarios UNION ALL SELECT 'Agendamentos registrados', COUNT(*) FROM agendamentos UNION ALL SELECT 'Histórico de consultas', COUNT(*) FROM historico_consultas UNION ALL SELECT 'Despesas cadastradas', COUNT(*) FROM despesas_gerais UNION ALL SELECT 'Mensalidades registradas', COUNT(*) FROM pagamentos_mensalidades UNION ALL SELECT 'Salários registrados', COUNT(*) FROM pagamentos_salarios;
SELECT '========================================' AS '';
SELECT 'Email: admin@sistema.com' AS 'Login Admin';
SELECT 'Senha: admin123' AS 'Senha Padrão';
SELECT 'IMPORTANTE: ALTERAR A SENHA EM PRODUÇÃO!' AS 'Aviso de Segurança';
SELECT '========================================' AS '';
-- ============================================
-- FIM DO SCRIPT
-- ============================================
