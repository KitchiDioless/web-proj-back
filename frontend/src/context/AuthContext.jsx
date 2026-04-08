import React, { createContext, useContext, useState, useEffect } from "react"
import { loginBackend, registerBackend, refreshBackend } from "@/api/backendService"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const savedToken = localStorage.getItem("token")
    const savedRefresh = localStorage.getItem("refreshToken")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    const bootstrap = async () => {
      if ((!savedToken || savedToken === "undefined") && savedRefresh) {
        try {
          const payload = await refreshBackend(savedRefresh)
          localStorage.setItem("token", payload.accessToken)
          localStorage.setItem("accessToken", payload.accessToken)
          localStorage.setItem("refreshToken", payload.refreshToken)
          localStorage.setItem("user", JSON.stringify(payload.user))
          setUser(payload.user)
        } catch (e) {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          setUser(null)
        }
      }
      setLoading(false)
    }
    bootstrap()
  }, [])

  const login = async (email, password) => {
    try {
      const payload = await loginBackend(email, password)
      const userData = payload.user
      setUser(userData)
      localStorage.setItem("token", payload.accessToken)
      localStorage.setItem("accessToken", payload.accessToken)
      localStorage.setItem("refreshToken", payload.refreshToken)
      localStorage.setItem("user", JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (e) {
      return { success: false, error: e?.message || "Неверный email или пароль" }
    }
  }

  const register = async (username, email, password) => {
    try {
      const payload = await registerBackend(username, email, password)
      const userData = payload.user
      setUser(userData)
      localStorage.setItem("token", payload.accessToken)
      localStorage.setItem("accessToken", payload.accessToken)
      localStorage.setItem("refreshToken", payload.refreshToken)
      localStorage.setItem("user", JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (e) {
      return {
        success: false,
        error: e?.message || "Ошибка регистрации",
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  const isAdmin = () => user?.role === "admin"
  const isUser = () => user?.role === "user" || user?.role === "admin"
  const isGuest = () => !user

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isAdmin,
        isUser,
        isGuest,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

