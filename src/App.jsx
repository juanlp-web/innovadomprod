import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
import { ForgotPassword } from './components/ForgotPassword'
import { Dashboard } from './components/Dashboard'
import './App.css'

function App() {
  const [userData, setUserData] = useState(null)

  const handleLogin = (credentials) => {
    // Simulación de login exitoso
    setUserData({
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      role: 'admin',
      id: 'USR001'
    })
  }

  const handleLogout = () => {
    setUserData(null)
  }

  const handleForgotPassword = (email) => {
    // Simulación de envío de correo
    console.log('Enviando instrucciones a:', email)
    return Promise.resolve()
  }

  // Si no hay usuario autenticado, mostrar login
  if (!userData) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} onForgotPassword={() => <Navigate to="/forgot-password" />} />} />
          <Route path="/forgot-password" element={<ForgotPassword onBack={() => <Navigate to="/" />} onResetPassword={handleForgotPassword} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    )
  }

  // Si hay usuario autenticado, mostrar dashboard con rutas protegidas
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard/*" element={<Dashboard userData={userData} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App
