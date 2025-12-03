import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
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
    try {
      const response = await authService.login(email, senha)
      setUser(response.usuario)
      return { success: true, user: response.usuario }
    } catch (error) {
      throw new Error(error.response?.data?.erro || 'Erro ao fazer login')
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated()
  }

  const isAdmin = () => {
    return user?.tipo === 'admin'
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
