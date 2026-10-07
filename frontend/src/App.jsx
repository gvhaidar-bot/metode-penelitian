import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Rekomendasi from "./pages/Rekomendasi";
import Roadmap from "./pages/Roadmap";
import Riwayat from "./pages/Riwayat";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rekomendasi" element={<Rekomendasi />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/riwayat" element={<Riwayat />} />
    </Routes>
  );
};

export default App;
