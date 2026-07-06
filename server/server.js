import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const BET = 10;
const STARTING_CHIPS = 100;
const MAX_PLAYERS = 4;
const rooms = new Map();

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

io.on('connection', (socket) => {
  socket.data.roomId = null;
  socket.data.playerId = null;

  socket.on('join', ({ instanceId, playerId }) => {
    const roomId = sanitize(instanceId || 'default-room');
    const id = sanitize(playerId || crypto.randomUUID());
    let room = rooms.get(roomId);
    if (!room) {
      room = createRoom(roomId);
      rooms.set(roomId, room);
    }

    let player = room.players.find((p) => p.id === id);
    if (!player) {
      if (room.players.length >= MAX_PLAYERS) {
        socket.emit('errorMessage', 'This table is full. Max 4 players.');
        return;
      }
      player = {
        id,
        name: `Player ${room.players.length + 1}`,
        slot: room.players.length + 1,
        chips: STARTING_CHIPS,
        ready: false,
        roll: null
      };
      room.players.push(player);
      room.log.unshift(`${player.name} joined the table.`);
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = id;
    emitRoom(roomId);
  });

  socket.on('ready', () => {
    const room = getSocketRoom(socket);
    if (!room) return;
    const player = room.players.find((p) => p.id === socket.data.playerId);
    if (!player || player.chips < BET) return;

    player.ready = true;
    room.message = `${player.name} is ready.`;

    const everyoneReady = room.players.length >= 1 && room.players.every((p) => p.ready);
    emitRoom(room.id);

    if (everyoneReady && !room.rolling) playRound(room.id);
  });

  socket.on('resetMe', () => {
    const room = getSocketRoom(socket);
    if (!room) return;
    const player = room.players.find((p) => p.id === socket.data.playerId);
    if (!player) return;
    player.chips = STARTING_CHIPS;
    player.ready = false;
    player.roll = null;
    room.log.unshift(`${player.name} reset their fake chips.`);
    emitRoom(room.id);
  });

  socket.on('disconnect', () => {
    const room = getSocketRoom(socket);
    if (!room) return;
    const index = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (index !== -1) {
      const [removed] = room.players.splice(index, 1);
      room.players.forEach((p, i) => {
        p.slot = i + 1;
        p.name = `Player ${i + 1}`;
      });
      room.log.unshift(`${removed.name} left the table.`);
    }
    if (room.players.length === 0) rooms.delete(room.id);
    else emitRoom(room.id);
  });
});

async function playRound(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.rolling = true;
  room.pot = 0;
  room.lastRoll = null;
  room.players.forEach((p) => {
    p.chips -= BET;
    room.pot += BET;
    p.roll = null;
  });
  room.message = `Rolling for ${room.pot} fake chips…`;
  emitRoom(roomId);

  for (const player of room.players) {
    await wait(700);
    player.roll = randomInt(1, 6);
    room.lastRoll = `${player.name}: ${player.roll}`;
    room.message = `${player.name} rolled ${player.roll}.`;
    emitRoom(roomId);
  }

  await wait(500);
  const highest = Math.max(...room.players.map((p) => p.roll));
  const winners = room.players.filter((p) => p.roll === highest);
  const prize = Math.floor(room.pot / winners.length);
  winners.forEach((p) => { p.chips += prize; });
  const winnerText = winners.map((p) => p.name).join(' & ');
  room.message = winners.length > 1 ? `Tie! ${winnerText} split the pot.` : `${winnerText} wins the pot!`;
  room.log.unshift(`${room.message} Highest roll: ${highest}.`);
  room.players.forEach((p) => { p.ready = false; p.roll = null; });
  room.pot = 0;
  room.rolling = false;
  emitRoom(roomId);
}

function createRoom(id) {
  return {
    id,
    bet: BET,
    pot: 0,
    lastRoll: null,
    message: 'Waiting for players… press Ready / Roll.',
    players: [],
    log: ['Table created. This uses fake chips only.'],
    rolling: false
  };
}

function emitRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit('roomState', room);
}

function getSocketRoom(socket) {
  if (!socket.data.roomId) return null;
  return rooms.get(socket.data.roomId);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitize(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
}

server.listen(PORT, () => {
  console.log(`NYXSEC Gamble Activity listening on port ${PORT}`);
});
