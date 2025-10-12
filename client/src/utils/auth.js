// src/utils/auth.js - FIXED VERSION
export const getAuthToken = () => {
  // Use consistent token key
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const isLoggedIn = () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Check if token is expired (optional)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return !!token; // If can't parse, just check if token exists
  }
};

export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  sessionStorage.removeItem("token");
};
