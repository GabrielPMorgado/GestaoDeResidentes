# Backend - Sistema Residencial

API RESTful para sistema de gerenciamento de instituição residencial para idosos.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para MySQL
- **MySQL** - Banco de dados relacional
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📋 Pré-requisitos

- Node.js 16+ instalado
- MySQL 8+ instalado e rodando
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório e navegue até a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

4. Crie o banco de dados no MySQL:
```sql
CREATE DATABASE sistema_residencial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Inicie o servidor:
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## 📚 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/         # Configurações (DB, constantes)
│   ├── controllers/    # Lógica de negócio
│   ├── middlewares/    # Middlewares (validação, erro, rate limit)
│   ├── models/         # Modelos Sequelize
│   ├── routes/         # Rotas da API
│   ├── utils/          # Utilitários (validators, responses, helpers)
│   └── server.js       # Arquivo principal
├── .env                # Variáveis de ambiente
├── .env.example        # Exemplo de variáveis
└── package.json        # Dependências
```

## 🛣️ Endpoints da API

### Residentes
- `GET /api/residentes` - Listar todos os residentes
- `GET /api/residentes/:id` - Buscar residente por ID
- `POST /api/residentes` - Criar novo residente
- `PUT /api/residentes/:id` - Atualizar residente
- `DELETE /api/residentes/:id` - Excluir residente

### Profissionais
- `GET /api/profissionais` - Listar todos os profissionais
- `GET /api/profissionais/:id` - Buscar profissional por ID
- `POST /api/profissionais` - Criar novo profissional
- `PUT /api/profissionais/:id` - Atualizar profissional
- `DELETE /api/profissionais/:id` - Excluir profissional

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `GET /api/agendamentos/:id` - Buscar agendamento por ID
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Cancelar agendamento

### Histórico de Consultas
- `GET /api/historico-consultas` - Listar histórico
- `POST /api/historico-consultas` - Registrar consulta
- `GET /api/historico-consultas/residente/:id` - Histórico por residente

### Financeiro
- `GET /api/financeiro/resumo` - Resumo financeiro
- `GET /api/financeiro/transacoes` - Todas as transações
- `GET /api/financeiro/despesas` - Listar despesas
- `POST /api/financeiro/despesas` - Criar despesa
- `GET /api/financeiro/mensalidades` - Listar mensalidades
- `POST /api/financeiro/mensalidades/:id/pagar` - Pagar mensalidade
- `GET /api/financeiro/salarios` - Listar salários
- `POST /api/financeiro/salarios/:id/pagar` - Pagar salário

## 🔒 Segurança

- **Rate Limiting**: 200 requisições por 15 minutos por IP
- **CORS**: Configurado para aceitar apenas origem do frontend
- **Validação**: Todos os dados são validados antes de serem processados
- **Error Handling**: Tratamento centralizado de erros

## 🏥 Health Check

Acesse `http://localhost:3000/health` para verificar o status do servidor e conexão com o banco de dados.

## 📊 Logs

O servidor registra automaticamente:
- Todas as requisições HTTP com status e tempo de resposta
- Erros com stack trace (em desenvolvimento)
- Conexões e desconexões do banco de dados

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia servidor em produção
npm run dev        # Inicia servidor em desenvolvimento (nodemon)
npm run sync-db    # Sincroniza/recria tabelas do banco
```

## ⚠️ Importante

- Nunca commite o arquivo `.env` (já está no .gitignore)
- Em produção, use `NODE_ENV=production`
- Configure `JWT_SECRET` forte em produção
- Faça backups regulares do banco de dados

## 🐛 Troubleshooting

### Erro de conexão com MySQL
- Verifique se o MySQL está rodando
- Confirme usuário, senha e porta no `.env`
- Teste a conexão manualmente

### Porta já em uso
- Altere a `PORT` no arquivo `.env`
- Ou encerre o processo usando a porta 3000

### Erros de validação
- Verifique o formato dos dados enviados
- Consulte a documentação da API acima

## 📝 Melhorias Implementadas

✅ **Arquitetura**
- Middleware de tratamento centralizado de erros
- Rate limiting para proteção contra abuso
- Logger de requisições com cores e timestamps
- Respostas padronizadas da API

✅ **Segurança**
- CORS configurado corretamente
- Validação de dados robusta
- Proteção contra SQL injection (Sequelize)
- Graceful shutdown

✅ **Performance**
- Pool de conexões otimizado
- Limite de payload (10mb)
- Retry automático em falhas de conexão

✅ **Código Limpo**
- Constantes centralizadas
- Utilitários reutilizáveis
- Validadores personalizados
- Código bem documentado

## 📧 Suporte

Para dúvidas ou problemas, entre em contato ou abra uma issue no repositório.
