:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #fff;
  background: #070713;
}

* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top, #5b15ff 0, #130826 35%, #070713 100%); }
.shell { width: min(980px, 100%); margin: 0 auto; padding: 24px; }
.hero { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 18px; }
.eyebrow { color: #ff4fd8; letter-spacing: .18em; font-weight: 800; font-size: 12px; }
h1 { margin: 0; font-size: clamp(34px, 7vw, 76px); line-height: .9; text-shadow: 0 0 30px rgba(255,79,216,.6); }
.sub { color: #b9b9ff; font-size: 16px; }
.status { padding: 10px 14px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 999px; white-space: nowrap; }
.table-card { border: 1px solid rgba(255,255,255,.16); background: linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.05)); border-radius: 30px; padding: 24px; box-shadow: 0 25px 80px rgba(0,0,0,.35); }
.pot { display: flex; justify-content: space-between; align-items: center; color: #b9b9ff; }
.pot strong { font-size: 46px; color: #60ffca; text-shadow: 0 0 20px rgba(96,255,202,.5); }
.dice-stage { display: grid; place-items: center; min-height: 150px; font-size: 78px; animation: glow 2.5s infinite alternate; }
.round { text-align: center; color: #f6dfff; min-height: 24px; }
button { border: 0; border-radius: 16px; padding: 16px 20px; font-size: 16px; font-weight: 900; cursor: pointer; }
button:disabled { opacity: .45; cursor: not-allowed; }
.primary { width: 100%; color: white; background: linear-gradient(90deg, #7b4dff, #ff4fd8); box-shadow: 0 8px 30px rgba(255,79,216,.35); }
.ghost { margin-top: 10px; width: 100%; color: white; background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.15); }
h2 { margin-top: 24px; }
.players { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
.player { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(0,0,0,.22); border: 1px solid rgba(255,255,255,.12); border-radius: 18px; }
.player.ready { border-color: #60ffca; box-shadow: 0 0 24px rgba(96,255,202,.18); }
.avatar { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; background: linear-gradient(135deg, #ff4fd8, #7b4dff); font-weight: 900; }
.player h3 { margin: 0; }
.player h3 span { color: #60ffca; font-size: 12px; }
.player p { margin: 4px 0 0; color: #b9b9ff; }
.roll { margin-left: auto; font-size: 34px; font-weight: 900; }
.log { max-height: 220px; overflow: auto; padding: 14px; border-radius: 18px; background: rgba(0,0,0,.25); border: 1px solid rgba(255,255,255,.1); }
.log p { margin: 0 0 8px; color: #d7d7ff; }
@keyframes glow { from { transform: scale(.96); filter: drop-shadow(0 0 12px #7b4dff); } to { transform: scale(1.05); filter: drop-shadow(0 0 30px #ff4fd8); } }
