// Smoke test for the packaged desktop build:
//   node tests/check-exe.mjs "<path to DormitoryAfterHours.exe>"
// Launches the exe with a local DevTools port, then asks the page whether the
// game booted, the bundled font loaded, and a new game starts without errors.
import { spawn } from 'node:child_process';

const exe = process.argv[2];
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(exe, [`--remote-debugging-port=${PORT}`], { stdio: 'ignore' });

async function pageSocketUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page' && t.url.startsWith('app://'));
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* app still starting */
    }
    await sleep(250);
  }
  throw new Error('Game window did not appear');
}

function evaluate(ws, expression, id) {
  return new Promise((resolve) => {
    const onMsg = (e) => {
      const m = JSON.parse(e.data);
      if (m.id !== id) return;
      ws.removeEventListener('message', onMsg);
      resolve(m.result.result.value);
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  });
}

try {
  const ws = new WebSocket(await pageSocketUrl());
  await new Promise((r) => ws.addEventListener('open', r));
  const errors = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errors.push(JSON.stringify(m.params.args));
  });
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  await sleep(1500);
  const result = await evaluate(ws, `(async () => {
    await document.fonts.ready;
    const fontOk = document.fonts.check('16px "Press Start 2P"', 'Привет');
    const g = window.__game;
    if (!g) return { booted: false };
    const menu = g.state;
    g.newGame('vlad');
    await new Promise(r => setTimeout(r, 2500));
    return { booted: true, url: location.href, menu, state: g.state, intro: g.dlg.visibleText.slice(0, 20), fontOk };
  })()`, 2);
  console.log(JSON.stringify({ ...result, errors }, null, 2));
  const shotPath = process.argv[3];
  if (shotPath) {
    const { writeFile } = await import('node:fs/promises');
    const shot = await new Promise((resolve) => {
      ws.addEventListener('message', (e) => {
        const m = JSON.parse(e.data);
        if (m.id === 3) resolve(m.result.data);
      });
      ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));
    });
    await writeFile(shotPath, Buffer.from(shot, 'base64'));
  }
  ws.close();
} finally {
  proc.kill();
}
