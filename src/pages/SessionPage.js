import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getSession, getResponses, addPoint, deletePoint, DB } from "../db";

const F = "'DM Sans','Helvetica Neue',Arial,sans-serif";

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [resps, setResps] = useState({});
  const [activity, setActivity] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [ptTitle, setPtTitle] = useState("");
  const [ptDesc, setPtDesc] = useState("");

  useEffect(() => {
    const refresh = () => {
      const s = getSession(sessionId);
      if (!s) return;
      setSession({ ...s, points: [...(s.points || [])] });
      const r = {};
      (s.points || []).forEach(p => { r[p.id] = getResponses(sessionId, p.id); });
      setResps(r);
      const all = [];
      (s.points || []).forEach(p => getResponses(sessionId, p.id).forEach(resp => all.push({ ...resp, pointTitle: p.title })));
      all.sort((a, b) => b.ts - a.ts);
      setActivity(all.slice(0, 10));
    };
    refresh();
    const t = setInterval(refresh, 800);
    return () => clearInterval(t);
  }, [sessionId]);

  if (!session) return <div style={{ padding: 48, fontFamily: F, textAlign: "center", color: "#666" }}>Session introuvable.</div>;

  function handleAddPoint() {
    if (!ptTitle.trim()) return;
    addPoint(sessionId, ptTitle.trim(), ptDesc.trim());
    setPtTitle(""); setPtDesc(""); setShowAdd(false);
  }

  function handleDelete(pid) {
    deletePoint(sessionId, pid);
    setSession({ ...getSession(sessionId) });
  }

  const totalPart = new Set(Object.values(resps).flatMap(arr => arr.map(r => r.name))).size;
  const participantUrl = (pid) => `${window.location.origin}/participer/${sessionId}/${pid}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: F }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/")} style={backBtn}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{session.name}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{totalPart} participant(s)</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={iconTopBtn}>↻</button>
          <button style={projBtn}>🖥️ Projection</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, padding: 32, maxWidth: 1300, margin: "0 auto" }}>

        {/* LEFT */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Ordre du jour</h2>
            <button onClick={() => setShowAdd(true)} style={addPtBtn}>+ Ajouter un point</button>
          </div>

          {(!session.points || session.points.length === 0)
            ? <div style={emptyCard}>Aucun point à l'ordre du jour</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {session.points.map(p => {
                  const pr = resps[p.id] || [];
                  const obj = pr.filter(r => r.hasObjection);
                  const ok = pr.filter(r => !r.hasObjection);
                  return (
                    <div key={p.id} style={pointCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{p.title}</div>
                          {p.description && <div style={{ color: "#777", fontSize: 14 }}>{p.description}</div>}
                        </div>
                        <span style={pendingBadge}>En attente</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                        <StatCard val={pr.length} label="Réponses" />
                        <StatCard val={obj.length} label="Objections" red={obj.length > 0} />
                        <StatCard val={ok.length} label="OK" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => setShowQR(p.id)} style={qrBtn}>▦ QR Code</button>
                        <button onClick={() => navigate(`/session/${sessionId}/point/${p.id}`)} style={startBtn}>▶ Démarrer</button>
                        <button onClick={() => handleDelete(p.id)} style={delBtn}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>}
        </div>

        {/* RIGHT - Activité en direct */}
        <div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8", overflow: "hidden", position: "sticky", top: 80 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Activité en direct</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fce7f3", borderRadius: 20, padding: "5px 12px" }}>
                <span style={{ width: 7, height: 7, background: "#e11d48", borderRadius: "50%", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 12, color: "#e11d48", fontWeight: 600 }}>Live</span>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {activity.length === 0
                ? <div style={{ textAlign: "center", color: "#bbb", fontSize: 14, padding: "32px 0" }}>En attente de réponses...</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activity.map(a => (
                      <div key={a.id} style={{ padding: 12, background: a.hasObjection ? "#fff5f5" : "#f0fdf4", borderRadius: 10, border: `1px solid ${a.hasObjection ? "#fecaca" : "#bbf7d0"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                          <span style={{ fontSize: 11, color: "#aaa" }}>{new Date(a.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>{a.pointTitle}</div>
                        <div style={{ fontSize: 12, color: a.hasObjection ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                          {a.hasObjection ? "⚠️ Objection" : "✓ Sans objection"}
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (() => {
        const pt = session.points?.find(p => p.id === showQR);
        const url = participantUrl(showQR);
        return (
          <div style={overlayStyle} onClick={() => setShowQR(null)}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, textAlign: "center" }}>QR Code</div>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 24, textAlign: "center" }}>{pt?.title}</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <QRCodeSVG value={url} size={220} level="M" includeMargin={true} />
              </div>
              <div style={{ background: "#f5f5f0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#555", fontFamily: "monospace", marginBottom: 20, wordBreak: "break-all", textAlign: "center" }}>
                {url}
              </div>
              <p style={{ color: "#888", fontSize: 13, textAlign: "center", margin: "0 0 20px" }}>
                Les participants scannent ce QR code avec leur smartphone pour accéder au questionnaire.
              </p>
              <button onClick={() => setShowQR(null)} style={{ ...addPtBtn, width: "100%", justifyContent: "center" }}>Fermer</button>
            </div>
          </div>
        );
      })()}

      {/* Add point modal */}
      {showAdd && (
        <div style={overlayStyle} onClick={() => setShowAdd(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Nouveau point à l'ordre du jour</h3>
              <button onClick={() => setShowAdd(false)} style={closeBtn}>×</button>
            </div>
            <label style={lbl}>Titre *</label>
            <input value={ptTitle} onChange={e => setPtTitle(e.target.value)} placeholder="Ex: Approbation du budget 2026" autoFocus
              onKeyDown={e => e.key === "Enter" && handleAddPoint()}
              style={{ ...inp, border: "1.5px solid #111" }} />
            <label style={lbl}>Description</label>
            <textarea value={ptDesc} onChange={e => setPtDesc(e.target.value)} placeholder="Détails du point..." rows={4}
              style={{ ...inp, resize: "vertical", background: "#f5f5f0" }} />
            <button onClick={handleAddPoint} disabled={!ptTitle.trim()}
              style={{ ...addPtBtn, width: "100%", justifyContent: "center", opacity: ptTitle.trim() ? 1 : 0.4 }}>
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ val, label, red }) {
  return (
    <div style={{ background: "#f9f9f9", borderRadius: 12, padding: "16px 20px", border: "1px solid #e8e8e8" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: red ? "#dc2626" : "#111" }}>{val}</div>
      <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// Styles
const backBtn = { background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#555", padding: "4px 8px" };
const iconTopBtn = { width: 36, height: 36, background: "#f5f5f0", border: "1px solid #e5e5e5", borderRadius: 8, cursor: "pointer", fontSize: 16 };
const projBtn = { padding: "8px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 6 };
const addPtBtn = { padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 6 };
const emptyCard = { background: "#fff", borderRadius: 16, padding: "60px 24px", textAlign: "center", border: "1px solid #e8e8e8", color: "#aaa", fontSize: 15 };
const pointCard = { background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e8e8e8" };
const pendingBadge = { background: "#f1f5f9", color: "#555", borderRadius: 20, padding: "4px 14px", fontSize: 13, whiteSpace: "nowrap" };
const qrBtn = { padding: "10px 18px", background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 };
const startBtn = { padding: "10px 22px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 6 };
const delBtn = { padding: "10px 12px", background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 16, cursor: "pointer", color: "#dc2626" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle = { background: "#fff", borderRadius: 20, padding: 36, maxWidth: 460, width: "100%" };
const closeBtn = { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" };
const lbl = { fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 };
const inp = { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 15, fontFamily: F, outline: "none", boxSizing: "border-box", marginBottom: 18 };
