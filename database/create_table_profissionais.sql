-- ============================================
-- Tabela para Cadastro de Profissionais
-- Sistema de Gerenciamento Residencial
-- ============================================

USE sistema_residencial;

-- Tabela de Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  -- Identificação
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Dados Pessoais
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro'),
  telefone VARCHAR(20),
  celular VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  
  -- Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Dados Profissionais
  profissao VARCHAR(100) NOT NULL,
  registro_profissional VARCHAR(50),
  especialidade VARCHAR(100),
  data_admissao DATE NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  departamento VARCHAR(100),
  turno VARCHAR(50) NOT NULL,
  salario DECIMAL(10,2),
  
  -- Contato de Emergência
  nome_emergencia VARCHAR(200) NOT NULL,
  parentesco_emergencia VARCHAR(50),
  telefone_emergencia VARCHAR(20) NOT NULL,
  
  -- Documentação
  titulo_eleitor VARCHAR(20),
  numero_pis VARCHAR(20),
  carteira_trabalho VARCHAR(20),
  
  -- Informações Administrativas
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('ativo', 'inativo', 'licenca', 'ferias') DEFAULT 'ativo',
  observacoes TEXT,
  
  -- Índices para melhorar performance
  INDEX idx_cpf (cpf),
  INDEX idx_nome (nome_completo),
  INDEX idx_profissao (profissao),
  INDEX idx_departamento (departamento),
  INDEX idx_status (status),
  INDEX idx_data_admissao (data_admissao),
  INDEX idx_data_cadastro (data_cadastro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Comentários das Colunas
-- ============================================
ALTER TABLE profissionais 
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID único do profissional',
  MODIFY COLUMN nome_completo VARCHAR(200) NOT NULL COMMENT 'Nome completo do profissional',
  MODIFY COLUMN data_nascimento DATE NOT NULL COMMENT 'Data de nascimento',
  MODIFY COLUMN cpf VARCHAR(14) UNIQUE NOT NULL COMMENT 'CPF (formato: 000.000.000-00)',
  MODIFY COLUMN rg VARCHAR(20) COMMENT 'Registro Geral (RG)',
  MODIFY COLUMN sexo ENUM('masculino', 'feminino', 'outro') NOT NULL COMMENT 'Sexo do profissional',
  MODIFY COLUMN estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro') COMMENT 'Estado civil',
  MODIFY COLUMN telefone VARCHAR(20) COMMENT 'Telefone fixo',
  MODIFY COLUMN celular VARCHAR(20) NOT NULL COMMENT 'Celular (obrigatório)',
  MODIFY COLUMN email VARCHAR(100) NOT NULL COMMENT 'E-mail do profissional',
  MODIFY COLUMN cep VARCHAR(10) COMMENT 'CEP (formato: 00000-000)',
  MODIFY COLUMN logradouro VARCHAR(200) COMMENT 'Rua/Avenida',
  MODIFY COLUMN numero VARCHAR(10) COMMENT 'Número do endereço',
  MODIFY COLUMN complemento VARCHAR(100) COMMENT 'Complemento (apto, bloco, etc)',
  MODIFY COLUMN bairro VARCHAR(100) COMMENT 'Bairro',
  MODIFY COLUMN cidade VARCHAR(100) COMMENT 'Cidade',
  MODIFY COLUMN estado VARCHAR(2) COMMENT 'Estado (UF)',
  MODIFY COLUMN profissao VARCHAR(100) NOT NULL COMMENT 'Profissão (médico, enfermeiro, etc)',
  MODIFY COLUMN registro_profissional VARCHAR(50) COMMENT 'CRM, COREN, CRO, etc',
  MODIFY COLUMN especialidade VARCHAR(100) COMMENT 'Especialidade profissional',
  MODIFY COLUMN data_admissao DATE NOT NULL COMMENT 'Data de admissão na instituição',
  MODIFY COLUMN cargo VARCHAR(100) NOT NULL COMMENT 'Cargo ocupado',
  MODIFY COLUMN departamento VARCHAR(100) COMMENT 'Departamento de trabalho',
  MODIFY COLUMN turno VARCHAR(50) NOT NULL COMMENT 'Turno de trabalho',
  MODIFY COLUMN salario DECIMAL(10,2) COMMENT 'Salário base',
  MODIFY COLUMN nome_emergencia VARCHAR(200) NOT NULL COMMENT 'Nome do contato de emergência',
  MODIFY COLUMN parentesco_emergencia VARCHAR(50) COMMENT 'Parentesco com o profissional',
  MODIFY COLUMN telefone_emergencia VARCHAR(20) NOT NULL COMMENT 'Telefone de emergência',
  MODIFY COLUMN titulo_eleitor VARCHAR(20) COMMENT 'Número do título de eleitor',
  MODIFY COLUMN numero_pis VARCHAR(20) COMMENT 'Número PIS/PASEP',
  MODIFY COLUMN carteira_trabalho VARCHAR(20) COMMENT 'Número da carteira de trabalho',
  MODIFY COLUMN data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  MODIFY COLUMN data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  MODIFY COLUMN status ENUM('ativo', 'inativo', 'licenca', 'ferias') DEFAULT 'ativo' COMMENT 'Status do profissional',
  MODIFY COLUMN observacoes TEXT COMMENT 'Observações gerais';

-- ============================================
-- Dados de Exemplo (Opcional)
-- ============================================
INSERT INTO profissionais (
  nome_completo, data_nascimento, cpf, rg, sexo, estado_civil,
  telefone, celular, email,
  cep, logradouro, numero, complemento, bairro, cidade, estado,
  profissao, registro_profissional, especialidade, data_admissao, cargo, departamento, turno, salario,
  nome_emergencia, parentesco_emergencia, telefone_emergencia,
  titulo_eleitor, numero_pis, carteira_trabalho,
  observacoes
) VALUES (
  'Dra. Maria Silva Santos', '1985-03-20', '987.654.321-00', '98.765.432-1', 'feminino', 'casado',
  '(11) 3456-7890', '(11) 99876-5432', 'maria.santos@email.com',
  '01234-567', 'Rua das Acácias', '456', 'Sala 3', 'Jardins', 'São Paulo', 'SP',
  'medico', 'CRM 123456/SP', 'Geriatria', '2020-01-15', 'Médica Geriatra', 'clinica', 'manha', 15000.00,
  'João Carlos Santos', 'Esposo', '(11) 98765-1234',
  '1234 5678 9012', '123.45678.90-1', '1234567',
  'Especialista em geriatria com 15 anos de experiência'
);

-- ============================================
-- Consultas Úteis
-- ============================================

-- Ver todos os profissionais ativos
-- SELECT * FROM profissionais WHERE status = 'ativo' ORDER BY nome_completo;

-- Buscar profissional por CPF
-- SELECT * FROM profissionais WHERE cpf = '987.654.321-00';

-- Listar profissionais por profissão
-- SELECT * FROM profissionais WHERE profissao = 'enfermeiro' ORDER BY nome_completo;

-- Listar profissionais por departamento
-- SELECT * FROM profissionais WHERE departamento = 'enfermaria' ORDER BY nome_completo;

-- Contar total de profissionais
-- SELECT COUNT(*) as total FROM profissionais;

-- Contar profissionais por profissão
-- SELECT profissao, COUNT(*) as total FROM profissionais GROUP BY profissao ORDER BY total DESC;

-- Profissionais admitidos nos últimos 30 dias
-- SELECT * FROM profissionais WHERE data_admissao >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Aniversariantes do mês
-- SELECT nome_completo, data_nascimento, profissao 
-- FROM profissionais 
-- WHERE MONTH(data_nascimento) = MONTH(NOW()) 
-- ORDER BY DAY(data_nascimento);

-- Profissionais por turno
-- SELECT turno, COUNT(*) as total FROM profissionais GROUP BY turno;

-- Relatório completo de profissionais ativos
-- SELECT 
--   nome_completo, 
--   profissao, 
--   cargo, 
--   departamento, 
--   turno,
--   DATE_FORMAT(data_admissao, '%d/%m/%Y') as admissao,
--   celular
-- FROM profissionais 
-- WHERE status = 'ativo'
-- ORDER BY departamento, profissao, nome_completo;
