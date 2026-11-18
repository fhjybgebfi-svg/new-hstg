import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.PUBLIC_ORIGIN ? process.env.PUBLIC_ORIGIN.split(",") : "*" },
  maxHttpBufferSize: 1e5
});
const PORT = Number(process.env.PORT || 3000);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const rooms = new Map();
const players = new Map();
const cleanText = (v, max = 32) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
const roomCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ status: "ok", rooms: rooms.size, players: players.size }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

function roomFor(code) {
  let room = rooms.get(code);
  if (!room) {
    room = { code, players: new Map(), event: null, createdAt: Date.now() };
    rooms.set(code, room);
  }
  return room;
}
function publicPlayer(p) {
  return { id: p.id, name: p.name, x: p.x, y: p.y, color: p.color, hp: p.hp, kills: p.kills };
}
function emitRoom(room) {
  io.to(room.code).emit("state", {
    room: room.code,
    players: [...room.players.values()].map(publicPlayer),
    event: room.event
  });
}
function leaveRoom(socket) {
  const p = players.get(socket.id);
  if (!p) return;
  const room = rooms.get(p.room);
  if (room) {
    room.players.delete(socket.id);
    socket.leave(room.code);
    emitRoom(room);
    if (room.players.size === 0) rooms.delete(room.code);
  }
  players.delete(socket.id);
}
io.on("connection", socket => {
  socket.on("join", (payload = {}, reply = () => {}) => {
    leaveRoom(socket);
    const name = cleanText(payload.name, 18) || "Pilot";
    const color = /^#[0-9a-fA-F]{6}$/.test(payload.color) ? payload.color : "#a855f7";
    const requested = cleanText(payload.room, 8).toUpperCase();
    const code = requested || roomCode();
    const room = roomFor(code);
    if (room.players.size >= 16) return reply({ ok: false, error: "Room penuh (maksimal 16 pemain)." });
    const p = { id: socket.id, name, color, room: code, x: 80 + Math.random() * 800, y: 70 + Math.random() * 390, hp: 100, kills: 0, lastMove: 0 };
    room.players.set(socket.id, p);
    players.set(socket.id, p);
    socket.join(code);
    reply({ ok: true, room: code, id: socket.id });
    socket.to(code).emit("notice", `${name} bergabung.`);
    emitRoom(room);
  });
  socket.on("move", data => {
    const p = players.get(socket.id);
    if (!p || Date.now() - p.lastMove < 35) return;
    p.lastMove = Date.now();
    const x = Number(data?.x), y = Number(data?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    p.x = Math.max(24, Math.min(936, x));
    p.y = Math.max(44, Math.min(516, y));
    const room = rooms.get(p.room);
    if (room) socket.to(room.code).emit("playerMoved", publicPlayer(p));
  });
  socket.on("chat", raw => {
    const p = players.get(socket.id);
    if (!p) return;
    const message = cleanText(raw, 180);
    if (!message) return;
    io.to(p.room).emit("chat", { name: p.name, message, at: Date.now() });
  });
  socket.on("adminEvent", data => {
    const p = players.get(socket.id);
    if (!p || !ADMIN_TOKEN || data?.token !== ADMIN_TOKEN) return;
    const room = rooms.get(p.room);
    if (!room) return;
    const type = ["halloween", "cyberpunk", "winter", "none"].includes(data.type) ? data.type : "none";
    room.event = type === "none" ? null : { type, title: cleanText(data.title, 48), description: cleanText(data.description, 180) };
    io.to(room.code).emit("eventChanged", room.event);
  });
  socket.on("disconnect", () => leaveRoom(socket));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`C666 Cyber War running on port ${PORT}`);
});