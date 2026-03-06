// ─── Shared in-memory store ───────────────────────────────────────────────────
// In production you'd replace this with a real backend (Firebase, Supabase, etc.)
// For now, data lives in localStorage so it persists across page refreshes
// and is shared within the same browser tab session.

const STORAGE_KEY = "socratic_ag_data";

function loadDB() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    sessions: {},
    responses: {},
    _id: 1,
  };
}

function saveDB() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
  } catch (e) {}
}

export const DB = loadDB();

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDB, 200);
}

export function uid() {
  const id = String(DB._id++);
  scheduleSave();
  return id;
}

export function createSession(name, description) {
  const id = uid();
  DB.sessions[id] = {
    id,
    name,
    description,
    status: "active",
    createdAt: Date.now(),
    points: [],
  };
  scheduleSave();
  return id;
}

export function addPoint(sessionId, title, description) {
  const id = uid();
  if (!DB.sessions[sessionId]) return null;
  DB.sessions[sessionId].points.push({
    id,
    title,
    description,
    status: "pending",
    createdAt: Date.now(),
  });
  scheduleSave();
  return id;
}

export function deletePoint(sessionId, pointId) {
  if (!DB.sessions[sessionId]) return;
  DB.sessions[sessionId].points = DB.sessions[sessionId].points.filter(
    (p) => p.id !== pointId
  );
  scheduleSave();
}

export function getSession(sessionId) {
  return DB.sessions[sessionId] || null;
}

export function getAllSessions() {
  return Object.values(DB.sessions).sort((a, b) => b.createdAt - a.createdAt);
}

export function getResponses(sessionId, pointId) {
  return DB.responses[`${sessionId}:${pointId}`] || [];
}

export function addResponse(sessionId, pointId, data) {
  const key = `${sessionId}:${pointId}`;
  if (!DB.responses[key]) DB.responses[key] = [];
  DB.responses[key].push({ id: uid(), ...data, ts: Date.now() });
  scheduleSave();
}
