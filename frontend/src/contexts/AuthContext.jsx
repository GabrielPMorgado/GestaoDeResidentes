import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se existe usuário no localStorage ao carregar
    const userData = authService.getCurrentUser()
    if (userData) {
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const login = async (email, senha) => {
    const response = await authService.login(email, senha)
    setUser(response.usuario)
    return { success: true, user: response.usuario }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isAuthenticated = () => !!user && authService.isAuthenticated()
  
  const isAdmin = () => user?.tipo === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
