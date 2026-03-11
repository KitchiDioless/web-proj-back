// Конфигурация Firebase
// Импорты выполняются только если Firebase установлен

let app = null
let db = null
let auth = null
let storage = null

// Функция для инициализации Firebase (вызывается только если нужно)
export const initFirebase = async () => {
  if (app) return { app, db, auth, storage }
  
  try {
    const { initializeApp } = await import('firebase/app')
    const { getFirestore } = await import('firebase/firestore')
    const { getAuth } = await import('firebase/auth')
    const { getStorage } = await import('firebase/storage')

    // Конфигурация Firebase из переменных окружения
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
    }

    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    
    return { app, db, auth, storage }
  } catch (error) {
    console.warn('Firebase не установлен. Используется localStorage. Установите: npm install firebase')
    return { app: null, db: null, auth: null, storage: null }
  }
}

// Экспортируем геттеры
export const getDb = () => db
export const getAuthInstance = () => auth
export const getStorageInstance = () => storage
export const getApp = () => app

export { db, auth, storage }
export default app

