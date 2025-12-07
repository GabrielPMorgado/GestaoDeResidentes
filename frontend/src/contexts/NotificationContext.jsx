import { createContext, useContext } from 'react';
import { useToast } from '../hooks';
import { ToastContainer } from '../components/Common';

const NotificationContext = createContext(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { toasts, success, error, warning, info, removeToast } = useToast();

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
};
