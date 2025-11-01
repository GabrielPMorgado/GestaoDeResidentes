# 📊 Guia de Configuração do MySQL

## ⚙️ Passo a Passo para Configurar o Banco de Dados

### 1️⃣ Abrir o MySQL Workbench

1. Abra o **MySQL Workbench**
2. Clique na sua conexão local (geralmente `root@localhost`)
3. Insira sua senha do MySQL

### 2️⃣ Executar o Script SQL

1. No menu superior, clique em **File → Open SQL Script**
2. Navegue até: 
   ```
   C:\Users\gabri\OneDrive\Área de Trabalho\sistema01\database\create_table_residentes.sql
   ```
3. Clique em **Open**
4. Clique no ícone de **raio ⚡** (Execute) ou pressione **Ctrl+Shift+Enter**
5. Aguarde a execução (deve aparecer mensagens de sucesso)

### 3️⃣ Verificar se Foi Criado

Execute os seguintes comandos para verificar:

```sql
-- Ver todos os bancos de dados
SHOW DATABASES;

-- Usar o banco criado
USE sistema_residencial;

-- Ver todas as tabelas
SHOW TABLES;

-- Ver a estrutura da tabela
DESCRIBE residentes;

-- Ver os dados (deve ter 1 registro de exemplo)
SELECT * FROM residentes;
```

### 4️⃣ Configurar as Credenciais no Backend

Edite o arquivo: `backend/.env`

```env
# Configuração do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_residencial
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI    👈 Coloque sua senha do MySQL aqui

# Configuração do Servidor
PORT=3000
NODE_ENV=development
```

**IMPORTANTE:** Troque `SUA_SENHA_AQUI` pela senha que você usa no MySQL Workbench!

### 5️⃣ Iniciar o Backend

```bash
cd backend
npm run dev
```

Você deve ver essas mensagens:

```
✅ Conexão com MySQL estabelecida com sucesso!
✅ Modelos sincronizados com o banco de dados
🚀 Servidor rodando na porta 3000
📍 http://localhost:3000
📊 API: http://localhost:3000/api/residentes
```

### 6️⃣ Testar a API

Acesse no navegador: **http://localhost:3000**

Você deve ver:

```json
{
  "message": "🏠 API Sistema Residencial - Online",
  "version": "1.0.0",
  "endpoints": {
    "residentes": "/api/residentes"
  }
}
```

---

## 🆘 Problemas Comuns

### ❌ Erro: "Access denied for user 'root'@'localhost'"

**Solução:** Senha incorreta no arquivo `.env`
- Verifique a senha no MySQL Workbench
- Atualize o arquivo `backend/.env`

### ❌ Erro: "Unknown database 'sistema_residencial'"

**Solução:** Banco de dados não foi criado
- Execute o script SQL novamente no MySQL Workbench
- Verifique se apareceu mensagens de sucesso

### ❌ Erro: "connect ECONNREFUSED 127.0.0.1:3306"

**Solução:** MySQL não está rodando
- Abra o MySQL Workbench
- Teste a conexão
- Inicie o serviço MySQL se necessário

### ❌ Erro: "Table 'residentes' already exists"

**Solução:** Tabela já existe (isso é normal!)
- O script usa `CREATE TABLE IF NOT EXISTS`
- Você pode executar novamente sem problemas

---

## ✅ Checklist Final

Marque cada item após completar:

- [ ] MySQL Workbench instalado e funcionando
- [ ] Script SQL executado com sucesso
- [ ] Banco `sistema_residencial` criado
- [ ] Tabela `residentes` criada
- [ ] Arquivo `.env` configurado com a senha correta
- [ ] Backend iniciado sem erros
- [ ] API respondendo em http://localhost:3000
- [ ] Frontend rodando em http://localhost:5174

---

## 🎯 Próximos Passos

Após configurar o MySQL:

1. ✅ Backend rodando → `npm run dev` no terminal do backend
2. ✅ Frontend rodando → `npm run dev` no terminal do frontend  
3. 🎨 Acesse: **http://localhost:5174**
4. 📝 Cadastre seu primeiro residente!

---

## 📝 Estrutura da Tabela

A tabela `residentes` tem 24 campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | INT | Sim (auto) | ID único |
| nome_completo | VARCHAR(200) | Sim | Nome completo |
| data_nascimento | DATE | Sim | Data de nascimento |
| cpf | VARCHAR(14) | Sim | CPF (único) |
| rg | VARCHAR(20) | Não | RG |
| sexo | ENUM | Sim | masculino/feminino/outro |
| estado_civil | ENUM | Não | solteiro/casado/divorciado/viuvo/outro |
| telefone | VARCHAR(20) | Sim | Telefone principal |
| email | VARCHAR(100) | Não | E-mail |
| cep | VARCHAR(10) | Não | CEP |
| logradouro | VARCHAR(200) | Não | Rua/Avenida |
| numero | VARCHAR(10) | Não | Número |
| complemento | VARCHAR(100) | Não | Complemento |
| bairro | VARCHAR(100) | Não | Bairro |
| cidade | VARCHAR(100) | Não | Cidade |
| estado | VARCHAR(2) | Não | UF |
| nome_responsavel | VARCHAR(200) | Sim | Nome do responsável |
| parentesco_responsavel | VARCHAR(50) | Não | Parentesco |
| telefone_responsavel | VARCHAR(20) | Sim | Telefone do responsável |
| email_responsavel | VARCHAR(100) | Não | E-mail do responsável |
| data_cadastro | TIMESTAMP | Sim (auto) | Data de criação |
| data_atualizacao | TIMESTAMP | Sim (auto) | Data de atualização |
| status | ENUM | Sim | ativo/inativo/suspenso |
| observacoes | TEXT | Não | Observações gerais |

---

## 💡 Dicas

1. **Backup Regular:** Faça backup do banco de dados periodicamente
   ```sql
   mysqldump -u root -p sistema_residencial > backup.sql
   ```

2. **Consultar Logs:** Se houver erros, veja os logs no terminal do backend

3. **Testar API:** Use ferramentas como Postman ou Insomnia para testar endpoints

4. **Desenvolvimento:** Mantenha ambos os terminais abertos (backend e frontend)

---

🎉 **Parabéns! Seu sistema está pronto para usar!** 🎉
