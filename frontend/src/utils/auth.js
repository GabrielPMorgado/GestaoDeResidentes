/**
 * Funções utilitárias para autenticação
 */

// Obter token do localStorage
export const getToken = () => {
  return localStorage.getItem('token')
}

// Salvar token no localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

// Remover token do localStorage
export const removeToken = () => {
  localStorage.removeItem('token')
}

// Obter dados do usuário
export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Salvar dados do usuário
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

// Remover dados do usuário
export const removeUser = () => {
  localStorage.removeItem('user')
}

// Verificar se está autenticado
export const isAuthenticated = () => {
  const token = getToken()
  const user = getUser()
  return !!(token && user)
}

// Limpar todos os dados de autenticação
export const clearAuth = () => {
  removeToken()
  removeUser()
}

// Configurar header de autorização para requisições
export const getAuthHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Validar se o token está expirado (quando integrar com JWT real)
export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    // Decodificar JWT (simplificado - usar biblioteca jwt-decode em produção)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  clearAuth,
  getAuthHeader,
  isTokenExpired
}
