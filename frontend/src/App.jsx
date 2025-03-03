// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MapComponent from "./components/MapComponent";
import AeonMallMap from "./components/AeonMallMap";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapComponent />} />
        <Route path="/indoor-map" element={<AeonMallMap />} />
      </Routes>
    </Router>
  );
}

export default App;
