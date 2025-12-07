import { createContext, useContext, useReducer, useMemo } from 'react';

const AppContext = createContext(undefined);

const initialState = {
  currentPage: 'dashboard',
  residenteHistorico: null,
  stats: {
    totalResidentes: 0,
    totalProfissionais: 0,
    agendamentosHoje: 0
  }
};

const actionTypes = {
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_RESIDENTE_HISTORICO: 'SET_RESIDENTE_HISTORICO',
  SET_STATS: 'SET_STATS'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    
    case actionTypes.SET_RESIDENTE_HISTORICO:
      return { ...state, residenteHistorico: action.payload };
    
    case actionTypes.SET_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } };
    
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

  const actions = useMemo(() => ({
    setCurrentPage: (page) => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
    setResidenteHistorico: (residente) => dispatch({ type: actionTypes.SET_RESIDENTE_HISTORICO, payload: residente }),
    setStats: (stats) => dispatch({ type: actionTypes.SET_STATS, payload: stats })
  }), []);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
