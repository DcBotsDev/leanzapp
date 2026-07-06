import { DiscordSDK } from '@discord/embedded-app-sdk';
import { io } from 'socket.io-client';
import './style.css';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || 'PASTE_CLIENT_ID_IN_RENDER_ENV';
const discordSdk = new DiscordSDK(CLIENT_ID);

const state = {
  socket: null,
  instanceId: 'browser-test-room',
  playerId: localStorage.getItem('nyxsecPlayerId') || crypto.randomUUID(),
  room: null,
  connected: false
};
localStorage.setItem('nyxsecPlayerId', state.playerId);

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <div>
        <p class="eyebrow">NYXSEC ACTIVITY</p>
        <h1>Neon Dice Gamble</h1>
        <p class="sub">1–4 players • fake coins only • highest roll wins the pot</p>
      </div>
      <div class="status" id="status">Starting…</div>
    </section>

    <section class="table-card">
      <div class="pot">
        <span>Current Pot</span>
        <strong id="pot">0</strong>
      </div>
      <div class="dice-stage" id="diceStage">🎲</div>
      <p class="round" id="roundText">Waiting for players…</p>
      <button id="readyBtn" class="primary">Ready / Roll</button>
      <button id="resetBtn" class="ghost">Reset my chips</button>
    </section>

    <section>
      <h2>Players</h2>
      <div class="players" id="players"></div>
    </section>

    <section>
      <h2>Game Log</h2>
      <div class="log" id="log"></div>
    </section>
  </main>
`;

const el = {
  status: document.querySelector('#status'),
  pot: document.querySelector('#pot'),
  diceStage: document.querySelector('#diceStage'),
  roundText: document.querySelector('#roundText'),
  readyBtn: document.querySelector('#readyBtn'),
  resetBtn: document.querySelector('#resetBtn'),
  players: document.querySelector('#players'),
  log: document.querySelector('#log')
};

setup().catch((error) => {
  console.error(error);
  el.status.textContent = 'Browser test mode';
  connectSocket();
});

async function setup() {
  await discordSdk.ready();
  state.instanceId = discordSdk.instanceId || state.instanceId;
  el.status.textContent = 'Connected to Discord';
  connectSocket();
}

function connectSocket() {
  state.socket = io({ transports: ['websocket', 'polling'] });

  state.socket.on('connect', () => {
    state.connected = true;
    el.status.textContent = 'Online';
    state.socket.emit('join', {
      instanceId: state.instanceId,
      playerId: state.playerId
    });
  });

  state.socket.on('roomState', (room) => {
    state.room = room;
    render(room);
  });

  state.socket.on('errorMessage', (message) => {
    el.status.textContent = message;
  });

  state.socket.on('disconnect', () => {
    state.connected = false;
    el.status.textContent = 'Reconnecting…';
  });
}

el.readyBtn.addEventListener('click', () => {
  if (!state.socket) return;
  state.socket.emit('ready');
});

el.resetBtn.addEventListener('click', () => {
  if (!state.socket) return;
  state.socket.emit('resetMe');
});

function render(room) {
  el.pot.textContent = room.pot;
  el.roundText.textContent = room.message;
  el.diceStage.textContent = room.lastRoll ? `🎲 ${room.lastRoll}` : '🎲';

  el.players.innerHTML = room.players.map((player) => `
    <article class="player ${player.ready ? 'ready' : ''}">
      <div class="avatar">${player.slot}</div>
      <div>
        <h3>${escapeHtml(player.name)} ${player.id === state.playerId ? '<span>(you)</span>' : ''}</h3>
        <p>${player.chips} chips</p>
      </div>
      <div class="roll">${player.roll ? player.roll : '—'}</div>
    </article>
  `).join('');

  el.log.innerHTML = room.log.map((entry) => `<p>${escapeHtml(entry)}</p>`).join('');

  const me = room.players.find((player) => player.id === state.playerId);
  el.readyBtn.disabled = !me || room.players.length > 4 || me.chips < room.bet;
  el.readyBtn.textContent = me?.ready ? 'Ready ✓' : `Bet ${room.bet} + Roll`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
