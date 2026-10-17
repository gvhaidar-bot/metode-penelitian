import { createContext, useContext, useEffect, useState } from "react";
import { ambilToken, ambilUser, cekSesi, hapusSesi } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (ambilToken() ? ambilUser() : null));
  // Tanpa token tidak ada yang perlu divalidasi: langsung siap.
  const [siap, setSiap] = useState(() => !ambilToken());

  // Validasi token tersimpan ke server saat aplikasi dimuat.
  // Token basi langsung dibersihkan agar tidak terkunci di halaman dalam.
  useEffect(() => {
    let batal = false;
    if (!ambilToken()) return;
    cekSesi()
      .then((u) => {
        if (!batal) {
          setUser(u);
          setSiap(true);
        }
      })
      .catch(() => {
        if (!batal) {
          hapusSesi();
          setUser(null);
          setSiap(true);
        }
      });
    return () => {
      batal = true;
    };
  }, []);

  const masuk = (u) => setUser(u);
  const keluar = () => {
    hapusSesi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, masuk, keluar, siap }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
