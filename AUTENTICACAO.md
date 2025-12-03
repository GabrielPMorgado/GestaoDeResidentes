# Sistema de Autenticação e Controle de Acesso

## 📋 Visão Geral

Sistema completo de autenticação com dois níveis de acesso:
- **Administrador**: Acesso total ao sistema
- **Profissional**: Acesso limitado apenas aos seus agendamentos

## 🚀 Configuração Inicial

### 1. Criar a tabela de usuários no banco de dados

Execute o script SQL:
```bash
mysql -u root -p sistema_residencial < database/create_table_usuarios.sql
```

Ou execute manualmente no MySQL:
```sql
-- Ver arquivo: database/create_table_usuarios.sql
```

### 2. Instalar dependências (já instalado)

Backend:
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 3. Iniciar o servidor

```bash
cd backend
npm run dev
```

## 👤 Acessos Padrão

### Administrador
- **Email**: admin@sistema.com
- **Senha**: admin123

> ⚠️ **IMPORTANTE**: Altere a senha padrão do administrador em produção!

## 📱 Funcionalidades

### Para Administradores

1. **Dashboard Completo**
   - Visualização de todas as estatísticas
   - Acesso a todos os módulos do sistema

2. **Gerenciar Acessos** (Novo!)
   - Menu: Administração → Gerenciar Acessos
   - Criar acessos para profissionais
   - Ativar/Desativar usuários
   - Visualizar histórico de acessos

3. **Todos os Módulos**
   - Cadastros (Residentes, Profissionais)
   - Listagens completas
   - Agendamentos
   - Relatórios
   - Gestão Financeira

### Para Profissionais

1. **Painel de Agendamentos**
   - Visualização apenas dos próprios agendamentos
   - Filtros por status
   - Atualização de status dos atendimentos
   - Cards com resumo (Total, Hoje, Confirmados, Concluídos)

2. **Ações Disponíveis**
   - Iniciar atendimento (quando confirmado)
   - Concluir atendimento (quando em atendimento)
   - Visualizar observações

## 🔐 Criar Acesso para Profissional

### Via Interface (Recomendado)

1. Faça login como administrador
2. Vá em **Administração → Gerenciar Acessos**
3. Clique em **Criar Novo Acesso**
4. Selecione o profissional
5. Informe email e senha
6. Clique em **Criar Acesso**

### Via API (Alternativo)

```bash
POST http://localhost:3000/api/auth/criar-acesso-profissional
Content-Type: application/json

{
  "profissional_id": 1,
  "email": "profissional@email.com",
  "senha": "senha123"
}
```

## 🔄 Fluxo de Autenticação

```
Login → Verificar Credenciais → Gerar JWT Token → Armazenar Token
    ↓
Admin → Acesso Total
    |
Profissional → Apenas Agendamentos
```

## 🛡️ Segurança

### Senhas
- Criptografadas com **bcrypt** (salt rounds: 10)
- Nunca armazenadas em texto plano

### Tokens JWT
- Expiração: 8 horas
- Enviados no header: `Authorization: Bearer {token}`
- Validados em cada requisição

### Middleware de Autenticação
- `verificarAutenticacao`: Valida token JWT
- `verificarAdmin`: Permite apenas administradores
- `verificarAcessoAgendamento`: Filtra agendamentos por profissional

## 📊 Estrutura do Banco

### Tabela: usuarios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único |
| profissional_id | INT | ID do profissional (NULL para admin) |
| email | VARCHAR(100) | Email único |
| senha | VARCHAR(255) | Senha criptografada |
| tipo | ENUM | 'admin' ou 'profissional' |
| ativo | BOOLEAN | Status do acesso |
| ultimo_acesso | DATETIME | Data do último login |

## 🎨 Interface

### Tela de Login
- Design moderno com gradientes
- Validação de formulário
- Feedback de erros
- Informações de acesso padrão (dev)

### Painel Profissional
- Cards de resumo coloridos
- Tabela responsiva com filtros
- Ações contextuais por status
- Atualização em tempo real

### Gerenciar Acessos
- Lista completa de usuários
- Status visual (ativo/inativo)
- Modal para criar novos acessos
- Filtro automático de profissionais disponíveis

## 🔧 Troubleshooting

### Token Inválido
- Faça logout e login novamente
- Verifique se JWT_SECRET está configurado

### Profissional não consegue ver agendamentos
- Verifique se o profissional_id está correto
- Confirme que existem agendamentos para este profissional

### Erro ao criar acesso
- Verifique se o profissional existe
- Confirme que não há acesso duplicado
- Email deve ser único no sistema

## 📝 Próximos Passos

1. ✅ Sistema de autenticação implementado
2. ✅ Controle de acesso por perfil
3. ✅ Painel específico para profissionais
4. ✅ Gerenciamento de acessos pelo admin

### Melhorias Futuras (Opcional)
- [ ] Recuperação de senha por email
- [ ] Autenticação de dois fatores (2FA)
- [ ] Logs de auditoria de acessos
- [ ] Política de senha forte
- [ ] Expiração automática de senha

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do backend
2. Confirme que o banco está sincronizado
3. Teste as rotas da API diretamente
4. Verifique o console do navegador

## 🔑 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verificar` - Verificar token
- `POST /api/auth/criar-acesso-profissional` - Criar acesso (admin)
- `GET /api/auth/usuarios` - Listar usuários (admin)
- `PATCH /api/auth/usuarios/:id/status` - Ativar/Desativar (admin)

### Exemplo de Uso

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@sistema.com',
    senha: 'admin123'
  })
});

const { token, usuario } = await response.json();

// Usar token nas próximas requisições
fetch('http://localhost:3000/api/agendamentos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

**Versão**: 1.0.0  
**Data**: 02/12/2025  
**Status**: ✅ Funcional
