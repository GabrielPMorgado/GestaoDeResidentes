# 🏥 Sistema de Gerenciamento Residencial

> Sistema completo para gerenciamento de instituições residenciais de longa permanência (ILPI), incluindo gestão de residentes, profissionais, agendamentos médicos, histórico clínico e controle financeiro.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Segurança](#-segurança)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Sistema de Gerenciamento Residencial** é uma solução full-stack desenvolvida para facilitar a administração de instituições de longa permanência. O sistema oferece um conjunto completo de ferramentas para:

- 📊 **Gestão Administrativa**: Controle completo de residentes, profissionais e usuários do sistema
- 🗓️ **Agendamentos**: Sistema inteligente de agendamento de consultas e procedimentos médicos
- 📋 **Histórico Clínico**: Registro detalhado de consultas, diagnósticos, procedimentos e evolução dos residentes
- 💰 **Controle Financeiro**: Gestão de mensalidades, salários e despesas gerais
- 📈 **Relatórios**: Dashboard com estatísticas, gráficos e relatórios detalhados
- 🔐 **Autenticação e Autorização**: Sistema seguro com JWT e controle de permissões

---

## ✨ Funcionalidades

### 👥 Gestão de Residentes

- ✅ Cadastro completo com dados pessoais, médicos e responsáveis
- ✅ Controle de status (ativo/inativo)
- ✅ Histórico completo de consultas e procedimentos
- ✅ Registro de condições médicas e medicamentos
- ✅ Busca avançada e filtros
- ✅ Gestão de quartos e localização

### 👨‍⚕️ Gestão de Profissionais

- ✅ Cadastro de médicos, enfermeiros, fisioterapeutas, etc.
- ✅ Controle de horários e disponibilidade
- ✅ Registro de especialidades e qualificações
- ✅ Histórico de atendimentos realizados
- ✅ Criação de acessos ao sistema
- ✅ Relatórios de produtividade

### 🗓️ Sistema de Agendamentos

- ✅ Agendamento de consultas e procedimentos
- ✅ Verificação de disponibilidade em tempo real
- ✅ Diferentes tipos de atendimento (consulta, exame, terapia, emergência)
- ✅ Status de agendamento (agendado, confirmado, concluído, cancelado)
- ✅ Notificações e lembretes
- ✅ Calendário visual interativo
- ✅ Filtros por data, profissional e tipo de atendimento

### 📋 Histórico Clínico

- ✅ Registro detalhado de consultas
- ✅ Diagnósticos com CID-10
- ✅ Lista de procedimentos realizados
- ✅ Prescrições e condutas médicas
- ✅ Evolução do quadro clínico
- ✅ Observações e anotações
- ✅ Rascunhos de atendimento (salvamento automático)
- ✅ Histórico completo por residente

### 💰 Gestão Financeira

- ✅ **Receitas**:
  - Registro de mensalidades dos residentes
  - Controle de pagamentos recebidos
  - Status (pago, pendente, atrasado)
  
- ✅ **Despesas**:
  - Salários dos profissionais
  - Despesas gerais (alimentação, medicamentos, manutenção, etc.)
  - Categorização de gastos
  
- ✅ **Relatórios Financeiros**:
  - Resumo de receitas e despesas
  - Fluxo de caixa
  - Balanço mensal
  - Relatórios por período

### 📊 Dashboard e Relatórios

- ✅ Dashboard administrativo com indicadores-chave
- ✅ Gráficos interativos (Chart.js)
- ✅ Estatísticas de ocupação
- ✅ Relatórios de atendimentos
- ✅ Indicadores financeiros
- ✅ Exportação de dados

### 🔐 Autenticação e Segurança

- ✅ Login seguro com JWT (JSON Web Tokens)
- ✅ Níveis de acesso (admin, profissional)
- ✅ Proteção contra ataques (rate limiting)
- ✅ Validação de dados em todas as operações
- ✅ Senhas criptografadas com bcrypt
- ✅ Sessões com tempo de expiração

---

## 🚀 Tecnologias

### Backend

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| **Node.js** | 20.x | Runtime JavaScript |
| **Express** | 5.1.0 | Framework web minimalista |
| **Sequelize** | 6.37.7 | ORM para MySQL |
| **MySQL** | 8.x | Banco de dados relacional |
| **JWT** | 9.0.3 | Autenticação via tokens |
| **Bcrypt.js** | 2.4.3 | Criptografia de senhas |
| **Dotenv** | 17.2.3 | Gerenciamento de variáveis de ambiente |
| **CORS** | 2.8.5 | Controle de acesso entre domínios |

### Frontend

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| **React** | 19.2.0 | Biblioteca para interfaces |
| **Vite** | 7.1.7 | Build tool ultrarrápido |
| **React Query** | 5.90.12 | Gerenciamento de estado assíncrono e cache |
| **Axios** | 1.13.1 | Cliente HTTP |
| **Chart.js** | 4.5.1 | Gráficos interativos |
| **Tailwind CSS** | 3.4.18 | Framework CSS utilitário |
| **Bootstrap Icons** | 5.3.8 | Biblioteca de ícones |

---

## 🏗️ Arquitetura

O sistema segue uma arquitetura **Cliente-Servidor** com separação clara entre frontend e backend:

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Components  │  │    Hooks     │  │   Services   │  │
│  │   (UI/UX)    │  │ (React Query)│  │   (Axios)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                │            │
│           └────────────────┴────────────────┘            │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTP/REST API
                            │ (JSON)
┌───────────────────────────┼──────────────────────────────┐
│                           │                              │
│                      BACKEND (Node.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Routes    │  │ Controllers  │  │    Models    │  │
│  │  (Express)   │  │  (Business)  │  │  (Sequelize) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                │            │
│  ┌────────┴────────────────┴────────────────┴────────┐  │
│  │              Middlewares                           │  │
│  │  (Auth, Validation, Error Handler, Rate Limiter)  │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │  MySQL Database │
                    │   (8 Tabelas)   │
                    └─────────────────┘
```

### Padrões de Projeto

- **MVC**: Model-View-Controller no backend
- **Component-Based**: Arquitetura de componentes no frontend
- **RESTful API**: Endpoints seguindo padrões REST
- **Repository Pattern**: Separação de lógica de negócio e acesso a dados
- **Custom Hooks**: Lógica reutilizável com React Query

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** >= 20.x
- **MySQL** >= 8.x
- **npm** ou **yarn**

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/GabrielPMorgado/sistema01.git
cd sistema01
```

### Passo 2: Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Configuração

### Backend

1. **Criar arquivo `.env` na pasta `backend`:**

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=sistema_residencial
DB_PORT=3306

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=200
```

2. **Criar o banco de dados MySQL:**

```bash
# Executar o script SQL para criar o banco
mysql -u root -p < database/criar_banco_completo.sql

# OU usar o script de sincronização do Sequelize
npm run sync-db
```

3. **Criar usuário admin inicial:**

```sql
-- Execute no MySQL para criar o primeiro usuário admin
-- (Consulte database/create_table_usuarios.sql)
```

### Frontend

1. **Criar arquivo `.env` na pasta `frontend`:**

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🎮 Uso

### Iniciar o Backend

```bash
cd backend

# Modo desenvolvimento (com nodemon - auto-reload)
npm run dev

# Modo produção
npm start
```

O backend estará rodando em: `http://localhost:3000`

### Iniciar o Frontend

```bash
cd frontend

# Modo desenvolvimento (Vite dev server)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

O frontend estará rodando em: `http://localhost:5173` ou `http://localhost:5174`

### Primeiro Acesso

1. Acesse o frontend no navegador
2. Use as credenciais do usuário admin criado no banco
3. Navegue pelo sistema usando o menu lateral

---

## 🔌 API Endpoints

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/login` | Login de usuário | ❌ |
| GET | `/verificar` | Verificar token JWT | ✅ |
| POST | `/criar-admin` | Criar usuário admin | ❌ |
| POST | `/criar-acesso-profissional` | Criar acesso para profissional | ✅ |
| GET | `/usuarios` | Listar usuários | ✅ |
| PATCH | `/usuarios/:id/status` | Ativar/inativar usuário | ✅ |

### Residentes (`/api/residentes`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/` | Criar residente | ✅ |
| GET | `/` | Listar residentes | ✅ |
| GET | `/estatisticas` | Estatísticas gerais | ✅ |
| GET | `/:id` | Buscar por ID | ✅ |
| GET | `/cpf/:cpf` | Buscar por CPF | ✅ |
| PUT | `/:id` | Atualizar residente | ✅ |
| DELETE | `/:id` | Inativar residente | ✅ |
| DELETE | `/:id/permanente` | Deletar permanentemente | ✅ |

### Profissionais (`/api/profissionais`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/` | Criar profissional | ✅ |
| GET | `/` | Listar profissionais | ✅ |
| GET | `/:id` | Buscar por ID | ✅ |
| GET | `/cpf/:cpf` | Buscar por CPF | ✅ |
| PUT | `/:id` | Atualizar profissional | ✅ |
| DELETE | `/:id` | Inativar profissional | ✅ |
| DELETE | `/:id/permanente` | Deletar permanentemente | ✅ |
| GET | `/estatisticas/geral` | Estatísticas gerais | ✅ |
| GET | `/relatorio/despesas` | Relatório de despesas | ✅ |
| GET | `/relatorio/folha-pagamento` | Folha de pagamento | ✅ |

### Agendamentos (`/api/agendamentos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/` | Criar agendamento | ✅ |
| GET | `/` | Listar agendamentos | ✅ |
| GET | `/estatisticas/geral` | Estatísticas | ✅ |
| GET | `/disponibilidade` | Verificar disponibilidade | ✅ |
| GET | `/residente/:residente_id` | Agendamentos do residente | ✅ |
| GET | `/profissional/:profissional_id` | Agendamentos do profissional | ✅ |
| GET | `/:id` | Buscar por ID | ✅ |
| PUT | `/:id` | Atualizar agendamento | ✅ |
| DELETE | `/:id` | Deletar agendamento | ✅ |
| PATCH | `/:id/cancelar` | Cancelar agendamento | ✅ |
| PATCH | `/:id/confirmar` | Confirmar agendamento | ✅ |

### Histórico de Consultas (`/api/historico-consultas`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/` | Criar histórico | ✅ |
| GET | `/` | Listar históricos | ✅ |
| GET | `/residente/:residente_id` | Histórico do residente | ✅ |
| GET | `/profissional/:profissional_id` | Histórico do profissional | ✅ |
| GET | `/:id` | Buscar por ID | ✅ |
| PUT | `/:id` | Atualizar histórico | ✅ |
| DELETE | `/:id` | Deletar histórico | ✅ |

### Financeiro (`/api/financeiro`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/despesas` | Registrar despesa | ✅ |
| GET | `/despesas` | Listar despesas | ✅ |
| GET | `/despesas/:id` | Buscar despesa | ✅ |
| PUT | `/despesas/:id` | Atualizar despesa | ✅ |
| DELETE | `/despesas/:id` | Excluir despesa | ✅ |
| POST | `/mensalidades` | Registrar mensalidade | ✅ |
| GET | `/mensalidades` | Listar mensalidades | ✅ |
| GET | `/mensalidades/:id` | Buscar mensalidade | ✅ |
| PUT | `/mensalidades/:id` | Atualizar mensalidade | ✅ |
| POST | `/mensalidades/:id/pagar` | Pagar mensalidade | ✅ |
| POST | `/salarios` | Registrar salário | ✅ |
| GET | `/salarios` | Listar salários | ✅ |
| GET | `/salarios/:id` | Buscar salário | ✅ |
| PUT | `/salarios/:id` | Atualizar salário | ✅ |
| POST | `/salarios/:id/pagar` | Pagar salário | ✅ |
| GET | `/resumo` | Resumo financeiro | ✅ |
| GET | `/transacoes` | Listar transações | ✅ |

### Atendimentos (`/api/atendimentos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/rascunho` | Salvar rascunho | ✅ |
| GET | `/rascunhos` | Listar rascunhos | ✅ |
| GET | `/rascunho/:id` | Buscar rascunho | ✅ |
| DELETE | `/rascunho/:id` | Deletar rascunho | ✅ |

---

## 📁 Estrutura de Pastas

```
sistema01/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Configuração do Sequelize
│   │   │   └── constants.js       # Constantes do sistema
│   │   ├── controllers/           # Lógica de negócio
│   │   │   ├── agendamentoController.js
│   │   │   ├── atendimentoController.js
│   │   │   ├── financeiroController.js
│   │   │   ├── historicoConsultaController.js
│   │   │   ├── profissionalController.js
│   │   │   └── residenteController.js
│   │   ├── middlewares/           # Middlewares Express
│   │   │   ├── auth.js            # Autenticação JWT
│   │   │   ├── errorHandler.js    # Tratamento de erros
│   │   │   ├── rateLimiter.js     # Limitação de requisições
│   │   │   ├── requestLogger.js   # Log de requisições
│   │   │   ├── validacaoAgendamento.js
│   │   │   ├── validacaoProfissional.js
│   │   │   └── validacaoResidente.js
│   │   ├── models/                # Modelos Sequelize (ORM)
│   │   │   ├── Agendamento.js
│   │   │   ├── DespesaGeral.js
│   │   │   ├── HistoricoConsulta.js
│   │   │   ├── index.js           # Relacionamentos
│   │   │   ├── PagamentoMensalidade.js
│   │   │   ├── PagamentoSalario.js
│   │   │   ├── Profissional.js
│   │   │   ├── Residente.js
│   │   │   └── Usuario.js
│   │   ├── routes/                # Definição de rotas
│   │   │   ├── agendamentos.js
│   │   │   ├── atendimentos.js
│   │   │   ├── auth.js
│   │   │   ├── financeiro.js
│   │   │   ├── historicoConsultas.js
│   │   │   ├── profissionais.js
│   │   │   └── residentes.js
│   │   ├── utils/                 # Funções utilitárias
│   │   │   ├── helpers.js
│   │   │   └── responses.js
│   │   └── server.js              # Entrada principal
│   ├── .env                       # Variáveis de ambiente
│   ├── .env.example               # Exemplo de configuração
│   ├── package.json
│   ├── sync-database.js           # Script de sincronização DB
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── api.js             # Configuração Axios
│   │   │   └── axios.js           # Instância Axios
│   │   ├── components/            # Componentes React
│   │   │   ├── Admin/
│   │   │   │   └── GerenciarAcessos.jsx
│   │   │   ├── Atendimento/
│   │   │   │   ├── PacientesAgendados.jsx
│   │   │   │   └── RegistroClinico.jsx
│   │   │   ├── Auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── Cadastros/
│   │   │   │   ├── CadastroAgendamento.jsx
│   │   │   │   ├── CadastroProfissionais.jsx
│   │   │   │   └── CadastroResidentes.jsx
│   │   │   ├── Common/            # Componentes reutilizáveis
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── ErrorBoundary/
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── Financeiro/
│   │   │   │   └── GestaoFinanceira.jsx
│   │   │   ├── Header/
│   │   │   │   └── Header.jsx
│   │   │   ├── Listagens/
│   │   │   │   ├── HistoricoConsultasResidente.jsx
│   │   │   │   ├── ListagemAgendamentos.jsx
│   │   │   │   ├── ListagemProfissionais.jsx
│   │   │   │   ├── ListagemResidentes.jsx
│   │   │   │   ├── ProfissionaisInativos.jsx
│   │   │   │   └── ResidentesInativos.jsx
│   │   │   ├── Login/
│   │   │   ├── Relatorios/
│   │   │   │   └── Relatorios.jsx
│   │   │   ├── Sidebar/
│   │   │   │   └── Sidebar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── contexts/              # Context API
│   │   │   ├── AppContext.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/                 # Custom Hooks
│   │   │   ├── index.js           # useToast, useLoading
│   │   │   └── useQueries.js      # React Query hooks (28 hooks)
│   │   ├── services/              # Camada de serviços
│   │   │   ├── agendamentoService.js
│   │   │   ├── authService.js
│   │   │   ├── financeiroService.js
│   │   │   ├── index.js
│   │   │   ├── profissionalService.js
│   │   │   ├── relatorioService.js
│   │   │   └── residenteService.js
│   │   ├── utils/                 # Utilitários
│   │   │   ├── auth.js
│   │   │   ├── formatters.js
│   │   │   ├── logger.js
│   │   │   └── validators.js
│   │   ├── App.jsx                # Componente raiz
│   │   ├── AppContent.jsx         # Roteamento
│   │   ├── main.jsx               # Entrada React
│   │   ├── App.css
│   │   └── index.css
│   ├── .env                       # Variáveis de ambiente
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── database/                      # Scripts SQL
│   ├── consultas_uteis.sql
│   ├── criar_banco_completo.sql
│   ├── create_table_usuarios.sql
│   └── ...
│
└── README.md                      # Este arquivo
```

---

## 🔒 Segurança

### Medidas Implementadas

- ✅ **JWT (JSON Web Tokens)** para autenticação stateless
- ✅ **Bcrypt** para hash de senhas (salt rounds: 10)
- ✅ **Rate Limiting**: 200 requisições por IP a cada 15 minutos
- ✅ **Validação de dados**: Middlewares de validação em todas as rotas
- ✅ **CORS** configurado para aceitar apenas origens permitidas
- ✅ **Sanitização de inputs**: Proteção contra XSS e SQL Injection
- ✅ **Headers de segurança**: Helmet.js (pode ser adicionado)
- ✅ **Variáveis de ambiente**: Dados sensíveis não commitados
- ✅ **Tratamento de erros**: Não expõe stack traces em produção

### Boas Práticas

1. **Nunca commite arquivos `.env`** com dados sensíveis
2. **Use senhas fortes** para JWT_SECRET (mínimo 32 caracteres)
3. **Atualize dependências** regularmente: `npm audit fix`
4. **Em produção**: Configure `NODE_ENV=production`
5. **SSL/TLS**: Use HTTPS em produção
6. **Backup regular** do banco de dados

---

## 🗄️ Banco de Dados

### Schema (8 Tabelas)

```sql
1. usuarios                    -- Autenticação e controle de acesso
2. residentes                  -- Dados dos residentes
3. profissionais              -- Dados dos profissionais
4. agendamentos               -- Consultas e procedimentos agendados
5. historico_consultas        -- Registro de consultas realizadas
6. despesas_gerais            -- Despesas da instituição
7. pagamentos_mensalidades    -- Mensalidades dos residentes
8. pagamentos_salarios        -- Salários dos profissionais
```

### Relacionamentos

- **Usuario** → `belongsTo` → **Profissional**
- **Residente** → `hasMany` → **Agendamento**
- **Residente** → `hasMany` → **HistoricoConsulta**
- **Profissional** → `hasMany` → **Agendamento**
- **Profissional** → `hasMany` → **HistoricoConsulta**
- **Agendamento** → `belongsTo` → **Residente**
- **Agendamento** → `belongsTo` → **Profissional**
- **HistoricoConsulta** → `belongsTo` → **Residente**
- **HistoricoConsulta** → `belongsTo` → **Profissional**

---

## 📊 React Query - Cache Inteligente

O frontend utiliza **@tanstack/react-query** para gerenciamento de estado assíncrono, oferecendo:

### Benefícios

- ⚡ **Cache Automático**: Dados armazenados em memória
- 🔄 **Sincronização**: Refetch automático em foco/reconexão
- 🎯 **Stale Time**: 5 minutos de cache antes de considerar dados antigos
- 💾 **Deduplicação**: Evita requisições duplicadas
- 🔄 **Refetch Manual**: Atualização sob demanda
- 📡 **Mutations**: Operações CRUD com invalidação de cache

### Hooks Customizados (28 total)

```javascript
// Residentes
useResidentes(), useResidentesAtivos(), useResidentesInativos()
useCriarResidente(), useAtualizarResidente()
useInativarResidente(), useReativarResidente()

// Profissionais
useProfissionais(), useProfissionaisAtivos(), useProfissionaisInativos()
useCriarProfissional(), useAtualizarProfissional()
useInativarProfissional(), useReativarProfissional()

// Agendamentos
useAgendamentos(), useAgendamento(id)
useCriarAgendamento(), useAtualizarAgendamento()
useCancelarAgendamento()

// Histórico
useHistoricoConsultas()
useCriarHistoricoConsulta(), useAtualizarHistoricoConsulta()

// Financeiro
useDespesas(), useMensalidades(), useSalarios()
useRegistrarDespesa(), useRegistrarMensalidade()
```

---

## 🎨 UI/UX

### Design System

- **Tailwind CSS**: Framework CSS utilitário para estilização rápida
- **Bootstrap Icons**: +2000 ícones SVG
- **Dark Mode**: Interface dark por padrão (tema escuro profissional)
- **Responsivo**: Mobile-first, adaptável a todos os tamanhos de tela
- **Cores**:
  - Primária: Amber/Gold (`#fbbf24`)
  - Fundo: Slate Dark (`#0f172a`, `#1e293b`)
  - Sucesso: Emerald (`#10b981`)
  - Erro: Red (`#ef4444`)
  - Info: Blue (`#3b82f6`)

### Componentes Reutilizáveis

- **Cards**: Componentes de card com glassmorphism
- **Modais**: Sistema de modais flutuantes
- **Formulários**: Inputs estilizados e validados
- **Tabelas**: Tabelas responsivas com paginação
- **Gráficos**: Integração com Chart.js
- **Notificações**: Toast notifications (canto superior direito)

---

## 🧪 Testes (Planejado)

### Backend
- [ ] Testes unitários com Jest
- [ ] Testes de integração para endpoints
- [ ] Testes de autenticação e autorização
- [ ] Cobertura de código > 80%

### Frontend
- [ ] Testes de componentes com React Testing Library
- [ ] Testes E2E com Cypress ou Playwright
- [ ] Testes de acessibilidade

---

## 📈 Melhorias Futuras

### Funcionalidades

- [ ] Sistema de notificações push
- [ ] Módulo de estoque de medicamentos
- [ ] Integração com e-mail (envio de lembretes)
- [ ] Impressão de relatórios em PDF
- [ ] Upload de arquivos e documentos
- [ ] Assinatura digital de documentos
- [ ] Aplicativo mobile (React Native)
- [ ] Modo offline (PWA)

### Técnicas

- [ ] Migração para TypeScript
- [ ] Implementar GraphQL como alternativa ao REST
- [ ] Docker e Docker Compose
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Sentry
- [ ] Logs estruturados com Winston
- [ ] Redis para cache e sessões
- [ ] WebSockets para notificações em tempo real

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Diretrizes

- Siga os padrões de código existentes
- Escreva mensagens de commit descritivas
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Gabriel Pereira Morgado**
- GitHub: [@GabrielPMorgado](https://github.com/GabrielPMorgado)
- LinkedIn: [Gabriel Morgado](https://linkedin.com/in/gabriel-morgado)

---

## 📞 Suporte

Para dúvidas ou suporte:

- 📧 Email: contato@exemplo.com
- 💬 Issues: [GitHub Issues](https://github.com/GabrielPMorgado/sistema01/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/GabrielPMorgado/sistema01/wiki)

---

## 🙏 Agradecimentos

- Comunidade React e Node.js
- Documentação do Sequelize e React Query
- Stack Overflow e GitHub Discussions

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório! ⭐**

Feito com ❤️ e ☕ por [Gabriel Morgado](https://github.com/GabrielPMorgado)

</div>
