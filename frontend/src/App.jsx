import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import MainPage from './components/MainPage'
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './components/NotFoundPage'
import './api/axiosConfig'
function App() {
  return (
    <div className="h-100">
      <div className="h-100" id="chat">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
