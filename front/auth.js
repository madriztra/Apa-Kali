// front/auth.js
let isLoggedIn = false;

export function login() {
  isLoggedIn = true;
}

export function logout() {
  isLoggedIn = false;
}

export function checkAuth() {
  return isLoggedIn;
}
