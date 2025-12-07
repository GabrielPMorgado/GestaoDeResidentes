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
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6">
            {/* Header com gradiente */}
            <div className="mb-6 sm:mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
                <i className="bi bi-house-heart text-3xl sm:text-4xl text-white"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 px-4">
                Sistema de Gerenciamento
              </h1>
              <p className="text-slate-400 text-sm sm:text-base md:text-lg px-4">
                Painel completo para gestão de residentes, profissionais e agendamentos
              </p>
            </div>

            {/* Estatísticas com Tailwind */}
            {loadingStats ? (
              <LoadingSpinner size="lg" text="Carregando estatísticas..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Card Residentes */}
                <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                        <i className="bi bi-people-fill text-2xl sm:text-3xl text-white"></i>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-blue-200 bg-blue-800/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        Ativos
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{state.stats.totalResidentes}</h3>
                    <p className="text-blue-100 font-medium text-sm sm:text-base">Residentes</p>
                  </div>
                </div>

                {/* Card Profissionais */}
                <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                        <i className="bi bi-person-badge-fill text-2xl sm:text-3xl text-white"></i>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-emerald-200 bg-emerald-800/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        Ativos
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{state.stats.totalProfissionais}</h3>
                    <p className="text-emerald-100 font-medium text-sm sm:text-base">Profissionais</p>
                  </div>
                </div>

                {/* Card Agendamentos Hoje */}
                <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                        <i className="bi bi-calendar-check-fill text-2xl sm:text-3xl text-white"></i>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-amber-200 bg-amber-800/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        Hoje
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{state.stats.agendamentosHoje}</h3>
                    <p className="text-amber-100 font-medium text-sm sm:text-base">Agendamentos</p>
                  </div>
                </div>

                {/* Card Total Agendamentos */}
                <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                        <i className="bi bi-clock-history text-2xl sm:text-3xl text-white"></i>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-purple-200 bg-purple-800/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        Total
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{state.stats.totalAgendamentos}</h3>
                    <p className="text-purple-100 font-medium text-sm sm:text-base">Registros</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ações Rápidas com Tailwind */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center px-2 sm:px-0">
                <i className="bi bi-lightning-charge-fill text-yellow-400 mr-2 sm:mr-3 text-xl sm:text-2xl"></i>
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <button 
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 sm:p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
                  onClick={() => actions.setCurrentPage('cadastro-residentes')}
                >
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                    <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-person-plus-fill text-2xl sm:text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 text-sm sm:text-base font-semibold group-hover:text-white">Novo Residente</span>
                  </div>
                </button>

                <button 
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 sm:p-6 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95"
                  onClick={() => actions.setCurrentPage('cadastro-profissionais')}
                >
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                    <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-person-badge text-2xl sm:text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 text-sm sm:text-base font-semibold group-hover:text-white">Novo Profissional</span>
                  </div>
                </button>

                <button 
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 sm:p-6 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 active:scale-95"
                  onClick={() => actions.setCurrentPage('cadastro-agendamento')}
                >
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                    <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-calendar-plus text-2xl sm:text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 text-sm sm:text-base font-semibold group-hover:text-white">Novo Agendamento</span>
                  </div>
                </button>

                <button 
                  className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 sm:p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 active:scale-95"
                  onClick={() => actions.setCurrentPage('dashboard-analytics')}
                >
                  <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                    <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-graph-up text-2xl sm:text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 text-sm sm:text-base font-semibold group-hover:text-white">Ver Relatórios</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        setCurrentPage={actions.setCurrentPage}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          currentPage={state.currentPage}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 md:p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppContent
