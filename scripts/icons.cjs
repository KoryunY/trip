(async () => {
const { chromium } = require('playwright');
const fs = require('node:fs');
const svg = fs.readFileSync('public/icons/icon.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(size, file, pad = 0, bg = 'transparent') {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - pad * 2;
  await page.setContent(`<html><body style="margin:0;background:${bg}"><div style="width:${size}px;height:${size}px;display:grid;place-items:center">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.screenshot({ path: file, omitBackground: bg === 'transparent' });
}
await shot(192, 'public/icons/icon-192.png');
await shot(512, 'public/icons/icon-512.png');
await shot(180, 'public/icons/apple-touch-icon.png', 0, '#16151b');
await shot(512, 'public/icons/icon-maskable-512.png', 56, '#16151b');
await browser.close();
console.log('icons done');
})();
