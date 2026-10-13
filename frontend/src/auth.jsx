import { createContext, useContext, useEffect, useState } from "react";
import { ambilToken, ambilUser, cekSesi, hapusSesi } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (ambilToken() ? ambilUser() : null));

  // Verifikasi token tersimpan ke backend saat aplikasi dimuat.
  // Token basi langsung dibersihkan agar user tidak terkunci di halaman dalam.
  useEffect(() => {
    if (!ambilToken()) return;
    cekSesi()
      .then((u) => setUser(u))
      .catch(() => {
        hapusSesi();
        setUser(null);
      });
  }, []);

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
