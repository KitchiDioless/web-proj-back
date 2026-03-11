import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import QuizPage from "./pages/QuizPage"
import QuizzesPage from "./pages/QuizzesPage"
import LeaderboardPage from "./pages/LeaderboardPage"
import QuizLeaderboardPage from "./pages/QuizLeaderboardPage"
import ProfilePage from "./pages/ProfilePage"
import AdminPage from "./pages/AdminPage"
import QuizBuilderPage from "./pages/QuizBuilderPage"
import LoginPage from "./pages/LoginPage"

function App() {
  return (
    <AuthProvider>
      <Router basename="/web-project/">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/quiz-leaderboard" element={<QuizLeaderboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/quiz-builder"
              element={
                <AdminRoute>
                  <QuizBuilderPage />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

const ProtectedRoute = ({ children }) => {
  const { isUser, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }
  
  return isUser() ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }
  
  return isAdmin() ? children : <Navigate to="/" replace />
}

export default App

