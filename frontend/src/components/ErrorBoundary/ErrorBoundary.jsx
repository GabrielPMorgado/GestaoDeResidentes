/**
 * Error Boundary para capturar erros de renderização
 */

import React from 'react';
import logger from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log do erro
    logger.error('Error Boundary capturou erro:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Recarrega a página se necessário
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="card border-danger">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Algo deu errado
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Ocorreu um erro inesperado ao renderizar esta parte da aplicação.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-3" style={{ whiteSpace: 'pre-wrap' }}>
                  <summary className="text-danger fw-bold mb-2">
                    Detalhes do erro (visível apenas em desenvolvimento)
                  </summary>
                  <div className="alert alert-danger">
                    <strong>Erro:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div className="alert alert-warning">
                      <strong>Component Stack:</strong>
                      <pre className="mb-0 mt-2" style={{ fontSize: '0.85rem' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}

              <div className="mt-4 d-flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={this.handleReset}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Tentar Novamente
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.href = '/'}
                >
                  <i className="bi bi-house me-2"></i>
                  Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
