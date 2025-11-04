# 📋 Guia de Implementação - Histórico de Consultas

## 🎯 Funcionalidades Implementadas

Este guia documenta a implementação completa do sistema de histórico de consultas e das ações de visualizar, editar e excluir residentes.

---

## 🗄️ 1. Criação da Tabela no Banco de Dados

### Executar SQL no MySQL

Abra o MySQL Workbench ou cliente MySQL e execute o script:

```sql
-- Localização: database/create_table_historico_consultas.sql

CREATE TABLE IF NOT EXISTS historico_consultas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  residente_id INT NOT NULL,
  profissional_id INT NOT NULL,
  agendamento_id INT,
  data_consulta DATETIME NOT NULL,
  tipo_consulta VARCHAR(100),
  observacoes TEXT,
  diagnostico TEXT,
  prescricao TEXT,
  status VARCHAR(50) DEFAULT 'realizada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (residente_id) REFERENCES residentes(id) ON DELETE CASCADE,
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
  
  INDEX idx_residente (residente_id),
  INDEX idx_profissional (profissional_id),
  INDEX idx_data_consulta (data_consulta),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 2. Reiniciar o Backend

Após criar a tabela, reinicie o servidor backend:

```bash
cd backend
npm start
```

O servidor irá sincronizar os modelos automaticamente.

---

## ✨ 3. Funcionalidades Disponíveis

### 📊 **Listagem de Residentes**

#### **1. Visualizar Residente** 👁️
- **Botão**: Azul com ícone de olho
- **Funcionalidade**: Abre modal com todos os detalhes do residente
- **Dados exibidos**:
  - Dados Pessoais (nome, CPF, RG, data nascimento, idade)
  - Informações de Contato (telefone, email)
  - Endereço Completo
  - Status atual

#### **2. Editar Residente** ✏️
- **Botão**: Amarelo com ícone de lápis
- **Funcionalidade**: Abre modal para editar dados do residente
- **Campos editáveis**:
  - Nome completo
  - CPF
  - RG
  - Data de nascimento
  - Sexo
  - Telefone
  - Email
  - Status (ativo, inativo, suspenso)
- **Validação**: Backend valida CPF único
- **Feedback**: Alert de sucesso ou erro

#### **3. Histórico de Consultas** 🕐
- **Botão**: Info (azul claro) com ícone de relógio
- **Funcionalidade**: Exibe histórico completo de consultas
- **Informações exibidas**:
  - Data da consulta
  - Nome do profissional
  - Especialidade
  - Tipo de consulta
  - Diagnóstico
  - Status da consulta
- **Busca automática**: Carrega consultas do backend ao abrir

#### **4. Excluir/Inativar Residente** 🗑️
- **Botão**: Vermelho com ícone de lixeira
- **Funcionalidade**: Inativa o residente (soft delete)
- **Confirmação**: Solicita confirmação antes de inativar
- **Atualização**: Recarrega lista e estatísticas

---

## 🔌 4. Endpoints da API

### **Histórico de Consultas**

#### Listar Histórico de um Residente
```http
GET /api/historico-consultas/residente/:residente_id
```

**Query Parameters**:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `profissional_id`: Filtrar por profissional
- `data_inicio`: Data início do filtro
- `data_fim`: Data fim do filtro

**Resposta**:
```json
{
  "success": true,
  "data": {
    "consultas": [
      {
        "id": 1,
        "residente_id": 1,
        "profissional_id": 1,
        "data_consulta": "2025-10-15T10:00:00",
        "tipo_consulta": "Consulta de Rotina",
        "diagnostico": "Hipertensão controlada",
        "status": "realizada",
        "profissional": {
          "nome_completo": "Dr. João Silva",
          "especialidade": "Clínico Geral"
        }
      }
    ],
    "pagination": {
      "totalItens": 10,
      "totalPaginas": 2,
      "paginaAtual": 1,
      "itensPorPagina": 10
    }
  }
}
```

#### Criar Consulta no Histórico
```http
POST /api/historico-consultas
```

**Body**:
```json
{
  "residente_id": 1,
  "profissional_id": 1,
  "agendamento_id": 5,
  "data_consulta": "2025-11-04T14:00:00",
  "tipo_consulta": "Consulta de Rotina",
  "observacoes": "Paciente relata melhora",
  "diagnostico": "Pressão arterial estável",
  "prescricao": "Manter medicação atual",
  "status": "realizada"
}
```

#### Obter Detalhes de uma Consulta
```http
GET /api/historico-consultas/:id
```

#### Atualizar Consulta
```http
PUT /api/historico-consultas/:id
```

#### Deletar Consulta
```http
DELETE /api/historico-consultas/:id
```

### **Residentes**

#### Buscar Residente por ID
```http
GET /api/residentes/:id
```

#### Atualizar Residente
```http
PUT /api/residentes/:id
```

**Body**: Objeto com campos a atualizar

---

## 🎨 5. Interface do Usuário

### Botões de Ação (4 botões)

```jsx
<button className="btn btn-sm btn-outline-primary">   {/* Visualizar */}
<button className="btn btn-sm btn-outline-info">      {/* Histórico */}
<button className="btn btn-sm btn-outline-warning">   {/* Editar */}
<button className="btn btn-sm btn-outline-danger">    {/* Excluir */}
```

### Modais Implementados

1. **Modal Visualizar**: Exibe informações completas (somente leitura)
2. **Modal Editar**: Formulário editável com validação
3. **Modal Histórico**: Tabela com histórico de consultas

---

## 📝 6. Como Testar

### 1. Criar Tabela
```sql
-- Execute o script SQL fornecido acima
```

### 2. Reiniciar Backend
```bash
cd backend
npm start
```

### 3. Testar no Frontend

#### Visualizar Residente:
1. Acesse "Listagem de Residentes"
2. Clique no botão azul (olho) de qualquer residente
3. Modal abre com todos os dados

#### Editar Residente:
1. Clique no botão amarelo (lápis)
2. Modifique os campos desejados
3. Clique em "Salvar Alterações"
4. Verifique a mensagem de sucesso

#### Ver Histórico:
1. Clique no botão info (relógio)
2. Visualize todas as consultas do residente
3. Ordenadasda mais recente para mais antiga

#### Excluir Residente:
1. Clique no botão vermelho (lixeira)
2. Confirme a ação
3. Residente é inativado (soft delete)

---

## 🔄 7. Fluxo de Dados

```
Frontend (ListagemResidentes.jsx)
  ↓
API Client (api.js)
  ↓
Backend Routes (historicoConsultas.js)
  ↓
Controller (historicoConsultaController.js)
  ↓
Model (HistoricoConsulta.js)
  ↓
Database (historico_consultas table)
```

---

## 🛡️ 8. Validações Implementadas

### Backend:
- ✅ Residente existe antes de criar consulta
- ✅ Profissional existe antes de criar consulta
- ✅ CPF único ao editar residente
- ✅ Campos obrigatórios validados

### Frontend:
- ✅ Confirmação antes de deletar
- ✅ Loading states durante requisições
- ✅ Mensagens de erro/sucesso
- ✅ Validação de campos obrigatórios

---

## 🎯 9. Próximos Passos (Opcional)

Para melhorias futuras, considere:

1. **Filtros Avançados no Histórico**:
   - Filtrar por data
   - Filtrar por profissional
   - Filtrar por tipo de consulta

2. **Exportação de Dados**:
   - Exportar histórico em PDF
   - Exportar relatórios em Excel

3. **Detalhes da Consulta**:
   - Modal para ver detalhes completos
   - Incluir prescrições e observações

4. **Notificações**:
   - Email ao residente sobre consulta
   - Lembrete de retorno

---

## ✅ Checklist de Implementação

- [x] Tabela `historico_consultas` criada no banco
- [x] Model `HistoricoConsulta.js` implementado
- [x] Controller com CRUD completo
- [x] Rotas configuradas no servidor
- [x] Relacionamentos Sequelize definidos
- [x] API client no frontend atualizada
- [x] Modal de visualização implementado
- [x] Modal de edição implementado
- [x] Modal de histórico implementado
- [x] Botões de ação funcionais
- [x] Validações e tratamento de erros
- [x] Feedback visual ao usuário

---

## 🆘 Troubleshooting

### Erro: "Tabela historico_consultas não existe"
**Solução**: Execute o script SQL de criação da tabela

### Erro: "Cannot find module HistoricoConsulta"
**Solução**: Reinicie o servidor backend após criar os arquivos

### Modal não abre
**Solução**: Verifique o console do navegador para erros JavaScript

### Histórico vazio mesmo com consultas
**Solução**: Verifique se o `residente_id` está correto nas consultas

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do backend (terminal)
3. Banco de dados (dados inseridos corretamente)

---

**Implementação concluída com sucesso!** ✨🎉
