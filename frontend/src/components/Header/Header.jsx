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
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-950/90 border-b border-slate-800/50 shadow-2xl shadow-black/20">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      
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
              <div className="hidden sm:flex w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className={`bi ${currentPageInfo.icon} text-amber-400 text-xl relative z-10 group-hover:scale-110 transition-transform`}></i>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                  {currentPageInfo.name}
                </h1>
                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  {currentPageInfo.breadcrumb.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {index > 0 && <i className="bi bi-chevron-right text-[10px] text-slate-600"></i>}
                      <span className={index === currentPageInfo.breadcrumb.length - 1 ? 'text-amber-400 font-semibold' : 'hover:text-slate-300 transition-colors cursor-default'}>
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
            <div className="hidden xl:flex items-center gap-3 px-4 py-2.5 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-800/60 hover:border-slate-700/80 transition-all shadow-lg shadow-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <i className="bi bi-calendar3 text-amber-400 text-sm"></i>
                </div>
                <span className="text-sm text-slate-200 font-medium capitalize tracking-wide">{formatDate(currentTime)}</span>
              </div>
              <div className="w-px h-5 bg-slate-800"></div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <i className="bi bi-clock text-blue-400 text-sm"></i>
                </div>
                <span className="text-sm text-slate-200 font-semibold tabular-nums tracking-wider">{formatTime(currentTime)}</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="user-menu-container relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-900/60 transition-all duration-200 border border-slate-800/60 hover:border-amber-500/30 active:scale-95 group shadow-lg shadow-black/5"
                aria-label="Menu do usuário"
              >
                <div className="hidden xl:flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xs text-slate-500 font-medium">{getGreeting()},</span>
                      <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors capitalize">
                        {user?.email?.split('@')[0] || 'Usuário'}
                      </p>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
                        <i className="bi bi-shield-check text-xs"></i>
                        {user?.tipo || 'user'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20 group-hover:ring-amber-500/50 group-hover:shadow-amber-500/40 transition-all duration-200">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-lg shadow-emerald-500/30"></div>
                </div>
                <i className={`bi bi-chevron-down text-slate-400 text-xs group-hover:text-amber-400 transition-all duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-72 bg-slate-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden z-50 animate-fade-in">
                  {/* User Info */}
                  <div className="px-4 py-4 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border-b border-slate-800/80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/50"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate capitalize mb-0.5 tracking-tight">
                          {user?.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mb-1.5 font-medium">{user?.email || 'email@exemplo.com'}</p>
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-400 border border-amber-500/40 capitalize">
                          <i className="bi bi-shield-check mr-1 text-xs"></i>
                          {user?.tipo || 'Usuário'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                      <div className="flex-1 px-2.5 py-2 bg-slate-950/60 backdrop-blur-sm rounded-lg border border-slate-800/60">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 font-bold">Status</p>
                        <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></span>
                          Online
                        </p>
                      </div>
                      <div className="flex-1 px-2.5 py-2 bg-slate-950/60 backdrop-blur-sm rounded-lg border border-slate-800/60">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5 font-bold">Sessão</p>
                        <p className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                          <i className="bi bi-shield-check text-xs"></i>
                          Ativa
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 rounded-lg flex items-center justify-between font-bold group border border-transparent hover:border-red-500/30"
                    >
                      <span className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all border border-red-500/20 group-hover:border-red-500/40">
                          <i className="bi bi-box-arrow-right text-base group-hover:scale-110 transition-transform"></i>
                        </div>
                        <span className="text-sm">Sair do Sistema</span>
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