const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND !== 'false'

import * as mockDataService from './mockData'
import * as backendService from './backendService'

let firebaseServiceCache = null

const getService = async () => {
  if (USE_FIREBASE) {
    if (firebaseServiceCache) return firebaseServiceCache
    try {
      firebaseServiceCache = await import('./firebaseService')
      return firebaseServiceCache
    } catch (error) {
      console.warn('Firebase не установлен или не настроен. Используется backend/mock.', error)
      return USE_BACKEND ? backendService : mockDataService
    }
  }

  return USE_BACKEND ? backendService : mockDataService
}

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

export const getQuizRating = (quiz) => (quiz?.upvotes || 0) - (quiz?.downvotes || 0)

export const getQuizzes = wrapFunction('getQuizzes')
export const getQuizById = wrapFunction('getQuizById')
export const getQuizzesByGameId = wrapFunction('getQuizzesByGameId')
export const getQuizzesByRating = wrapFunction('getQuizzesByRating')
export const addQuiz = wrapFunction('addQuiz')
export const updateQuiz = wrapFunction('updateQuiz')
export const deleteQuiz = wrapFunction('deleteQuiz')

export const voteQuiz = wrapFunction('voteQuiz')
export const getUserVote = wrapFunction('getUserVote')

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

