import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { onSessionChange, addResponse } from "../db";

const F = "'DM Sans','Helvetica Neue',Arial,sans-serif";

export default function ParticipantPage() {
  const { sessionId, pointId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [hasObjection, setHasObjection] = useState(null);
  const [perception, setPerception] = useState(null);
  const [interestType, setInterestType] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [protectsCollective, setProtectsCollective] = useState(null);
  const [verifiable, setVerifiable] = useState(null);
  const [canLift, setCanLift] = useState(null);
  const [amendment, setAmendment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const unsub = onSessionChange(sessionId, (s) => {
      setSession(s);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ color: "#666" }}>Chargement...</p>
        </div>
      </div>
    );
  }

  const point = session?.points?.find(p => p.id === pointId);

  if (!session || !point) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
          <p style={{ color: "#666" }}>Session ou point introuvable.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    await addResponse(sessionId, pointId, {
      name,
      hasObjection: hasObjection === true,
      perception,
      interestType,
      riskLevel,
      protectsCollective,
      verifiable,
      canLift,
      amendment,
    });
    setSubmitted(true);
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={pageStyle}>
        <TopBar session={session} point={point} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Réponse enregistrée</h2>
            <p style={{ color: "#666", fontSize: 15 }}>Merci {name}, votre réponse a bien été transmise.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Name screen ─────────────────────────────────────────────────────────────
  if (!nameSet) {
    return (
      <div style={pageStyle}>
        <TopBar session={session} point={point} />
        <div style={bodyStyle}>
          <div style={card}>
            <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 6px" }}>Bienvenue</h2>
            <p style={subText}>Entrez votre nom pour participer</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom et prénom"
              autoFocus
              onKeyDown={e => e.key === "Enter" && name.trim() && setNameSet(true)}
              style={inputStyle}
            />
            <button
              onClick={() => name.trim() && setNameSet(true)}
              disabled={!name.trim()}
              style={{ ...submitBtn, opacity: name.trim() ? 1 : 0.4 }}
            >
              Commencer →
            </button>
          </div>
          <div style={connectedAs}>Connecté en tant que...</div>
        </div>
      </div>
    );
  }

  // ── Main questionnaire ──────────────────────────────────────────────────────
  const canSubmitObjection = perception && interestType && riskLevel && protectsCollective && verifiable && canLift;

  return (
    <div style={pageStyle}>
      <TopBar session={session} point={point} />
      <div style={bodyStyle}>

        {/* Q1 — Objection ? */}
        <div style={card}>
          <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", lineHeight: 1.2, margin: "0 0 6px" }}>
            Y a-t-il une objection ?
          </h2>
          <p style={subText}>Concernant: {point.title}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <OvalRadio selected={hasObjection === false} onClick={() => setHasObjection(false)} icon="⊙" label="Non, aucune objection" />
            <OvalRadio selected={hasObjection === true} onClick={() => setHasObjection(true)} icon="△" label="Oui, j'ai une objection" />
          </div>
        </div>

        {/* No objection → simple submit */}
        {hasObjection === false && (
          <button onClick={handleSubmit} style={submitBtn}>
            Confirmer — Pas d'objection
          </button>
        )}

        {/* Objection details */}
        {hasObjection === true && (
          <>
            <div style={card}>
              <p style={sectionTitle}>Détails de l'objection</p>

              <p style={qLabel}>Comment percevez-vous ce point ?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  { val: "comprehension", label: "Problème de compréhension" },
                  { val: "reglement", label: "Problème de règlement" },
                  { val: "objection", label: "Objection de fond" },
                ].map(o => (
                  <OvalRadio key={o.val} selected={perception === o.val} onClick={() => setPerception(o.val)} label={o.label} />
                ))}
              </div>

              <p style={qLabel}>Quel intérêt est concerné ?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { val: "personnel", label: "Personnel" },
                  { val: "sous-groupe", label: "Sous-groupe" },
                  { val: "collectif", label: "Collectif" },
                  { val: "juridique", label: "Juridique" },
                  { val: "financier", label: "Financier" },
                ].map(o => (
                  <OvalRadio key={o.val} selected={interestType === o.val} onClick={() => setInterestType(o.val)} label={o.label} />
                ))}
              </div>
            </div>

            <div style={card}>
              <p style={qLabel}>Niveau du risque</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  { val: "certain", label: "Certain" },
                  { val: "probable", label: "Probable" },
                  { val: "hypothetique", label: "Hypothétique" },
                ].map(o => (
                  <OvalRadio key={o.val} selected={riskLevel === o.val} onClick={() => setRiskLevel(o.val)} label={o.label} />
                ))}
              </div>

              <BinaryQuestion label="L'objection protège-t-elle un intérêt collectif ?" value={protectsCollective} onChange={setProtectsCollective} />
              <BinaryQuestion label="Est-elle fondée sur un fait vérifiable ?" value={verifiable} onChange={setVerifiable} />
              <BinaryQuestion label="Peut-on lever le risque sans bloquer la décision ?" value={canLift} onChange={setCanLift} />

              <p style={{ ...qLabel, marginTop: 20 }}>Proposition d'amendement (optionnel)</p>
              <textarea
                value={amendment}
                onChange={e => setAmendment(e.target.value)}
                placeholder="Proposez une modification pour lever l'objection..."
                rows={4}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 10, fontSize: 14, fontFamily: F, outline: "none", resize: "none", boxSizing: "border-box", background: "#f5f5f0", color: "#888" }}
              />
            </div>

            <button onClick={handleSubmit} disabled={!canSubmitObjection}
              style={{ ...submitBtn, opacity: canSubmitObjection ? 1 : 0.4 }}>
              Soumettre mon objection
            </button>
          </>
        )}

        <div style={connectedAs}>Connecté en tant que {name}</div>
      </div>
    </div>
  );
}

function TopBar({ session, point }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "12px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 2 }}>{session.name}</div>
      <div style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>{point.title}</div>
    </div>
  );
}

function OvalRadio({ selected, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 16px", background: selected ? "#111" : "#fff", border: `1.5px solid ${selected ? "#111" : "#e8e8e8"}`, borderRadius: 10, cursor: "pointer", fontFamily: F, textAlign: "left", transition: "all 0.15s" }}>
      <span style={{ width: 22, height: 36, borderRadius: 20, border: `2px solid ${selected ? "#fff" : "#ddd"}`, background: selected ? "#333" : "#fff", display: "inline-block", flexShrink: 0 }} />
      {icon && <span style={{ fontSize: 15, color: selected ? "#fff" : "#555" }}>{icon}</span>}
      <span style={{ fontSize: 15, fontWeight: 500, color: selected ? "#fff" : "#111" }}>{label}</span>
    </button>
  );
}

function BinaryQuestion({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ ...qLabel, marginBottom: 10 }}>{label}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {["Oui", "Non"].map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            style={{ padding: "13px", background: value === opt ? "#111" : "#fff", color: value === opt ? "#fff" : "#111", border: `1.5px solid ${value === opt ? "#111" : "#e8e8e8"}`, borderRadius: 10, cursor: "pointer", fontFamily: F, fontWeight: 600, fontSize: 15, transition: "all 0.15s" }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#f5f5f0", fontFamily: F, display: "flex", flexDirection: "column" };
const bodyStyle = { flex: 1, padding: "16px 16px 32px", maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box" };
const card = { background: "#fff", borderRadius: 16, padding: "24px 20px", marginBottom: 12, border: "1px solid #ebebeb" };
const subText = { color: "#888", fontSize: 13, textAlign: "center", margin: "0 0 20px" };
const sectionTitle = { fontWeight: 800, fontSize: 16, margin: "0 0 18px", color: "#111" };
const qLabel = { fontSize: 13, fontWeight: 600, color: "#333", margin: "0 0 10px", lineHeight: 1.4 };
const inputStyle = { width: "100%", padding: "13px 14px", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 15, fontFamily: F, outline: "none", boxSizing: "border-box", marginBottom: 16 };
const submitBtn = { width: "100%", padding: "16px", background: "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F, marginBottom: 12 };
const connectedAs = { textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 16, paddingBottom: 16 };
