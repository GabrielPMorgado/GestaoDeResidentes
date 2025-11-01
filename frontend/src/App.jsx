import { useState } from 'react'
import './App.css'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import CadastroResidentes from './components/Cadastros/CadastroResidentes'
import CadastroProfissionais from './components/Cadastros/CadastroProfissionais'
import ListagemResidentes from './components/Listagens/ListagemResidentes'
import ListagemProfissionais from './components/Listagens/ListagemProfissionais'

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [currentPage, setCurrentPage] = useState('dashboard')

    const renderPage = () => {
      switch(currentPage) {
        case 'cadastro-residentes':
          return <CadastroResidentes />
        case 'cadastro-profissionais':
          return <CadastroProfissionais />
        case 'listagem-residentes':
          return <ListagemResidentes />
        case 'listagem-profissionais':
          return <ListagemProfissionais />
        case 'dashboard':
        default:
          return (
            <div className="container-fluid">
              <h1>Bem-vindo ao Sistema01</h1>
              <p className="text-muted">Sistema de gerenciamento com React e Bootstrap</p>
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-people text-primary me-2"></i>
                        Cadastro de Residentes
                      </h5>
                      <p className="card-text">Gerencie o cadastro de residentes</p>
                      <button 
                        onClick={() => setCurrentPage('cadastro-residentes')} 
                        className="btn btn-primary btn-sm"
                      >
                        Acessar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-person-badge text-success me-2"></i>
                        Cadastro de Profissionais
                      </h5>
                      <p className="card-text">Gerencie o cadastro de profissionais</p>
                      <button 
                        onClick={() => setCurrentPage('cadastro-profissionais')} 
                        className="btn btn-success btn-sm"
                      >
                        Acessar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-graph-up text-info me-2"></i>
                        Relatórios
                      </h5>
                      <p className="card-text">Visualize relatórios e estatísticas</p>
                      <button className="btn btn-info btn-sm">Acessar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
      }
    }

    return(
      <>
        <Header />
        <div className="d-flex">
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen}
            setCurrentPage={setCurrentPage}
          />
          <main 
            className="flex-grow-1 p-4" 
            style={{
              marginLeft: sidebarOpen ? '260px' : '70px',
              transition: 'margin-left 0.3s ease'
            }}
          >
            {renderPage()}
          </main>
        </div>
      </>
    )
}

export default App
