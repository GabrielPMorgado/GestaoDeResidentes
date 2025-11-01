# 🏠 Sistema de Gerenciamento Residencial

Sistema completo para cadastro e gerenciamento de residentes com interface moderna usando React + Bootstrap e API REST com Node.js + MySQL.

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **MySQL** 8.0+
- **MySQL Workbench** (recomendado)
- **npm** ou **yarn**

## 🚀 Instalação

### 1️⃣ Configurar Banco de Dados

1. Abra o **MySQL Workbench**
2. Conecte-se ao seu servidor MySQL
3. Abra o arquivo `database/create_table_residentes.sql`
4. Execute o script (Ctrl+Shift+Enter ou clique no ícone ⚡)
5. Verifique se o banco `sistema_residencial` e a tabela `residentes` foram criados

### 2️⃣ Configurar Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências (se necessário)
npm install

# Configurar variáveis de ambiente
# Edite o arquivo .env com suas credenciais do MySQL:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=sistema_residencial
# DB_USER=root
# DB_PASSWORD=sua_senha_aqui

# Iniciar servidor
npm run dev
```

O backend estará rodando em: **http://localhost:3000**

### 3️⃣ Configurar Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências (se necessário)
npm install

# Iniciar aplicação
npm run dev
```

O frontend estará rodando em: **http://localhost:5174**

## 📖 Como Usar

### Cadastrar Novo Residente

1. Acesse **http://localhost:5174**
2. Clique em **"Cadastro de Residentes"** no menu lateral
3. Preencha o formulário em 3 etapas:
   - **Etapa 1:** Dados Pessoais
   - **Etapa 2:** Endereço
   - **Etapa 3:** Responsável/Contato de Emergência
4. Clique em **"Finalizar Cadastro"**

### Campos Obrigatórios (*)

- Nome Completo
- Data de Nascimento
- CPF
- Sexo
- Telefone
- Nome do Responsável
- Telefone do Responsável

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/residentes` | Criar novo residente |
| GET | `/residentes` | Listar todos os residentes |
| GET | `/residentes/:id` | Buscar residente por ID |
| GET | `/residentes/cpf/:cpf` | Buscar residente por CPF |
| GET | `/residentes/estatisticas` | Obter estatísticas |
| PUT | `/residentes/:id` | Atualizar residente |
| DELETE | `/residentes/:id` | Inativar residente |

### Exemplo de Requisição (POST)

```json
{
  "nome_completo": "João da Silva",
  "data_nascimento": "1980-05-15",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "sexo": "masculino",
  "estado_civil": "casado",
  "telefone": "(11) 98765-4321",
  "email": "joao.silva@email.com",
  "cep": "01234-567",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "nome_responsavel": "Maria da Silva",
  "parentesco_responsavel": "Esposa",
  "telefone_responsavel": "(11) 98765-1234",
  "email_responsavel": "maria.silva@email.com",
  "observacoes": "Observações adicionais"
}
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** 19.2.0
- **Vite** 7.1.7
- **Bootstrap** 5.3.x
- **Bootstrap Icons** 1.11.x
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express** 5.1.0
- **Sequelize** 6.37.7 (ORM)
- **MySQL2** 3.15.3
- **CORS**
- **dotenv**

### Banco de Dados
- **MySQL** 8.0+

## 📁 Estrutura do Projeto

```
sistema01/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Configuração do banco
│   │   ├── controllers/
│   │   │   └── residenteController.js  # Lógica de negócio
│   │   ├── middlewares/
│   │   │   └── validacaoResidente.js   # Validações
│   │   ├── models/
│   │   │   └── Residente.js       # Model Sequelize
│   │   ├── routes/
│   │   │   └── residentes.js      # Rotas da API
│   │   └── server.js              # Servidor Express
│   ├── .env                       # Variáveis de ambiente
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             # Configuração Axios
│   │   ├── components/
│   │   │   ├── Cadastros/
│   │   │   │   ├── CadastroResidentes.jsx
│   │   │   │   └── CadastroResidentes.css
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Header.css
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.jsx
│   │   │       └── Sidebar.css
│   │   ├── App.jsx                # Componente principal
│   │   └── main.jsx               # Entry point
│   └── package.json
│
└── database/
    └── create_table_residentes.sql  # Script SQL
```

## ✅ Funcionalidades Implementadas

- ✅ Cadastro de residentes (multi-step form)
- ✅ Validação de CPF
- ✅ Validação de campos obrigatórios
- ✅ Listagem de residentes com paginação
- ✅ Busca por nome, CPF ou telefone
- ✅ Filtros por status (ativo/inativo/suspenso)
- ✅ Estatísticas de residentes
- ✅ Interface responsiva (mobile-friendly)
- ✅ Feedback visual (loading, erros, sucessos)

## 🐛 Solução de Problemas

### Erro de conexão com MySQL
- Verifique se o MySQL está rodando
- Confira as credenciais no arquivo `.env`
- Teste a conexão no MySQL Workbench

### Porta já em uso
- Frontend: Altere a porta no `vite.config.js`
- Backend: Altere a PORT no arquivo `.env`

### CPF duplicado
- O sistema não permite CPFs duplicados
- Verifique se o CPF já foi cadastrado

## 📝 Consultas SQL Úteis

```sql
-- Ver todos os residentes
SELECT * FROM residentes;

-- Buscar por CPF
SELECT * FROM residentes WHERE cpf = '123.456.789-00';

-- Contar residentes ativos
SELECT COUNT(*) FROM residentes WHERE status = 'ativo';

-- Últimos cadastros
SELECT * FROM residentes 
ORDER BY data_cadastro DESC 
LIMIT 10;
```

## 👨‍💻 Desenvolvido por

Gabriel - Sistema de Gerenciamento Residencial

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.
