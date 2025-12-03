-- ============================================
-- SCRIPT PARA INSERIR DADOS MANUALMENTE
-- Sistema de Gestão Residencial
-- ============================================

USE sistema_residencial;

-- ============================================
-- 1. INSERIR RESIDENTES
-- ============================================

INSERT INTO residentes (
    nome_completo, 
    data_nascimento, 
    cpf, 
    rg, 
    sexo,
    telefone, 
    nome_responsavel, 
    parentesco_responsavel,
    telefone_responsavel,
    status,
    observacoes
) VALUES 
(
    'João da Silva Santos',
    '1945-03-15',
    '77788899900',
    'MG7778889',
    'masculino',
    '31987654321',
    'Maria da Silva',
    'Filha',
    '31987654322',
    'ativo',
    'Hipertensão, Diabetes tipo 2. Medicamentos: Losartana 50mg, Metformina 850mg. Plano: Unimed 123456789. Dieta com pouco sal e açúcar.'
),
(
    'Ana Maria Oliveira',
    '1950-07-22',
    '88899900011',
    'MG8889990',
    'feminino',
    '31976543210',
    'Pedro Oliveira',
    'Filho',
    '31976543211',
    'ativo',
    'Artrose, Osteoporose. Medicamentos: Colágeno tipo 2, Cálcio + Vitamina D. Plano: Unimed 987654321.'
),
(
    'Carlos Eduardo Ferreira',
    '1948-11-30',
    '99900011122',
    'MG9990001',
    'masculino',
    '31965432109',
    'Lucia Ferreira',
    'Esposa',
    '31965432108',
    'ativo',
    'Parkinson inicial. Medicamentos: Levodopa 250mg, Biperideno 2mg. Plano: Unimed 111222333.'
);

-- ============================================
-- 2. INSERIR PROFISSIONAIS
-- ============================================

INSERT INTO profissionais (
    nome_completo,
    cpf,
    rg,
    data_nascimento,
    sexo,
    celular,
    email,
    especialidade,
    registro_profissional,
    status
) VALUES 
(
    'Dra. Fernanda Costa',
    '10011022033',
    'MG1001102',
    '1985-06-12',
    'feminino',
    '31998877665',
    'fernanda.costa@email.com',
    'Médica Geriatra',
    'CRM 12345/MG',
    'ativo'
),
(
    'Enf. Roberto Silva',
    '20022033044',
    'MG2002203',
    '1990-09-20',
    'masculino',
    '31987766554',
    'roberto.silva@email.com',
    'Enfermeiro',
    'COREN 123456',
    'ativo'
),
(
    'Dra. Mariana Souza',
    '30033044055',
    'MG3003304',
    '1988-04-15',
    'feminino',
    '31976655443',
    'mariana.souza@email.com',
    'Fisioterapeuta',
    'CREFITO 78901',
    'ativo'
),
(
    'Téc. Paula Santos',
    '40044055066',
    'MG4004405',
    '1992-12-08',
    'feminino',
    '31965544332',
    'paula.santos@email.com',
    'Técnica de Enfermagem',
    'COREN 234567',
    'ativo'
);

-- ============================================
-- 3. INSERIR AGENDAMENTOS (CONSULTAS)
-- ============================================

-- Buscar IDs dos residentes e profissionais inseridos
SET @joao_id = (SELECT id FROM residentes WHERE cpf = '77788899900');
SET @ana_id = (SELECT id FROM residentes WHERE cpf = '88899900011');
SET @carlos_id = (SELECT id FROM residentes WHERE cpf = '99900011122');

SET @medica_id = (SELECT id FROM profissionais WHERE cpf = '10011022033');
SET @enfermeiro_id = (SELECT id FROM profissionais WHERE cpf = '20022033044');
SET @fisio_id = (SELECT id FROM profissionais WHERE cpf = '30033044055');

INSERT INTO agendamentos (
    residente_id,
    profissional_id,
    data_agendamento,
    hora_inicio,
    hora_fim,
    tipo_atendimento,
    titulo,
    status,
    observacoes
) VALUES 
(
    @joao_id,
    @medica_id,
    '2025-12-05',
    '09:00:00',
    '09:30:00',
    'consulta_medica',
    'Consulta de Rotina',
    'agendado',
    'Renovação de receitas'
),
(
    @ana_id,
    @fisio_id,
    '2025-12-06',
    '10:00:00',
    '10:45:00',
    'fisioterapia',
    'Sessão de Fisioterapia',
    'agendado',
    'Sessão de fisioterapia para artrose'
),
(
    @carlos_id,
    @medica_id,
    '2025-12-08',
    '14:00:00',
    '14:30:00',
    'consulta_medica',
    'Consulta de Rotina',
    'agendado',
    'Acompanhamento de Parkinson'
);

-- ============================================
-- 4. INSERIR DESPESAS GERAIS
-- ============================================

INSERT INTO despesas_gerais (
    descricao,
    categoria,
    valor,
    data_despesa,
    status,
    metodo_pagamento,
    observacoes
) VALUES 
(
    'Compra de alimentos - Dezembro',
    'Alimentacao',
    2500.00,
    '2025-12-01',
    'pago',
    'Transferência Bancária',
    'Supermercado mensal'
),
(
    'Manutenção do ar condicionado',
    'Manutencao',
    450.00,
    '2025-12-02',
    'pago',
    'Dinheiro',
    'Limpeza de 5 unidades'
),
(
    'Produtos de limpeza',
    'Limpeza',
    380.00,
    '2025-12-01',
    'pago',
    'Cartão de Crédito',
    'Material para o mês'
),
(
    'Medicamentos diversos',
    'Saude',
    1200.00,
    '2025-12-03',
    'pendente',
    NULL,
    'Farmácia - pedido mensal'
),
(
    'Conta de luz',
    'Operacional',
    890.00,
    '2025-12-05',
    'pendente',
    NULL,
    'Vencimento: 10/12/2025'
),
(
    'Conta de água',
    'Operacional',
    320.00,
    '2025-12-05',
    'pendente',
    NULL,
    'Vencimento: 15/12/2025'
);

-- ============================================
-- 5. INSERIR PAGAMENTOS DE MENSALIDADES
-- ============================================

INSERT INTO pagamentos_mensalidades (
    residente_id,
    valor,
    mes_referencia,
    ano_referencia,
    data_vencimento,
    status,
    observacoes
) VALUES 
(
    @joao_id,
    3500.00,
    12,
    2025,
    '2025-12-10',
    'pendente',
    'Mensalidade de Dezembro/2025'
),
(
    @ana_id,
    3500.00,
    12,
    2025,
    '2025-12-10',
    'pendente',
    'Mensalidade de Dezembro/2025'
),
(
    @carlos_id,
    3800.00,
    12,
    2025,
    '2025-12-10',
    'pendente',
    'Mensalidade de Dezembro/2025 - Valor diferenciado'
),
(
    @joao_id,
    3500.00,
    11,
    2025,
    '2025-11-10',
    'pago',
    'Pago em 08/11/2025'
),
(
    @ana_id,
    3500.00,
    11,
    2025,
    '2025-11-10',
    'pago',
    'Pago em 09/11/2025'
);

-- Para marcar mensalidades como pagas
UPDATE pagamentos_mensalidades 
SET data_pagamento = '2025-11-08', metodo_pagamento = 'Transferência Bancária'
WHERE residente_id = @joao_id AND mes_referencia = 11 AND ano_referencia = 2025;

UPDATE pagamentos_mensalidades 
SET data_pagamento = '2025-11-09', metodo_pagamento = 'Pix'
WHERE residente_id = @ana_id AND mes_referencia = 11 AND ano_referencia = 2025;

-- ============================================
-- 6. INSERIR PAGAMENTOS DE SALÁRIOS
-- ============================================

INSERT INTO pagamentos_salarios (
    profissional_id,
    valor,
    mes_referencia,
    ano_referencia,
    status,
    bonus,
    descontos,
    observacoes
) VALUES 
(
    @medica_id,
    8000.00,
    12,
    2025,
    'pendente',
    0.00,
    0.00,
    'Salário Dezembro/2025'
),
(
    @enfermeiro_id,
    4500.00,
    12,
    2025,
    'pendente',
    200.00,
    0.00,
    'Salário Dezembro/2025 + Bônus assiduidade'
),
(
    @fisio_id,
    4000.00,
    12,
    2025,
    'pendente',
    0.00,
    0.00,
    'Salário Dezembro/2025'
),
(
    @medica_id,
    8000.00,
    11,
    2025,
    'pago',
    0.00,
    0.00,
    'Salário Novembro/2025'
),
(
    @enfermeiro_id,
    4500.00,
    11,
    2025,
    'pago',
    150.00,
    0.00,
    'Salário Novembro/2025 + Bônus'
);

-- Para marcar salários como pagos
UPDATE pagamentos_salarios 
SET data_pagamento = '2025-11-30', metodo_pagamento = 'Transferência Bancária'
WHERE profissional_id = @medica_id AND mes_referencia = 11 AND ano_referencia = 2025;

UPDATE pagamentos_salarios 
SET data_pagamento = '2025-11-30', metodo_pagamento = 'Transferência Bancária'
WHERE profissional_id = @enfermeiro_id AND mes_referencia = 11 AND ano_referencia = 2025;

-- ============================================
-- 7. VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

SELECT '=== RESIDENTES ===' as '';
SELECT id, nome_completo, cpf, status FROM residentes ORDER BY id DESC LIMIT 3;

SELECT '=== PROFISSIONAIS ===' as '';
SELECT id, nome_completo, especialidade, status FROM profissionais ORDER BY id DESC LIMIT 4;

SELECT '=== AGENDAMENTOS ===' as '';
SELECT a.id, r.nome_completo as residente, p.nome_completo as profissional, 
       a.titulo, a.tipo_atendimento, a.data_agendamento, a.status 
FROM agendamentos a
JOIN residentes r ON a.residente_id = r.id
JOIN profissionais p ON a.profissional_id = p.id
ORDER BY a.id DESC LIMIT 3;

SELECT '=== DESPESAS GERAIS ===' as '';
SELECT id, descricao, categoria, valor, status FROM despesas_gerais ORDER BY id DESC LIMIT 6;

SELECT '=== MENSALIDADES ===' as '';
SELECT pm.id, r.nome_completo as residente, pm.valor, 
       CONCAT(pm.mes_referencia, '/', pm.ano_referencia) as mes_ano, pm.status
FROM pagamentos_mensalidades pm
JOIN residentes r ON pm.residente_id = r.id
ORDER BY pm.id DESC LIMIT 5;

SELECT '=== SALÁRIOS ===' as '';
SELECT ps.id, p.nome_completo as profissional, ps.valor, ps.bonus,
       CONCAT(ps.mes_referencia, '/', ps.ano_referencia) as mes_ano, ps.status
FROM pagamentos_salarios ps
JOIN profissionais p ON ps.profissional_id = p.id
ORDER BY ps.id DESC LIMIT 5;

SELECT '=== RESUMO FINANCEIRO ===' as '';
SELECT 
    (SELECT SUM(valor) FROM pagamentos_mensalidades WHERE status = 'pago' AND mes_referencia = 12 AND ano_referencia = 2025) as receitas_dez,
    (SELECT SUM(valor) FROM despesas_gerais WHERE status = 'pago') as despesas_gerais,
    (SELECT SUM(valor + bonus - descontos) FROM pagamentos_salarios WHERE status = 'pago' AND mes_referencia = 12 AND ano_referencia = 2025) as folha_pagamento;
