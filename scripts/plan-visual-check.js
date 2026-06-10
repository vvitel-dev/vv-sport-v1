const http = require('http');
const path = require('path');
const fs = require('fs');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  console.error('Playwright is not installed. Run: npm install -D playwright');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const port = 4173;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.resolve(root, '.' + safePath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

async function run() {
  await new Promise(resolve => server.listen(port, resolve));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('vv-level', 'medium');
    localStorage.setItem('vv-mode', 'adaptive');
    localStorage.setItem('vv-profile-done', '1');
    localStorage.setItem('vv-current-tab', 'plan');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-tab="plan"]');
  await page.waitForSelector('#weekly-plan-content .plan-day-card');
  await fs.promises.mkdir(path.join(root, 'artifacts'), { recursive: true });
  await page.screenshot({ path: path.join(root, 'artifacts', 'plan-tab.png'), fullPage: true });
  await browser.close();
}

run()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
