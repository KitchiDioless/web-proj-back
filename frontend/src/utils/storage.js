const STORAGE_KEYS = {
  QUIZZES: 'game-quiz-quizzes',
  QUIZ_VOTES: 'game-quiz-votes',
  USERS: 'game-quiz-users',
  QUIZ_RESULTS: 'game-quiz-results',
}

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
    if (error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Consider using external storage.')
    }
    return false
  }
}

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item)
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error)
    return defaultValue
  }
}

export const clearStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error clearing localStorage (${key}):`, error)
    return false
  }
}

export { STORAGE_KEYS }

