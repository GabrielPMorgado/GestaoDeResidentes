# 📚 GUIA COMPLETO DO BANCO DE DADOS
## Sistema de Gerenciamento Residencial

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Estrutura das Tabelas](#estrutura-das-tabelas)
4. [Mapeamento Formulário → Tabela](#mapeamento-formulário--tabela)
5. [Queries Úteis](#queries-úteis)
6. [Boas Práticas](#boas-práticas)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este banco de dados foi criado especificamente para refletir **100% os campos dos formulários** do sistema:

- ✅ **CadastroResidentes.jsx** → Tabela `residentes` (20 campos)
- ✅ **CadastroProfissionais.jsx** → Tabela `profissionais` (24 campos)
- ✅ **CadastroAgendamento.jsx** → Tabela `agendamentos` (10 campos)
- ✅ **Histórico de Consultas** → Tabela `historico_consultas`

### ⚡ Características Principais

- **Charset**: UTF-8 (utf8mb4) para suportar acentos e emojis
- **Engine**: InnoDB para transações ACID
- **Índices**: Otimizados para consultas frequentes
- **Constraints**: Foreign keys com CASCADE
- **Status**: ENUM corrigido (`ativo`/`inativo` em vez de booleano)

---

## 🚀 Instalação

### Opção 1: Instalação Completa (RECOMENDADO)

```bash
# No MySQL Workbench ou terminal MySQL
mysql -u root -p < CREATE_DATABASE_COMPLETE.sql
```

### Opção 2: Passo a Passo

```sql
-- 1. Criar banco
CREATE DATABASE sistema_residencial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_residencial;

-- 2. Executar o script completo
SOURCE C:/Users/gabri/OneDrive/Área\ de\ Trabalho/aquivos/sistema01/database/CREATE_DATABASE_COMPLETE.sql;
```

### ✅ Validar Instalação

```bash
mysql -u root -p < VALIDAR_ESTRUTURA.sql
```

**Saída esperada**: Todas as validações devem mostrar ✅ OK

---

## 📊 Estrutura das Tabelas

### 1️⃣ Tabela: `residentes`

Baseada em **CadastroResidentes.jsx** (3 etapas)

```sql
CREATE TABLE residentes (
  -- Identificação
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Etapa 1: Dados Pessoais
  nome_completo VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rg VARCHAR(20) UNIQUE,
  data_nascimento DATE NOT NULL,
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  estado_civil ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'outro'),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  
  -- Etapa 2: Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Etapa 3: Responsável
  nome_responsavel VARCHAR(200) NOT NULL,
  parentesco_responsavel VARCHAR(50),
  telefone_responsavel VARCHAR(20) NOT NULL,
  email_responsavel VARCHAR(100),
  
  -- Observações
  observacoes TEXT,
  
  -- Sistema
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Total de campos do formulário**: 20 ✅

---

### 2️⃣ Tabela: `profissionais`

Baseada em **CadastroProfissionais.jsx** (3 etapas)

```sql
CREATE TABLE profissionais (
  -- Identificação
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Etapa 1: Dados Pessoais
  nome_completo VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rg VARCHAR(20) UNIQUE,
  data_nascimento DATE NOT NULL,
  sexo ENUM('masculino', 'feminino', 'outro') NOT NULL,
  celular VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  
  -- Etapa 2: Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Etapa 3: Dados Profissionais
  profissao VARCHAR(100) NOT NULL,
  registro_profissional VARCHAR(50),
  especialidade VARCHAR(100),
  data_admissao DATE NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  departamento VARCHAR(100),
  turno VARCHAR(50) NOT NULL,
  salario DECIMAL(10,2),  -- ⚠️ IMPORTANTE para relatórios
  
  -- Observações
  observacoes TEXT,
  
  -- Sistema
  status ENUM('ativo', 'inativo', 'licenca', 'ferias') DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Total de campos do formulário**: 24 ✅  
**Campo crítico**: `salario DECIMAL(10,2)` para relatórios de despesas

---

### 3️⃣ Tabela: `agendamentos`

Baseada em **CadastroAgendamento.jsx**

```sql
CREATE TABLE agendamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Relacionamentos
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  
  -- Dados do Agendamento
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  tipo_atendimento ENUM(
    'consulta_medica', 'fisioterapia', 'psicologia', 
    'nutricao', 'enfermagem', 'terapia_ocupacional',
    'assistencia_social', 'outro'
  ) NOT NULL,
  
  -- Detalhes
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  local VARCHAR(200),
  observacoes TEXT,
  
  -- Status
  status ENUM('agendado', 'confirmado', 'em_atendimento', 
              'concluido', 'cancelado', 'falta') DEFAULT 'agendado',
  
  -- Sistema
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
);
```

**Total de campos do formulário**: 10 ✅

---

### 4️⃣ Tabela: `historico_consultas`

Para registrar consultas realizadas

```sql
CREATE TABLE historico_consultas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  agendamento_id INT,
  
  data_consulta DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  tipo_atendimento VARCHAR(100),
  
  queixa_principal TEXT,
  historico TEXT,
  exame_fisico TEXT,
  diagnostico TEXT,
  prescricao TEXT,
  orientacoes TEXT,
  observacoes TEXT,
  
  data_retorno DATE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
);
```

---

## 🔗 Mapeamento Formulário → Tabela

### ✅ CadastroResidentes.jsx → residentes

| Campo Formulário | Campo Tabela | Tipo SQL | Obrigatório |
|-----------------|--------------|----------|-------------|
| `nome_completo` | `nome_completo` | VARCHAR(200) | ✅ Sim |
| `cpf` | `cpf` | VARCHAR(14) | ✅ Sim |
| `rg` | `rg` | VARCHAR(20) | ❌ Não |
| `data_nascimento` | `data_nascimento` | DATE | ✅ Sim |
| `sexo` | `sexo` | ENUM | ✅ Sim |
| `estado_civil` | `estado_civil` | ENUM | ❌ Não |
| `telefone` | `telefone` | VARCHAR(20) | ✅ Sim |
| `email` | `email` | VARCHAR(100) | ❌ Não |
| `cep` | `cep` | VARCHAR(10) | ❌ Não |
| `logradouro` | `logradouro` | VARCHAR(200) | ❌ Não |
| `numero` | `numero` | VARCHAR(10) | ❌ Não |
| `complemento` | `complemento` | VARCHAR(100) | ❌ Não |
| `bairro` | `bairro` | VARCHAR(100) | ❌ Não |
| `cidade` | `cidade` | VARCHAR(100) | ❌ Não |
| `estado` | `estado` | VARCHAR(2) | ❌ Não |
| `nome_responsavel` | `nome_responsavel` | VARCHAR(200) | ✅ Sim |
| `parentesco_responsavel` | `parentesco_responsavel` | VARCHAR(50) | ❌ Não |
| `telefone_responsavel` | `telefone_responsavel` | VARCHAR(20) | ✅ Sim |
| `email_responsavel` | `email_responsavel` | VARCHAR(100) | ❌ Não |
| `observacoes` | `observacoes` | TEXT | ❌ Não |

**Status**: ✅ **100% compatível** - 20 campos mapeados

---

### ✅ CadastroProfissionais.jsx → profissionais

| Campo Formulário | Campo Tabela | Tipo SQL | Obrigatório |
|-----------------|--------------|----------|-------------|
| `nome_completo` | `nome_completo` | VARCHAR(200) | ✅ Sim |
| `cpf` | `cpf` | VARCHAR(14) | ✅ Sim |
| `rg` | `rg` | VARCHAR(20) | ❌ Não |
| `data_nascimento` | `data_nascimento` | DATE | ✅ Sim |
| `sexo` | `sexo` | ENUM | ✅ Sim |
| `celular` | `celular` | VARCHAR(20) | ✅ Sim |
| `email` | `email` | VARCHAR(100) | ✅ Sim |
| `cep` | `cep` | VARCHAR(10) | ❌ Não |
| `logradouro` | `logradouro` | VARCHAR(200) | ❌ Não |
| `numero` | `numero` | VARCHAR(10) | ❌ Não |
| `complemento` | `complemento` | VARCHAR(100) | ❌ Não |
| `bairro` | `bairro` | VARCHAR(100) | ❌ Não |
| `cidade` | `cidade` | VARCHAR(100) | ❌ Não |
| `estado` | `estado` | VARCHAR(2) | ❌ Não |
| `profissao` | `profissao` | VARCHAR(100) | ✅ Sim |
| `registro_profissional` | `registro_profissional` | VARCHAR(50) | ❌ Não |
| `especialidade` | `especialidade` | VARCHAR(100) | ❌ Não |
| `data_admissao` | `data_admissao` | DATE | ✅ Sim |
| `cargo` | `cargo` | VARCHAR(100) | ✅ Sim |
| `departamento` | `departamento` | VARCHAR(100) | ❌ Não |
| `turno` | `turno` | VARCHAR(50) | ✅ Sim |
| `salario` | `salario` | DECIMAL(10,2) | ❌ Não |
| `observacoes` | `observacoes` | TEXT | ❌ Não |

**Status**: ✅ **100% compatível** - 24 campos mapeados  
**⚠️ IMPORTANTE**: Campo `salario` existe para relatórios de despesas

---

### ✅ CadastroAgendamento.jsx → agendamentos

| Campo Formulário | Campo Tabela | Tipo SQL | Obrigatório |
|-----------------|--------------|----------|-------------|
| `residente_id` | `residente_id` | INT | ✅ Sim |
| `profissional_id` | `profissional_id` | INT | ✅ Sim |
| `data_agendamento` | `data_agendamento` | DATE | ✅ Sim |
| `hora_inicio` | `hora_inicio` | TIME | ✅ Sim |
| `hora_fim` | `hora_fim` | TIME | ✅ Sim |
| `tipo_atendimento` | `tipo_atendimento` | ENUM | ✅ Sim |
| `titulo` | `titulo` | VARCHAR(200) | ✅ Sim |
| `descricao` | `descricao` | TEXT | ❌ Não |
| `local` | `local` | VARCHAR(200) | ❌ Não |
| `observacoes` | `observacoes` | TEXT | ❌ Não |

**Status**: ✅ **100% compatível** - 10 campos mapeados

---

## 🔍 Queries Úteis

### 📌 Listar Profissionais Ativos (correto)

```sql
-- ✅ CORRETO (usa ENUM status)
SELECT * FROM profissionais WHERE status = 'ativo';

-- ❌ ERRADO (campo 'ativo' não existe mais)
-- SELECT * FROM profissionais WHERE ativo = true;
```

### 💰 Relatório de Despesas por Departamento

```sql
SELECT 
  departamento,
  COUNT(*) AS total_profissionais,
  SUM(salario) AS total_salarios,
  AVG(salario) AS media_salarial
FROM profissionais
WHERE status = 'ativo' AND salario IS NOT NULL
GROUP BY departamento
ORDER BY total_salarios DESC;
```

### 📅 Agendamentos do Dia

```sql
SELECT 
  a.id,
  r.nome_completo AS residente,
  p.nome_completo AS profissional,
  a.hora_inicio,
  a.hora_fim,
  a.tipo_atendimento,
  a.titulo
FROM agendamentos a
INNER JOIN residentes r ON a.residente_id = r.id
INNER JOIN profissionais p ON a.profissional_id = p.id
WHERE a.data_agendamento = CURDATE()
  AND a.status IN ('agendado', 'confirmado')
ORDER BY a.hora_inicio;
```

### 📊 Histórico de Consultas por Residente

```sql
SELECT 
  hc.data_consulta,
  p.nome_completo AS profissional,
  p.profissao,
  hc.diagnostico,
  hc.data_retorno
FROM historico_consultas hc
INNER JOIN profissionais p ON hc.profissional_id = p.id
WHERE hc.residente_id = 1
ORDER BY hc.data_consulta DESC;
```

---

## ✅ Boas Práticas

### 1. **Sempre use o campo `status`**

```javascript
// ✅ CORRETO
const profissionais = await Profissional.findAll({
  where: { status: 'ativo' }
});

// ❌ ERRADO
const profissionais = await Profissional.findAll({
  where: { ativo: true }  // Campo não existe!
});
```

### 2. **Formato do campo `salario`**

```javascript
// No formulário
salario: '5000.00'  // String com 2 decimais

// No banco
DECIMAL(10,2)  // Aceita até R$ 99.999.999,99
```

### 3. **Validação de CPF**

```javascript
// Use a função do validators.js
import { validarCPF } from '../utils/validators';

if (!validarCPF(cpf)) {
  alert('CPF inválido!');
}
```

### 4. **Formatação consistente**

```javascript
// Use as funções do formatters.js
import { formatarCPF, formatarCelular, formatarMoeda } from '../utils/formatters';

const cpfFormatado = formatarCPF('12345678900');  // 123.456.789-00
const celularFormatado = formatarCelular('11987654321');  // (11) 98765-4321
const salarioFormatado = formatarMoeda(5000);  // R$ 5.000,00
```

---

## 🔧 Troubleshooting

### ❌ Erro: "Campo 'ativo' não existe"

**Causa**: Código antigo usando `ativo` em vez de `status`

**Solução**:
```javascript
// Substituir
where: { ativo: true }

// Por
where: { status: 'ativo' }
```

---

### ❌ Erro: "Duplicate entry for key 'cpf'"

**Causa**: Tentativa de cadastrar CPF já existente

**Solução**:
```sql
-- Verificar se CPF existe antes de inserir
SELECT id FROM profissionais WHERE cpf = '123.456.789-00';
SELECT id FROM residentes WHERE cpf = '123.456.789-00';
```

---

### ❌ Erro: "Foreign key constraint fails"

**Causa**: Tentativa de criar agendamento com IDs inexistentes

**Solução**:
```sql
-- Verificar se IDs existem
SELECT id, nome_completo FROM residentes WHERE id = 1;
SELECT id, nome_completo FROM profissionais WHERE id = 1;
```

---

### ❌ Erro: "Data type mismatch for column 'salario'"

**Causa**: Enviando string com formato incorreto

**Solução**:
```javascript
// Remover formatação antes de salvar
const salarioNumerico = removerFormatacao(salarioFormatado);
// '5.000,00' → '5000.00'
```

---

## 📞 Suporte

Se encontrar algum problema:

1. Execute `VALIDAR_ESTRUTURA.sql` para verificar a estrutura
2. Verifique os logs do backend no console
3. Confirme que todos os campos obrigatórios estão preenchidos
4. Verifique se o campo `status` está sendo usado corretamente

---

## 📝 Changelog

### Versão 2.0 (Atual)
- ✅ Estrutura baseada 100% nos formulários
- ✅ Campo `salario` adicionado
- ✅ Campo `ativo` substituído por `status` ENUM
- ✅ Índices otimizados para relatórios
- ✅ Validações e documentação completas

### Versão 1.0
- Estrutura inicial do banco de dados

---

**✅ Banco de dados pronto para uso!**
