import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'

function Header({ toggleSidebar, currentPage }) {
  const { user, logout } = useAuth()
  const { actions } = useApp()
  const [showUserMenu, setShowUserMenu] = useState(false)
  // ...existing code...

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

  // ...existing code...

  const getGreeting = () => {
    const hour = new Date().getHours()
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
            {/* ...existing code... */}

            {/* User Menu */}
            <div className="user-menu-container relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 border border-slate-700/50 hover:border-slate-600"
                aria-label="Menu do usuário"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <i className={`bi bi-chevron-down text-slate-400 text-xs transition-all duration-200 ${showUserMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-700/50 overflow-hidden z-50 animate-fade-in">
                  {/* User Info */}
                  <div className="px-3 py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate capitalize">
                          {user?.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || 'email@exemplo.com'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 capitalize">
                      <i className="bi bi-shield-check text-xs"></i>
                      {user?.tipo || 'Usuário'}
                    </span>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        actions.setCurrentPage('trocar-senha')
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200 rounded-lg flex items-center gap-2.5 font-medium"
                    >
                      <i className="bi bi-key text-blue-400 text-sm"></i>
                      <span>Trocar Senha</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800/60 hover:text-red-400 transition-all duration-200 rounded-lg flex items-center gap-2.5 font-medium"
                    >
                      <i className="bi bi-box-arrow-right text-red-400 text-sm"></i>
                      <span>Sair do Sistema</span>
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