import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estados de carregamento
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return { loading, startLoading, stopLoading };
};

/**
 * Hook para gerenciar notificações toast
 */
let toastCounter = 0;
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${++toastCounter}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((message, duration = 3000) => 
    addToast(message, 'success', duration), [addToast]);
  
  const error = useCallback((message, duration = 3000) => 
    addToast(message, 'error', duration), [addToast]);
  
  const warning = useCallback((message, duration = 3000) => 
    addToast(message, 'warning', duration), [addToast]);
  
  const info = useCallback((message, duration = 3000) => 
    addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

// Exportar hooks do React Query
export * from './useQueries';
