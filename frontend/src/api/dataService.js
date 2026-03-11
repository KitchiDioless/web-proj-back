// Единый сервис для работы с данными
// Использует Firebase если VITE_USE_FIREBASE=true, иначе localStorage

const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'

// Импортируем mockData всегда (для localStorage)
import * as mockDataService from './mockData'

// Кэш для firebaseService
let firebaseServiceCache = null

// Функция для получения сервиса
const getService = async () => {
  // Если Firebase не используется, возвращаем mockData
  if (!USE_FIREBASE) {
    return mockDataService
  }
  
  // Если уже загружен, возвращаем из кэша
  if (firebaseServiceCache) {
    return firebaseServiceCache
  }
  
  // Загружаем Firebase сервис
  try {
    firebaseServiceCache = await import('./firebaseService')
    return firebaseServiceCache
  } catch (error) {
    console.warn('Firebase не установлен или не настроен. Используется localStorage.', error)
    console.warn('Для использования Firebase установите: npm install firebase')
    return mockDataService
  }
}

// Обертка для функций, которая выбирает нужный сервис
const wrapFunction = (fnName) => {
  return async (...args) => {
    const service = await getService()
    const func = service[fnName]
    if (typeof func === 'function') {
      return func(...args)
    }
    return func
  }
}

// Экспортируем все функции
export const getQuizzes = wrapFunction('getQuizzes')
export const getQuizById = wrapFunction('getQuizById')
export const getQuizzesByGameId = wrapFunction('getQuizzesByGameId')
export const getQuizzesByRating = wrapFunction('getQuizzesByRating')
export const addQuiz = wrapFunction('addQuiz')
export const updateQuiz = wrapFunction('updateQuiz')

export const voteQuiz = wrapFunction('voteQuiz')
export const getUserVote = wrapFunction('getUserVote')
// getQuizRating - синхронная функция, не требует обертки
export const getQuizRating = mockDataService.getQuizRating

export const getUsers = wrapFunction('getUsers')
export const getUserById = wrapFunction('getUserById')
export const getUserByEmail = wrapFunction('getUserByEmail')
export const getUserByUsername = wrapFunction('getUserByUsername')
export const createUser = wrapFunction('createUser')
export const updateUser = wrapFunction('updateUser')
export const updateUserAvatar = wrapFunction('updateUserAvatar')

export const addQuizResult = wrapFunction('addQuizResult')
export const getUserResults = wrapFunction('getUserResults')
export const getLeaderboard = wrapFunction('getLeaderboard')

export const getGames = wrapFunction('getGames')
export const getGameById = wrapFunction('getGameById')
export const loadGames = wrapFunction('loadGames')

