import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSessions, createSession } from "../db";

const F = "'DM Sans','Helvetica Neue',Arial,sans-serif";

export default function Home() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    setSessions(getAllSessions());
  }, []);

  function handleCreate() {
    if (!name.trim()) return;
    const id = createSession(name.trim(), desc.trim());
    navigate(`/session/${id}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: F }}>
      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 16 }}>
          <div style={{ width: 34, height: 34, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>👥</div>
          Socratic Consensus
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={navBtnStyle}>🕐 Historique</button>
          <button style={navBtnStyle}>🖥️ Administration</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", padding: "80px 48px 60px", overflow: "hidden", minHeight: 340 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1400&q=60')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
          <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.05, margin: "0 0 20px", color: "#111", letterSpacing: -2 }}>
            Processus Socratique<br />
            <span style={{ color: "#555", fontWeight: 700 }}>pour vos Assemblées<br />Générales</span>
          </h1>
          <p style={{ color: "#555", fontSize: 18, lineHeight: 1.6, maxWidth: 540, margin: "0 0 36px" }}>
            Identifiez les objections, proposez des amendements et atteignez le consensus grâce à un questionnement structuré en temps réel.
          </p>
          <button onClick={() => setShowCreate(true)} style={ctaBtnStyle}>
            + Créer une session
          </button>
        </div>
      </div>

      {/* Sessions actives */}
      <div style={{ padding: "40px 48px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 24px" }}>Sessions actives</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 48 }}>
          {sessions.map(s => (
            <div key={s.id} style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: s.description ? 6 : 20 }}>
                <span style={{ fontWeight: 700, fontSize: 17 }}>{s.name}</span>
                <span style={badgeStyle}>Active</span>
              </div>
              {s.description && <p style={{ color: "#777", fontSize: 14, margin: "0 0 20px" }}>{s.description}</p>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => navigate(`/session/${s.id}`)}
                  style={manageBtn}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e5e5"}>
                  Gérer →
                </button>
                <button onClick={() => navigate(`/session/${s.id}`)} style={iconBtnStyle}>🖥️</button>
              </div>
            </div>
          ))}
          {/* Add new card */}
          <div style={{ ...cardStyle, border: "2px dashed #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140, cursor: "pointer", color: "#aaa" }}
            onClick={() => setShowCreate(true)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#111"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#aaa"; }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>+</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Nouvelle session</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "0 48px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 24px" }}>Comment ça fonctionne</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 48 }}>
          {[
            { n: "01", t: "Présentez le point", d: "Créez une session et ajoutez les points à l'ordre du jour. Un QR code unique est généré pour chaque point." },
            { n: "02", t: "Collectez les réponses", d: "Les participants scannent le QR code et répondent au questionnaire socratique pour exprimer leurs objections." },
            { n: "03", t: "Atteignez le consensus", d: "Visualisez les objections en temps réel, traitez les amendements et procédez au vote final." },
          ].map(h => (
            <div key={h.n} style={cardStyle}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#ddd", margin: "0 0 16px", letterSpacing: -2 }}>{h.n}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 10px" }}>{h.t}</h3>
              <p style={{ color: "#666", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{h.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 48px", borderTop: "1px solid #e5e5e5", background: "#fff", display: "flex", justifyContent: "space-between", fontSize: 13, color: "#aaa" }}>
        <span>Socratic Consensus — Faciliter le consentement en assemblée générale</span>
        <span>© 2026</span>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={overlayStyle} onClick={() => setShowCreate(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Créer une session</h3>
              <button onClick={() => setShowCreate(false)} style={closeBtnStyle}>×</button>
            </div>
            <p style={{ color: "#777", fontSize: 14, margin: "0 0 24px" }}>Configurez votre session AG.</p>
            <label style={labelStyle}>Nom de la session *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: AG annuelle 2026" autoFocus
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              style={inputStyle} />
            <label style={labelStyle}>Description (optionnel)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description..." rows={3}
              style={{ ...inputStyle, resize: "vertical" }} />
            <button onClick={handleCreate} disabled={!name.trim()}
              style={{ ...ctaBtnStyle, width: "100%", opacity: name.trim() ? 1 : 0.4 }}>
              Créer la session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const navBtnStyle = { padding: "8px 16px", background: "transparent", border: "1px solid #e5e5e5", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#555", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 };
const ctaBtnStyle = { display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 30px", background: "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const cardStyle = { background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e8e8e8", transition: "box-shadow 0.15s,transform 0.15s" };
const badgeStyle = { background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 12 };
const manageBtn = { flex: 1, padding: "10px 16px", background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, transition: "border-color 0.15s" };
const iconBtnStyle = { padding: "10px 14px", background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 16, cursor: "pointer" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle = { background: "#fff", borderRadius: 20, padding: 36, maxWidth: 480, width: "100%" };
const closeBtnStyle = { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" };
const labelStyle = { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#444" };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 16 };
