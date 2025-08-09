// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely parse localStorage data
const getSafeLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    localStorage.removeItem(key);
    return null;
  }
};

// Initialize state from localStorage
const initialState = {
  user: getSafeLocalStorage("userInfo"),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;

      // Handle both response structures for backward compatibility
      const userData = action.payload.data
        ? action.payload.data
        : action.payload;

      state.user = userData.user;
      state.token = userData.token;
      state.error = null;

      // Ensure user data is properly stored
      try {
        localStorage.setItem("userInfo", JSON.stringify(userData.user));
        localStorage.setItem("token", userData.token);
        console.log("User logged in successfully:", userData.user);
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;

      // Clear localStorage on login failure
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;

      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      console.log("User logged out successfully");
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      // Update user profile in state
      if (state.user) {
        // Handle both response structures
        const updateData = action.payload.data
          ? action.payload.data
          : action.payload;

        state.user = { ...state.user, ...updateData.user };
        state.token = updateData.token || state.token;

        // Update localStorage
        try {
          localStorage.setItem("userInfo", JSON.stringify(state.user));
          if (updateData.token) {
            localStorage.setItem("token", updateData.token);
          }
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      }
    },
    // Action to restore auth state (useful for app initialization)
    restoreAuthState: (state) => {
      const storedUser = getSafeLocalStorage("userInfo");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        state.user = storedUser;
        state.token = storedToken;
        state.isAuthenticated = true;
        console.log("Auth state restored:", storedUser);
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUserProfile,
  restoreAuthState,
} = authSlice.actions;

export default authSlice.reducer;
