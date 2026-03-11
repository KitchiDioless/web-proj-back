import React, { createContext, useContext, useState, useEffect } from "react"
import { getUserByEmail, createUser } from "@/api/dataService"

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
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const foundUser = await getUserByEmail(email)
    if (foundUser && foundUser.password === password) {
      const userData = { ...foundUser }
      delete userData.password // Не сохраняем пароль в состоянии
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return { success: true, user: userData }
    }
    return { success: false, error: "Неверный email или пароль" }
  }

  const register = async (username, email, password) => {
    // Проверяем, не существует ли уже пользователь
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { success: false, error: "Пользователь с таким email уже существует" }
    }

    const newUser = await createUser({ username, email, password })
    const userData = { ...newUser }
    delete userData.password
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
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

