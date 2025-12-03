/**
 * Context para gerenciar estado da aplicação
 */

import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(undefined);

const initialState = {
  sidebarOpen: true,
  currentPage: 'gerenciamento',
  residenteHistorico: null,
  stats: {
    totalResidentes: 0,
    totalProfissionais: 0,
    agendamentosHoje: 0
  },
  user: null
};

const actionTypes = {
  SET_SIDEBAR: 'SET_SIDEBAR',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_RESIDENTE_HISTORICO: 'SET_RESIDENTE_HISTORICO',
  SET_STATS: 'SET_STATS',
  SET_USER: 'SET_USER',
  RESET: 'RESET'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_SIDEBAR:
      return { ...state, sidebarOpen: action.payload };
    
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    
    case actionTypes.SET_RESIDENTE_HISTORICO:
      return { ...state, residenteHistorico: action.payload };
    
    case actionTypes.SET_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } };
    
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case actionTypes.RESET:
      return initialState;
    
    default:
      return state;
  }
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setSidebar: (open) => dispatch({ type: actionTypes.SET_SIDEBAR, payload: open }),
    setCurrentPage: (page) => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
    setResidenteHistorico: (residente) => dispatch({ type: actionTypes.SET_RESIDENTE_HISTORICO, payload: residente }),
    setStats: (stats) => dispatch({ type: actionTypes.SET_STATS, payload: stats }),
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    reset: () => dispatch({ type: actionTypes.RESET })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};
