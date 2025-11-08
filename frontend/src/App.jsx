import { useState, useEffect } from 'react'
import './App.css'
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
  import { residenteService, profissionalService, agendamentoService } from './services'

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [currentPage, setCurrentPage] = useState('dashboard')
    const [residenteHistorico, setResidenteHistorico] = useState(null)
    const [stats, setStats] = useState({
      totalResidentes: 0,
      totalProfissionais: 0,
      totalAgendamentos: 0,
      agendamentosHoje: 0
    })

    useEffect(() => {
      if (currentPage === 'dashboard') {
        carregarEstatisticas()
      }
    }, [currentPage])

    const carregarEstatisticas = async () => {
      try {
        const [residentes, profissionais, agendamentos] = await Promise.all([
          residenteService.listarAtivos(),
          profissionalService.listarAtivos(),
          agendamentoService.listar()
        ])

        const hoje = new Date().toISOString().split('T')[0]
        
        // Garantir que agendamentos é um array - verificar múltiplas estruturas possíveis
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

        setStats({
          totalResidentes: residentes.length,
          totalProfissionais: profissionais.length,
          totalAgendamentos: listaAgendamentos.length,
          agendamentosHoje: agendamentosHoje.length
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      }
    }

    const renderPage = () => {
      switch(currentPage) {
        case 'cadastro-residentes':
          return <CadastroResidentes />
        case 'cadastro-profissionais':
          return <CadastroProfissionais />
        case 'cadastro-agendamento':
          return <CadastroAgendamento />
        case 'listagem-residentes':
          return <ListagemResidentes onVerHistorico={(residente) => {
            setResidenteHistorico(residente)
            setCurrentPage('historico-consultas')
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
          return residenteHistorico ? (
            <HistoricoConsultasResidente 
              residenteId={residenteHistorico.id}
              residenteNome={residenteHistorico.nome_completo}
              onVoltar={() => setCurrentPage('listagem-residentes')}
            />
          ) : <ListagemResidentes />
        case 'relatorios':
          return <Relatorios />
        case 'dashboard':
        default:
          return (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1>
                  <i className="bi bi-house-heart me-3"></i>
                  Bem-vindo ao Sistema de Gerenciamento
                </h1>
                <p>Painel completo para gestão de residentes, profissionais e agendamentos</p>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon primary">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div className="stat-content">
                    <h4>{stats.totalResidentes}</h4>
                    <p>Residentes Ativos</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon success">
                    <i className="bi bi-person-badge-fill"></i>
                  </div>
                  <div className="stat-content">
                    <h4>{stats.totalProfissionais}</h4>
                    <p>Profissionais Ativos</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon warning">
                    <i className="bi bi-calendar-check-fill"></i>
                  </div>
                  <div className="stat-content">
                    <h4>{stats.agendamentosHoje}</h4>
                    <p>Agendamentos Hoje</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon danger">
                    <i className="bi bi-calendar3"></i>
                  </div>
                  <div className="stat-content">
                    <h4>{stats.totalAgendamentos}</h4>
                    <p>Total de Agendamentos</p>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="quick-actions">
                <h3>
                  <i className="bi bi-lightning-fill me-2 text-warning"></i>
                  Ações Rápidas
                </h3>
                <div className="action-buttons">
                  <button 
                    onClick={() => setCurrentPage('cadastro-residentes')} 
                    className="action-btn"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                  >
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Novo Residente</span>
                  </button>

                  <button 
                    onClick={() => setCurrentPage('cadastro-profissionais')} 
                    className="action-btn"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    <i className="bi bi-person-badge"></i>
                    <span>Novo Profissional</span>
                  </button>

                  <button 
                    onClick={() => setCurrentPage('cadastro-agendamento')} 
                    className="action-btn"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <i className="bi bi-calendar-plus"></i>
                    <span>Novo Agendamento</span>
                  </button>

                  <button 
                    onClick={() => setCurrentPage('relatorios')} 
                    className="action-btn"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                  >
                    <i className="bi bi-graph-up-arrow"></i>
                    <span>Ver Relatórios</span>
                  </button>
                </div>
              </div>

              {/* Cards de Acesso Rápido */}
                            {/* Cards de Acesso Rápido */}
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="dashboard-card">
                    <div className="dashboard-card-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <h5>Residentes</h5>
                    <h3>{stats.totalResidentes}</h3>
                    <p>Total de residentes cadastrados</p>
                    <button 
                      onClick={() => setCurrentPage('listagem-residentes')} 
                      className="btn btn-primary btn-sm mt-3"
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Ver Lista
                    </button>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="dashboard-card">
                    <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      <i className="bi bi-person-badge-fill"></i>
                    </div>
                    <h5>Profissionais</h5>
                    <h3>{stats.totalProfissionais}</h3>
                    <p>Total de profissionais cadastrados</p>
                    <button 
                      onClick={() => setCurrentPage('listagem-profissionais')} 
                      className="btn btn-success btn-sm mt-3"
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Ver Lista
                    </button>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="dashboard-card">
                    <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      <i className="bi bi-calendar-check-fill"></i>
                    </div>
                    <h5>Agendamentos</h5>
                    <h3>{stats.totalAgendamentos}</h3>
                    <p>Total de agendamentos registrados</p>
                    <button 
                      onClick={() => setCurrentPage('listagem-agendamentos')} 
                      className="btn btn-warning btn-sm mt-3"
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Ver Lista
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
      }
    }

    return(
      <div className="app-container">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          setCurrentPage={setCurrentPage}
        />
        <main className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          {renderPage()}
        </main>
      </div>
    )
}

export default App
