import { parseGamesCSV } from './csvParser'
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage'

let gamesCache = null

const defaultQuizzes = [
  {
    id: 1,
    gameId: 730,
    title: "Квиз по Counter-Strike 2",
    description: "Ну моковый квиз и моковый квиз",
    coverImage: "https://s0.rbk.ru/v6_top_pics/media/img/0/66/346959045956660.webp",
    upvotes: 5,
    downvotes: 1,
    createdAt: "2024-01-10T10:00:00",
    questions: [
      {
        id: 1,
        text: "Сколько раундов нужно выиграть для победы в матче?",
        options: ["13", "16", "15", "12"],
        correctAnswer: 1,
        image: null,
      },
      {
        id: 2,
        text: "Какое оружие самое дорогое в игре?",
        options: ["AK-47", "AWP", "M4A4", "Desert Eagle"],
        correctAnswer: 1,
        image: null,
      },
    ],
  },
  {
    id: 2,
    gameId: 1091500,
    title: "Квиз по Cyberpunk 2077",
    description: "Пара глупых вопросов",
    coverImage: "https://cdn.kanobu.ru/r/c369697658c1420200a8656749fa105f/1040x-/u.kanobu.ru/editor/images/30/f9ec5e56-7869-44b0-8b09-6a1282359b56.jpg",
    upvotes: 8,
    downvotes: 0,
    createdAt: "2024-01-12T14:30:00",
    questions: [
      {
        id: 1,
        text: "Как найти игуану после предыстории?",
        options: ["В башне Арасаки", "У Джеки дома", "В лагере кочевников", "Хз чет, не знаю"],
        correctAnswer: 0,
        image: null,
      },
      {
        id: 2,
        text: "А кота?",
        options: ["Не поверите, в башне Арасаки", "На помойке рядом с квартирой Ви", "На выходе из Посмертия"],
        correctAnswer: 1,
        image: null,
      },
    ],
  },
]

const defaultUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    avatar: null,
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    username: "user1",
    email: "user1@example.com",
    password: "user123",
    role: "user",
    avatar: null,
    createdAt: "2024-01-02",
  },
]

const defaultQuizResults = [
  {
    id: 1,
    userId: 2,
    username: "user1",
    quizId: 1,
    score: 3,
    totalQuestions: 3,
    completedAt: "2024-01-15T10:30:00",
  },
]

export let quizzes = [...defaultQuizzes]
export let quizVotes = {}
export let users = [...defaultUsers]
export let quizResults = [...defaultQuizResults]

const saveAllData = () => {
  saveToStorage(STORAGE_KEYS.QUIZZES, quizzes)
  saveToStorage(STORAGE_KEYS.QUIZ_VOTES, quizVotes)
  saveToStorage(STORAGE_KEYS.USERS, users)
  saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, quizResults)
}

const initializeData = () => {
  const savedQuizzes = loadFromStorage(STORAGE_KEYS.QUIZZES)
  const savedVotes = loadFromStorage(STORAGE_KEYS.QUIZ_VOTES)
  const savedUsers = loadFromStorage(STORAGE_KEYS.USERS)
  const savedResults = loadFromStorage(STORAGE_KEYS.QUIZ_RESULTS)

  if (savedQuizzes && savedQuizzes.length > 0) {
    quizzes = savedQuizzes
  } else {
    quizzes = [...defaultQuizzes]
    saveToStorage(STORAGE_KEYS.QUIZZES, quizzes)
  }

  if (savedVotes && typeof savedVotes === 'object') {
    quizVotes = savedVotes
  } else {
    quizVotes = {}
    saveToStorage(STORAGE_KEYS.QUIZ_VOTES, quizVotes)
  }

  if (savedUsers && savedUsers.length > 0) {
    users = savedUsers
  } else {
    users = [...defaultUsers]
    saveToStorage(STORAGE_KEYS.USERS, users)
  }

  if (savedResults && savedResults.length > 0) {
    quizResults = savedResults
  } else {
    quizResults = [...defaultQuizResults]
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, quizResults)
  }
}

initializeData()

export const loadGames = async () => {
  if (gamesCache) return gamesCache
  try {
    const csvGames = await parseGamesCSV()
    gamesCache = csvGames.map((game, index) => ({
      ...game,
      id: game.appid || index + 1,
    }))
    return gamesCache
  } catch (error) {
    console.error('Error loading games from CSV:', error)
    gamesCache = []
    return gamesCache
  }
}

export const getGames = async () => {
  if (!gamesCache) {
    await loadGames()
  }
  return gamesCache || []
}

export const getQuizzes = async () => quizzes

export const getQuizById = async (id) => quizzes.find((q) => q.id === parseInt(id))

export const getQuizzesByGameId = async (gameId) =>
  quizzes.filter((q) => q.gameId === parseInt(gameId))

export const getGameById = async (id) => {
  try {
    const games = await getGames()
    return games.find((g) => g.id === parseInt(id) || g.appid === parseInt(id)) || null
  } catch (error) {
    console.error('Error getting game by id:', error)
    return null
  }
}

export const addQuiz = async (quiz) => {
  const newQuiz = {
    ...quiz,
    id: quizzes.length > 0 ? Math.max(...quizzes.map((q) => q.id)) + 1 : 1,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  }
  quizzes.push(newQuiz)
  saveAllData()
  return newQuiz
}

export const voteQuiz = async (userId, quizId, vote) => {
  if (!quizVotes[userId]) {
    quizVotes[userId] = {}
  }
  
  const quiz = quizzes.find((q) => q.id === parseInt(quizId))
  if (!quiz) return null
  
  const previousVote = quizVotes[userId][quizId]
  
  if (previousVote === 'up') {
    quiz.upvotes = Math.max(0, quiz.upvotes - 1)
  } else if (previousVote === 'down') {
    quiz.downvotes = Math.max(0, quiz.downvotes - 1)
  }
  if (vote === 'up') {
    quiz.upvotes += 1
    quizVotes[userId][quizId] = 'up'
  } else if (vote === 'down') {
    quiz.downvotes += 1
    quizVotes[userId][quizId] = 'down'
  } else {
    delete quizVotes[userId][quizId]
  }
  
  saveAllData()
  return quiz
}

export const getUserVote = async (userId, quizId) => {
  return quizVotes[userId]?.[quizId] || null
}

export const getQuizRating = (quiz) => {
  return (quiz.upvotes || 0) - (quiz.downvotes || 0)
}

export const getQuizzesByRating = async () => {
  return [...quizzes].sort((a, b) => {
    const ratingA = getQuizRating(a)
    const ratingB = getQuizRating(b)
    if (ratingB !== ratingA) {
      return ratingB - ratingA
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
}

export const getUserByEmail = async (email) =>
  users.find((u) => u.email === email)

export const getUserByUsername = async (username) =>
  users.find((u) => u.username === username)

export const createUser = async (userData) => {
  const newUser = {
    ...userData,
    id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    role: "user",
    avatar: null,
    createdAt: new Date().toISOString().split("T")[0],
  }
  users.push(newUser)
  saveAllData()
  return newUser
}

export const updateUser = async (userId, updates) => {
  const user = users.find((u) => u.id === userId)
  if (user) {
    Object.assign(user, updates)
    saveAllData()
    return user
  }
  return null
}

export const updateUserAvatar = async (userId, avatar) => {
  return await updateUser(userId, { avatar })
}

export const getUserById = async (userId) => {
  return users.find((u) => u.id === userId)
}

export const addQuizResult = async (result) => {
  const user = users.find((u) => u.id === result.userId)
  const newResult = {
    ...result,
    id: quizResults.length > 0 ? Math.max(...quizResults.map((r) => r.id)) + 1 : 1,
    username: user?.username || "Unknown",
    completedAt: new Date().toISOString(),
  }
  quizResults.push(newResult)
  saveAllData()
  return newResult
}

export const getLeaderboard = async () => {
  const userScores = {}
  
  const userIds = [...new Set(quizResults.map(r => r.userId))]
  
  const usersMap = {}
  for (const userId of userIds) {
    const user = await getUserById(userId)
    if (user) {
      usersMap[userId] = user
    }
  }
  
  quizResults.forEach((result) => {
    if (!userScores[result.userId]) {
      const user = usersMap[result.userId]
      userScores[result.userId] = {
        userId: result.userId,
        username: result.username,
        avatar: user?.avatar || null,
        totalScore: 0,
        totalQuizzes: 0,
        averageScore: 0,
      }
    }
    userScores[result.userId].totalScore += result.score
    userScores[result.userId].totalQuizzes += 1
  })

  Object.values(userScores).forEach((user) => {
    user.averageScore = user.totalQuizzes > 0
      ? (user.totalScore / user.totalQuizzes).toFixed(2)
      : 0
  })

  return Object.values(userScores)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((user, index) => ({ ...user, rank: index + 1 }))
}

export const getUserResults = async (userId) => {
  return quizResults.filter((r) => r.userId === userId)
}

export const getUsers = async () => users

