import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function Header({ toggleSidebar, currentPage }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pageInfo = {
    'dashboard': { name: 'Dashboard', icon: 'bi-house-door', breadcrumb: ['Início', 'Dashboard'] },
    'cadastro-residentes': { name: 'Cadastro de Residentes', icon: 'bi-person-plus', breadcrumb: ['Cadastros', 'Residentes'] },
    'cadastro-profissionais': { name: 'Cadastro de Profissionais', icon: 'bi-person-badge', breadcrumb: ['Cadastros', 'Profissionais'] },
    'cadastro-agendamento': { name: 'Novo Agendamento', icon: 'bi-calendar-plus', breadcrumb: ['Agendamentos', 'Novo'] },
    'listagem-residentes': { name: 'Residentes', icon: 'bi-people', breadcrumb: ['Listagens', 'Residentes'] },
    'listagem-profissionais': { name: 'Profissionais', icon: 'bi-person-vcard', breadcrumb: ['Listagens', 'Profissionais'] },
    'listagem-agendamentos': { name: 'Agendamentos', icon: 'bi-calendar-event', breadcrumb: ['Agendamentos', 'Consultar'] },
    'residentes-inativos': { name: 'Residentes Inativos', icon: 'bi-person-x', breadcrumb: ['Inativos', 'Residentes'] },
    'profissionais-inativos': { name: 'Profissionais Inativos', icon: 'bi-person-dash', breadcrumb: ['Inativos', 'Profissionais'] },
    'historico-consultas': { name: 'Histórico de Consultas', icon: 'bi-clock-history', breadcrumb: ['Atendimento', 'Histórico'] },
    'relatorios': { name: 'Relatórios', icon: 'bi-file-earmark-bar-graph', breadcrumb: ['Analytics', 'Relatórios'] },
    'dashboard-analytics': { name: 'Analytics', icon: 'bi-speedometer2', breadcrumb: ['Analytics', 'Dashboard'] },
    'gestao-financeira': { name: 'Gestão Financeira', icon: 'bi-currency-dollar', breadcrumb: ['Gestão', 'Financeira'] },
    'gerenciar-acessos': { name: 'Gerenciar Acessos', icon: 'bi-key', breadcrumb: ['Administração', 'Acessos'] },
    'pacientes-agendados': { name: 'Pacientes Agendados', icon: 'bi-calendar2-check', breadcrumb: ['Atendimento', 'Agendados'] },
    'dashboard-recepcionista': { name: 'Recepção', icon: 'bi-calendar-check', breadcrumb: ['Início', 'Recepção'] }
  }

  const currentPageInfo = pageInfo[currentPage] || { name: 'Sistema', icon: 'bi-grid', breadcrumb: ['Início'] }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-slate-800/95 border-b border-slate-700/50 shadow-2xl">
      <div className="px-4 lg:px-6">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-800/50 transition-all text-slate-300 hover:text-amber-400 active:scale-95"
              aria-label="Toggle menu"
            >
              <i className="bi bi-list text-2xl"></i>
            </button>
            
            {/* Page Title with Icon */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                <i className={`bi ${currentPageInfo.icon} text-amber-400 text-xl`}></i>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">
                  {currentPageInfo.name}
                </h1>
                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                  {currentPageInfo.breadcrumb.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {index > 0 && <i className="bi bi-chevron-right text-[10px]"></i>}
                      <span className={index === currentPageInfo.breadcrumb.length - 1 ? 'text-amber-400 font-medium' : ''}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Date & Time */}
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2">
                <i className="bi bi-calendar3 text-amber-400"></i>
                <span className="text-sm text-slate-300 font-medium capitalize">{formatDate(currentTime)}</span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <i className="bi bi-clock text-blue-400"></i>
                <span className="text-sm text-slate-300 font-medium tabular-nums">{formatTime(currentTime)}</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="user-menu-container relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all border border-slate-700/50 hover:border-amber-500/30 active:scale-95 group"
                aria-label="Menu do usuário"
              >
                <div className="hidden xl:block text-right">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-slate-500">{getGreeting()},</span>
                    <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors capitalize">
                      {user?.email?.split('@')[0] || 'Usuário'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                      {user?.tipo || 'user'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <i className="bi bi-chevron-down text-slate-400 text-xs group-hover:text-amber-400 transition-colors hidden sm:block"></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden z-50 animate-fade-in">
                  {/* User Info */}
                  <div className="px-4 py-4 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border-b border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/30">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-white truncate capitalize mb-0.5">
                          {user?.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-400 truncate mb-1">{user?.email || 'email@exemplo.com'}</p>
                        <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 capitalize">
                          <i className="bi bi-shield-check mr-1.5"></i>
                          {user?.tipo || 'Usuário'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Status</p>
                        <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          Online
                        </p>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Sessão</p>
                        <p className="text-xs font-semibold text-blue-400">Ativa</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Actions */}
                  <div className="py-2">
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <i className="bi bi-person-circle text-blue-400"></i>
                      </div>
                      <div>
                        <p className="font-medium">Meu Perfil</p>
                        <p className="text-xs text-slate-500">Visualizar e editar</p>
                      </div>
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        <i className="bi bi-gear text-purple-400"></i>
                      </div>
                      <div>
                        <p className="font-medium">Configurações</p>
                        <p className="text-xs text-slate-500">Preferências do sistema</p>
                      </div>
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <i className="bi bi-question-circle text-amber-400"></i>
                      </div>
                      <div>
                        <p className="font-medium">Ajuda & Suporte</p>
                        <p className="text-xs text-slate-500">Central de ajuda</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-700/50 p-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all rounded-lg flex items-center justify-between font-semibold group"
                    >
                      <span className="flex items-center gap-3">
                        <i className="bi bi-box-arrow-right text-lg"></i>
                        Sair do Sistema
                      </span>
                      <i className="bi bi-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header