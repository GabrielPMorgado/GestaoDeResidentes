# Guia de Configuração do Sistema de Agendamentos

## 📋 Resumo

O sistema de agendamentos foi criado para conectar residentes com profissionais, permitindo agendar atendimentos de diversos tipos (consulta, fisioterapia, psicologia, nutrição, etc.).

## 🗄️ Estrutura do Banco de Dados

### Tabela: agendamentos

- **id** (INT, PK, AUTO_INCREMENT): Identificador único
- **residente_id** (INT, FK): Referência ao residente
- **profissional_id** (INT, FK): Referência ao profissional
- **data_agendamento** (DATE): Data do atendimento
- **hora_inicio** (TIME): Hora de início
- **hora_fim** (TIME): Hora de término
- **tipo_atendimento** (ENUM): consulta, fisioterapia, psicologia, nutricao, outro
- **status** (ENUM): agendado, confirmado, em_andamento, concluido, cancelado
- **observacoes** (TEXT): Observações adicionais
- **data_cadastro** (TIMESTAMP): Data de criação
- **data_atualizacao** (TIMESTAMP): Data de atualização
- **cancelado_por** (VARCHAR): Quem cancelou
- **motivo_cancelamento** (TEXT): Motivo do cancelamento

### Relacionamentos

- `agendamentos.residente_id` → `residentes.id` (ON DELETE CASCADE)
- `agendamentos.profissional_id` → `profissionais.id` (ON DELETE CASCADE)

## 🚀 Passos de Configuração

### 1. Executar SQL no MySQL Workbench

Abra o arquivo `database/create_table_agendamentos.sql` no MySQL Workbench e execute-o para criar a tabela.

**Arquivo:** `database/create_table_agendamentos.sql`

```sql
-- A tabela será criada com todos os campos, índices, foreign keys e constraints
-- Dados de exemplo serão inseridos automaticamente
```

### 2. Backend (✅ Já Configurado)

Os seguintes arquivos já foram criados:

- ✅ `backend/src/models/Agendamento.js` - Model do Sequelize
- ✅ `backend/src/controllers/agendamentoController.js` - Controladores (9 funções)
- ✅ `backend/src/middlewares/validacaoAgendamento.js` - Validações
- ✅ `backend/src/routes/agendamentos.js` - Rotas da API
- ✅ `backend/src/server.js` - Registro das rotas (atualizado)

### 3. API Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/agendamentos` | Criar agendamento |
| GET | `/api/agendamentos` | Listar com filtros |
| GET | `/api/agendamentos/:id` | Buscar por ID |
| GET | `/api/agendamentos/residente/:id` | Agendamentos de um residente |
| GET | `/api/agendamentos/profissional/:id` | Agendamentos de um profissional |
| PUT | `/api/agendamentos/:id` | Atualizar agendamento |
| PUT | `/api/agendamentos/:id/confirmar` | Confirmar agendamento |
| PUT | `/api/agendamentos/:id/cancelar` | Cancelar agendamento |
| GET | `/api/agendamentos/estatisticas/geral` | Estatísticas gerais |

### 4. Frontend (✅ Já Configurado)

Os seguintes componentes já foram criados:

- ✅ `frontend/src/api/api.js` - Funções de API (9 funções)
- ✅ `frontend/src/components/Cadastros/CadastroAgendamento.jsx` - Formulário de cadastro
- ✅ `frontend/src/components/Cadastros/CadastroAgendamento.css` - Estilos
- ✅ `frontend/src/components/Listagens/ListagemAgendamentos.jsx` - Listagem com filtros
- ✅ `frontend/src/components/Listagens/ListagemAgendamentos.css` - Estilos
- ✅ `frontend/src/App.jsx` - Rotas adicionadas
- ✅ `frontend/src/components/Sidebar/Sidebar.jsx` - Menu atualizado

## 🎯 Funcionalidades Implementadas

### Cadastro de Agendamentos
- Seleção de residente (dropdown com residentes ativos)
- Seleção de profissional (dropdown com profissionais ativos)
- Data e horário (início e fim)
- Tipo de atendimento (5 opções)
- Observações
- Validações:
  - Data não pode ser no passado
  - Hora fim > hora início
  - Campos obrigatórios
  - Detecção de conflitos (mesmo profissional, horários sobrepostos)

### Listagem de Agendamentos
- **Estatísticas**: Total, Agendados, Confirmados, Concluídos
- **Filtros**:
  - Status (agendado, confirmado, em_andamento, concluido, cancelado)
  - Tipo de atendimento
  - Range de datas (início e fim)
  - Busca por nome (residente ou profissional)
- **Tabela**:
  - Data, Horário, Residente, Profissional, Tipo, Status
  - Badges coloridos por tipo e status
  - Paginação (5, 10, 25, 50 itens)
- **Ações**:
  - Ver detalhes (modal)
  - Confirmar (status: agendado → confirmado)
  - Cancelar (com motivo e responsável)

## 🔄 Fluxo de Status

1. **agendado** (azul) - Criado, aguardando confirmação
2. **confirmado** (verde) - Confirmado pelo profissional/sistema
3. **em_andamento** (amarelo) - Atendimento em execução
4. **concluido** (cinza) - Atendimento finalizado
5. **cancelado** (vermelho) - Cancelado com motivo

## 🎨 Design

- **Cores por Status**:
  - Agendado: Azul (#0d6efd)
  - Confirmado: Verde (#198754)
  - Em Andamento: Amarelo (#ffc107)
  - Concluído: Cinza (#6c757d)
  - Cancelado: Vermelho (#dc3545)

- **Cores por Tipo**:
  - Consulta: Info (#0dcaf0)
  - Fisioterapia: Verde (#198754)
  - Psicologia: Amarelo (#ffc107)
  - Nutrição: Vermelho (#dc3545)
  - Outro: Cinza (#6c757d)

## 🧪 Testes Sugeridos

1. **Criar agendamento**:
   - Selecionar residente e profissional
   - Definir data futura e horário válido
   - Verificar se foi criado com sucesso

2. **Validar conflitos**:
   - Tentar criar dois agendamentos para o mesmo profissional em horários sobrepostos
   - Sistema deve bloquear e exibir erro

3. **Confirmar agendamento**:
   - Criar agendamento (status: agendado)
   - Clicar em confirmar
   - Verificar mudança de status e badge

4. **Cancelar agendamento**:
   - Clicar em cancelar
   - Informar motivo e responsável
   - Verificar status cancelado e detalhes no modal

5. **Filtros e busca**:
   - Filtrar por status
   - Filtrar por tipo
   - Filtrar por range de datas
   - Buscar por nome de residente/profissional

6. **Estatísticas**:
   - Verificar contadores nos cards
   - Criar/confirmar/cancelar e ver atualização

## 📊 Queries Úteis

```sql
-- Ver todos os agendamentos com nomes
SELECT 
  a.id, 
  r.nome_completo as residente, 
  p.nome_completo as profissional,
  a.data_agendamento, 
  a.hora_inicio, 
  a.hora_fim,
  a.tipo_atendimento, 
  a.status
FROM agendamentos a
JOIN residentes r ON a.residente_id = r.id
JOIN profissionais p ON a.profissional_id = p.id
ORDER BY a.data_agendamento DESC, a.hora_inicio;

-- Agendamentos de um profissional específico
SELECT * FROM agendamentos 
WHERE profissional_id = 1 
AND data_agendamento >= CURDATE()
ORDER BY data_agendamento, hora_inicio;

-- Estatísticas por status
SELECT status, COUNT(*) as total 
FROM agendamentos 
GROUP BY status;

-- Estatísticas por tipo
SELECT tipo_atendimento, COUNT(*) as total 
FROM agendamentos 
GROUP BY tipo_atendimento;

-- Verificar conflitos de horário
SELECT * FROM agendamentos
WHERE profissional_id = 1
AND data_agendamento = '2024-06-15'
AND (
  (hora_inicio < '14:00:00' AND hora_fim > '13:00:00')
);
```

## ✨ Melhorias Futuras (Opcionais)

- [ ] Visualização em calendário (FullCalendar.js)
- [ ] Notificações por e-mail/SMS
- [ ] Recorrência de agendamentos
- [ ] Integração com Google Calendar
- [ ] Relatórios em PDF
- [ ] Dashboard com gráficos (Chart.js)
- [ ] Lista de espera
- [ ] Histórico de agendamentos do residente
- [ ] Avaliação pós-atendimento

## 🐛 Troubleshooting

**Problema**: Tabela não existe
- **Solução**: Execute o SQL `create_table_agendamentos.sql` no MySQL Workbench

**Problema**: Erro de foreign key
- **Solução**: Certifique-se de que as tabelas `residentes` e `profissionais` existem

**Problema**: Dropdowns vazios no formulário
- **Solução**: Verifique se há residentes e profissionais cadastrados com status "ativo"

**Problema**: Erro ao criar agendamento
- **Solução**: Verifique:
  - Todos os campos obrigatórios preenchidos
  - Data não está no passado
  - Hora fim > hora início
  - Sem conflitos de horário para o profissional

**Problema**: Listagem vazia
- **Solução**: Crie pelo menos um agendamento de teste

## 📝 Notas Importantes

- ✅ Backend rodando na porta 3000
- ✅ Frontend rodando na porta 5174
- ✅ Banco de dados: `sistema_residencial`
- ✅ Relacionamentos com CASCADE configurados
- ✅ Validações no backend e frontend
- ✅ Detecção automática de conflitos de horário
- ✅ Paginação e filtros funcionais

## 🎉 Pronto para Usar!

Após executar o SQL, o sistema está completamente funcional. Acesse:

- **Novo Agendamento**: Menu → AGENDAMENTOS → Novo Agendamento
- **Listagem**: Menu → AGENDAMENTOS → Listagem de Agendamentos
