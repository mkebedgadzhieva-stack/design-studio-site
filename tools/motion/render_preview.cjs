// Рендер превью сцен пантеры (MOTION-01): кадры → MP4/GIF + контактный лист.
// Детерминированно: все анимации на паузе, время ставится через currentTime.
//
//   node tools/motion/render_preview.cjs <scene.svg> <out-prefix> <duration_ms> \
//        [width_px=900] [fps=30] [contact_frames=16] [loops=1]
//
// Пример (из корня репозитория):
//   node tools/motion/render_preview.cjs public/motion/rig/panther-loader.svg \
//        /tmp/previews/scene-a-loader 2200 820 30 16 2
// Нужны: playwright (Chromium) и ffmpeg в PATH. Новых npm-зависимостей нет.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

(async () => {
  const [svgPath, outPrefix, durArg, widthArg = '900', fpsArg = '30',
    contactArg = '16', loopsArg = '1'] = process.argv.slice(2);
  if (!svgPath || !outPrefix || !durArg) {
    console.error('usage: render_preview.cjs scene.svg out-prefix duration_ms [width] [fps] [contact] [loops]');
    process.exit(2);
  }
  const dur = Number(durArg), width = Number(widthArg), fps = Number(fpsArg);
  const contactN = Number(contactArg), loops = Number(loopsArg);
  const svg = fs.readFileSync(svgPath, 'utf8');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pt-frames-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 400 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff">
    <div id="wrap" style="width:${width}px">${svg}</div></body></html>`);
  await page.evaluate(() => {
    const s = document.querySelector('svg');
    s.removeAttribute('height');
    s.style.width = '100%';
    s.style.height = 'auto';
    s.style.display = 'block';
  });
  const nAnims = await page.evaluate(() => document.getAnimations().length);
  if (!nAnims) throw new Error('В SVG нет CSS-анимаций');
  const total = Math.round(dur * loops / 1000 * fps);
  const el = await page.$('svg');
  for (let i = 0; i < total; i++) {
    const t = (i * 1000 / fps) % (dur * 1);
    const tt = i * 1000 / fps;
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
    }, tt);
    await el.screenshot({ path: path.join(tmp, `f${String(i).padStart(5, '0')}.png`) });
  }
  await browser.close();
  const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
  const pattern = path.join(tmp, 'f%05d.png');
  ff(['-framerate', String(fps), '-i', pattern, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-crf', '20', `${outPrefix}.mp4`]);
  const gw = Math.min(width, 900);
  ff(['-framerate', String(fps), '-i', pattern, '-vf',
    `fps=${Math.min(fps, 25)},scale=${gw}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=none`,
    '-loop', '0', `${outPrefix}.gif`]);
  // контактный лист: contactN кадров через равные промежутки одного прохода
  const step = Math.max(1, Math.floor(Math.round(dur / 1000 * fps) / contactN));
  const cols = 4, rows = Math.ceil(contactN / cols);
  ff(['-framerate', String(fps), '-i', pattern, '-vf',
    `select='not(mod(n\\,${step}))*lt(n\\,${step * contactN})',scale=${Math.min(width, 600)}:-1,tile=${cols}x${rows}:padding=6:color=0xbbbbbb`,
    '-frames:v', '1', '-fps_mode', 'passthrough', `${outPrefix}-contact.png`]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(JSON.stringify({ frames: total, fps, stepFrames: step, stepMs: step * 1000 / fps, out: outPrefix }));
})().catch((e) => { console.error(e); process.exit(1); });
