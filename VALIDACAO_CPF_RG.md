# 🔒 Validação de CPF e RG - Sistema de Gerenciamento

## 📋 Resumo

Implementado sistema completo de validação para garantir que **CPF e RG sejam únicos** em todo o sistema, impedindo duplicações tanto dentro da mesma categoria (residentes/profissionais) quanto entre categorias.

---

## ✅ Validações Implementadas

### 1. **Cadastro de Residentes**
Ao cadastrar um novo residente, o sistema verifica:
- ✅ CPF não existe em nenhum outro residente
- ✅ CPF não existe em nenhum profissional
- ✅ RG não existe em nenhum outro residente (se fornecido)
- ✅ RG não existe em nenhum profissional (se fornecido)

### 2. **Cadastro de Profissionais**
Ao cadastrar um novo profissional, o sistema verifica:
- ✅ CPF não existe em nenhum outro profissional
- ✅ CPF não existe em nenhum residente
- ✅ RG não existe em nenhum outro profissional (se fornecido)
- ✅ RG não existe em nenhum residente (se fornecido)

### 3. **Atualização de Residentes**
Ao atualizar dados de um residente, o sistema:
- ✅ Permite manter o próprio CPF/RG
- ✅ Verifica se o novo CPF/RG não pertence a outro residente
- ✅ Verifica se o novo CPF/RG não pertence a nenhum profissional

### 4. **Atualização de Profissionais**
Ao atualizar dados de um profissional, o sistema:
- ✅ Permite manter o próprio CPF/RG
- ✅ Verifica se o novo CPF/RG não pertence a outro profissional
- ✅ Verifica se o novo CPF/RG não pertence a nenhum residente

---

## 🎯 Mensagens de Erro

O sistema retorna mensagens claras e específicas:

| Situação | Mensagem |
|----------|----------|
| CPF duplicado em residentes | `CPF já cadastrado como residente!` |
| CPF duplicado em profissionais | `CPF já cadastrado como profissional!` |
| RG duplicado em residentes | `RG já cadastrado como residente!` |
| RG duplicado em profissionais | `RG já cadastrado como profissional!` |

---

## 🔧 Arquivos Modificados

### Backend
1. **`backend/src/controllers/residenteController.js`**
   - Validação no método `criar()`
   - Validação no método `atualizar()`
   - Verificação cruzada com tabela de profissionais

2. **`backend/src/controllers/profissionalController.js`**
   - Validação no método `criar()`
   - Validação no método `atualizar()`
   - Verificação cruzada com tabela de residentes

### Database
3. **`database/add_unique_rg_constraint.sql`** (NOVO)
   - Script para adicionar constraint UNIQUE no RG
   - Aplica em ambas as tabelas (residentes e profissionais)

---

## 📊 Banco de Dados

### Constraints Existentes
- ✅ `cpf` - UNIQUE (já existia)
- ✅ `rg` - UNIQUE (adicionar via script SQL)

### Executar Script SQL
Para adicionar a constraint UNIQUE no RG, execute:

```sql
USE sistema_residencial;

ALTER TABLE residentes
ADD UNIQUE INDEX idx_unique_rg (rg);

ALTER TABLE profissionais
ADD UNIQUE INDEX idx_unique_rg (rg);
```

**⚠️ IMPORTANTE:** Se já existirem RGs duplicados, remova-os antes de executar o script!

---

## 🧪 Como Testar

### 1. Teste CPF Duplicado - Mesma Categoria
```javascript
// Cadastrar primeiro residente
POST /api/residentes
{
  "cpf": "123.456.789-00",
  "nome_completo": "João Silva"
}

// Tentar cadastrar outro com mesmo CPF
POST /api/residentes
{
  "cpf": "123.456.789-00",
  "nome_completo": "Maria Santos"
}

// ❌ Esperado: "CPF já cadastrado como residente!"
```

### 2. Teste CPF Duplicado - Entre Categorias
```javascript
// Cadastrar residente
POST /api/residentes
{
  "cpf": "123.456.789-00",
  "nome_completo": "João Silva"
}

// Tentar cadastrar profissional com mesmo CPF
POST /api/profissionais
{
  "cpf": "123.456.789-00",
  "nome_completo": "Maria Santos"
}

// ❌ Esperado: "CPF já cadastrado como residente!"
```

### 3. Teste RG Duplicado
```javascript
// Cadastrar residente com RG
POST /api/residentes
{
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "nome_completo": "João Silva"
}

// Tentar cadastrar profissional com mesmo RG
POST /api/profissionais
{
  "cpf": "987.654.321-00",
  "rg": "12.345.678-9",
  "nome_completo": "Maria Santos"
}

// ❌ Esperado: "RG já cadastrado como residente!"
```

### 4. Teste Atualização
```javascript
// Atualizar mantendo próprio CPF (✅ PERMITIDO)
PUT /api/residentes/1
{
  "cpf": "123.456.789-00", // próprio CPF
  "nome_completo": "João Silva Atualizado"
}

// Atualizar para CPF de outra pessoa (❌ BLOQUEADO)
PUT /api/residentes/1
{
  "cpf": "999.999.999-99", // CPF de outra pessoa
  "nome_completo": "João Silva"
}
```

---

## 🚀 Benefícios

1. **Integridade de Dados** 🔐
   - Garante que não existam pessoas duplicadas no sistema

2. **Segurança** 🛡️
   - Impede cadastros fraudulentos com documentos de outras pessoas

3. **Conformidade** ✅
   - Atende requisitos legais de identificação única

4. **Experiência do Usuário** 👥
   - Mensagens claras sobre o motivo da rejeição

5. **Manutenibilidade** 🔧
   - Código organizado e fácil de manter

---

## 📝 Observações

- O RG é opcional, mas se fornecido deve ser único
- O CPF é obrigatório e sempre único
- Validações ocorrem antes da tentativa de salvar no banco
- Validações cruzadas garantem integridade entre tabelas
- Ao atualizar, o sistema permite manter os próprios documentos

---

## 🎓 Próximos Passos Sugeridos

1. ✅ Executar script SQL para adicionar constraint UNIQUE no RG
2. ✅ Testar todas as validações no Postman/Insomnia
3. ⏳ Adicionar validação de formato de CPF (11 dígitos)
4. ⏳ Adicionar validação de dígito verificador do CPF
5. ⏳ Implementar validação visual no frontend (mensagens de erro)

---

**Data de Implementação:** 05/11/2025  
**Versão:** 1.0.0
