-- ============================================
-- INSERÇÃO DE DADOS - CONJUNTO 2
-- Mais residentes, profissionais e dados financeiros
-- ============================================

USE sistema_residencial;

-- ============================================
-- INSERIR MAIS RESIDENTES
-- ============================================

INSERT INTO residentes (
  nome_completo, data_nascimento, cpf, rg, sexo, estado_civil,
  telefone, email,
  cep, logradouro, numero, bairro, cidade, estado,
  nome_responsavel, parentesco_responsavel, telefone_responsavel, email_responsavel,
  status, observacoes
) VALUES 
(
  'Helena Ferreira Alves', '1947-09-08', '678.901.234-56', '67.890.123-4',
  'feminino', 'viuvo',
  '(11) 98123-4567', 'helena.alves@email.com',
  '02345-678', 'Rua dos Lírios', '234', 'Jardim Europa', 'São Paulo', 'SP',
  'Paulo Alves', 'neto', '(11) 97234-5678', 'paulo.alves@email.com',
  'ativo', 'Ex-professora de música. Toca piano. Necessita acompanhamento psicológico.'
),
(
  'Francisco Gomes Pereira', '1940-12-25', '789.012.345-67', '78.901.234-5',
  'masculino', 'viuvo',
  '(11) 96789-0123', 'francisco.pereira@email.com',
  '02345-679', 'Avenida das Palmeiras', '567', 'Alto da Boa Vista', 'São Paulo', 'SP',
  'Sandra Pereira', 'filha', '(11) 95678-9012', 'sandra.pereira@email.com',
  'ativo', 'Ex-engenheiro civil. Portador de Alzheimer inicial. Requer supervisão constante.'
),
(
  'Beatriz Martins Costa', '1952-04-17', '890.123.456-78', '89.012.345-6',
  'feminino', 'divorciado',
  '(11) 95432-1098', 'beatriz.costa@email.com',
  '02345-680', 'Rua das Hortênsias', '890', 'Vila Mariana', 'São Paulo', 'SP',
  'Roberto Costa', 'filho', '(11) 94321-0987', 'roberto.costa@email.com',
  'ativo', 'Ex-enfermeira. Independente. Participa de atividades em grupo.'
),
(
  'Osvaldo Ribeiro Santos', '1943-08-30', '901.234.567-89', '90.123.456-7',
  'masculino', 'casado',
  '(11) 94567-8901', 'osvaldo.santos@email.com',
  '02345-681', 'Travessa do Bosque', '112', 'Morumbi', 'São Paulo', 'SP',
  'Lucia Ribeiro Santos', 'esposa', '(11) 93456-7890', 'lucia.santos@email.com',
  'ativo', 'Ex-comerciante. Diabetes e hipertensão controladas. Cardiopata.'
),
(
  'Carmem Lucia Barbosa', '1949-06-12', '012.345.678-90', '01.234.567-8',
  'feminino', 'solteiro',
  '(11) 93210-9876', 'carmem.barbosa@email.com',
  '02345-682', 'Rua das Azaleias', '445', 'Pinheiros', 'São Paulo', 'SP',
  'Marcia Barbosa', 'sobrinha', '(11) 92109-8765', 'marcia.barbosa@email.com',
  'ativo', 'Ex-secretária executiva. Ativa e comunicativa. Gosta de artesanato.'
);

-- ============================================
-- INSERIR MAIS PROFISSIONAIS
-- ============================================

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
  'Enf. Patricia Lima Santos', '1987-11-05', '666.777.888-99', '66.777.888-9',
  'feminino',
  '(11) 99999-6666', 'patricia.santos@clinica.com',
  '05678-901', 'Rua dos Profissionais', '500', 'Saúde', 'São Paulo', 'SP',
  'Enfermeira', 'COREN 111222', 'Enfermagem Geriátrica',
  '2021-05-10', 'Enfermeira', 'Saúde', 'Noite', 6000.00,
  'Fernando Santos', 'marido', '(11) 98888-3333',
  'ativo', 'Responsável pelo plantão noturno.'
),
(
  'Terapeuta Ocupacional Juliana Mendes', '1991-02-28', '777.888.999-00', '77.888.999-0',
  'feminino',
  '(11) 99999-7777', 'juliana.mendes@clinica.com',
  '05678-902', 'Avenida Reabilitação', '600', 'Consolação', 'São Paulo', 'SP',
  'Terapeuta Ocupacional', 'CREFITO 444555', 'Terapia Ocupacional em Geriatria',
  '2022-03-15', 'Terapeuta Ocupacional', 'Reabilitação', 'Manhã', 5500.00,
  'Marcos Mendes', 'irmão', '(11) 98888-2222',
  'ativo', 'Desenvolve atividades de vida diária e estimulação cognitiva.'
),
(
  'Assistente Social Renata Oliveira', '1989-07-20', '888.999.000-11', '88.999.000-1',
  'feminino',
  '(11) 99999-8888', 'renata.oliveira@clinica.com',
  '05678-903', 'Rua Social', '700', 'República', 'São Paulo', 'SP',
  'Assistente Social', 'CRESS 666777', 'Serviço Social em Saúde',
  '2021-09-01', 'Assistente Social', 'Assistência Social', 'Integral', 4800.00,
  'André Oliveira', 'esposo', '(11) 98888-1111',
  'ativo', 'Responsável pelo atendimento às famílias e questões sociais.'
),
(
  'Farmacêutico Lucas Ferreira', '1986-03-14', '999.000.111-22', '99.000.111-2',
  'masculino',
  '(11) 99999-9999', 'lucas.ferreira@clinica.com',
  '05678-904', 'Rua dos Medicamentos', '800', 'Liberdade', 'São Paulo', 'SP',
  'Farmacêutico', 'CRF 888999', 'Farmácia Clínica',
  '2020-11-20', 'Farmacêutico', 'Farmácia', 'Integral', 6500.00,
  'Camila Ferreira', 'esposa', '(11) 98888-0000',
  'ativo', 'Controle de medicamentos e orientação farmacêutica.'
),
(
  'Recepcionista Amanda Silva', '1995-05-22', '000.111.222-33', '00.111.222-3',
  'feminino',
  '(11) 98888-9999', 'amanda.silva@clinica.com',
  '05678-905', 'Rua Administrativa', '900', 'Bela Vista', 'São Paulo', 'SP',
  'Recepcionista', NULL, NULL,
  '2023-01-10', 'Recepcionista', 'Administrativo', 'Integral', 2800.00,
  'Maria Silva', 'mãe', '(11) 97777-8888',
  'ativo', 'Atendimento e organização da recepção.'
);

-- ============================================
-- INSERIR MAIS AGENDAMENTOS
-- ============================================

-- Usar variáveis para pegar os IDs corretos dos residentes e profissionais recém-inseridos
SET @helena_id = (SELECT id FROM residentes WHERE cpf = '678.901.234-56');
SET @francisco_id = (SELECT id FROM residentes WHERE cpf = '789.012.345-67');
SET @beatriz_id = (SELECT id FROM residentes WHERE cpf = '890.123.456-78');
SET @osvaldo_id = (SELECT id FROM residentes WHERE cpf = '901.234.567-89');
SET @carmem_id = (SELECT id FROM residentes WHERE cpf = '012.345.678-90');

SET @patricia_id = (SELECT id FROM profissionais WHERE cpf = '666.777.888-99');
SET @juliana_id = (SELECT id FROM profissionais WHERE cpf = '777.888.999-00');
SET @renata_id = (SELECT id FROM profissionais WHERE cpf = '888.999.000-11');
SET @lucas_id = (SELECT id FROM profissionais WHERE cpf = '999.000.111-22');

-- Pegar IDs de profissionais existentes para alguns agendamentos
SET @medico_id = (SELECT id FROM profissionais WHERE profissao = 'Médica' LIMIT 1);
SET @enfermeiro_id = (SELECT id FROM profissionais WHERE profissao = 'Enfermeiro' LIMIT 1);
SET @fisio_id = (SELECT id FROM profissionais WHERE profissao = 'Fisioterapeuta' LIMIT 1);
SET @nutri_id = (SELECT id FROM profissionais WHERE profissao = 'Nutricionista' LIMIT 1);

INSERT INTO agendamentos (
  residente_id, profissional_id, data_agendamento, hora_inicio, hora_fim,
  tipo_atendimento, titulo, descricao, local, status
) VALUES
(@helena_id, @renata_id, '2025-12-07', '09:00:00', '09:30:00',
 'assistencia_social', 'Atendimento Social - Helena',
 'Acompanhamento de adaptação', 'Sala de Serviço Social', 'agendado'),

(@francisco_id, @medico_id, '2025-12-07', '10:00:00', '11:00:00',
 'consulta_medica', 'Avaliação Neurológica - Francisco',
 'Avaliação do quadro de Alzheimer', 'Consultório 1', 'agendado'),

(@beatriz_id, @juliana_id, '2025-12-07', '14:00:00', '15:00:00',
 'terapia_ocupacional', 'Terapia Ocupacional - Beatriz',
 'Atividades de estimulação cognitiva', 'Sala de T.O.', 'agendado'),

(@osvaldo_id, @nutri_id, '2025-12-08', '09:00:00', '09:30:00',
 'nutricao', 'Acompanhamento Nutricional - Osvaldo',
 'Revisão da dieta para cardiopatas', 'Sala de Nutrição', 'confirmado'),

(@carmem_id, @fisio_id, '2025-12-08', '14:00:00', '15:00:00',
 'fisioterapia', 'Fisioterapia - Carmem',
 'Manutenção da mobilidade', 'Sala de Fisioterapia', 'agendado'),

(@helena_id, @enfermeiro_id, '2025-12-09', '08:00:00', '08:30:00',
 'enfermagem', 'Administração de Medicamentos - Helena',
 'Aplicação de medicação injetável', 'Enfermaria', 'confirmado');

-- ============================================
-- INSERIR MAIS DESPESAS
-- ============================================

INSERT INTO despesas_gerais (
  descricao, categoria, valor, data_despesa, status, data_pagamento, metodo_pagamento, observacoes
) VALUES
('Internet Banda Larga - Dezembro', 'Operacional', 250.00, '2025-12-01', 'pago', '2025-12-01', 'PIX', 'Pagamento automático'),
('Telefone Fixo - Dezembro', 'Operacional', 180.00, '2025-12-01', 'pago', '2025-12-01', 'Débito Automático', 'Conta mensal'),
('Material de Enfermagem', 'Saude', 890.00, '2025-12-02', 'pago', '2025-12-02', 'Cartão de Crédito', 'Seringas, gazes, luvas'),
('Lavanderia Externa', 'Limpeza', 1200.00, '2025-12-03', 'pago', '2025-12-03', 'Transferência', 'Roupas de cama e banho'),
('Extintor de Incêndio', 'Manutencao', 450.00, '2025-12-04', 'pago', '2025-12-04', 'Boleto', 'Recarga anual'),
('Notebook para Administração', 'Operacional', 3500.00, '2025-12-15', 'pendente', NULL, NULL, 'Equipamento administrativo'),
('Reforma da Sala de TV', 'Manutencao', 2800.00, '2025-12-20', 'pendente', NULL, NULL, 'Pintura e mobiliário'),
('Seguro do Imóvel - Anual', 'Operacional', 5600.00, '2025-12-25', 'pendente', NULL, NULL, 'Renovação anual');

-- ============================================
-- INSERIR MENSALIDADES DOS NOVOS RESIDENTES
-- ============================================

INSERT INTO pagamentos_mensalidades (
  residente_id, mes_referencia, ano_referencia,
  valor_mensalidade, data_vencimento, data_pagamento,
  metodo_pagamento, status, valor_pago, observacoes
) VALUES
-- Novembro - Novos Residentes
(@helena_id, 11, 2025, 4500.00, '2025-11-10', '2025-11-11', 'PIX', 'pago', 4500.00, 'Helena - Primeiro pagamento'),
(@francisco_id, 11, 2025, 4800.00, '2025-11-10', '2025-11-09', 'Transferência', 'pago', 4800.00, 'Francisco - Mensalidade com suplemento especial'),
(@beatriz_id, 11, 2025, 4500.00, '2025-11-10', '2025-11-10', 'PIX', 'pago', 4500.00, 'Beatriz - Pagamento em dia'),
(@osvaldo_id, 11, 2025, 4700.00, '2025-11-10', '2025-11-12', 'Boleto', 'pago', 4700.00, 'Osvaldo - Mensalidade com acompanhamento especial'),
(@carmem_id, 11, 2025, 4500.00, '2025-11-10', '2025-11-08', 'PIX', 'pago', 4500.00, 'Carmem - Pagamento antecipado'),

-- Dezembro - Novos Residentes
(@helena_id, 12, 2025, 4500.00, '2025-12-10', NULL, NULL, 'pendente', NULL, 'Helena - Dezembro'),
(@francisco_id, 12, 2025, 4800.00, '2025-12-10', NULL, NULL, 'pendente', NULL, 'Francisco - Dezembro'),
(@beatriz_id, 12, 2025, 4500.00, '2025-12-10', NULL, NULL, 'pendente', NULL, 'Beatriz - Dezembro'),
(@osvaldo_id, 12, 2025, 4700.00, '2025-12-10', NULL, NULL, 'pendente', NULL, 'Osvaldo - Dezembro'),
(@carmem_id, 12, 2025, 4500.00, '2025-12-10', NULL, NULL, 'pendente', NULL, 'Carmem - Dezembro');

-- ============================================
-- INSERIR SALÁRIOS DOS NOVOS PROFISSIONAIS
-- ============================================

SET @amanda_id = (SELECT id FROM profissionais WHERE cpf = '000.111.222-33');

INSERT INTO pagamentos_salarios (
  profissional_id, mes_referencia, ano_referencia,
  salario_base, bonus, descontos, valor_liquido,
  data_pagamento, metodo_pagamento, status, horas_trabalhadas, observacoes
) VALUES
-- Novembro - Novos Profissionais
(@patricia_id, 11, 2025, 6000.00, 0.00, 840.00, 5160.00, '2025-11-05', 'Transferência Bancária', 'pago', 176.00, 'Patricia - Plantão noturno com horas extras'),
(@juliana_id, 11, 2025, 5500.00, 200.00, 798.00, 4902.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Juliana - Bônus por projeto especial'),
(@renata_id, 11, 2025, 4800.00, 0.00, 672.00, 4128.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Renata - Pagamento regular'),
(@lucas_id, 11, 2025, 6500.00, 300.00, 952.00, 5848.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Lucas - Bônus por eficiência'),
(@amanda_id, 11, 2025, 2800.00, 0.00, 392.00, 2408.00, '2025-11-05', 'Transferência Bancária', 'pago', 160.00, 'Amanda - Pagamento regular'),

-- Dezembro - Novos Profissionais
(@patricia_id, 12, 2025, 6000.00, 0.00, 840.00, 5160.00, NULL, NULL, 'pendente', NULL, 'Patricia - Dezembro'),
(@juliana_id, 12, 2025, 5500.00, 0.00, 770.00, 4730.00, NULL, NULL, 'pendente', NULL, 'Juliana - Dezembro'),
(@renata_id, 12, 2025, 4800.00, 0.00, 672.00, 4128.00, NULL, NULL, 'pendente', NULL, 'Renata - Dezembro'),
(@lucas_id, 12, 2025, 6500.00, 0.00, 910.00, 5590.00, NULL, NULL, 'pendente', NULL, 'Lucas - Dezembro'),
(@amanda_id, 12, 2025, 2800.00, 0.00, 392.00, 2408.00, NULL, NULL, 'pendente', NULL, 'Amanda - Dezembro');

-- ============================================
-- INSERIR HISTÓRICO DE CONSULTAS
-- ============================================

INSERT INTO historico_consultas (
  residente_id, profissional_id, agendamento_id,
  data_consulta, tipo_consulta, observacoes, diagnostico, prescricao, status
) VALUES
(@helena_id, @renata_id, NULL,
 '2025-11-15 09:00:00', 'Serviço Social',
 'Primeira consulta. Paciente adaptando-se bem ao ambiente.',
 'Adaptação satisfatória. Família presente e participativa.',
 'Acompanhamento social mensal. Grupo de convivência.',
 'realizada'),

(@francisco_id, @medico_id, NULL,
 '2025-11-18 10:00:00', 'Neurologia',
 'Avaliação inicial do quadro cognitivo.',
 'Alzheimer estágio inicial. Preservação de autonomia.',
 'Rivastigmina 6mg/dia. Acompanhamento neurológico mensal. Estimulação cognitiva.',
 'realizada'),

(@beatriz_id, @juliana_id, NULL,
 '2025-11-22 14:00:00', 'Terapia Ocupacional',
 'Avaliação das atividades de vida diária. Paciente independente.',
 'Capacidade funcional preservada.',
 'Atividades em grupo. Artesanato terapêutico 2x por semana.',
 'realizada'),

(@osvaldo_id, @nutri_id, NULL,
 '2025-11-25 09:00:00', 'Nutrição',
 'Primeira consulta nutricional. Paciente com restrições alimentares.',
 'Diabetes Tipo 2 e Cardiopatia. Necessita dieta hipossódica e hipoglicêmica.',
 'Dieta de 1800 kcal. Baixo teor de sódio e açúcar. Acompanhamento mensal.',
 'realizada');

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

SELECT '✅ Conjunto 2 de dados inserido com sucesso!' AS Status;

SELECT 'RESUMO DA INSERÇÃO' AS Info;
SELECT 'Novos Residentes' AS Tipo, COUNT(*) AS Total FROM residentes WHERE cpf IN ('678.901.234-56', '789.012.345-67', '890.123.456-78', '901.234.567-89', '012.345.678-90')
UNION ALL
SELECT 'Novos Profissionais', COUNT(*) FROM profissionais WHERE cpf IN ('666.777.888-99', '777.888.999-00', '888.999.000-11', '999.000.111-22', '000.111.222-33')
UNION ALL
SELECT 'Total de Residentes', COUNT(*) FROM residentes
UNION ALL
SELECT 'Total de Profissionais', COUNT(*) FROM profissionais
UNION ALL
SELECT 'Total de Agendamentos', COUNT(*) FROM agendamentos
UNION ALL
SELECT 'Total de Despesas', COUNT(*) FROM despesas_gerais
UNION ALL
SELECT 'Total de Mensalidades', COUNT(*) FROM pagamentos_mensalidades
UNION ALL
SELECT 'Total de Salários', COUNT(*) FROM pagamentos_salarios;
