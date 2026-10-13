import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Rekomendasi from "./pages/Rekomendasi";
import Roadmap from "./pages/Roadmap";
import Riwayat from "./pages/Riwayat";
import { AuthProvider, ProtectedRoute } from "./auth";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rekomendasi" element={<ProtectedRoute><Rekomendasi /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/riwayat" element={<ProtectedRoute><Riwayat /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
