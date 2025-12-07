import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'

function Sidebar({ isOpen, setIsOpen, setCurrentPage }) {
  const { isAdmin, logout, user } = useAuth()
  const { success: showSuccess } = useNotification()
  const [activeItem, setActiveItem] = useState('dashboard')
  const [expandedSections, setExpandedSections] = useState({
    cadastros: true,
    listagens: true,
    agendamentos: true,
    atendimento: true,
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

  // Menu para Administrador (completo)
  const menuAdmin = [
    {
      id: 'main',
      items: [
        { id: 'dashboard', label: 'Dashboard', page: 'dashboard', icon: 'bi-house-door-fill' }
      ]
    },
    {
      id: 'cadastros',
      title: 'Cadastros',
      icon: 'bi-plus-circle',
      items: [
        { id: 'cad-residentes', label: 'Residentes', page: 'cadastro-residentes', icon: 'bi-person-plus-fill' },
        { id: 'cad-profissionais', label: 'Profissionais', page: 'cadastro-profissionais', icon: 'bi-person-badge-fill' }
      ]
    },
    {
      id: 'listagens',
      title: 'Listagens',
      icon: 'bi-list-ul',
      items: [
        { id: 'list-residentes', label: 'Residentes', page: 'listagem-residentes', icon: 'bi-people-fill' },
        { id: 'list-profissionais', label: 'Profissionais', page: 'listagem-profissionais', icon: 'bi-person-vcard-fill' }
      ]
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      icon: 'bi-calendar-check',
      items: [
        { id: 'new-agendamento', label: 'Novo', page: 'cadastro-agendamento', icon: 'bi-calendar-plus' },
        { id: 'list-agendamentos', label: 'Consultar', page: 'listagem-agendamentos', icon: 'bi-calendar-event' }
      ]
    },
    {
      id: 'inativos',
      title: 'Inativos',
      icon: 'bi-archive',
      items: [
        { id: 'res-inativos', label: 'Residentes', page: 'residentes-inativos', icon: 'bi-person-x-fill' },
        { id: 'prof-inativos', label: 'Profissionais', page: 'profissionais-inativos', icon: 'bi-person-dash-fill' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'bi-graph-up',
      items: [
        { id: 'analytics', label: 'Dashboard', page: 'dashboard-analytics', icon: 'bi-speedometer2' },
        { id: 'relatorios', label: 'Relatórios', page: 'relatorios', icon: 'bi-file-earmark-bar-graph' }
      ]
    },
    {
      id: 'gestao',
      title: 'Gestão',
      icon: 'bi-briefcase',
      items: [
        { id: 'financeira', label: 'Financeira', page: 'gestao-financeira', icon: 'bi-currency-dollar' }
      ]
    },
    {
      id: 'admin',
      title: 'Administração',
      icon: 'bi-shield-lock',
      items: [
        { id: 'acessos', label: 'Gerenciar Acessos', page: 'gerenciar-acessos', icon: 'bi-key-fill' }
      ]
    }
  ]

  // Menu para Profissional
  const menuProfissional = [
    {
      id: 'main',
      items: [
        { id: 'pacientes-agendados', label: 'Pacientes Agendados', page: 'pacientes-agendados', icon: 'bi-calendar2-check-fill' }
      ]
    },
    {
      id: 'atendimento',
      title: 'Atendimento',
      icon: 'bi-clipboard2-pulse',
      items: [
        { id: 'historico-atendimentos', label: 'Histórico', page: 'historico-atendimentos', icon: 'bi-clock-history' }
      ]
    }
  ]

  // Menu para Recepcionista
  const menuRecepcionista = [
    {
      id: 'main',
      items: [
        { id: 'dashboard-recep', label: 'Dashboard', page: 'dashboard-recepcionista', icon: 'bi-house-door-fill' }
      ]
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      icon: 'bi-calendar-check',
      items: [
        { id: 'novo-agendamento', label: 'Novo Agendamento', page: 'cadastro-agendamento', icon: 'bi-calendar-plus' },
        { id: 'list-agendamentos', label: 'Consultar', page: 'listagem-agendamentos', icon: 'bi-calendar-event' }
      ]
    }
  ]

  // Selecionar menu baseado no tipo de usuário
  const getUserMenu = () => {
    if (isAdmin()) return menuAdmin
    if (user?.tipo === 'recepcionista') return menuRecepcionista
    return menuProfissional
  }
  
  const filteredSections = getUserMenu()

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700/50 transition-all duration-300 z-50 flex flex-col
        ${isOpen ? 'w-64 shadow-2xl' : 'w-16'}
        lg:${isOpen ? 'w-64' : 'w-16'}
        ${isOpen ? '' : 'lg:block'}
        ${isOpen ? 'block' : 'hidden lg:block'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50 flex-shrink-0">
          {isOpen && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-lg">Sistema Residencial</span>
            </div>
          )}
          {!isOpen && (
            <div className="text-center">
              <span className="text-white text-xs font-bold">SR</span>
            </div>
          )}
        </div>
        
        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 hover:scrollbar-thumb-slate-600" style={{scrollBehavior: 'smooth'}}>
          <ul className="space-y-1">
            {filteredSections.map((section) => (
              <li key={section.id}>
                {section.title && isOpen ? (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mt-4 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon && <i className={`bi ${section.icon} text-sm`}></i>}
                      <span>{section.title}</span>
                    </div>
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
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            activeItem === item.page
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                          title={!isOpen ? item.label : ''}
                        >
                          {isOpen ? (
                            <>
                              {item.icon && <i className={`bi ${item.icon} text-base flex-shrink-0`}></i>}
                              <span className="text-sm font-medium">{item.label}</span>
                            </>
                          ) : (
                            <i className={`bi ${item.icon} text-base mx-auto`} title={item.label}></i>
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
