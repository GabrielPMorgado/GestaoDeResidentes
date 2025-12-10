-- INSERÇÃO DE DADOS DE TESTE PARA O MÓDULO FINANCEIRO

-- Residente de exemplo
INSERT INTO residentes (
  nome_completo, data_nascimento, cpf, rg, sexo, estado_civil, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, estado, nome_responsavel, parentesco_responsavel, telefone_responsavel, email_responsavel, status, valor_mensalidade, observacoes
) VALUES (
  'João da Silva', '1950-05-10', '123.456.789-01', 'MG-12.345.678', 'masculino', 'viuvo', '31999999999', 'joao@email.com', '30123-456', 'Rua das Flores', '100', 'Apto 101', 'Centro', 'Belo Horizonte', 'MG', 'Maria Silva', 'filha', '31988888888', 'maria@email.com', 'ativo', 2500.00, 'Residente desde 2020'
);

-- Profissional de exemplo
INSERT INTO profissionais (
  nome_completo, data_nascimento, cpf, rg, sexo, estado_civil, telefone, celular, email, cep, logradouro, numero, complemento, bairro, cidade, estado, profissao, registro_profissional, especialidade, data_admissao, cargo, departamento, turno, salario, nome_emergencia, parentesco_emergencia, telefone_emergencia, status, observacoes
) VALUES (
  'Ana Souza', '1985-08-20', '987.654.321-00', 'SP-98.765.432', 'feminino', 'casado', '11999999999', '11988888888', 'ana@email.com', '04000-000', 'Av. Paulista', '2000', '', 'Bela Vista', 'São Paulo', 'SP', 'Enfermeira', 'COREN-SP 123456', 'Geriatria', '2022-01-15', 'Enfermeira Chefe', 'Enfermagem', 'diurno', 3500.00, 'Carlos Souza', 'marido', '11977777777', 'ativo', 'Profissional dedicada'
);

-- Mensalidade paga
INSERT INTO pagamentos_mensalidades (
  residente_id, mes_referencia, ano_referencia, valor_mensalidade, data_vencimento, data_pagamento, metodo_pagamento, status, valor_pago, observacoes
) VALUES (
  1, 12, 2025, 2500.00, '2025-12-10', '2025-12-09', 'Boleto', 'pago', 2500.00, 'Mensalidade quitada'
);

-- Salário pago
INSERT INTO pagamentos_salarios (
  profissional_id, valor, salario_base, bonus, descontos, valor_liquido, mes_referencia, ano_referencia, data_pagamento, metodo_pagamento, status, horas_trabalhadas, observacoes
) VALUES (
  1, 3500.00, 3500.00, 0.00, 0.00, 3500.00, 12, 2025, '2025-12-05', 'Transferência', 'pago', 160, 'Salário referente a dezembro'
);

-- Despesa geral paga
INSERT INTO despesas_gerais (
  descricao, categoria, valor, data_despesa, status, data_pagamento, metodo_pagamento, observacoes
) VALUES (
  'Compra de medicamentos', 'Saude', 500.00, '2025-12-09', 'pago', '2025-12-09', 'Dinheiro', 'Medicamentos para residentes'
);
