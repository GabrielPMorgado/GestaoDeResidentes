import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import AppContent from './AppContent'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  )

}

export default App
