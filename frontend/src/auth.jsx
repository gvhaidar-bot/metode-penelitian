import React, { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ambilToken, ambilUser, hapusSesi } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (ambilToken() ? ambilUser() : null));

  const masuk = (u) => setUser(u);
  const keluar = () => {
    hapusSesi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, masuk, keluar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Bungkus route yang butuh login; lempar ke "/" bila belum login. */
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" replace state={{ dari: location.pathname }} />;
  }
  return children;
}
