# Frontend - Sistema de Gestão

Sistema de gestão para residenciais com React, Vite e Bootstrap.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Arquitetura](#arquitetura)
- [Componentes](#componentes)
- [Hooks Customizados](#hooks-customizados)
- [Boas Práticas](#boas-práticas)

## 🚀 Tecnologias

- **React 19.2.0** - Biblioteca para interfaces
- **Vite 7.1.7** - Build tool e dev server
- **Bootstrap 5.3.8** - Framework CSS
- **Axios 1.13.1** - Cliente HTTP
- **Chart.js 4.5.1** - Gráficos e visualizações
- **React Router** - Roteamento (client-side)

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── api/              # Configuração do Axios
│   │   ├── axios.js      # Instância e interceptors
│   │   └── api.js        # Endpoints base
│   ├── components/       # Componentes React
│   │   ├── Common/       # Componentes reutilizáveis
│   │   ├── Cadastros/    # Formulários de cadastro
│   │   ├── Listagens/    # Listagens e tabelas
│   │   ├── Financeiro/   # Gestão financeira
│   │   ├── Relatorios/   # Relatórios e dashboards
│   │   └── ErrorBoundary/ # Error handling
│   ├── contexts/         # Context API
│   │   ├── AppContext.jsx
│   │   └── NotificationContext.jsx
│   ├── hooks/            # Custom hooks
│   │   └── index.js      # useLoading, useDebounce, etc
│   ├── hoc/              # Higher Order Components
│   │   └── index.jsx     # withMemo, lazyLoad, etc
│   ├── services/         # Lógica de negócio
│   │   ├── residenteService.js
│   │   ├── profissionalService.js
│   │   └── agendamentoService.js
│   ├── utils/            # Utilitários
│   │   ├── validators.js # Validações (CPF, email, etc)
│   │   ├── formatters.js # Formatação de dados
│   │   ├── logger.js     # Sistema de logs
│   │   └── errorHandler.js # Tratamento de erros
│   ├── config/           # Configurações
│   │   └── config.js     # Constantes da aplicação
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Entry point
├── public/               # Assets estáticos
├── index.html            # HTML template
├── vite.config.js        # Configuração do Vite
└── package.json          # Dependências
```

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

## 💻 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Lint
npm run lint
```

O aplicativo estará disponível em `http://localhost:5173`

## 🏗️ Arquitetura

### Context API

Gerenciamento de estado global usando Context API:

```jsx
// AppContext - Estado da aplicação
const { state, actions } = useApp();

// NotificationContext - Sistema de notificações
const { success, error, warning, info } = useNotification();
```

### Services Layer

Camada de serviços para comunicação com API:

```jsx
import { residenteService } from './services';

const residentes = await residenteService.listar();
const residente = await residenteService.buscarPorId(id);
await residenteService.criar(dados);
```

### Error Handling

Sistema robusto de tratamento de erros:

- **Error Boundary**: Captura erros de renderização
- **Axios Interceptors**: Tratamento automático de erros HTTP
- **Error Handler Utility**: Funções para tratamento consistente

## 🧩 Componentes

### Componentes Comuns

```jsx
import {
  LoadingSpinner,
  EmptyState,
  ErrorMessage,
  ConfirmModal,
  StatusBadge,
  Card,
  Pagination
} from './components/Common';

// Loading
<LoadingSpinner size="lg" text="Carregando dados..." />

// Empty State
<EmptyState 
  icon="bi-inbox"
  title="Nenhum registro"
  action={<button>Adicionar</button>}
/>

// Confirmação
<ConfirmModal
  isOpen={showModal}
  title="Excluir residente?"
  onConfirm={handleDelete}
  onClose={closeModal}
/>
```

### Notificações (Toast)

```jsx
const { success, error } = useNotification();

// Exibir notificações
success('Dados salvos com sucesso!');
error('Erro ao salvar dados');
warning('Atenção: verifique os campos');
info('Informação importante');
```

## 🪝 Hooks Customizados

### useLoading

```jsx
const { loading, startLoading, stopLoading } = useLoading();

const fetchData = async () => {
  startLoading();
  try {
    const data = await api.get('/endpoint');
  } finally {
    stopLoading();
  }
};
```

### useDebounce

```jsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // Executa busca apenas após 500ms sem digitação
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

### useForm

```jsx
const validationRules = {
  nome: (value) => !value ? 'Nome obrigatório' : null,
  cpf: (value) => !validarCPF(value) ? 'CPF inválido' : null
};

const { values, errors, handleChange, validateAll } = useForm(
  initialValues,
  validationRules
);

const handleSubmit = (e) => {
  e.preventDefault();
  if (validateAll()) {
    // Enviar dados
  }
};
```

### usePagination

```jsx
const {
  currentPage,
  totalPages,
  currentData,
  nextPage,
  prevPage,
  goToPage
} = usePagination(data, 10);

return (
  <>
    <Lista items={currentData} />
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={goToPage}
    />
  </>
);
```

### useModal

```jsx
const { isOpen, open, close } = useModal();

return (
  <>
    <button onClick={open}>Abrir Modal</button>
    {isOpen && <Modal onClose={close}>Conteúdo</Modal>}
  </>
);
```

### useFetch

```jsx
const { data, loading, error, refetch } = useFetch(
  () => api.get('/residentes'),
  []
);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} onRetry={refetch} />;
return <Lista items={data} />;
```

### useLocalStorage

```jsx
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');

// Salvar
setTheme('dark');

// Remover
removeTheme();
```

### useClickOutside

```jsx
const ref = useClickOutside(() => {
  console.log('Clicou fora!');
});

return <div ref={ref}>Conteúdo</div>;
```

## ✨ Boas Práticas

### 1. Organização de Componentes

```jsx
// Imports
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

// Component
const MeuComponente = ({ prop1, prop2 }) => {
  // Hooks
  const { state, actions } = useApp();
  const [localState, setLocalState] = useState(null);

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MeuComponente;
```

### 2. Performance

```jsx
import React, { memo, useMemo, useCallback } from 'react';

// Memoização de componente
const ListaItem = memo(({ item, onSelect }) => {
  return <div onClick={() => onSelect(item)}>{item.nome}</div>;
});

// No componente pai
const Lista = ({ items }) => {
  // Memoizar callbacks
  const handleSelect = useCallback((item) => {
    console.log(item);
  }, []);

  // Memoizar valores computados
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [items]);

  return sortedItems.map(item => (
    <ListaItem key={item.id} item={item} onSelect={handleSelect} />
  ));
};
```

### 3. Tratamento de Erros

```jsx
import { handleError } from '../utils/errorHandler';

const MyComponent = () => {
  const { error: showError } = useNotification();

  const fetchData = async () => {
    try {
      const data = await api.get('/endpoint');
      return data;
    } catch (err) {
      const message = handleError(err);
      showError(message);
    }
  };
};
```

### 4. Validação de Formulários

```jsx
import { validarCPF, validarEmail } from '../utils/validators';

const validationRules = {
  nome: (value) => {
    if (!value) return 'Nome é obrigatório';
    if (value.length < 3) return 'Mínimo 3 caracteres';
    return null;
  },
  cpf: (value) => {
    if (!value) return 'CPF é obrigatório';
    if (!validarCPF(value)) return 'CPF inválido';
    return null;
  },
  email: (value) => {
    if (!value) return 'E-mail é obrigatório';
    if (!validarEmail(value)) return 'E-mail inválido';
    return null;
  }
};
```

### 5. Lazy Loading

```jsx
import { lazyLoad } from '../hoc';

// Lazy load de componentes
const CadastroResidente = lazyLoad(
  () => import('./components/Cadastros/CadastroResidentes')
);

const ListagemResidentes = lazyLoad(
  () => import('./components/Listagens/ListagemResidentes')
);
```

## 📊 Configurações

Todas as configurações estão centralizadas em `src/config/config.js`:

```javascript
import config from './config/config';

// API
config.api.baseURL
config.api.timeout

// Mensagens
config.messages.success.save
config.messages.error.network

// Status
config.status.residente
config.status.agendamento

// Cores
config.colors.primary
config.colors.success
```

## 🔐 Segurança

- **Validação de inputs**: Todos os campos são validados
- **Sanitização**: Dados sanitizados antes de enviar
- **CORS**: Configurado no backend
- **XSS Protection**: React protege por padrão
- **HTTPS**: Recomendado em produção

## 📱 Responsividade

O sistema usa Bootstrap 5 e é totalmente responsivo:

- Mobile: < 576px
- Tablet: 576px - 992px
- Desktop: > 992px

## 🎨 Temas e Estilos

- Bootstrap 5.3.8 como base
- Variáveis CSS customizadas
- Ícones: Bootstrap Icons
- Cores definidas em `config.js`

## 🐛 Debug

```javascript
import logger from './utils/logger';

// Diferentes níveis de log
logger.info('Informação');
logger.warn('Aviso');
logger.error('Erro', { contexto: 'dados' });
logger.debug('Debug (apenas em dev)');
```

## 📦 Build e Deploy

```bash
# Build de produção
npm run build

# Os arquivos otimizados estarão em dist/
# Fazer deploy da pasta dist/ para seu servidor
```

## 🤝 Contribuindo

1. Siga o padrão de código estabelecido
2. Use os hooks customizados quando apropriado
3. Adicione tratamento de erros
4. Teste em diferentes navegadores
5. Mantenha a documentação atualizada

## 📄 Licença

Este projeto é privado e proprietário.
