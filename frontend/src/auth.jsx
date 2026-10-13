import { createContext, useContext, useState } from "react";
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
