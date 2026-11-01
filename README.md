# Dormitory: After Hours

## ⬇️ Скачать игру (Windows)

### [**Скачать Dormitory-After-Hours-Windows-x64.zip**](https://github.com/Maestoo-of-69/dormitory-after-hours/releases/latest/download/Dormitory-After-Hours-Windows-x64.zip) (≈150 МБ)

1. Скачайте архив по ссылке выше.
2. Распакуйте его (правой кнопкой → «Извлечь всё»).
3. Откройте папку `Dormitory After Hours` и запустите **`DormitoryAfterHours.exe`**.

Установка не нужна. Если Windows покажет «Windows защитила ваш компьютер» —
нажмите «Подробнее» → «Выполнить в любом случае» (у игры нет платной подписи).

> ⚠️ Зелёная кнопка **Code → Download ZIP** скачивает исходный код, а не игру —
> двойным кликом он не запустится. Для игры используйте ссылку выше
> или раздел [Releases](https://github.com/Maestoo-of-69/dormitory-after-hours/releases/latest).

**Управление:** WASD — ходить · SHIFT — быстрее · E — взаимодействовать · SPACE — диалог ·
TAB — сменить героя · I — находки · ESC — пауза · M — музыка · F — полный экран.

---

2D pixel-art exploration game. Two students, Vlad and Angelina, explore a
university dormitory at night, find 15 secrets and uncover a time capsule
left by the class of 2006. Dialogue is in Russian.

No dependencies, no build step: plain JavaScript ES modules + HTML5 Canvas.
All graphics and sound are generated in code (no image/audio files).

## Run

```bash
node serve.mjs
```

Open http://localhost:5173. (ES modules do not load from `file://`, so a local server is needed.)
`npm start` does the same. World sanity checks: `npm test`.

## Desktop build (Windows .exe)

The browser game itself has no dependencies. The desktop version wraps it in
Electron (dev dependencies only, installed with `npm install`):

```bash
npm run app        # run as a desktop window
npm run package    # build out/Dormitory After Hours-win32-x64/DormitoryAfterHours.exe
node tests/check-exe.mjs "<full path to DormitoryAfterHours.exe>"   # smoke test
```

`electron-main.cjs` serves the game through a private `app://` scheme and blocks
navigation to other sites. The whole output folder must be shipped together
(the .exe needs the DLLs and `resources/` next to it). Saves live in
`%APPDATA%\Dormitory After Hours`. The build is unsigned, so Windows SmartScreen
may warn on first launch ("More info" → "Run anyway").

## Controls

| Key | Action |
|-----|--------|
| WASD / arrows | move |
| SHIFT | walk faster |
| E | interact / open doors / stand up |
| SPACE | next dialogue line |
| TAB | switch Vlad ⇄ Angelina |
| I | inventory (finds) |
| ESC | pause menu |
| M | music on/off |
| F | fullscreen |

## Structure

```
index.html, styles.css    page shell and pixel UI styles
serve.mjs                 zero-dependency static server
src/main.js               game loop, state machine, save/load glue
src/config.js             constants (resolution, speeds, keys)
src/core/                 input, camera, collision, util, save (localStorage)
src/world/                builder (rooms → tiles + auto walls), floor1/floor2 data,
                          object type registry, runtime world state
src/gfx/                  tiles, furniture, characters, item icons, renderer + lighting
src/game/                 party (player + companion), interaction targeting,
                          dialogue, action scripts, item definitions
src/audio/audio.js        procedural Web Audio music, ambience, SFX
src/ui/                   HUD, menus (main, select, pause, settings, controls, inventory)
tests/validate-world.mjs  reachability / spawn / collision checks for both floors
```

Rendering: the world is drawn at 730×270 and scaled 4× to the 2920×1080 stage
(`image-rendering: pixelated`); the stage is scaled to fit the window with letterboxing.
Settings → «Масштаб: пиксель-в-пиксель» switches to integer scaling.

## Known limitations

- Font "Press Start 2P" is bundled in `fonts/` (SIL Open Font License 1.1, `fonts/OFL.txt`).
- The desktop build is ~360 MB unpacked (~150 MB zipped), almost all of it the Electron runtime.
- No gamepad or touch controls; keyboard (menus also accept mouse).
- Tested in Chromium only (Playwright).
