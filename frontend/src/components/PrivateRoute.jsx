import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/Common'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    )
  }

  return isAuthenticated() ? children : null
}

export default PrivateRoute
