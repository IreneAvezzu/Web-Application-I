const BASE_URL = 'http://localhost:3001/api';

// support method (handles the response of fetch requests)
async function handleResponse(response) {
  if (response.ok) {
    if (response.status === 204) return null;
    return response.json();
  }
  
  const errMessage = await response.json().catch(() => ({ error: 'Errore di comunicazione con il server' }));
  throw errMessage;
}

// AUTHENTICATION SERVICES

// user login (POST /api/sessions)
export async function login(username, password) {
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include' // Consente al browser di salvare il cookie di sessione
  });
  return handleResponse(response);
}

// user logout (DELETE /api/sessions/current)
export async function logout() {
  const response = await fetch(`${BASE_URL}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
}

// get current user (GET /api/sessions/current)
export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/sessions/current`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
}

// register new user (POST /api/users)
export async function registerUser(username, password) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });
  return handleResponse(response);
}


// GAME SERVICES

// map structure (GET /api/network)
export async function getNetwork() {
  const response = await fetch(`${BASE_URL}/network`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
}

// start new game (POST /api/games/start)
export async function startGame() {
  const response = await fetch(`${BASE_URL}/games/start`, {
    method: 'POST',
    credentials: 'include'
  });
  return handleResponse(response);
}

// send route for validation and scoring (POST /api/games/:id/validate)
export async function validateGame(gameId, routeData) {
  const response = await fetch(`${BASE_URL}/games/${gameId}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData), // routeData conterrà { route, startStation, endStation }
    credentials: 'include'
  });
  return handleResponse(response);
}

// restore the ranking (GET /api/ranking)
export async function getRanking() {
  const response = await fetch(`${BASE_URL}/ranking`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(response);
}