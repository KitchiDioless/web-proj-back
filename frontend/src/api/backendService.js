const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

const getAuthHeaders = () => {
  const token =
    localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text || `Request failed with status ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === 'string') {
        message = parsed.message;
      } else if (Array.isArray(parsed?.message) && parsed.message.length > 0) {
        message = parsed.message.join(', ');
      } else if (parsed?.error && typeof parsed.error === 'string') {
        message = parsed.error;
      }
    } catch {
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
};

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

export const deleteQuiz = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
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

export const getGames = async () => {
  const res = await fetch(`${API_BASE_URL}/api/games`);
  const games = await handleResponse(res);
  return (games || []).map((g) => ({
    ...g,
    name: g.title ?? g.name,
    releaseYear: g.releasedAt ? new Date(g.releasedAt).getUTCFullYear() : g.releaseYear ?? null,
  }));
};

export const getGameById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/games/${id}`);
  const g = await handleResponse(res);
  return {
    ...g,
    name: g.title ?? g.name,
    releaseYear: g.releasedAt ? new Date(g.releasedAt).getUTCFullYear() : g.releaseYear ?? null,
  };
};

export const loadGames = getGames;

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

export const refreshBackend = async (refreshToken) => {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse(res);
};
