import { useEffect, useCallback } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useApp } from './contexts/AppContext'
import { useNotification } from './contexts/NotificationContext'
import { useLoading } from './hooks'
import Login from './components/Login/Login'
import PrivateRoute from './components/PrivateRoute'
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
import PainelProfissional from './components/Profissional/PainelProfissional'
import { residenteService, profissionalService, agendamentoService } from './services'
import { LoadingSpinner } from './components/Common'

function AppContent() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const { state, actions } = useApp()
  const { error: showError } = useNotification()
  const { loading, startLoading, stopLoading } = useLoading()

  // Se o usuário é profissional e não está na página certa, redirecionar
  useEffect(() => {
    if (isAuthenticated() && !isAdmin() && state.currentPage !== 'painel-profissional') {
      actions.setCurrentPage('painel-profissional')
    }
  }, [isAuthenticated, isAdmin, state.currentPage, actions])

  const carregarEstatisticas = useCallback(async () => {
    startLoading()
    try {
      const [residentes, profissionais, agendamentos] = await Promise.all([
        residenteService.listarAtivos(),
        profissionalService.listarAtivos(),
        agendamentoService.listar()
      ])

      const hoje = new Date().toISOString().split('T')[0]
      
      // Garantir que agendamentos é um array
      let listaAgendamentos = []
      
      if (Array.isArray(agendamentos)) {
        listaAgendamentos = agendamentos
      } else if (agendamentos?.data) {
        if (Array.isArray(agendamentos.data)) {
          listaAgendamentos = agendamentos.data
        } else if (agendamentos.data.agendamentos && Array.isArray(agendamentos.data.agendamentos)) {
          listaAgendamentos = agendamentos.data.agendamentos
        }
      }
      
      const agendamentosHoje = listaAgendamentos.filter(ag => ag.data === hoje)

      actions.setStats({
        totalResidentes: residentes.length,
        totalProfissionais: profissionais.length,
        totalAgendamentos: listaAgendamentos.length,
        agendamentosHoje: agendamentosHoje.length
      })
    } catch {
      showError('Erro ao carregar estatísticas')
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading, showError, actions])

  useEffect(() => {
    if (state.currentPage === 'dashboard') {
      carregarEstatisticas()
    }
  }, [state.currentPage, carregarEstatisticas])

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated()) {
    return <Login />
  }

  const renderPage = () => {
    // Se é profissional, mostrar apenas painel de agendamentos
    if (!isAdmin()) {
      return <PainelProfissional />
    }

    // Rotas para admin
    switch(state.currentPage) {
      case 'gerenciar-acessos':
        return <GerenciarAcessos />
      case 'painel-profissional':
        return <PainelProfissional />
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
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header com gradiente */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
                <i className="bi bi-house-heart text-4xl text-white"></i>
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                Sistema de Gerenciamento
              </h1>
              <p className="text-slate-400 text-lg">
                Painel completo para gestão de residentes, profissionais e agendamentos
              </p>
            </div>

            {/* Estatísticas com Tailwind */}
            {loading ? (
              <LoadingSpinner size="lg" text="Carregando estatísticas..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card Residentes */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <i className="bi bi-people-fill text-3xl text-white"></i>
                      </div>
                      <span className="text-xs font-semibold text-blue-200 bg-blue-800/50 px-3 py-1 rounded-full">
                        Ativos
                      </span>
                    </div>
                    <h3 className="text-5xl font-bold text-white mb-2">{state.stats.totalResidentes}</h3>
                    <p className="text-blue-100 font-medium">Residentes</p>
                  </div>
                </div>

                {/* Card Profissionais */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <i className="bi bi-person-badge-fill text-3xl text-white"></i>
                      </div>
                      <span className="text-xs font-semibold text-emerald-200 bg-emerald-800/50 px-3 py-1 rounded-full">
                        Ativos
                      </span>
                    </div>
                    <h3 className="text-5xl font-bold text-white mb-2">{state.stats.totalProfissionais}</h3>
                    <p className="text-emerald-100 font-medium">Profissionais</p>
                  </div>
                </div>

                {/* Card Agendamentos Hoje */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <i className="bi bi-calendar-check-fill text-3xl text-white"></i>
                      </div>
                      <span className="text-xs font-semibold text-amber-200 bg-amber-800/50 px-3 py-1 rounded-full">
                        Hoje
                      </span>
                    </div>
                    <h3 className="text-5xl font-bold text-white mb-2">{state.stats.agendamentosHoje}</h3>
                    <p className="text-amber-100 font-medium">Agendamentos</p>
                  </div>
                </div>

                {/* Card Total Agendamentos */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <i className="bi bi-clock-history text-3xl text-white"></i>
                      </div>
                      <span className="text-xs font-semibold text-purple-200 bg-purple-800/50 px-3 py-1 rounded-full">
                        Total
                      </span>
                    </div>
                    <h3 className="text-5xl font-bold text-white mb-2">{state.stats.totalAgendamentos}</h3>
                    <p className="text-purple-100 font-medium">Registros</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ações Rápidas com Tailwind */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="bi bi-lightning-charge-fill text-yellow-400 mr-3"></i>
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
                  onClick={() => actions.setCurrentPage('cadastro-residentes')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-person-plus-fill text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 font-semibold group-hover:text-white">Novo Residente</span>
                  </div>
                </button>

                <button 
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20"
                  onClick={() => actions.setCurrentPage('cadastro-profissionais')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-person-badge text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 font-semibold group-hover:text-white">Novo Profissional</span>
                  </div>
                </button>

                <button 
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20"
                  onClick={() => actions.setCurrentPage('cadastro-agendamento')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-calendar-plus text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 font-semibold group-hover:text-white">Novo Agendamento</span>
                  </div>
                </button>

                <button 
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
                  onClick={() => actions.setCurrentPage('dashboard-analytics')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                      <i className="bi bi-graph-up text-3xl text-white"></i>
                    </div>
                    <span className="text-slate-200 font-semibold group-hover:text-white">Ver Relatórios</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar 
        isOpen={state.sidebarOpen} 
        setIsOpen={actions.setSidebar}
        setCurrentPage={actions.setCurrentPage}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${state.sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header 
          toggleSidebar={() => actions.setSidebar(!state.sidebarOpen)} 
          currentPage={state.currentPage}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppContent
