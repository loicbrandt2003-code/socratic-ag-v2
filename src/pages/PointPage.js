import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { onSessionChange, onResponsesChange } from "../db";

const F = "'DM Sans','Helvetica Neue',Arial,sans-serif";
const perceptionLabel = { comprehension: "Problème de compréhension", reglement: "Problème de règlement", objection: "Objection de fond" };
const interestLabel = { personnel: "Personnel", "sous-groupe": "Sous-groupe", collectif: "Collectif", juridique: "Juridique", financier: "Financier" };

export default function PointPage() {
  const { sessionId, pointId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [resps, setResps] = useState([]);
  const [votes, setVotes] = useState({ pour: 0, contre: 0, abstention: 0 });

  useEffect(() => {
    const unsubSession = onSessionChange(sessionId, setSession);
    const unsubResps = onResponsesChange(sessionId, pointId, setResps);
    return () => { unsubSession(); unsubResps(); };
  }, [sessionId, pointId]);

  if (!session) return null;
  const point = session.points?.find(p => p.id === pointId);
  if (!point) return <div style={{ padding: 48, fontFamily: F, color: "#666" }}>Point introuvable.</div>;

  const objections = resps.filter(r => r.hasObjection);
  const noObj = resps.filter(r => !r.hasObjection);
  const participantUrl = `${window.location.origin}/participer/${sessionId}/${pointId}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: F }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(`/session/${sessionId}`)} style={backBtn}>←</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#666" }}>{resps.length} participant(s)</span>
          <div style={liveBadge}>
            <span style={liveDot} />
            <span style={{ fontSize: 13, color: "#e11d48", fontWeight: 600 }}>Discussion</span>
          </div>
          <button style={projBtn}>🖥️ Projection</button>
        </div>
      </div>

      <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 32px", letterSpacing: -1 }}>{point.title}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          {/* LEFT */}
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "👥", val: resps.length, label: "Réponses", color: "#111" },
                { icon: "✅", val: noObj.length, label: "Sans objection", color: "#16a34a" },
                { icon: "⚠️", val: objections.length, label: "Objections", color: "#dc2626" },
              ].map(s => (
                <div key={s.label} style={statCard}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Objections list */}
            {objections.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span>⚠️</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: "#dc2626" }}>Objections ({objections.length})</span>
                </div>
                {objections.map(r => (
                  <div key={r.id} style={objCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: "#dc2626" }}>{r.name}</span>
                      {r.riskLevel && (
                        <span style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
                          Risque {r.riskLevel.charAt(0).toUpperCase() + r.riskLevel.slice(1)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {r.perception && (
                        <div>
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>👁️ Type</div>
                          <div style={{ fontWeight: 600, color: "#dc2626", fontSize: 14 }}>{perceptionLabel[r.perception] || r.perception}</div>
                        </div>
                      )}
                      {r.interestType && (
                        <div>
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>👥 Intérêt</div>
                          <div style={{ fontWeight: 600, color: "#dc2626", fontSize: 14 }}>{interestLabel[r.interestType] || r.interestType}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: r.amendment ? 14 : 0 }}>
                      {r.protectsCollective && <GreenTag>⊙ Intérêt collectif: {r.protectsCollective}</GreenTag>}
                      {r.verifiable && <GreenTag>📄 Fait vérifiable: {r.verifiable}</GreenTag>}
                      {r.canLift && <GreenTag>Risque levable: {r.canLift}</GreenTag>}
                    </div>
                    {r.amendment && (
                      <div style={amendBox}>
                        <div style={{ fontSize: 13, color: "#a16207", marginBottom: 6 }}>💡 <strong>Amendement proposé :</strong></div>
                        <div style={{ fontSize: 14, color: "#78350f", fontStyle: "italic" }}>"{r.amendment}"</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No objection list */}
            {noObj.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#16a34a", marginBottom: 12 }}>✓ Sans objection ({noObj.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {noObj.map(r => (
                    <span key={r.id} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "6px 16px", fontSize: 14, color: "#166534" }}>
                      ✓ {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resps.length === 0 && (
              <div style={emptyWaiting}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
                <div style={{ fontSize: 16 }}>En attente des réponses...</div>
                <div style={{ fontSize: 14, color: "#aaa", marginTop: 6 }}>Les participants scannent le QR code ci-contre</div>
              </div>
            )}

            {/* Vote */}
            {objections.length === 0 && resps.length > 0 && (
              <div style={voteBox}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>🗳️ Vote final</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    { t: "pour", label: "✓ Pour", bg: "#f0fdf4", brd: "#bbf7d0", col: "#16a34a" },
                    { t: "contre", label: "✗ Contre", bg: "#fff5f5", brd: "#fecaca", col: "#dc2626" },
                    { t: "abstention", label: "— Abstention", bg: "#f9f9f9", brd: "#e5e5e5", col: "#666" },
                  ].map(v => (
                    <button key={v.t} onClick={() => setVotes(p => ({ ...p, [v.t]: p[v.t] + 1 }))}
                      style={{ padding: 20, background: v.bg, border: `1.5px solid ${v.brd}`, borderRadius: 12, cursor: "pointer", fontFamily: F, color: v.col, fontWeight: 700, fontSize: 15 }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>{votes[v.t]}</div>
                      {v.label}
                    </button>
                  ))}
                </div>
                {(votes.pour + votes.contre + votes.abstention) > 0 && (
                  <div style={{ marginTop: 14, display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 }}>
                    {votes.pour > 0 && <div style={{ flex: votes.pour, background: "#16a34a" }} />}
                    {votes.contre > 0 && <div style={{ flex: votes.contre, background: "#dc2626" }} />}
                    {votes.abstention > 0 && <div style={{ flex: votes.abstention, background: "#999" }} />}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT - QR */}
          <div>
            <div style={qrPanel}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Participez</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <QRCodeSVG value={participantUrl} size={220} level="M" includeMargin={true} />
              </div>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 12, textAlign: "center" }}>Scannez pour répondre</div>
              <div style={{ background: "#f5f5f0", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#888", fontFamily: "monospace", wordBreak: "break-all", textAlign: "center" }}>
                {participantUrl}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GreenTag({ children }) {
  return <span style={{ background: "#166534", color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 500 }}>{children}</span>;
}

const backBtn = { background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#555", padding: "4px 8px" };
const liveBadge = { display: "flex", alignItems: "center", gap: 6, background: "#fce7f3", borderRadius: 20, padding: "6px 14px" };
const liveDot = { width: 8, height: 8, background: "#e11d48", borderRadius: "50%", display: "inline-block", animation: "pulse 1.5s infinite" };
const projBtn = { padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 6 };
const statCard = { background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", textAlign: "center" };
const objCard = { background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 16, padding: 24, marginBottom: 14 };
const amendBox = { background: "#fefce8", border: "1px solid #fef08a", borderRadius: 10, padding: "14px 16px" };
const emptyWaiting = { background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", border: "1px solid #e8e8e8", color: "#999" };
const voteBox = { background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e8e8e8", marginTop: 8 };
const qrPanel = { background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", textAlign: "center", position: "sticky", top: 80 };
