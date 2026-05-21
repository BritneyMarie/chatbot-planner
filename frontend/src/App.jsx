import { lazy, Suspense } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

// Loading component for code-split routes
const RouteLoader = () => (
  <div className="route-loader">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// Code-split routes with lazy loading
// These are loaded on-demand when the route is accessed
const LoginPage = lazy(() => 
  import(/* webpackChunkName: "auth" */ './pages/LoginPage')
);

const HomePage = lazy(() => 
  import(/* webpackChunkName: "home" */ './pages/HomePage')
);

const SettingsPage = lazy(() => 
  import(/* webpackChunkName: "settings" */ './pages/SettingsPage')
);

const Onboarding = lazy(() => 
  import(/* webpackChunkName: "onboarding" */ './components/Onboarding')
);

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <LoginPage />
          </Suspense>
        } 
      />
      <Route 
        path="/register" 
        element={
          <Suspense fallback={<RouteLoader />}>
            <LoginPage />
          </Suspense>
        } 
      />

      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <HomePage />
            </Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <SettingsPage />
            </Suspense>
          </PrivateRoute>
        }
      />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
