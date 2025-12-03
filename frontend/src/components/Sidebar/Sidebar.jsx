import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'

function Sidebar({ isOpen, setIsOpen, setCurrentPage }) {
  const { isAdmin, logout, user } = useAuth()
  const { showSuccess } = useNotification()
  const [activeItem, setActiveItem] = useState('dashboard')
  const [expandedSections, setExpandedSections] = useState({
    cadastros: true,
    listagens: true,
    agendamentos: true,
  })

  const handleNavigation = (page) => {
    setCurrentPage(page)
    setActiveItem(page)
  }

  const handleLogout = () => {
    logout()
    showSuccess('Logout realizado com sucesso!')
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const menuSections = [
    {
      id: 'main',
      items: [
        { id: 'dashboard', label: 'Dashboard', page: 'dashboard' }
      ]
    },
    {
      id: 'cadastros',
      title: 'Cadastros',
      items: [
        { id: 'cad-residentes', label: 'Residentes', page: 'cadastro-residentes' },
        { id: 'cad-profissionais', label: 'Profissionais', page: 'cadastro-profissionais' }
      ]
    },
    {
      id: 'listagens',
      title: 'Listagens',
      items: [
        { id: 'list-residentes', label: 'Residentes', page: 'listagem-residentes' },
        { id: 'list-profissionais', label: 'Profissionais', page: 'listagem-profissionais' }
      ]
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      items: [
        { id: 'new-agendamento', label: 'Novo', page: 'cadastro-agendamento' },
        { id: 'list-agendamentos', label: 'Consultar', page: 'listagem-agendamentos' }
      ]
    },
    {
      id: 'inativos',
      title: 'Inativos',
      items: [
        { id: 'res-inativos', label: 'Residentes', page: 'residentes-inativos' },
        { id: 'prof-inativos', label: 'Profissionais', page: 'profissionais-inativos' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      items: [
        { id: 'analytics', label: 'Dashboard', page: 'dashboard-analytics' },
        { id: 'relatorios', label: 'Relatórios', page: 'relatorios' }
      ]
    },
    {
      id: 'gestao',
      title: 'Gestão',
      items: [
        { id: 'financeira', label: 'Financeira', page: 'gestao-financeira' }
      ]
    },
    {
      id: 'admin',
      title: 'Administração',
      adminOnly: true,
      items: [
        { id: 'acessos', label: 'Gerenciar Acessos', page: 'gerenciar-acessos' }
      ]
    }
  ]

  // Filtrar seções baseado no tipo de usuário
  const filteredSections = isAdmin() 
    ? menuSections 
    : menuSections.filter(section => !section.adminOnly)

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700/50 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'} overflow-hidden`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">SR</span>
              </div>
              <span className="font-semibold text-white">Sistema</span>
            </div>
          )}
          {!isOpen && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-bold">SR</span>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
          <ul className="space-y-1">
            {filteredSections.map((section) => (
              <li key={section.id}>
                {section.title && isOpen ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mt-4 mb-2"
                  >
                    <span>{section.title}</span>
                    <span className="text-xs">{expandedSections[section.id] ? '−' : '+'}</span>
                  </button>
                ) : section.title && !isOpen ? (
                  <div className="h-px bg-slate-700/50 my-3"></div>
                ) : null}
                
                {(!section.title || expandedSections[section.id]) && (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigation(item.page)}
                          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
                            activeItem === item.page
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                          title={!isOpen ? item.label : ''}
                        >
                          {isOpen ? (
                            <span className="text-sm font-medium">{item.label}</span>
                          ) : (
                            <span className="text-xs font-semibold mx-auto">{item.label.substring(0, 2).toUpperCase()}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-700/50 p-4 space-y-3">
          {isOpen && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(user?.profissional?.nome_completo || 'Admin').substring(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.profissional?.nome_completo || 'Admin'}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {isAdmin() ? 'Administrador' : user?.profissional?.profissao || 'Profissional'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
              >
                Sair
              </button>
            </div>
          )}
          {!isOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
              title="Sair"
            >
              <span className="text-xs font-bold">×</span>
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}

export default Sidebar
