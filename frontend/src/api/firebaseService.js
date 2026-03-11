// Сервисы для работы с Firebase Firestore
// Импорты выполняются динамически при вызове функций

let firestoreModule = null
let db = null
let initialized = false

// Инициализация Firebase при первом использовании
const initFirestore = async () => {
  if (initialized && firestoreModule && db) return
  
  try {
    // Динамический импорт Firebase модулей
    const firebaseApp = await import('firebase/app')
    const firebaseFirestore = await import('firebase/firestore')
    const firebaseAuth = await import('firebase/auth')
    const firebaseStorage = await import('firebase/storage')
    
    firestoreModule = firebaseFirestore
    
    // Инициализация Firebase
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
    }
    
    const app = firebaseApp.initializeApp(firebaseConfig)
    db = firebaseFirestore.getFirestore(app)
    initialized = true
  } catch (error) {
    console.error('Ошибка инициализации Firebase:', error)
    throw new Error('Firebase не настроен. Установите: npm install firebase и настройте конфигурацию.')
  }
}

const getFirestoreFunctions = () => {
  if (!firestoreModule) {
    throw new Error('Firebase не инициализирован')
  }
  return firestoreModule
}

// ==================== QUIZZES ====================

export const getQuizzes = async () => {
  await initFirestore()
  const { collection, getDocs } = getFirestoreFunctions()
  try {
    const quizzesRef = collection(db, 'quizzes')
    const snapshot = await getDocs(quizzesRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting quizzes:', error)
    return []
  }
}

export const getQuizById = async (id) => {
  try {
    const quizRef = doc(db, 'quizzes', id.toString())
    const quizSnap = await getDoc(quizRef)
    if (quizSnap.exists()) {
      return { id: quizSnap.id, ...quizSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting quiz:', error)
    return null
  }
}

export const getQuizzesByGameId = async (gameId) => {
  try {
    const quizzesRef = collection(db, 'quizzes')
    const q = query(quizzesRef, where('gameId', '==', parseInt(gameId)))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting quizzes by gameId:', error)
    return []
  }
}

export const getQuizzesByRating = async () => {
  try {
    const quizzesRef = collection(db, 'quizzes')
    const q = query(quizzesRef, orderBy('rating', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        rating: (data.upvotes || 0) - (data.downvotes || 0)
      }
    }).sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating
      }
      return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - 
             new Date(a.createdAt?.toDate?.() || a.createdAt || 0)
    })
  } catch (error) {
    console.error('Error getting quizzes by rating:', error)
    // Fallback: получаем все и сортируем вручную
    const quizzes = await getQuizzes()
    return quizzes.sort((a, b) => {
      const ratingA = (a.upvotes || 0) - (a.downvotes || 0)
      const ratingB = (b.upvotes || 0) - (b.downvotes || 0)
      if (ratingB !== ratingA) {
        return ratingB - ratingA
      }
      return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - 
             new Date(a.createdAt?.toDate?.() || a.createdAt || 0)
    })
  }
}

export const addQuiz = async (quiz) => {
  try {
    const quizData = {
      ...quiz,
      upvotes: 0,
      downvotes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'quizzes'), quizData)
    return { id: docRef.id, ...quizData }
  } catch (error) {
    console.error('Error adding quiz:', error)
    throw error
  }
}

export const updateQuiz = async (quizId, updates) => {
  try {
    const quizRef = doc(db, 'quizzes', quizId.toString())
    await updateDoc(quizRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    return await getQuizById(quizId)
  } catch (error) {
    console.error('Error updating quiz:', error)
    throw error
  }
}

// ==================== VOTES ====================

export const voteQuiz = async (userId, quizId, vote) => {
  try {
    const voteRef = doc(db, 'quizVotes', `${userId}_${quizId}`)
    const voteSnap = await getDoc(voteRef)
    const quizRef = doc(db, 'quizzes', quizId.toString())
    const quizSnap = await getDoc(quizRef)
    
    if (!quizSnap.exists()) {
      throw new Error('Quiz not found')
    }

    const quiz = quizSnap.data()
    const previousVote = voteSnap.exists() ? voteSnap.data().vote : null

    // Отменяем предыдущий голос
    if (previousVote === 'up') {
      await updateDoc(quizRef, {
        upvotes: Math.max(0, (quiz.upvotes || 0) - 1)
      })
    } else if (previousVote === 'down') {
      await updateDoc(quizRef, {
        downvotes: Math.max(0, (quiz.downvotes || 0) - 1)
      })
    }

    // Устанавливаем новый голос
    if (vote === 'up') {
      await updateDoc(quizRef, {
        upvotes: (quiz.upvotes || 0) + 1
      })
      await setDoc(voteRef, {
        userId,
        quizId,
        vote: 'up',
        createdAt: serverTimestamp(),
      })
    } else if (vote === 'down') {
      await updateDoc(quizRef, {
        downvotes: (quiz.downvotes || 0) + 1
      })
      await setDoc(voteRef, {
        userId,
        quizId,
        vote: 'down',
        createdAt: serverTimestamp(),
      })
    } else {
      // Удаляем голос
      if (voteSnap.exists()) {
        await deleteDoc(voteRef)
      }
    }

    return await getQuizById(quizId)
  } catch (error) {
    console.error('Error voting quiz:', error)
    throw error
  }
}

export const getUserVote = async (userId, quizId) => {
  try {
    const voteRef = doc(db, 'quizVotes', `${userId}_${quizId}`)
    const voteSnap = await getDoc(voteRef)
    if (voteSnap.exists()) {
      return voteSnap.data().vote
    }
    return null
  } catch (error) {
    console.error('Error getting user vote:', error)
    return null
  }
}

export const getQuizRating = (quiz) => {
  return (quiz.upvotes || 0) - (quiz.downvotes || 0)
}

// ==================== USERS ====================

export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting users:', error)
    return []
  }
}

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId.toString())
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const data = userSnap.data()
      return { id: userSnap.id, ...data }
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export const getUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export const getUserByUsername = async (username) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting user by username:', error)
    return null
  }
}

export const createUser = async (userData) => {
  try {
    const newUser = {
      ...userData,
      role: "user",
      avatar: null,
      createdAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'users'), newUser)
    return { id: docRef.id, ...newUser }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId.toString())
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    return await getUserById(userId)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const updateUserAvatar = async (userId, avatar) => {
  return await updateUser(userId, { avatar })
}

// ==================== QUIZ RESULTS ====================

export const addQuizResult = async (result) => {
  try {
    const user = await getUserById(result.userId)
    const resultData = {
      ...result,
      username: user?.username || "Unknown",
      completedAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'quizResults'), resultData)
    return { id: docRef.id, ...resultData }
  } catch (error) {
    console.error('Error adding quiz result:', error)
    throw error
  }
}

export const getUserResults = async (userId) => {
  try {
    const resultsRef = collection(db, 'quizResults')
    const q = query(resultsRef, where('userId', '==', parseInt(userId)))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting user results:', error)
    return []
  }
}

export const getLeaderboard = async () => {
  await initFirestore()
  const { collection, getDocs } = getFirestoreFunctions()
  
  try {
    const resultsRef = collection(db, 'quizResults')
    const snapshot = await getDocs(resultsRef)
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Собираем все уникальные userId
    const userIds = [...new Set(results.map(r => r.userId))]
    
    // Загружаем всех пользователей сразу
    const usersMap = {}
    for (const userId of userIds) {
      const user = await getUserById(userId)
      if (user) {
        usersMap[userId] = user
      }
    }

    // Группируем результаты по пользователю
    const userScores = {}
    for (const result of results) {
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
      userScores[result.userId].totalScore += result.score || 0
      userScores[result.userId].totalQuizzes += 1
    }

    // Вычисляем средний балл
    Object.values(userScores).forEach((user) => {
      user.averageScore = user.totalQuizzes > 0
        ? (user.totalScore / user.totalQuizzes).toFixed(2)
        : 0
    })

    // Сортируем по общему количеству очков
    return Object.values(userScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((user, index) => ({ ...user, rank: index + 1 }))
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return []
  }
}

// ==================== GAMES ====================
// Игры остаются в CSV, так как это статические данные

export { getGames, getGameById, loadGames } from './mockData'

