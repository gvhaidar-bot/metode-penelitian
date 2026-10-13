import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth.jsx";

/** Bungkus route yang butuh login; lempar ke "/" bila belum login. */
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" replace state={{ dari: location.pathname }} />;
  }
  return children;
}
