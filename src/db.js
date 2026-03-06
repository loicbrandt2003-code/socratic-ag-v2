// db.js — base de données Firebase Firestore (remplace localStorage)
import { db } from "./firebase";
import {
  doc, collection, setDoc, getDoc, getDocs,
  updateDoc, deleteField, onSnapshot, addDoc, serverTimestamp
} from "firebase/firestore";

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function createSession(name, description) {
  const ref = await addDoc(collection(db, "sessions"), {
    name,
    description,
    status: "active",
    createdAt: serverTimestamp(),
    points: [],
  });
  return ref.id;
}

export async function getSession(sessionId) {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getAllSessions() {
  const snap = await getDocs(collection(db, "sessions"));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export function onSessionsChange(callback) {
  return onSnapshot(collection(db, "sessions"), snap => {
    const sessions = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(sessions);
  });
}

export function onSessionChange(sessionId, callback) {
  return onSnapshot(doc(db, "sessions", sessionId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

// ─── Points ──────────────────────────────────────────────────────────────────

export async function addPoint(sessionId, title, description) {
  const sessionRef = doc(db, "sessions", sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) return null;
  const points = snap.data().points || [];
  const newPoint = {
    id: Date.now().toString(),
    title,
    description,
    status: "pending",
    createdAt: Date.now(),
  };
  points.push(newPoint);
  await updateDoc(sessionRef, { points });
  return newPoint.id;
}

export async function deletePoint(sessionId, pointId) {
  const sessionRef = doc(db, "sessions", sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) return;
  const points = (snap.data().points || []).filter(p => p.id !== pointId);
  await updateDoc(sessionRef, { points });
}

// ─── Responses ───────────────────────────────────────────────────────────────

export async function addResponse(sessionId, pointId, data) {
  await addDoc(collection(db, "sessions", sessionId, "responses"), {
    ...data,
    pointId,
    ts: Date.now(),
  });
}

export async function getResponses(sessionId, pointId) {
  const snap = await getDocs(collection(db, "sessions", sessionId, "responses"));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.pointId === pointId);
}

export function onResponsesChange(sessionId, pointId, callback) {
  return onSnapshot(collection(db, "sessions", sessionId, "responses"), snap => {
    const resps = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.pointId === pointId);
    callback(resps);
  });
}

export function onAllResponsesChange(sessionId, callback) {
  return onSnapshot(collection(db, "sessions", sessionId, "responses"), snap => {
    const resps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(resps);
  });
}
