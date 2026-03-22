import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initial state is null. We don't read from localStorage for security.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 2. Global Interceptor for 401s (Expired Cookies)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // If the cookie is dead, clear the state and go to login
          setUser(null);
          // Only redirect if we're not already on the login page to avoid loops
          if (window.location.pathname !== "/login") {
             window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);


  const checkAuth = async () => {
    setLoading(true);
    try {
      // Axios sends the cookie automatically because of withCredentials: true
      const { data } = await axios.get(`${API_URL}/api/auth/me`);
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    // We just set the user object. The cookie was already set by the browser.
    setUser(userData);
  };

  // 5. Logout function
  const logout = async () => {
    try {
      // Tells the backend to clear the httpOnly cookie
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;