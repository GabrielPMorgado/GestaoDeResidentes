import { useState } from 'react';
import './common.css';

/**
 * Componente de botão de ajuda (Help) com modal informativo
 * Exibe instruções e orientações para o usuário
 */
const HelpButton = ({ title, content, steps = [], tips = [] }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Botão de Help Flutuante */}
      <button
        onClick={() => setShowHelp(true)}
        className="btn btn-primary position-fixed rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          zIndex: 1000,
          fontSize: '1.5rem',
          animation: 'pulse 2s infinite'
        }}
        title="Ajuda"
        aria-label="Abrir ajuda"
      >
        <i className="bi bi-question-circle"></i>
      </button>

      {/* Modal de Help */}
      {showHelp && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowHelp(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              {/* Header */}
              <div className="modal-header bg-gradient text-white" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3" style={{ fontSize: '2rem' }}></i>
                  <div>
                    <h5 className="modal-title mb-0">{title || 'Ajuda'}</h5>
                    <small className="opacity-75">Guia de orientação</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowHelp(false)}
                  aria-label="Fechar"
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body p-4">
                {/* Descrição */}
                {content && (
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-lightbulb text-primary me-3 mt-1" style={{ fontSize: '1.5rem' }}></i>
                      <div>
                        <h6 className="mb-2 text-primary">Sobre esta tela</h6>
                        <p className="mb-0 text-dark">{content}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passos de Utilização */}
                {steps.length > 0 && (
                  <div className="mb-4">
                    <h6 className="mb-3 d-flex align-items-center">
                      <i className="bi bi-list-ol text-success me-2"></i>
                      Como utilizar
                    </h6>
                    <div className="list-group">
                      {steps.map((step, index) => (
                        <div key={index} className="list-group-item border-start border-4 border-success mb-2">
                          <div className="d-flex align-items-start">
                            <span className="badge bg-success rounded-circle me-3 mt-1" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {index + 1}
                            </span>
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{step.title}</h6>
                              <p className="mb-0 text-muted small">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dicas e Observações */}
                {tips.length > 0 && (
                  <div>
                    <h6 className="mb-3 d-flex align-items-center">
                      <i className="bi bi-star text-warning me-2"></i>
                      Dicas importantes
                    </h6>
                    <div className="list-group list-group-flush">
                      {tips.map((tip, index) => (
                        <div key={index} className="list-group-item px-0 py-2">
                          <div className="d-flex align-items-start">
                            <i className="bi bi-check-circle-fill text-warning me-2 mt-1"></i>
                            <span className="text-muted">{tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Atalhos de Teclado (opcional) */}
                <div className="mt-4 p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-keyboard text-secondary me-2"></i>
                    <small className="text-muted fw-bold">ATALHOS ÚTEIS</small>
                  </div>
                  <div className="row g-2 small">
                    <div className="col-6">
                      <kbd className="bg-dark">Tab</kbd> <span className="text-muted">Navegar entre campos</span>
                    </div>
                    <div className="col-6">
                      <kbd className="bg-dark">Esc</kbd> <span className="text-muted">Fechar modal</span>
                    </div>
                    <div className="col-6">
                      <kbd className="bg-dark">Ctrl+S</kbd> <span className="text-muted">Salvar (quando aplicável)</span>
                    </div>
                    <div className="col-6">
                      <kbd className="bg-dark">Ctrl+F</kbd> <span className="text-muted">Buscar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light">
                <div className="d-flex align-items-center me-auto text-muted small">
                  <i className="bi bi-info-circle me-2"></i>
                  Precisa de mais ajuda? Entre em contato com o suporte.
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowHelp(false)}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animação de pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
        }
      `}</style>
    </>
  );
};

export default HelpButton;
