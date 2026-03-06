import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { getSession, addResponse } from "../db";

const F = "'DM Sans','Helvetica Neue',Arial,sans-serif";

export default function ParticipantPage() {
  const { sessionId, pointId } = useParams();
  const session = getSession(sessionId);
  const point = session?.points?.find(p => p.id === pointId);

  const [name, setName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [hasObjection, setHasObjection] = useState(null); // null | true | false
  const [perception, setPerception] = useState(null);
  const [interestType, setInterestType] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [protectsCollective, setProtectsCollective] = useState(null);
  const [verifiable, setVerifiable] = useState(null);
  const [canLift, setCanLift] = useState(null);
  const [amendment, setAmendment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!session || !point) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
          <p style={{ color: "#666" }}>Session ou point introuvable.</p>
        </div>
      </div>
    );
  }

  function handleSubmit() {
    addResponse(sessionId, pointId, {
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

  if (submitted) {
    return (
      <div style={pageStyle}>
        <Header session={session} point={point} />
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

  // Step 1: name
  if (!nameSet) {
    return (
      <div style={pageStyle}>
        <Header session={session} point={point} />
        <div style={bodyStyle}>
          <h2 style={qTitle}>Bienvenue</h2>
          <p style={qSub}>Entrez votre nom pour participer au questionnaire.</p>
          <label style={lbl}>Nom & Prénom</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Marie Dupont" autoFocus
            onKeyDown={e => e.key === "Enter" && name.trim() && setNameSet(true)}
            style={inp} />
          <button onClick={() => name.trim() && setNameSet(true)} disabled={!name.trim()}
            style={{ ...bigBtn, opacity: name.trim() ? 1 : 0.4 }}>
            Commencer →
          </button>
          <div style={connectedAs}>Connecté en tant que...</div>
        </div>
      </div>
    );
  }

  // Main questionnaire — all on one page like the screenshots
  return (
    <div style={pageStyle}>
      <Header session={session} point={point} name={name} />
      <div style={bodyStyle}>

        {/* Q1: Objection? */}
        <div style={sectionBox}>
          <h2 style={{ ...qTitle, fontSize: 26 }}>Y a-t-il une objection ?</h2>
          <p style={{ ...qSub, margin: "0 0 20px" }}>Concernant: {point.title}</p>
          <RadioOval
            options={[
              { val: false, label: "⊙  Non, aucune objection" },
              { val: true, label: "△  Oui, j'ai une objection" },
            ]}
            value={hasObjection}
            onChange={v => { setHasObjection(v); if (v === false) { setPerception(null); } }}
          />
        </div>

        {/* If no objection, just submit */}
        {hasObjection === false && (
          <button onClick={handleSubmit} style={{ ...bigBtn, marginTop: 8 }}>
            Confirmer — Pas d'objection
          </button>
        )}

        {/* If objection: show all detail questions */}
        {hasObjection === true && (
          <>
            <div style={sectionBox}>
              <p style={sectionLabel}>Détails de l'objection</p>

              {/* Perception */}
              <p style={qLabel}>Comment percevez-vous ce point ?</p>
              <RadioOval
                options={[
                  { val: "comprehension", label: "Problème de compréhension" },
                  { val: "reglement", label: "Problème de règlement" },
                  { val: "objection", label: "Objection de fond" },
                ]}
                value={perception}
                onChange={setPerception}
              />

              {/* Interest type */}
              <p style={{ ...qLabel, marginTop: 20 }}>Quel intérêt est concerné ?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["Personnel", "Sous-groupe", "Collectif", "Juridique", "Financier"].map(opt => {
                  const val = opt.toLowerCase().replace("-", "-");
                  const sel = interestType === val;
                  return (
                    <button key={val} onClick={() => setInterestType(val)}
                      style={{ ...ovalBtn, background: sel ? "#111" : "#fff", color: sel ? "#fff" : "#111", border: `1.5px solid ${sel ? "#111" : "#e5e5e5"}` }}>
                      <span style={ovalDot} />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={sectionBox}>
              {/* Risk level */}
              <p style={qLabel}>Niveau du risque</p>
              <RadioOval
                options={[
                  { val: "certain", label: "Certain" },
                  { val: "probable", label: "Probable" },
                  { val: "hypothetique", label: "Hypothétique" },
                ]}
                value={riskLevel}
                onChange={setRiskLevel}
              />

              {/* Protects collective */}
              <p style={{ ...qLabel, marginTop: 20 }}>L'objection protège-t-elle un intérêt collectif ?</p>
              <TwoBtn value={protectsCollective} onChange={setProtectsCollective} />

              {/* Verifiable */}
              <p style={{ ...qLabel, marginTop: 20 }}>Est-elle fondée sur un fait vérifiable ?</p>
              <TwoBtn value={verifiable} onChange={setVerifiable} />

              {/* Can lift */}
              <p style={{ ...qLabel, marginTop: 20 }}>Peut-on lever le risque sans bloquer la décision ?</p>
              <TwoBtn value={canLift} onChange={setCanLift} />

              {/* Amendment */}
              <p style={{ ...qLabel, marginTop: 20 }}>Proposition d'amendement (optionnel)</p>
              <textarea
                value={amendment}
                onChange={e => setAmendment(e.target.value)}
                placeholder="Proposez une modification pour lever l'objection..."
                rows={4}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 10, fontSize: 14, fontFamily: F, outline: "none", resize: "vertical", boxSizing: "border-box", background: "#f5f5f0" }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!perception || !interestType || !riskLevel || !protectsCollective || !verifiable || !canLift}
              style={{ ...bigBtn, opacity: (perception && interestType && riskLevel && protectsCollective && verifiable && canLift) ? 1 : 0.4, marginTop: 8 }}>
              Soumettre mon objection
            </button>
          </>
        )}

        <div style={connectedAs}>Connecté en tant que {name}</div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header({ session, point, name }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "14px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>{session.name}</div>
      <div style={{ fontWeight: 800, fontSize: 17, color: "#111" }}>{point.title}</div>
    </div>
  );
}

function RadioOval({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map(o => {
        const sel = value === o.val;
        return (
          <button key={String(o.val)} onClick={() => onChange(o.val)}
            style={{ ...ovalBtn, background: sel ? "#111" : "#fff", color: sel ? "#fff" : "#111", border: `1.5px solid ${sel ? "#111" : "#e5e5e5"}`, width: "100%" }}>
            <span style={{ ...ovalDot, background: sel ? "#fff" : "#e5e5e5", border: sel ? "4px solid #555" : "1px solid #ccc" }} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function TwoBtn({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {["Oui", "Non"].map(opt => {
        const sel = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)}
            style={{ padding: "12px", background: sel ? "#111" : "#fff", color: sel ? "#fff" : "#111", border: `1.5px solid ${sel ? "#111" : "#e5e5e5"}`, borderRadius: 10, cursor: "pointer", fontFamily: F, fontWeight: 600, fontSize: 15 }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// Styles
const pageStyle = { minHeight: "100vh", background: "#f5f5f0", fontFamily: F, display: "flex", flexDirection: "column" };
const bodyStyle = { flex: 1, padding: "24px 20px", maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box" };
const sectionBox = { background: "#fff", borderRadius: 16, padding: 20, marginBottom: 14, border: "1px solid #ebebeb" };
const sectionLabel = { fontWeight: 800, fontSize: 16, margin: "0 0 16px", color: "#111" };
const qTitle = { fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: "0 0 8px", color: "#111", textAlign: "center" };
const qSub = { color: "#888", fontSize: 14, textAlign: "center", margin: "0 0 24px" };
const qLabel = { fontSize: 14, fontWeight: 600, color: "#333", margin: "0 0 10px" };
const lbl = { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#444" };
const inp = { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 15, fontFamily: F, outline: "none", boxSizing: "border-box", marginBottom: 16 };
const bigBtn = { width: "100%", padding: "16px", background: "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F };
const ovalBtn = { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, cursor: "pointer", fontFamily: F, fontSize: 15, fontWeight: 500, textAlign: "left" };
const ovalDot = { width: 20, height: 20, borderRadius: "50%", display: "inline-block", flexShrink: 0, border: "1px solid #ccc", background: "#e5e5e5" };
const connectedAs = { textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 24, paddingBottom: 24 };
