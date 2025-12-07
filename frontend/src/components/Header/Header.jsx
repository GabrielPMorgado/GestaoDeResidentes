import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function Header({ toggleSidebar, currentPage }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const pageNames = {
    'dashboard': 'Página Inicial',
    'cadastro-residentes': 'Cadastro de Residentes',
    'cadastro-profissionais': 'Cadastro de Profissionais',
    'cadastro-agendamento': 'Novo Agendamento',
    'listagem-residentes': 'Residentes',
    'listagem-profissionais': 'Profissionais',
    'listagem-agendamentos': 'Agendamentos',
    'residentes-inativos': 'Residentes Inativos',
    'profissionais-inativos': 'Profissionais Inativos',
    'historico-consultas': 'Histórico de Consultas',
    'relatorios': 'Relatórios',
    'dashboard-analytics': 'Analytics',
    'gestao-financeira': 'Gestão Financeira'
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-slate-900/95 border-b border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white active:scale-95"
            aria-label="Toggle menu"
          >
            <i className="bi bi-list text-xl sm:text-2xl"></i>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">SR</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[150px] md:max-w-none">
                {pageNames[currentPage] || 'Sistema'}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden md:block">Gestão de Residentes</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-700 hover:opacity-80 transition-opacity active:scale-95"
              aria-label="Menu do usuário"
            >
              <div className="hidden md:block text-right">
                <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] capitalize">{user?.tipo || 'Usuário'}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[120px]">{user?.email || 'email@exemplo.com'}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50 animate-fade-in">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-700">
                    <p className="text-xs sm:text-sm font-medium text-white truncate capitalize">{user?.tipo || 'Usuário'}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate">{user?.email || 'email@exemplo.com'}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header