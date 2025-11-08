# 📚 Guia de Uso dos Services

## 🎯 O que são Services?

Services são **camadas de abstração** que separam a lógica de negócio das chamadas HTTP. Eles centralizam todas as operações relacionadas a uma entidade específica.

## ✅ Vantagens dos Services

### 1. **Organização** 📁
- Código limpo e bem estruturado
- Fácil de encontrar funções específicas
- Separação clara de responsabilidades

### 2. **Reutilização** ♻️
- Use a mesma função em vários componentes
- Evite duplicação de código
- Manutenção simplificada

### 3. **Manutenção** 🔧
- Alterações centralizadas
- Fácil debug e teste
- Menos propensão a erros

### 4. **Testabilidade** 🧪
- Testes unitários simplificados
- Mock de dados facilitado
- Cobertura de código melhor

---

## 🏗️ Estrutura dos Services

```
frontend/src/
├── api/
│   └── axios.js              # Configuração do Axios
└── services/
    ├── index.js              # Exportações centralizadas
    ├── residenteService.js   # Operações de residentes
    ├── profissionalService.js# Operações de profissionais
    ├── agendamentoService.js # Operações de agendamentos
    └── relatorioService.js   # Operações de relatórios
```

---

## 📖 Como Usar

### Importação nos Componentes

```javascript
// Importar um service específico
import residenteService from '../services/residenteService';

// Ou importar vários de uma vez
import { 
  residenteService, 
  profissionalService,
  agendamentoService 
} from '../services';
```

---

## 🔥 Exemplos Práticos

### **1. Residente Service**

#### Criar Residente
```javascript
import residenteService from '../services/residenteService';

const cadastrarResidente = async (dados) => {
  try {
    const novoResidente = await residenteService.criar({
      nome: dados.nome,
      cpf: dados.cpf,
      rg: dados.rg,
      dataNascimento: dados.dataNascimento,
      telefone: dados.telefone,
      endereco: dados.endereco
    });
    
    console.log('Residente criado:', novoResidente);
    alert('Residente cadastrado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    alert(error.message || 'Erro ao cadastrar residente');
  }
};
```

#### Listar Residentes Ativos
```javascript
const carregarResidentes = async () => {
  try {
    const residentes = await residenteService.listarAtivos();
    setResidentes(residentes);
    
  } catch (error) {
    console.error('Erro ao carregar:', error);
  }
};
```

#### Buscar por CPF
```javascript
const buscarPorCpf = async (cpf) => {
  try {
    const residente = await residenteService.buscarPorCpf(cpf);
    console.log('Residente encontrado:', residente);
    
  } catch (error) {
    console.error('Residente não encontrado');
  }
};
```

#### Atualizar Residente
```javascript
const atualizarResidente = async (id, dadosAtualizados) => {
  try {
    const atualizado = await residenteService.atualizar(id, dadosAtualizados);
    console.log('Residente atualizado:', atualizado);
    
  } catch (error) {
    console.error('Erro ao atualizar:', error);
  }
};
```

#### Deletar (Inativar) Residente
```javascript
const deletarResidente = async (id) => {
  try {
    await residenteService.deletar(id);
    alert('Residente inativado com sucesso!');
    carregarResidentes(); // Recarregar lista
    
  } catch (error) {
    console.error('Erro ao deletar:', error);
  }
};
```

---

### **2. Profissional Service**

#### Criar Profissional
```javascript
import profissionalService from '../services/profissionalService';

const cadastrarProfissional = async (dados) => {
  try {
    const novoProfissional = await profissionalService.criar({
      nome: dados.nome,
      cpf: dados.cpf,
      rg: dados.rg,
      especialidade: dados.especialidade,
      registro: dados.registro,
      telefone: dados.telefone,
      email: dados.email
    });
    
    console.log('Profissional criado:', novoProfissional);
    
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
  }
};
```

#### Buscar por Especialidade
```javascript
const buscarPorEspecialidade = async (especialidade) => {
  try {
    const profissionais = await profissionalService.buscarPorEspecialidade(especialidade);
    setProfissionais(profissionais);
    
  } catch (error) {
    console.error('Erro ao buscar:', error);
  }
};
```

#### Listar Especialidades Disponíveis
```javascript
const carregarEspecialidades = async () => {
  try {
    const especialidades = await profissionalService.listarEspecialidades();
    setEspecialidades(especialidades);
    
  } catch (error) {
    console.error('Erro ao carregar especialidades:', error);
  }
};
```

---

### **3. Agendamento Service**

#### Criar Agendamento
```javascript
import agendamentoService from '../services/agendamentoService';

const criarAgendamento = async (dados) => {
  try {
    // Verificar disponibilidade antes de agendar
    const disponivel = await agendamentoService.verificarDisponibilidade(
      dados.profissional_id,
      dados.data,
      dados.horario
    );
    
    if (!disponivel) {
      alert('Horário indisponível!');
      return;
    }
    
    const agendamento = await agendamentoService.criar({
      residente_id: dados.residente_id,
      profissional_id: dados.profissional_id,
      data: dados.data,
      horario: dados.horario,
      observacoes: dados.observacoes
    });
    
    console.log('Agendamento criado:', agendamento);
    
  } catch (error) {
    console.error('Erro ao agendar:', error);
  }
};
```

#### Buscar Agendamentos do Dia
```javascript
const carregarAgendamentosHoje = async () => {
  try {
    const agendamentos = await agendamentoService.agendamentosHoje();
    setAgendamentos(agendamentos);
    
  } catch (error) {
    console.error('Erro ao carregar:', error);
  }
};
```

#### Confirmar Agendamento
```javascript
const confirmarAgendamento = async (id) => {
  try {
    await agendamentoService.confirmar(id);
    alert('Agendamento confirmado!');
    
  } catch (error) {
    console.error('Erro ao confirmar:', error);
  }
};
```

#### Cancelar Agendamento
```javascript
const cancelarAgendamento = async (id, motivo) => {
  try {
    await agendamentoService.cancelar(id, motivo);
    alert('Agendamento cancelado!');
    
  } catch (error) {
    console.error('Erro ao cancelar:', error);
  }
};
```

#### Buscar por Período
```javascript
const buscarPorPeriodo = async () => {
  try {
    const agendamentos = await agendamentoService.buscarPorPeriodo(
      '2024-01-01',  // Data início
      '2024-01-31'   // Data fim
    );
    
    setAgendamentos(agendamentos);
    
  } catch (error) {
    console.error('Erro ao buscar:', error);
  }
};
```

---

### **4. Relatório Service**

#### Obter Estatísticas Gerais
```javascript
import relatorioService from '../services/relatorioService';

const carregarEstatisticas = async () => {
  try {
    const stats = await relatorioService.obterEstatisticasGerais();
    setEstatisticas(stats);
    
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
};
```

#### Dados do Dashboard
```javascript
const carregarDashboard = async () => {
  try {
    const dados = await relatorioService.obterDadosDashboard();
    setDadosDashboard(dados);
    
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
};
```

#### Exportar Relatório PDF
```javascript
const exportarPDF = async () => {
  try {
    const blob = await relatorioService.exportarPDF('agendamentos', {
      dataInicio: '2024-01-01',
      dataFim: '2024-01-31'
    });
    
    relatorioService.baixarArquivo(blob, 'relatorio-agendamentos.pdf');
    
  } catch (error) {
    console.error('Erro ao exportar:', error);
  }
};
```

---

## 🎨 Exemplo Completo em um Componente

```javascript
import React, { useState, useEffect } from 'react';
import { residenteService, agendamentoService } from '../services';

function CadastroAgendamento() {
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    residente_id: '',
    profissional_id: '',
    data: '',
    horario: ''
  });

  // Carregar residentes ao montar o componente
  useEffect(() => {
    carregarResidentes();
  }, []);

  const carregarResidentes = async () => {
    try {
      setLoading(true);
      const dados = await residenteService.listarAtivos();
      setResidentes(dados);
    } catch (error) {
      console.error('Erro ao carregar residentes:', error);
      alert('Erro ao carregar residentes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Verificar disponibilidade
      const disponivel = await agendamentoService.verificarDisponibilidade(
        formData.profissional_id,
        formData.data,
        formData.horario
      );
      
      if (!disponivel) {
        alert('Horário indisponível!');
        return;
      }
      
      // Criar agendamento
      await agendamentoService.criar(formData);
      alert('Agendamento criado com sucesso!');
      
      // Limpar formulário
      setFormData({
        residente_id: '',
        profissional_id: '',
        data: '',
        horario: ''
      });
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert(error.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-agendamento">
      <h2>Novo Agendamento</h2>
      
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <select
            value={formData.residente_id}
            onChange={(e) => setFormData({...formData, residente_id: e.target.value})}
            required
          >
            <option value="">Selecione o Residente</option>
            {residentes.map(r => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
          
          {/* Outros campos... */}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CadastroAgendamento;
```

---

## 🛡️ Tratamento de Erros

Todos os services já possuem tratamento de erros. Você deve usar `try/catch`:

```javascript
try {
  const dados = await residenteService.listarAtivos();
  // Sucesso
} catch (error) {
  // Erro capturado
  console.error('Erro:', error);
  
  // Exibir mensagem amigável
  if (error.message) {
    alert(error.message);
  } else {
    alert('Erro ao executar operação');
  }
}
```

---

## 🔄 Migração do Código Antigo

### **Antes (usando api.js diretamente):**
```javascript
import { listarResidentes, criarResidente } from '../api/api';

const residentes = await listarResidentes();
const novo = await criarResidente(dados);
```

### **Depois (usando services):**
```javascript
import residenteService from '../services/residenteService';

const residentes = await residenteService.listarAtivos();
const novo = await residenteService.criar(dados);
```

---

## 📝 Convenções

1. **Nome das funções**: Use verbos descritivos
   - `criar`, `listar`, `buscar`, `atualizar`, `deletar`
   
2. **Retorno**: Sempre retorne os dados ou lance erro
   
3. **Async/Await**: Todas as funções são assíncronas
   
4. **Try/Catch**: Sempre use nos componentes

5. **Documentação**: Todas as funções estão documentadas com JSDoc

---

## 🚀 Próximos Passos

1. **Migrar componentes** para usar os services
2. **Remover** chamadas diretas ao `api.js` dos componentes
3. **Testar** todas as funcionalidades
4. **Adicionar** novos métodos conforme necessário

---

## 💡 Dicas

- Use `async/await` em vez de `.then()/.catch()`
- Sempre valide dados antes de enviar
- Exiba feedback visual (loading, mensagens)
- Teste cada operação isoladamente
- Mantenha os services **simples e focados**

---

## 📞 Funções Disponíveis

### **Residente Service**
- `criar(dados)`
- `listarAtivos()`
- `listarTodos()`
- `listarInativos()`
- `buscarPorId(id)`
- `buscarPorCpf(cpf)`
- `atualizar(id, dados)`
- `deletar(id)`
- `reativar(id)`
- `validarCpfUnico(cpf, idExcluir)`
- `validarRgUnico(rg, idExcluir)`
- `obterEstatisticas()`

### **Profissional Service**
- `criar(dados)`
- `listarAtivos()`
- `listarTodos()`
- `listarInativos()`
- `buscarPorId(id)`
- `buscarPorCpf(cpf)`
- `buscarPorEspecialidade(especialidade)`
- `atualizar(id, dados)`
- `deletar(id)`
- `reativar(id)`
- `listarEspecialidades()`
- `validarCpfUnico(cpf, idExcluir)`
- `validarRgUnico(rg, idExcluir)`
- `obterEstatisticas()`

### **Agendamento Service**
- `criar(dados)`
- `listar()`
- `buscarPorId(id)`
- `buscarPorResidente(residenteId)`
- `buscarPorProfissional(profissionalId)`
- `buscarPorData(data)`
- `buscarPorPeriodo(dataInicio, dataFim)`
- `buscarPorStatus(status)`
- `atualizar(id, dados)`
- `atualizarStatus(id, status)`
- `confirmar(id)`
- `cancelar(id, motivo)`
- `marcarRealizado(id)`
- `deletar(id)`
- `verificarDisponibilidade(profissionalId, data, horario, idExcluir)`
- `agendamentosHoje()`
- `proximosAgendamentos()`
- `obterEstatisticas()`

### **Relatório Service**
- `obterEstatisticasGerais()`
- `agendamentosPorPeriodo(dataInicio, dataFim)`
- `agendamentosPorProfissional(profissionalId, dataInicio, dataFim)`
- `agendamentosPorResidente(residenteId, dataInicio, dataFim)`
- `consultasRealizadas(dataInicio, dataFim)`
- `consultasCanceladas(dataInicio, dataFim)`
- `rankingProfissionais(dataInicio, dataFim, limite)`
- `especialidadesMaisProcuradas(dataInicio, dataFim)`
- `taxaComparecimento(dataInicio, dataFim)`
- `horariosDePico(dataInicio, dataFim)`
- `exportarPDF(tipo, filtros)`
- `exportarExcel(tipo, filtros)`
- `baixarArquivo(blob, nomeArquivo)`
- `obterDadosDashboard()`

---

## ✅ Conclusão

A arquitetura com **Services** torna seu código:
- ✅ Mais organizado
- ✅ Mais fácil de manter
- ✅ Mais testável
- ✅ Mais profissional
- ✅ Mais escalável

**Comece a usar hoje mesmo!** 🚀
