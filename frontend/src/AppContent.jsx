import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useApp } from './contexts/AppContext'
import { useNotification } from './contexts/NotificationContext'
import { useEstatisticas } from './hooks'
import Login from './components/Login/Login'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import CadastroResidentes from './components/Cadastros/CadastroResidentes'
import CadastroProfissionais from './components/Cadastros/CadastroProfissionais'
import CadastroAgendamento from './components/Cadastros/CadastroAgendamento'
import ListagemResidentes from './components/Listagens/ListagemResidentes'
import ListagemProfissionais from './components/Listagens/ListagemProfissionais'
import ListagemAgendamentos from './components/Listagens/ListagemAgendamentos'
import ResidentesInativos from './components/Listagens/ResidentesInativos'
import ProfissionaisInativos from './components/Listagens/ProfissionaisInativos'
import HistoricoConsultasResidente from './components/Listagens/HistoricoConsultasResidente'
import Relatorios from './components/Relatorios/Relatorios'
import Dashboard from './components/Dashboard/Dashboard'
import GestaoFinanceira from './components/Financeiro/GestaoFinanceira'
import GerenciarAcessos from './components/Admin/GerenciarAcessos'
import PacientesAgendados from './components/Atendimento/PacientesAgendados'
import RegistroClinico from './components/Atendimento/RegistroClinico'
import { LoadingSpinner } from './components/Common'

function AppContent() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const { state, actions } = useApp()
  const { error: showError } = useNotification()
  const [agendamentoAtual, setAgendamentoAtual] = useState(null)
  // Sidebar sempre aberto no desktop, fechado no mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)

  // Hook de estatísticas com cache automático
  const { data: estatisticas, isLoading: loadingStats } = useEstatisticas()

  useEffect(() => {
    if (!isAuthenticated()) return
    
    if (state.currentPage === 'dashboard') {
      if (user?.tipo === 'recepcionista') {
        actions.setCurrentPage('dashboard-recepcionista')
      } else if (user?.tipo === 'profissional') {
        actions.setCurrentPage('pacientes-agendados')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.tipo, state.currentPage])

  // Atualizar estatísticas no contexto quando carregadas
  useEffect(() => {
    if (estatisticas && isAdmin()) {
      actions.setStats(estatisticas)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estatisticas])

  // Fechar sidebar no mobile ao mudar de página
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [state.currentPage])

  // Gerenciar responsividade do sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated()) {
    return <Login />
  }

  const renderPage = () => {
    // Rotas para recepcionistas
    if (!isAdmin() && user?.tipo === 'recepcionista') {
      switch(state.currentPage) {
        case 'cadastro-agendamento':
          return <CadastroAgendamento />
        case 'listagem-agendamentos':
          return <ListagemAgendamentos />
        case 'dashboard-recepcionista':
        default:
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                    <i className="bi bi-calendar-check text-4xl text-white"></i>
                  </div>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                    Recepção
                  </h1>
                  <p className="text-slate-400 text-lg">
                    Gerenciamento de Agendamentos
                  </p>
                </div>

                {/* Cards de Ação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <button 
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-600 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => actions.setCurrentPage('cadastro-agendamento')}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-5 rounded-full bg-white/20 backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
                        <i className="bi bi-calendar-plus text-5xl text-white"></i>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Novo Agendamento</h3>
                        <p className="text-emerald-100">Agendar nova consulta ou procedimento</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => actions.setCurrentPage('listagem-agendamentos')}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-5 rounded-full bg-white/20 backdrop-blur-xl group-hover:scale-110 transition-transform duration-300">
                        <i className="bi bi-calendar-event text-5xl text-white"></i>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Ver Agendamentos</h3>
                        <p className="text-blue-100">Consultar e gerenciar agendamentos</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Informações Rápidas */}
                <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="bi bi-info-circle text-cyan-400"></i>
                    Atalhos de Teclado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 text-slate-300">
                      <kbd className="px-3 py-1 bg-slate-700 rounded border border-slate-600 font-mono">Ctrl+N</kbd>
                      <span>Novo Agendamento</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <kbd className="px-3 py-1 bg-slate-700 rounded border border-slate-600 font-mono">Ctrl+L</kbd>
                      <span>Listar Agendamentos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
      }
    }

    // Rotas para profissionais
    if (!isAdmin() && user?.tipo === 'profissional') {
      // Se está em modo de registro clínico
      if (agendamentoAtual) {
        return (
          <RegistroClinico 
            agendamento={agendamentoAtual}
            onVoltar={() => setAgendamentoAtual(null)}
            onFinalizar={() => {
              setAgendamentoAtual(null)
              actions.setCurrentPage('pacientes-agendados')
            }}
          />
        )
      }

      // Páginas de profissional
      switch(state.currentPage) {
        case 'pacientes-agendados':
          return <PacientesAgendados onIniciarAtendimento={setAgendamentoAtual} />
        case 'historico-atendimentos':
          return <HistoricoConsultasResidente 
            residenteId={null}
            residenteNome="Meus Atendimentos"
            onVoltar={() => actions.setCurrentPage('pacientes-agendados')}
          />
        default:
          return <PacientesAgendados onIniciarAtendimento={setAgendamentoAtual} />
      }
    }

    // Rotas para admin
    switch(state.currentPage) {
      case 'gerenciar-acessos':
        return <GerenciarAcessos />
      case 'cadastro-residentes':
        return <CadastroResidentes />
      case 'cadastro-profissionais':
        return <CadastroProfissionais />
      case 'cadastro-agendamento':
        return <CadastroAgendamento />
      case 'listagem-residentes':
        return <ListagemResidentes onVerHistorico={(residente) => {
          actions.setResidenteHistorico(residente)
          actions.setCurrentPage('historico-consultas')
        }} />
      case 'listagem-profissionais':
        return <ListagemProfissionais />
      case 'listagem-agendamentos':
        return <ListagemAgendamentos />
      case 'residentes-inativos':
        return <ResidentesInativos />
      case 'profissionais-inativos':
        return <ProfissionaisInativos />
      case 'historico-consultas':
        return state.residenteHistorico ? (
          <HistoricoConsultasResidente 
            residenteId={state.residenteHistorico.id}
            residenteNome={state.residenteHistorico.nome_completo}
            onVoltar={() => actions.setCurrentPage('listagem-residentes')}
          />
        ) : <ListagemResidentes />
      case 'relatorios':
        return <Relatorios />
      case 'dashboard-analytics':
        return <Dashboard />
      case 'gestao-financeira':
        return <GestaoFinanceira />
      case 'dashboard':
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-800/50 mb-8">
              <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:32px_32px]"></div>
              <div className="relative px-4 sm:px-6 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto text-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
                    Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">Sistema</span>
                  </h1>
                  <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                    Gestão completa de residentes, profissionais e agendamentos em um único lugar
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
              {/* Estatísticas */}
              {loadingStats ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" text="Carregando estatísticas..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
                  {/* Card Residentes */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-6 transition-all duration-300 hover:scale-105 hover:border-blue-500/50">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <i className="bi bi-people-fill text-3xl text-blue-400"></i>
                          </div>
                          <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                            Ativos
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{state.stats.totalResidentes}</h3>
                        <p className="text-slate-400 font-medium">Residentes</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Profissionais */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-6 transition-all duration-300 hover:scale-105 hover:border-emerald-500/50">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <i className="bi bi-person-badge-fill text-3xl text-emerald-400"></i>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            Ativos
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{state.stats.totalProfissionais}</h3>
                        <p className="text-slate-400 font-medium">Profissionais</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Agendamentos Hoje */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-6 transition-all duration-300 hover:scale-105 hover:border-amber-500/50">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <i className="bi bi-calendar-check-fill text-3xl text-amber-400"></i>
                          </div>
                          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                            Hoje
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{state.stats.agendamentosHoje}</h3>
                        <p className="text-slate-400 font-medium">Agendamentos</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Total Registros */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-500/50">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <i className="bi bi-clock-history text-3xl text-purple-400"></i>
                          </div>
                          <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                            Total
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{state.stats.totalAgendamentos}</h3>
                        <p className="text-slate-400 font-medium">Registros</p>
                      </div>
                    </div>
                  </div>
              </div>
            )}

              {/* Ações Rápidas */}
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center">
                    <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mr-3"></div>
                    Ações Rápidas
                  </h2>
                  <p className="text-slate-400 ml-7">Acesso direto às funcionalidades principais</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <button 
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/80 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={() => actions.setCurrentPage('cadastro-residentes')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <i className="bi bi-person-plus-fill text-4xl text-blue-400"></i>
                      </div>
                      <div>
                        <span className="text-white text-base font-semibold block mb-1">Novo Residente</span>
                        <span className="text-slate-400 text-sm">Cadastrar novo morador</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={() => actions.setCurrentPage('cadastro-profissionais')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <i className="bi bi-person-badge text-4xl text-emerald-400"></i>
                      </div>
                      <div>
                        <span className="text-white text-base font-semibold block mb-1">Novo Profissional</span>
                        <span className="text-slate-400 text-sm">Cadastrar funcionário</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/80 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={() => actions.setCurrentPage('cadastro-agendamento')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <i className="bi bi-calendar-plus text-4xl text-amber-400"></i>
                      </div>
                      <div>
                        <span className="text-white text-base font-semibold block mb-1">Novo Agendamento</span>
                        <span className="text-slate-400 text-sm">Agendar consulta</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={() => actions.setCurrentPage('dashboard-analytics')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <i className="bi bi-graph-up text-4xl text-purple-400"></i>
                      </div>
                      <div>
                        <span className="text-white text-base font-semibold block mb-1">Ver Relatórios</span>
                        <span className="text-slate-400 text-sm">Analytics e gráficos</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        setCurrentPage={actions.setCurrentPage}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} ml-0`}>
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          currentPage={state.currentPage}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppContent