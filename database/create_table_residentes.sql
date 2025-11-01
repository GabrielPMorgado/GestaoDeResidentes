-- ============================================
-- Tabela para Cadastro de Residentes
-- Sistema de Gerenciamento Residencial
-- ============================================

CREATE DATABASE IF NOT EXISTS sistema_residencial;
USE sistema_residencial;

-- Tabela de Residentes
CREATE TABLE IF NOT EXISTS residentes (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Dados Pessoais
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro'),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  
  -- Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Responsável / Contato de Emergência
  nome_responsavel VARCHAR(200) NOT NULL,
  parentesco_responsavel VARCHAR(50),
  telefone_responsavel VARCHAR(20) NOT NULL,
  email_responsavel VARCHAR(100),
  
  -- Informações Administrativas
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
  observacoes TEXT,
  
  -- Índices para melhorar performance
  INDEX idx_cpf (cpf),
  INDEX idx_nome (nome_completo),
  INDEX idx_status (status),
  INDEX idx_data_cadastro (data_cadastro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Comentários das Colunas
-- ============================================
ALTER TABLE residentes 
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID único do residente',
  MODIFY COLUMN nome_completo VARCHAR(200) NOT NULL COMMENT 'Nome completo do residente',
  MODIFY COLUMN data_nascimento DATE NOT NULL COMMENT 'Data de nascimento',
  MODIFY COLUMN cpf VARCHAR(14) UNIQUE NOT NULL COMMENT 'CPF (formato: 000.000.000-00)',
  MODIFY COLUMN rg VARCHAR(20) COMMENT 'Registro Geral (RG)',
  MODIFY COLUMN sexo ENUM('masculino', 'feminino', 'outro') NOT NULL COMMENT 'Sexo do residente',
  MODIFY COLUMN estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro') COMMENT 'Estado civil',
  MODIFY COLUMN telefone VARCHAR(20) NOT NULL COMMENT 'Telefone principal',
  MODIFY COLUMN email VARCHAR(100) COMMENT 'E-mail do residente',
  MODIFY COLUMN cep VARCHAR(10) COMMENT 'CEP (formato: 00000-000)',
  MODIFY COLUMN logradouro VARCHAR(200) COMMENT 'Rua/Avenida',
  MODIFY COLUMN numero VARCHAR(10) COMMENT 'Número do endereço',
  MODIFY COLUMN complemento VARCHAR(100) COMMENT 'Complemento (apto, bloco, etc)',
  MODIFY COLUMN bairro VARCHAR(100) COMMENT 'Bairro',
  MODIFY COLUMN cidade VARCHAR(100) COMMENT 'Cidade',
  MODIFY COLUMN estado VARCHAR(2) COMMENT 'Estado (UF)',
  MODIFY COLUMN nome_responsavel VARCHAR(200) NOT NULL COMMENT 'Nome do responsável/contato emergência',
  MODIFY COLUMN parentesco_responsavel VARCHAR(50) COMMENT 'Parentesco com o residente',
  MODIFY COLUMN telefone_responsavel VARCHAR(20) NOT NULL COMMENT 'Telefone do responsável',
  MODIFY COLUMN email_responsavel VARCHAR(100) COMMENT 'E-mail do responsável',
  MODIFY COLUMN data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  MODIFY COLUMN data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  MODIFY COLUMN status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo' COMMENT 'Status do residente',
  MODIFY COLUMN observacoes TEXT COMMENT 'Observações gerais';

-- ============================================
-- Dados de Exemplo (Opcional)
-- ============================================
INSERT INTO residentes (
  nome_completo, data_nascimento, cpf, rg, sexo, estado_civil,
  telefone, email,
  cep, logradouro, numero, complemento, bairro, cidade, estado,
  nome_responsavel, parentesco_responsavel, telefone_responsavel, email_responsavel,
  observacoes
) VALUES (
  'João da Silva', '1980-05-15', '123.456.789-00', '12.345.678-9', 'masculino', 'casado',
  '(11) 98765-4321', 'joao.silva@email.com',
  '01234-567', 'Rua das Flores', '123', 'Apto 45', 'Centro', 'São Paulo', 'SP',
  'Maria da Silva', 'Esposa', '(11) 98765-1234', 'maria.silva@email.com',
  'Residente modelo para testes'
);

-- ============================================
-- Consultas Úteis
-- ============================================

-- Ver todos os residentes ativos
-- SELECT * FROM residentes WHERE status = 'ativo' ORDER BY nome_completo;

-- Buscar residente por CPF
-- SELECT * FROM residentes WHERE cpf = '123.456.789-00';

-- Contar total de residentes
-- SELECT COUNT(*) as total FROM residentes;

-- Residentes cadastrados nos últimos 30 dias
-- SELECT * FROM residentes WHERE data_cadastro >= DATE_SUB(NOW(), INTERVAL 30 DAY);
