import assert from 'node:assert/strict'
import { JOBS } from '../src/hermes/jobs.js'
import { NAKAS, nearestNaka, jobsAtNaka } from '../src/hermes/nakas.js'
import { assessJob, scanMessage, SAMPLE_MESSAGES, RED_FLAGS } from '../src/domain/trust.js'
let checks = 0
const ok = (v, m) => { assert.ok(v, m); checks++ }
const suspicious = JOBS.filter(j => j.suspicious)
ok(suspicious.length === 8, 'eight deliberately suspicious listings')
for (const j of suspicious) ok(assessJob(j).tone !== 'good', `${j.id} is not sealed as clear`)
for (const j of suspicious.filter(j => j.fee > 0)) ok(assessJob(j).tone === 'bad', `${j.id} with a fee is a warning`)
const tones = JOBS.filter(j => !j.suspicious).map(j => assessJob(j).tone)
ok(tones.includes('good') && tones.includes('mid'), 'ordinary work mixes clear and ask-first seals')
ok(!tones.includes('bad'), 'no ordinary listing carries a hard warning')
for (const j of JOBS) { const a = assessJob(j); ok(a.questions.length > 0); for (const f of a.flags) ok(RED_FLAGS[f.id] && f.why && f.whyHi) }
const [scam, ordinary, overseas] = SAMPLE_MESSAGES.map(([m]) => scanMessage(m))
ok(scam.tone === 'bad' && scam.fee === 1500 && scam.pay === 2600 && scam.flags.some(f => f.id === 'otp'), 'scam message: fee, pay and OTP read')
ok(ordinary.tone === 'good' && ordinary.pay === 900 && ordinary.unit === 'day', 'ordinary message reads pay and unit')
ok(overseas.flags.some(f => f.id === 'overseas') && overseas.tone === 'bad', 'overseas recruitment flagged')
ok(scanMessage('').tone === 'none')
ok(scanMessage('Kaam hai. 700 rupees roz. Lane 4 near the bridge.').pay === 700)
ok(scanMessage('पंजीकरण के लिए ₹500 जमा करें, रोज़ ₹800, गली 2').fee === 500)
for (const n of NAKAS) ok(jobsAtNaka(n.id, JOBS).length >= 3, `${n.id} has nearby work`)
ok(nearestNaka([0, 0]) === null)
console.log(`Trust checks passed: ${checks} assertions across seals, red flags, message reading and nakas.`)
