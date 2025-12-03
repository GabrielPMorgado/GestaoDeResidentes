/**
 * Componentes reutilizáveis - Apenas componentes utilizados
 */

import React from 'react';
import './common.css';

/**
 * Loading Spinner
 */
export const LoadingSpinner = ({ size = 'md', text = 'Carregando...' }) => {
  const sizes = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  };

  return (
    <div className="loading-spinner-container">
      <div 
        className="spinner-border text-primary" 
        role="status"
        style={{ width: sizes[size], height: sizes[size] }}
      >
        <span className="visually-hidden">Carregando...</span>
      </div>
      {text && <p className="mt-2 text-muted">{text}</p>}
    </div>
  );
};

/**
 * Toast Container
 */
export const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  const Toast = ({ toast }) => {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };

    const colors = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'info'
    };

    return (
      <div className={`toast show align-items-center text-bg-${colors[toast.type]} border-0`} role="alert">
        <div className="d-flex">
          <div className="toast-body">
            <i className={`bi ${icons[toast.type]} me-2`}></i>
            {toast.message}
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white me-2 m-auto" 
            onClick={() => onClose(toast.id)}
          ></button>
        </div>
      </div>
    );
  };

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
