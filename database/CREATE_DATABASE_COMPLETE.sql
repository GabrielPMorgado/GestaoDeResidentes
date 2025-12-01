-- ============================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS
-- Sistema de Gerenciamento Residencial
-- Baseado nos formulários do sistema
-- Data: Dezembro 2025
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sistema_residencial
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sistema_residencial;

-- ============================================
-- TABELA: residentes
-- Baseada em: CadastroResidentes.jsx
-- ============================================

CREATE TABLE IF NOT EXISTS residentes (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do residente',
  
  -- Dados Pessoais (do formulário)
  nome_completo VARCHAR(200) NOT NULL COMMENT 'Nome completo do residente',
  cpf VARCHAR(14) NOT NULL UNIQUE COMMENT 'CPF (formato: 000.000.000-00)',
  rg VARCHAR(20) UNIQUE COMMENT 'Registro Geral (RG)',
  data_nascimento DATE NOT NULL COMMENT 'Data de nascimento',
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL COMMENT 'Sexo do residente',
  estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro') COMMENT 'Estado civil',
  telefone VARCHAR(20) NOT NULL COMMENT 'Telefone principal',
  email VARCHAR(100) COMMENT 'E-mail do residente',
  
  -- Endereço (do formulário)
  cep VARCHAR(10) COMMENT 'CEP (formato: 00000-000)',
  logradouro VARCHAR(200) COMMENT 'Rua/Avenida',
  numero VARCHAR(10) COMMENT 'Número do endereço',
  complemento VARCHAR(100) COMMENT 'Complemento (apto, bloco, etc)',
  bairro VARCHAR(100) COMMENT 'Bairro',
  cidade VARCHAR(100) COMMENT 'Cidade',
  estado VARCHAR(2) COMMENT 'Estado (UF)',
  
  -- Responsável (do formulário)
  nome_responsavel VARCHAR(200) NOT NULL COMMENT 'Nome do responsável/contato emergência',
  parentesco_responsavel VARCHAR(50) COMMENT 'Parentesco com o residente',
  telefone_responsavel VARCHAR(20) NOT NULL COMMENT 'Telefone do responsável',
  email_responsavel VARCHAR(100) COMMENT 'E-mail do responsável',
  
  -- Observações (do formulário)
  observacoes TEXT COMMENT 'Observações gerais',
  
  -- Campos de Sistema
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo' COMMENT 'Status do residente',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  
  -- Índices para performance
  INDEX idx_cpf (cpf),
  INDEX idx_nome (nome_completo),
  INDEX idx_status (status),
  INDEX idx_data_cadastro (data_cadastro),
  INDEX idx_email (email)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de residentes do sistema';

-- ============================================
-- TABELA: profissionais
-- Baseada em: CadastroProfissionais.jsx
-- ============================================

CREATE TABLE IF NOT EXISTS profissionais (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do profissional',
  
  -- Dados Pessoais (do formulário)
  nome_completo VARCHAR(200) NOT NULL COMMENT 'Nome completo do profissional',
  cpf VARCHAR(14) NOT NULL UNIQUE COMMENT 'CPF (formato: 000.000.000-00)',
  rg VARCHAR(20) UNIQUE COMMENT 'Registro Geral (RG)',
  data_nascimento DATE NOT NULL COMMENT 'Data de nascimento',
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL COMMENT 'Sexo do profissional',
  celular VARCHAR(20) NOT NULL COMMENT 'Celular (obrigatório)',
  email VARCHAR(100) NOT NULL COMMENT 'E-mail do profissional',
  
  -- Endereço (do formulário)
  cep VARCHAR(10) COMMENT 'CEP (formato: 00000-000)',
  logradouro VARCHAR(200) COMMENT 'Rua/Avenida',
  numero VARCHAR(10) COMMENT 'Número do endereço',
  complemento VARCHAR(100) COMMENT 'Complemento (apto, bloco, etc)',
  bairro VARCHAR(100) COMMENT 'Bairro',
  cidade VARCHAR(100) COMMENT 'Cidade',
  estado VARCHAR(2) COMMENT 'Estado (UF)',
  
  -- Dados Profissionais (do formulário)
  profissao VARCHAR(100) NOT NULL COMMENT 'Profissão (médico, enfermeiro, etc)',
  registro_profissional VARCHAR(50) COMMENT 'CRM, COREN, CRO, etc',
  especialidade VARCHAR(100) COMMENT 'Especialidade profissional',
  data_admissao DATE NOT NULL COMMENT 'Data de admissão na instituição',
  cargo VARCHAR(100) NOT NULL COMMENT 'Cargo ocupado',
  departamento VARCHAR(100) COMMENT 'Departamento de trabalho',
  turno VARCHAR(50) NOT NULL COMMENT 'Turno de trabalho',
  salario DECIMAL(10,2) COMMENT 'Salário base',
  
  -- Observações (do formulário)
  observacoes TEXT COMMENT 'Observações gerais',
  
  -- Campos de Sistema
  status ENUM('ativo', 'inativo', 'licenca', 'ferias') DEFAULT 'ativo' COMMENT 'Status do profissional',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  
  -- Índices para performance
  INDEX idx_cpf (cpf),
  INDEX idx_nome (nome_completo),
  INDEX idx_profissao (profissao),
  INDEX idx_departamento (departamento),
  INDEX idx_status (status),
  INDEX idx_data_admissao (data_admissao),
  INDEX idx_data_cadastro (data_cadastro),
  INDEX idx_salario (salario),
  INDEX idx_status_salario (status, salario)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de profissionais do sistema';

-- ============================================
-- TABELA: agendamentos
-- Baseada em: CadastroAgendamento.jsx
-- ============================================

CREATE TABLE IF NOT EXISTS agendamentos (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do agendamento',
  
  -- Relacionamentos (do formulário)
  residente_id INT NOT NULL COMMENT 'ID do residente',
  profissional_id INT NOT NULL COMMENT 'ID do profissional',
  
  -- Dados do Agendamento (do formulário)
  data_agendamento DATE NOT NULL COMMENT 'Data do agendamento',
  hora_inicio TIME NOT NULL COMMENT 'Hora de início',
  hora_fim TIME NOT NULL COMMENT 'Hora de término',
  tipo_atendimento ENUM(
    'consulta_medica',
    'fisioterapia',
    'psicologia',
    'nutricao',
    'enfermagem',
    'terapia_ocupacional',
    'assistencia_social',
    'outro'
  ) NOT NULL COMMENT 'Tipo de atendimento',
  
  -- Detalhes (do formulário)
  titulo VARCHAR(200) NOT NULL COMMENT 'Título do agendamento',
  descricao TEXT COMMENT 'Descrição detalhada',
  local VARCHAR(200) COMMENT 'Local do atendimento',
  observacoes TEXT COMMENT 'Observações adicionais',
  
  -- Status do Sistema
  status ENUM('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta') 
    DEFAULT 'agendado' COMMENT 'Status do agendamento',
  motivo_cancelamento TEXT COMMENT 'Motivo do cancelamento',
  
  -- Campos de Sistema
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  
  -- Chaves Estrangeiras
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  -- Índices para performance
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_data (data_agendamento),
  INDEX idx_status (status),
  INDEX idx_tipo (tipo_atendimento),
  INDEX idx_data_hora (data_agendamento, hora_inicio),
  INDEX idx_residente_data (residente_id, data_agendamento),
  INDEX idx_profissional_data (profissional_id, data_agendamento),
  INDEX idx_status_data (status, data_agendamento)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de agendamentos do sistema';

-- ============================================
-- TABELA: historico_consultas
-- Para registro de consultas realizadas
-- ============================================

CREATE TABLE IF NOT EXISTS historico_consultas (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único da consulta',
  
  -- Relacionamentos
  residente_id INT NOT NULL COMMENT 'ID do residente',
  profissional_id INT NOT NULL COMMENT 'ID do profissional',
  agendamento_id INT COMMENT 'ID do agendamento relacionado (opcional)',
  
  -- Dados da Consulta
  data_consulta DATE NOT NULL COMMENT 'Data da consulta',
  hora_inicio TIME COMMENT 'Hora de início da consulta',
  hora_fim TIME COMMENT 'Hora de término da consulta',
  tipo_atendimento VARCHAR(100) COMMENT 'Tipo de atendimento realizado',
  
  -- Informações Clínicas
  queixa_principal TEXT COMMENT 'Queixa principal do residente',
  historico TEXT COMMENT 'Histórico da consulta',
  exame_fisico TEXT COMMENT 'Exame físico realizado',
  diagnostico TEXT COMMENT 'Diagnóstico',
  prescricao TEXT COMMENT 'Prescrição médica',
  orientacoes TEXT COMMENT 'Orientações fornecidas',
  observacoes TEXT COMMENT 'Observações gerais',
  
  -- Próxima Consulta
  data_retorno DATE COMMENT 'Data sugerida para retorno',
  
  -- Campos de Sistema
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  
  -- Chaves Estrangeiras
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
  
  -- Índices para performance
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_agendamento (agendamento_id),
  INDEX idx_data_consulta (data_consulta),
  INDEX idx_residente_data (residente_id, data_consulta),
  INDEX idx_profissional_data (profissional_id, data_consulta)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de histórico de consultas';

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- Descomente as linhas abaixo para inserir dados de teste
-- ============================================

/*
-- Exemplo de Residente
INSERT INTO residentes (
  nome_completo, cpf, rg, data_nascimento, sexo, estado_civil,
  telefone, email,
  cep, logradouro, numero, bairro, cidade, estado,
  nome_responsavel, telefone_responsavel
) VALUES (
  'João da Silva Santos', '123.456.789-00', '12.345.678-9', '1980-05-15', 'masculino', 'casado',
  '(11) 98765-4321', 'joao.silva@email.com',
  '01234-567', 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP',
  'Maria da Silva Santos', '(11) 98765-1234'
);

-- Exemplo de Profissional
INSERT INTO profissionais (
  nome_completo, cpf, rg, data_nascimento, sexo, celular, email,
  profissao, data_admissao, cargo, turno, salario
) VALUES (
  'Dra. Ana Paula Costa', '987.654.321-00', '98.765.432-1', '1985-08-20', 'feminino', 
  '(11) 99999-8888', 'ana.costa@email.com',
  'Médica Geriatra', '2020-01-15', 'Médica', 'Manhã', 15000.00
);
*/

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT 'Banco de dados criado com sucesso!' AS Status;
SHOW TABLES;

SELECT '✅ TABELAS CRIADAS:' AS Info;
SELECT 
  TABLE_NAME AS Tabela,
  TABLE_ROWS AS Linhas,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Tamanho (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'sistema_residencial'
ORDER BY TABLE_NAME;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
