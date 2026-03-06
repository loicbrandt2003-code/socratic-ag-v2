import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SessionPage from "./pages/SessionPage";
import PointPage from "./pages/PointPage";
import ParticipantPage from "./pages/ParticipantPage";

const F = "'DM Sans','Helvetica Neue',Arial,sans-serif";

export default function App() {
  return (
    <div style={{ fontFamily: F, margin: 0, padding: 0 }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/session/:sessionId/point/:pointId" element={<PointPage />} />
        <Route path="/participer/:sessionId/:pointId" element={<ParticipantPage />} />
      </Routes>
    </div>
  );
}
