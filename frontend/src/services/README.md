# 📦 Services

Camada de serviços da aplicação que centraliza toda a lógica de comunicação com a API.

## 📂 Estrutura

```
services/
├── index.js              # Exportações centralizadas
├── residenteService.js   # Gerenciamento de residentes
├── profissionalService.js# Gerenciamento de profissionais
├── agendamentoService.js # Gerenciamento de agendamentos
└── relatorioService.js   # Relatórios e estatísticas
```

## 🚀 Uso Rápido

```javascript
// Importar service específico
import residenteService from '../services/residenteService';

// Ou importar múltiplos services
import { 
  residenteService,
  profissionalService,
  agendamentoService 
} from '../services';

// Usar no componente
const residentes = await residenteService.listarAtivos();
const novoResidente = await residenteService.criar(dados);
```

## ✅ Benefícios

- ✅ **Código organizado** e fácil de manter
- ✅ **Reutilização** de funções em múltiplos componentes
- ✅ **Tratamento de erros** centralizado
- ✅ **Fácil de testar** e documentar
- ✅ **Separação de responsabilidades**

## 📖 Documentação Completa

Consulte o [GUIA_SERVICES.md](../GUIA_SERVICES.md) para exemplos detalhados e todas as funcionalidades disponíveis.

## 🔧 Configuração do Axios

A configuração do Axios está em `../api/axios.js` e inclui:

- Interceptors para requisições e respostas
- Tratamento de erros global
- Timeout configurado
- Headers padrão

## 💡 Exemplo Prático

```javascript
import React, { useState, useEffect } from 'react';
import residenteService from '../services/residenteService';

function MeuComponente() {
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await residenteService.listarAtivos();
      setResidentes(dados);
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? <p>Carregando...</p> : (
        <ul>
          {residentes.map(r => (
            <li key={r.id}>{r.nome}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 🛠️ Desenvolvimento

### Adicionar Novo Service

1. Crie o arquivo `nomeService.js`
2. Importe o axios configurado: `import api from '../api/axios';`
3. Crie as funções necessárias
4. Exporte o objeto service
5. Adicione ao `index.js`

### Template Básico

```javascript
import api from '../api/axios';

const meuService = {
  listar: async () => {
    try {
      const response = await api.get('/endpoint');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  criar: async (dados) => {
    try {
      const response = await api.post('/endpoint', dados);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default meuService;
```

## 📞 Suporte

Consulte a documentação completa em `GUIA_SERVICES.md` para mais detalhes sobre cada service e suas funcionalidades.
