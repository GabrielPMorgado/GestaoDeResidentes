import './Sidebar.css'

function Sidebar({ isOpen, setIsOpen, setCurrentPage }) {
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigation = (page) => {
    console.log('Navegando para:', page)
    setCurrentPage(page)
  }

  return (
    <>
      <aside className={`sidebar border-end ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {isOpen && <span>Menu Principal</span>}
          </h5>
          <button 
            className="btn btn-sm btn-outline-secondary border-0" 
            onClick={toggleSidebar}
            title={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            <li className="nav-item">
              <button 
                className="nav-link active" 
                onClick={() => handleNavigation('dashboard')}
                title="Início"
              >
                <i className="bi bi-house-door me-2"></i>
                {isOpen && <span>Início</span>}
              </button>
            </li>
            
            {isOpen && (
              <li className="nav-item mt-3">
                <h6 className="sidebar-heading px-3 text-white">CADASTROS</h6>
              </li>
            )}
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('cadastro-residentes')}
                title="Cadastro de Residentes"
              >
                <i className="bi bi-person-plus me-2"></i>
                {isOpen && <span>Cadastro de Residentes</span>}
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('cadastro-profissionais')}
                title="Cadastro de Profissionais"
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                {isOpen && <span>Cadastro de Profissionais</span>}
              </button>
            </li>
            
            {isOpen && (
              <li className="nav-item mt-3">
                <h6 className="sidebar-heading px-3 text-white">LISTAGENS</h6>
              </li>
            )}
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('listagem-residentes')}
                title="Listagem de Residentes"
              >
                <i className="bi bi-people me-2"></i>
                {isOpen && <span>Listagem de Residentes</span>}
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('listagem-profissionais')}
                title="Listagem de Profissionais"
              >
                <i className="bi bi-person-badge me-2"></i>
                {isOpen && <span>Listagem de Profissionais</span>}
              </button>
            </li>
            
            {isOpen && (
              <li className="nav-item mt-3">
                <h6 className="sidebar-heading px-3 text-white">AGENDAMENTOS</h6>
              </li>
            )}
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('cadastro-agendamento')}
                title="Novo Agendamento"
              >
                <i className="bi bi-calendar-plus me-2"></i>
                {isOpen && <span>Novo Agendamento</span>}
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('listagem-agendamentos')}
                title="Listagem de Agendamentos"
              >
                <i className="bi bi-calendar-check me-2"></i>
                {isOpen && <span>Listagem de Agendamentos</span>}
              </button>
            </li>
            
            {isOpen && (
              <li className="nav-item mt-3">
                <h6 className="sidebar-heading px-3 text-white">INATIVOS</h6>
              </li>
            )}
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('residentes-inativos')}
                title="Residentes Inativos"
              >
                <i className="bi bi-person-x me-2"></i>
                {isOpen && <span>Residentes Inativos</span>}
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('profissionais-inativos')}
                title="Profissionais Inativos"
              >
                <i className="bi bi-person-slash me-2"></i>
                {isOpen && <span>Profissionais Inativos</span>}
              </button>
            </li>
            
            {isOpen && (
              <li className="nav-item mt-3">
                <h6 className="sidebar-heading px-3 text-white">RELATÓRIOS</h6>
              </li>
            )}
            
            <li className="nav-item">
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('relatorios')}
                title="Relatórios"
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                {isOpen && <span>Relatórios</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
