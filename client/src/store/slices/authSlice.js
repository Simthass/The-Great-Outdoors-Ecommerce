import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Secure axios instance with interceptors
const secureAxios = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor to add token
secureAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
secureAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Secure token storage
const secureStorage = {
  getToken: () => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Token access error:", error);
      return null;
    }
  },
  setToken: (token) => {
    try {
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Token storage error:", error);
      throw new Error("Failed to store authentication token");
    }
  },
  removeToken: () => {
    try {
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Token removal error:", error);
    }
  },
};

// Async thunks
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = secureStorage.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await secureAxios.get("/auth/verify");

      // Validate response structure
      if (!response.data?.success || !response.data.data?.user) {
        throw new Error("Invalid authentication response");
      }

      return response.data;
    } catch (error) {
      console.error("Auth check failed:", error);

      // Only logout on specific errors
      if (error.response?.status === 401) {
        secureStorage.removeToken();
      }

      return rejectWithValue(
        error.response?.data?.message || "Authentication verification failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Input validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      const response = await secureAxios.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      // Validate response
      if (!response.data?.success || !response.data.data?.token) {
        throw new Error("Invalid login response");
      }

      const { token, user } = response.data.data;

      // Validate token presence
      if (!token) {
        throw new Error("No token received from server");
      }

      secureStorage.setToken(token);

      return { user, token };
    } catch (error) {
      console.error("Login error:", error);

      // Don't expose specific error details to client
      const safeError =
        error.response?.status >= 500
          ? "Server error. Please try again later."
          : error.response?.data?.message || "Login failed";

      return rejectWithValue(safeError);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: secureStorage.getToken(),
    isAuthenticated: !!secureStorage.getToken(),
    loading: false,
    error: null,
    lastVerified: null,
    sessionExpiry: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      secureStorage.removeToken();
    },
    clearError: (state) => {
      state.error = null;
    },
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Add back the missing reducers for manual state management
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.lastVerified = Date.now();
      state.sessionExpiry = Date.now() + 30 * 60 * 1000;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
        state.lastVerified = Date.now();
        // Set session expiry (30 minutes from now)
        state.sessionExpiry = Date.now() + 30 * 60 * 1000;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear auth state immediately on verification failure
        // Let the interceptor handle 401 responses
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.lastVerified = Date.now();
        state.sessionExpiry = Date.now() + 30 * 60 * 1000;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
        state.error = action.payload;
      });
  },
});

export const {
  logout,
  clearError,
  updateUser,
  setSessionExpiry,
  loginStart,
  loginSuccess,
  loginFailure,
} = authSlice.actions;
export default authSlice.reducer;
