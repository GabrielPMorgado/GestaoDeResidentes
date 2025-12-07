-- ============================================
-- BANCO DE DADOS COMPLETO - SISTEMA RESIDENCIAL
-- Sistema de Gerenciamento de Residência Sênior
-- ============================================
-- INSTRUÇÕES DE USO:
-- 1. Execute este script no MySQL Workbench, phpMyAdmin ou linha de comando MySQL
-- 2. O script irá RECRIAR o banco de dados do zero (CUIDADO: dados existentes serão perdidos!)
-- 3. Todas as tabelas, relacionamentos e dados de exemplo serão criados
-- 4. Usuário admin padrão: admin@sistema.com | Senha: admin123 (ALTERAR EM PRODUÇÃO!)
-- ============================================

-- ============================================
-- PARTE 1: PREPARAÇÃO E CRIAÇÃO DO BANCO
-- ============================================

-- Remover banco existente (CUIDADO!)
DROP DATABASE IF EXISTS sistema_residencial;

-- Criar banco de dados
CREATE DATABASE sistema_residencial
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE sistema_residencial;

-- Configurações temporárias para instalação
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================
-- PARTE 2: CRIAÇÃO DAS TABELAS
-- ============================================

-- --------------------------------------------
-- TABELA: residentes
-- --------------------------------------------
CREATE TABLE residentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Dados Pessoais
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
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
  
  -- Responsável/Contato de Emergência
  nome_responsavel VARCHAR(200) NOT NULL,
  parentesco_responsavel VARCHAR(50),
  telefone_responsavel VARCHAR(20) NOT NULL,
  email_responsavel VARCHAR(100),
  
  -- Controle
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para performance
  INDEX idx_cpf (cpf),
  INDEX idx_nome (nome_completo),
  INDEX idx_status (status),
  INDEX idx_data_cadastro (data_cadastro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cadastro de residentes da instituição';

-- --------------------------------------------
-- TABELA: profissionais
-- --------------------------------------------
CREATE TABLE profissionais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Dados Pessoais
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rg VARCHAR(20),
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  celular VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  
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
  salario DECIMAL(10, 2),
  
  -- Contato de Emergência
  nome_emergencia VARCHAR(200),
  parentesco_emergencia VARCHAR(50),
  telefone_emergencia VARCHAR(20),
  
  -- Documentação
  titulo_eleitor VARCHAR(20),
  numero_pis VARCHAR(20),
  carteira_trabalho VARCHAR(20),
  
  -- Controle
  status ENUM('ativo', 'inativo', 'licenca', 'ferias') DEFAULT 'ativo',
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para performance
  INDEX idx_cpf_prof (cpf),
  INDEX idx_nome_prof (nome_completo),
  INDEX idx_profissao (profissao),
  INDEX idx_departamento (departamento),
  INDEX idx_status_prof (status),
  INDEX idx_data_admissao (data_admissao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cadastro de profissionais da instituição';

-- --------------------------------------------
-- TABELA: usuarios (Autenticação)
-- --------------------------------------------
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
  
  -- Chave estrangeira
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_email (email),
  INDEX idx_tipo (tipo),
  INDEX idx_ativo (ativo),
  INDEX idx_profissional_id (profissional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuários do sistema para autenticação';

-- --------------------------------------------
-- TABELA: agendamentos
-- --------------------------------------------
CREATE TABLE agendamentos (
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
  
  -- Controle
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chaves estrangeiras
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_data_agendamento (data_agendamento),
  INDEX idx_status (status),
  INDEX idx_tipo_atendimento (tipo_atendimento),
  INDEX idx_data_hora (data_agendamento, hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Agendamentos de consultas e atendimentos';

-- --------------------------------------------
-- TABELA: historico_consultas
-- --------------------------------------------
CREATE TABLE historico_consultas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relacionamentos
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  agendamento_id INT,
  
  -- Dados da Consulta
  data_consulta DATETIME NOT NULL,
  tipo_consulta VARCHAR(100),
  observacoes TEXT,
  diagnostico TEXT,
  prescricao TEXT,
  status VARCHAR(50) DEFAULT 'realizada',
  
  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chaves estrangeiras
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
  
  -- Índices
  INDEX idx_data_consulta (data_consulta),
  INDEX idx_residente_hist (residente_id),
  INDEX idx_profissional_hist (profissional_id),
  INDEX idx_agendamento_hist (agendamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Histórico de consultas e atendimentos realizados';

-- --------------------------------------------
-- TABELA: despesas_gerais
-- --------------------------------------------
CREATE TABLE despesas_gerais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Dados da Despesa
  descricao VARCHAR(255) NOT NULL,
  categoria ENUM('Alimentacao', 'Manutencao', 'Limpeza', 'Saude', 'Operacional', 'Outros') NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_despesa DATE NOT NULL,
  
  -- Status do Pagamento
  status ENUM('pendente', 'pago', 'vencido') DEFAULT 'pendente',
  data_pagamento DATE,
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  
  -- Controle
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_data_despesa (data_despesa),
  INDEX idx_categoria (categoria),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Despesas gerais da instituição';

-- --------------------------------------------
-- TABELA: pagamentos_mensalidades
-- --------------------------------------------
CREATE TABLE pagamentos_mensalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relacionamento
  residente_id INT NOT NULL,
  
  -- Dados do Pagamento
  mes_referencia INT NOT NULL,
  ano_referencia INT NOT NULL,
  valor_mensalidade DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  metodo_pagamento VARCHAR(50),
  status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
  valor_pago DECIMAL(10, 2),
  observacoes TEXT,
  
  -- Controle
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chave estrangeira
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  
  -- Constraint único (um residente só pode ter uma mensalidade por mês/ano)
  UNIQUE KEY unique_mensalidade (residente_id, mes_referencia, ano_referencia),
  
  -- Índices
  INDEX idx_mes_ano (mes_referencia, ano_referencia),
  INDEX idx_status_mens (status),
  INDEX idx_data_venc (data_vencimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pagamentos de mensalidades dos residentes';

-- --------------------------------------------
-- TABELA: pagamentos_salarios
-- --------------------------------------------
CREATE TABLE pagamentos_salarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relacionamento
  profissional_id INT NOT NULL,
  
  -- Dados do Pagamento
  mes_referencia INT NOT NULL,
  ano_referencia INT NOT NULL,
  salario_base DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0.00,
  descontos DECIMAL(10, 2) DEFAULT 0.00,
  valor_liquido DECIMAL(10, 2) NOT NULL,
  data_pagamento DATE,
  metodo_pagamento VARCHAR(50),
  status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
  horas_trabalhadas DECIMAL(5, 2),
  observacoes TEXT,
  
  -- Controle
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Chave estrangeira
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  
  -- Constraint único (um profissional só pode ter um salário por mês/ano)
  UNIQUE KEY unique_salario (profissional_id, mes_referencia, ano_referencia),
  
  -- Índices
  INDEX idx_mes_ano_sal (mes_referencia, ano_referencia),
  INDEX idx_status_sal (status),
  INDEX idx_data_pag_sal (data_pagamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pagamentos de salários dos profissionais';

-- Reabilitar verificações
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- PARTE 3: INSERÇÃO DE DADOS INICIAIS
-- ============================================

-- --------------------------------------------
-- USUÁRIO ADMIN PADRÃO
-- --------------------------------------------
-- Email: admin@sistema.com
-- Senha: admin123 (ALTERAR EM PRODUÇÃO!)
-- Hash bcrypt para 'admin123'
INSERT INTO usuarios (email, senha, tipo, ativo) 
VALUES ('admin@sistema.com', '$2a$10$jCGMPZShJUOKxHRlecw32OFMIvwVdIHIEpzSh0gzTACXqQnOwt22G', 'admin', TRUE);

-- --------------------------------------------
-- RESIDENTES DE EXEMPLO
-- --------------------------------------------
INSERT INTO residentes (
  nome_completo, data_nascimento, cpf, rg, sexo, estado_civil,
  telefone, email,
  cep, logradouro, numero, bairro, cidade, estado,
  nome_responsavel, parentesco_responsavel, telefone_responsavel, email_responsavel,
  status, observacoes
) VALUES 
(
  'Maria da Silva Souza', '1945-03-15', '123.456.789-01', '12.345.678-9',
  'feminino', 'viuvo',
  '(11) 91234-5678', 'maria.souza@email.com',
  '01234-567', 'Rua das Flores', '123', 'Centro', 'São Paulo', 'SP',
  'João Silva Souza', 'filho', '(11) 98765-4321', 'joao.souza@email.com',
  'ativo', 'Paciente com diabetes tipo 2. Necessita acompanhamento nutricional regular.'
),
(
  'José Santos Oliveira', '1940-08-22', '234.567.890-12', '23.456.789-0',
  'masculino', 'casado',
  '(11) 92345-6789', 'jose.oliveira@email.com',
  '01234-568', 'Avenida Central', '456', 'Jardins', 'São Paulo', 'SP',
  'Ana Oliveira', 'esposa', '(11) 97654-3210', 'ana.oliveira@email.com',
  'ativo', 'Ex-engenheiro. Ativo e participativo. Gosta de xadrez e leitura.'
),
(
  'Ana Paula Ferreira', '1950-12-10', '345.678.901-23', '34.567.890-1',
  'feminino', 'solteiro',
  '(11) 93456-7890', 'ana.ferreira@email.com',
  '01234-569', 'Rua São João', '789', 'Vila Mariana', 'São Paulo', 'SP',
  'Carlos Ferreira', 'irmão', '(11) 96543-2109', 'carlos.ferreira@email.com',
  'ativo', 'Ex-professora de matemática. Autonomia preservada. Participa de atividades em grupo.'
),
(
  'Pedro Alves Costa', '1943-05-18', '456.789.012-34', '45.678.901-2',
  'masculino', 'viuvo',
  '(11) 94567-8901', 'pedro.costa@email.com',
  '01234-570', 'Travessa das Palmeiras', '321', 'Moema', 'São Paulo', 'SP',
  'Lucia Costa', 'filha', '(11) 95432-1098', 'lucia.costa@email.com',
  'ativo', 'Hipertenso. Medicação controlada. Necessita fisioterapia regular.'
),
(
  'Rosa Lima Santos', '1948-09-30', '567.890.123-45', '56.789.012-3',
  'feminino', 'divorciado',
  '(11) 95678-9012', 'rosa.santos@email.com',
  '01234-571', 'Rua das Acácias', '654', 'Pinheiros', 'São Paulo', 'SP',
  'Marina Santos', 'filha', '(11) 94321-0987', 'marina.santos@email.com',
  'ativo', 'Ex-comerciante. Sociável e comunicativa. Gosta de artesanato e pintura.'
);

-- --------------------------------------------
-- PROFISSIONAIS DE EXEMPLO
-- --------------------------------------------
INSERT INTO profissionais (
  nome_completo, data_nascimento, cpf, rg, sexo,
  celular, email,
  cep, logradouro, numero, bairro, cidade, estado,
  profissao, registro_profissional, especialidade,
  data_admissao, cargo, departamento, turno, salario,
  nome_emergencia, parentesco_emergencia, telefone_emergencia,
  status, observacoes
) VALUES
(
  'Dra. Fernanda Costa Silva', '1985-06-12', '111.222.333-44', '11.222.333-4',
  'feminino',
  '(11) 99999-1111', 'fernanda.silva@clinica.com',
  '05678-901', 'Rua dos Médicos', '100', 'Itaim Bibi', 'São Paulo', 'SP',
  'Médica', 'CRM 123456/SP', 'Geriatria',
  '2020-01-15', 'Médica Geriatra', 'Saúde', 'Manhã/Tarde', 12000.00,
  'Roberto Silva', 'marido', '(11) 98888-1111',
  'ativo', 'Especialista em cuidados geriátricos. Responsável por consultas médicas.'
),
(
  'Enf. Roberto Santos Lima', '1990-03-25', '222.333.444-55', '22.333.444-5',
  'masculino',
  '(11) 99999-2222', 'roberto.lima@clinica.com',
  '05678-902', 'Avenida Saúde', '200', 'Saúde', 'São Paulo', 'SP',
  'Enfermeiro', 'COREN 123456', 'Enfermagem Geriátrica',
  '2019-05-20', 'Enfermeiro Chefe', 'Saúde', 'Integral', 7000.00,
  'Julia Lima', 'esposa', '(11) 98888-2222',
  'ativo', 'Responsável pela equipe de enfermagem e medicações.'
),
(
  'Ft. Mariana Souza Alves', '1988-11-08', '333.444.555-66', '33.444.555-6',
  'feminino',
  '(11) 99999-3333', 'mariana.alves@clinica.com',
  '05678-903', 'Rua Reabilitação', '300', 'Consolação', 'São Paulo', 'SP',
  'Fisioterapeuta', 'CREFITO 12345', 'Fisioterapia Motora',
  '2021-02-10', 'Fisioterapeuta', 'Reabilitação', 'Manhã/Tarde', 5500.00,
  'Paulo Alves', 'irmão', '(11) 98888-3333',
  'ativo', 'Especialista em fisioterapia motora e respiratória para idosos.'
),
(
  'Nut. Carolina Pereira Dias', '1992-07-19', '444.555.666-77', '44.555.666-7',
  'feminino',
  '(11) 99999-4444', 'carolina.dias@clinica.com',
  '05678-904', 'Travessa Nutrição', '400', 'Bela Vista', 'São Paulo', 'SP',
  'Nutricionista', 'CRN 23456', 'Nutrição Clínica',
  '2022-08-01', 'Nutricionista', 'Saúde', 'Integral', 4500.00,
  'Marcos Dias', 'esposo', '(11) 98888-4444',
  'ativo', 'Responsável por dietas e acompanhamento nutricional dos residentes.'
),
(
  'Psic. Amanda Rodrigues Martins', '1989-04-14', '555.666.777-88', '55.666.777-8',
  'feminino',
  '(11) 99999-5555', 'amanda.martins@clinica.com',
  '05678-905', 'Rua das Mentes', '500', 'República', 'São Paulo', 'SP',
  'Psicóloga', 'CRP 06/123456', 'Psicologia Clínica',
  '2020-11-01', 'Psicóloga', 'Saúde Mental', 'Manhã/Tarde', 5000.00,
  'Felipe Martins', 'irmão', '(11) 98888-5555',
  'ativo', 'Atendimento psicológico individual e em grupo.'
);

-- --------------------------------------------
-- USUÁRIOS DOS PROFISSIONAIS
-- --------------------------------------------
INSERT INTO usuarios (profissional_id, email, senha, tipo, ativo)
SELECT id, email, '$2a$10$jCGMPZShJUOKxHRlecw32OFMIvwVdIHIEpzSh0gzTACXqQnOwt22G', 'profissional', TRUE
FROM profissionais
WHERE email IN (
  'fernanda.silva@clinica.com',
  'roberto.lima@clinica.com',
  'mariana.alves@clinica.com',
  'carolina.dias@clinica.com',
  'amanda.martins@clinica.com'
);

-- --------------------------------------------
-- AGENDAMENTOS DE EXEMPLO
-- --------------------------------------------
INSERT INTO agendamentos (
  residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim,
  tipo_atendimento, titulo, descricao, local, status
) VALUES
-- Agendamentos para hoje e próximos dias
(1, 1, CURDATE(), '09:00:00', '09:30:00',
 'consulta_medica', 'Consulta de Rotina - Maria',
 'Avaliação médica mensal', 'Consultório 1', 'confirmado'),

(2, 3, CURDATE(), '10:00:00', '11:00:00',
 'fisioterapia', 'Sessão de Fisioterapia - José',
 'Fisioterapia motora', 'Sala de Fisioterapia', 'agendado'),

(3, 4, CURDATE(), '14:00:00', '14:30:00',
 'nutricao', 'Consulta Nutricional - Ana Paula',
 'Revisão do plano alimentar', 'Sala de Nutrição', 'confirmado'),

(4, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '08:30:00',
 'enfermagem', 'Administração de Medicamentos - Pedro',
 'Aplicação de medicação', 'Enfermaria', 'agendado'),

(5, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00', '16:00:00',
 'psicologia', 'Atendimento Psicológico - Rosa',
 'Sessão de terapia individual', 'Consultório de Psicologia', 'agendado'),

(1, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', '11:30:00',
 'enfermagem', 'Verificação de Sinais Vitais - Maria',
 'Rotina de enfermagem', 'Enfermaria', 'agendado'),

(3, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00:00', '10:00:00',
 'fisioterapia', 'Fisioterapia - Ana Paula',
 'Manutenção da mobilidade', 'Sala de Fisioterapia', 'agendado');

-- --------------------------------------------
-- HISTÓRICO DE CONSULTAS (passadas)
-- --------------------------------------------
INSERT INTO historico_consultas (
  residente_id, profissional_id, data_consulta,
  tipo_consulta, observacoes, diagnostico, prescricao, status
) VALUES
(1, 1, DATE_SUB(CURDATE(), INTERVAL 30 DAY),
 'Consulta Médica', 'Paciente apresentando bom estado geral.',
 'Diabetes tipo 2 controlada. Pressão arterial normal.',
 'Manter medicação atual. Metformina 850mg 2x ao dia. Retorno em 30 dias.',
 'realizada'),

(2, 3, DATE_SUB(CURDATE(), INTERVAL 15 DAY),
 'Fisioterapia', 'Paciente com boa evolução na mobilidade.',
 'Melhora significativa na marcha. Equilíbrio estável.',
 'Continuar sessões 3x por semana. Exercícios de fortalecimento.',
 'realizada'),

(3, 4, DATE_SUB(CURDATE(), INTERVAL 20 DAY),
 'Nutrição', 'Paciente aderindo bem à dieta.',
 'Perda de 2kg no mês. IMC adequado para idade.',
 'Manter dieta atual. Aumentar ingestão hídrica. Retorno em 30 dias.',
 'realizada'),

(5, 5, DATE_SUB(CURDATE(), INTERVAL 7 DAY),
 'Psicologia', 'Paciente relatando adaptação positiva.',
 'Humor estável. Boa interação social.',
 'Manter sessões semanais. Estimular participação em atividades em grupo.',
 'realizada');

-- --------------------------------------------
-- DESPESAS GERAIS
-- --------------------------------------------
INSERT INTO despesas_gerais (
  descricao, categoria, valor, data_despesa, 
  status, data_pagamento, metodo_pagamento, observacoes
) VALUES
('Compra de alimentos - Novembro', 'Alimentacao', 8500.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY),
 'pago', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Transferência Bancária', 'Supermercado mensal'),

('Energia Elétrica - Novembro', 'Operacional', 2350.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY),
 'pago', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Débito Automático', 'Conta mensal'),

('Água e Esgoto - Novembro', 'Operacional', 890.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY),
 'pago', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Débito Automático', 'Conta mensal'),

('Manutenção do Elevador', 'Manutencao', 1200.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY),
 'pago', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Boleto', 'Manutenção preventiva'),

('Produtos de Limpeza', 'Limpeza', 650.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY),
 'pago', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Cartão de Crédito', 'Material mensal'),

('Medicamentos - Farmácia', 'Saude', 3200.00, CURDATE(),
 'pendente', NULL, NULL, 'Pedido mensal de medicamentos'),

('Compra de alimentos - Dezembro', 'Alimentacao', 8500.00, DATE_ADD(CURDATE(), INTERVAL 5 DAY),
 'pendente', NULL, NULL, 'Supermercado mensal'),

('Internet e Telefone', 'Operacional', 450.00, DATE_ADD(CURDATE(), INTERVAL 8 DAY),
 'pendente', NULL, NULL, 'Vencimento dia 15');

-- --------------------------------------------
-- MENSALIDADES DOS RESIDENTES
-- --------------------------------------------
-- Mensalidades de Novembro (pagas)
INSERT INTO pagamentos_mensalidades (
  residente_id, mes_referencia, ano_referencia,
  valor_mensalidade, data_vencimento, data_pagamento,
  metodo_pagamento, status, valor_pago, observacoes
) VALUES
(1, 11, 2025, 4500.00, '2025-11-10', '2025-11-08', 'PIX', 'pago', 4500.00, 'Pagamento antecipado'),
(2, 11, 2025, 4500.00, '2025-11-10', '2025-11-10', 'Transferência', 'pago', 4500.00, 'Pagamento em dia'),
(3, 11, 2025, 4500.00, '2025-11-10', '2025-11-09', 'PIX', 'pago', 4500.00, 'Pagamento em dia'),
(4, 11, 2025, 4500.00, '2025-11-10', '2025-11-11', 'Boleto', 'pago', 4500.00, 'Pagamento com 1 dia de atraso'),
(5, 11, 2025, 4500.00, '2025-11-10', '2025-11-08', 'PIX', 'pago', 4500.00, 'Pagamento antecipado');

-- Mensalidades de Dezembro (pendentes)
INSERT INTO pagamentos_mensalidades (
  residente_id, mes_referencia, ano_referencia,
  valor_mensalidade, data_vencimento, status, observacoes
) VALUES
(1, 12, 2025, 4500.00, '2025-12-10', 'pendente', 'Mensalidade de Dezembro'),
(2, 12, 2025, 4500.00, '2025-12-10', 'pendente', 'Mensalidade de Dezembro'),
(3, 12, 2025, 4500.00, '2025-12-10', 'pendente', 'Mensalidade de Dezembro'),
(4, 12, 2025, 4500.00, '2025-12-10', 'pendente', 'Mensalidade de Dezembro'),
(5, 12, 2025, 4500.00, '2025-12-10', 'pendente', 'Mensalidade de Dezembro');

-- --------------------------------------------
-- SALÁRIOS DOS PROFISSIONAIS
-- --------------------------------------------
-- Salários de Novembro (pagos)
INSERT INTO pagamentos_salarios (
  profissional_id, mes_referencia, ano_referencia,
  salario_base, bonus, descontos, valor_liquido,
  data_pagamento, metodo_pagamento, status, horas_trabalhadas, observacoes
) VALUES
(1, 11, 2025, 12000.00, 0.00, 1680.00, 10320.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Salário + descontos INSS/IR'),
(2, 11, 2025, 7000.00, 200.00, 1008.00, 6192.00, '2025-11-05', 'Transferência Bancária', 'pago', 176.00, 'Bônus por horas extras'),
(3, 11, 2025, 5500.00, 0.00, 770.00, 4730.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Salário regular'),
(4, 11, 2025, 4500.00, 0.00, 630.00, 3870.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Salário regular'),
(5, 11, 2025, 5000.00, 0.00, 700.00, 4300.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Salário regular');

-- Salários de Dezembro (pendentes)
INSERT INTO pagamentos_salarios (
  profissional_id, mes_referencia, ano_referencia,
  salario_base, bonus, descontos, valor_liquido, status, observacoes
) VALUES
(1, 12, 2025, 12000.00, 0.00, 1680.00, 10320.00, 'pendente', 'Salário de Dezembro'),
(2, 12, 2025, 7000.00, 0.00, 980.00, 6020.00, 'pendente', 'Salário de Dezembro'),
(3, 12, 2025, 5500.00, 0.00, 770.00, 4730.00, 'pendente', 'Salário de Dezembro'),
(4, 12, 2025, 4500.00, 0.00, 630.00, 3870.00, 'pendente', 'Salário de Dezembro'),
(5, 12, 2025, 5000.00, 0.00, 700.00, 4300.00, 'pendente', 'Salário de Dezembro');

-- ============================================
-- PARTE 4: VERIFICAÇÕES E CONSULTAS ÚTEIS
-- ============================================

-- Verificar criação das tabelas
SELECT '========================================' AS '';
SELECT '✅ BANCO DE DADOS CRIADO COM SUCESSO!' AS '';
SELECT '========================================' AS '';

SELECT 'TABELAS CRIADAS:' AS '';
SHOW TABLES;

SELECT '' AS '';
SELECT 'RESUMO DOS DADOS:' AS '';
SELECT 'Residentes cadastrados' AS Tipo, COUNT(*) AS Total FROM residentes
UNION ALL
SELECT 'Profissionais cadastrados', COUNT(*) FROM profissionais
UNION ALL
SELECT 'Usuários do sistema', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Agendamentos registrados', COUNT(*) FROM agendamentos
UNION ALL
SELECT 'Histórico de consultas', COUNT(*) FROM historico_consultas
UNION ALL
SELECT 'Despesas cadastradas', COUNT(*) FROM despesas_gerais
UNION ALL
SELECT 'Mensalidades registradas', COUNT(*) FROM pagamentos_mensalidades
UNION ALL
SELECT 'Salários registrados', COUNT(*) FROM pagamentos_salarios;

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT 'INFORMAÇÕES DE ACESSO:' AS '';
SELECT '========================================' AS '';
SELECT 'Email: admin@sistema.com' AS 'Login Admin';
SELECT 'Senha: admin123' AS 'Senha Padrão';
SELECT '⚠️ IMPORTANTE: ALTERAR A SENHA EM PRODUÇÃO!' AS 'Aviso de Segurança';
SELECT '' AS '';

-- ============================================
-- CONSULTAS ÚTEIS PARA ADMINISTRAÇÃO
-- ============================================

-- Agendamentos de hoje
SELECT '' AS '';
SELECT 'AGENDAMENTOS DE HOJE:' AS '';
SELECT 
    a.hora_inicio AS Hora,
    r.nome_completo AS Residente,
    p.nome_completo AS Profissional,
    a.titulo AS Atendimento,
    a.status AS Status
FROM agendamentos a
JOIN residentes r ON a.residente_id = r.id
JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = CURDATE()
ORDER BY a.hora_inicio;

-- Mensalidades pendentes
SELECT '' AS '';
SELECT 'MENSALIDADES PENDENTES - DEZEMBRO:' AS '';
SELECT 
    r.nome_completo AS Residente,
    pm.valor_mensalidade AS Valor,
    pm.data_vencimento AS Vencimento,
    pm.status AS Status
FROM pagamentos_mensalidades pm
JOIN residentes r ON pm.residente_id = r.id
WHERE pm.mes_referencia = 12 
  AND pm.ano_referencia = 2025 
  AND pm.status = 'pendente'
ORDER BY r.nome_completo;

-- Resumo financeiro
SELECT '' AS '';
SELECT 'RESUMO FINANCEIRO - DEZEMBRO 2025:' AS '';
SELECT 
    COALESCE(SUM(valor_mensalidade), 0) AS 'Receita Prevista (Mensalidades)',
    (SELECT COALESCE(SUM(valor), 0) FROM despesas_gerais WHERE MONTH(data_despesa) = 12 AND YEAR(data_despesa) = 2025) AS 'Despesas',
    (SELECT COALESCE(SUM(valor_liquido), 0) FROM pagamentos_salarios WHERE mes_referencia = 12 AND ano_referencia = 2025) AS 'Folha de Pagamento'
FROM pagamentos_mensalidades
WHERE mes_referencia = 12 AND ano_referencia = 2025;

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT '✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!' AS '';
SELECT 'O sistema está pronto para uso.' AS '';
SELECT '========================================' AS '';
