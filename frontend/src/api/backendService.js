const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// Quizzes
export const getQuizzes = async () => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes`);
  return handleResponse(res);
};

export const getQuizById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}`);
  return handleResponse(res);
};

export const getQuizzesByGameId = async (gameId) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/by-game/${gameId}`);
  return handleResponse(res);
};

export const getQuizzesByRating = async () => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/by-rating`);
  return handleResponse(res);
};

export const addQuiz = async (quiz) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(quiz),
  });
  return handleResponse(res);
};

export const updateQuiz = async (id, quiz) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(quiz),
  });
  return handleResponse(res);
};

export const voteQuiz = async (userId, quizId, vote) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ userId, vote }),
  });
  return handleResponse(res);
};

export const getUserVote = async (userId, quizId) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/vote/${userId}`);
  return handleResponse(res);
};

// Users
export const getUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/api/users`);
  return handleResponse(res);
};

export const getUserById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
  return handleResponse(res);
};

export const getUserByEmail = async (email) => {
  const url = new URL(`${API_BASE_URL}/api/users/by-email`);
  url.searchParams.set('email', email);
  const res = await fetch(url);
  return handleResponse(res);
};

export const getUserByUsername = async (username) => {
  const url = new URL(`${API_BASE_URL}/api/users/by-username`);
  url.searchParams.set('username', username);
  const res = await fetch(url);
  return handleResponse(res);
};

export const createUser = async (user) => {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(user),
  });
  return handleResponse(res);
};

export const updateUser = async (userId, updates) => {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
};

export const updateUserAvatar = async (userId, avatarUrl) => {
  return updateUser(userId, { avatarUrl });
};

// Results & leaderboard
export const addQuizResult = async (result) => {
  const res = await fetch(`${API_BASE_URL}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(result),
  });
  return handleResponse(res);
};

export const getUserResults = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/results`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const getLeaderboard = async () => {
  const res = await fetch(`${API_BASE_URL}/api/leaderboard`);
  return handleResponse(res);
};

// Games
export const getGames = async () => {
  const res = await fetch(`${API_BASE_URL}/api/games`);
  return handleResponse(res);
};

export const getGameById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/games/${id}`);
  return handleResponse(res);
};

// CSV-загрузка игр на бекенде пока не реализована, оставим loadGames как алиас getGames
export const loadGames = getGames;

// Auth
export const loginBackend = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const registerBackend = async (username, email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
};
