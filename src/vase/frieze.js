// What touching a figure on the frieze means depends on the chapter you are
// in. Before and after the chapters a figure opens its record; inside them the
// same nine figures become controls for that chapter's tool:
//   Α Hermes      → show that trade's work nearby
//   Β Hephaestus  → start your card in that trade
//   Γ Themis      → put that worker's usual offer on the scales
//   Δ Athena      → find schemes for that kind of work
import { CanvasTexture, SRGBColorSpace } from 'three'
import { RECORDS } from './data.js'
import { jobStore } from '../domain/jobs.js'
import { cardStore } from '../domain/card.js'
import { offerStore } from '../domain/offers.js'
import { rightsStore } from '../domain/rights.js'
import { PRESETS } from '../themis/rules.js'
import { tradeOf } from '../hermes/jobs.js'

export const MODES = ['work', 'craft', 'trust', 'rights']
export const modeFor = (chapter) => (chapter >= 0 && chapter < MODES.length ? MODES[chapter] : 'record')
export const FULL_TOOL = { work: '#map', craft: '#passport', trust: '#scales', rights: '#athena' }

export const FIGURE_TRADE = { carpenter: 'carpenter', mason: 'mason', electrician: 'electrician', painter: 'painter', plumber: 'plumber', sweeper: 'housekeeping', headload: 'helper', hawker: 'loading' }
const FIGURE_WORK = { carpenter: 'construction', mason: 'construction', electrician: 'construction', painter: 'construction', plumber: 'construction', headload: 'construction', sweeper: 'domestic', hawker: 'vending', sisyphus: 'other' }
const WORK_LABEL = { construction: ['building work', 'निर्माण कार्य'], domestic: ['housework and cleaning', 'घरेलू काम और सफ़ाई'], vending: ['street vending', 'रेहड़ी-पटरी'], other: ['other work', 'अन्य काम'] }
const rateOf = (id) => Number(String(RECORDS[id]?.rate ?? '').replace(/[^\d]/g, '')) || null

// The label a figure carries in each mode: [en, hi].
export function actionLabel(mode, fig) {
  const id = fig.id
  const trade = FIGURE_TRADE[id] ? tradeOf(FIGURE_TRADE[id]) : null
  if (mode === 'work') return trade ? [`See ${trade.label.toLowerCase()} work nearby`, `पास में ${trade.hi} का काम देखें`] : ['See all work nearby', 'पास का सारा काम देखें']
  if (mode === 'craft') return trade ? [`Start my card as a ${trade.label.toLowerCase()}`, `${trade.hi} के रूप में मेरा कार्ड बनाएँ`] : ['Why a record matters', 'रिकॉर्ड क्यों ज़रूरी है']
  if (mode === 'trust') return id === 'sisyphus' ? ['Weigh Sisyphus’ offer', 'सिसिफ़स का प्रस्ताव तौलें'] : [`Weigh ${RECORDS[id].name.split(' ')[0]}’s usual offer`, `${RECORDS[id].name.split(' ')[0]} का आम प्रस्ताव तौलें`]
  if (mode === 'rights') { const w = WORK_LABEL[FIGURE_WORK[id]]; return [`Schemes for ${w[0]}`, `${w[1]} के लिए योजनाएँ`] }
  return [`${fig.trade}: open record`, `${fig.hi}: रिकॉर्ड खोलें`]
}

// Apply a figure to the chapter's tool. Returns a short confirmation [en, hi].
export function figureAction(mode, id) {
  const tradeId = FIGURE_TRADE[id]
  const trade = tradeId ? tradeOf(tradeId) : null
  const name = RECORDS[id]?.name ?? ''
  if (mode === 'work') {
    jobStore.set((s) => ({ ...s, trade: tradeId ?? 'all', selected: null }))
    return trade ? [`Showing ${trade.label.toLowerCase()} work near the naka.`, `नाके के पास ${trade.hi} का काम दिख रहा है।`] : ['Showing every trade.', 'सभी काम दिख रहे हैं।']
  }
  if (mode === 'craft') {
    if (!trade) return ['Sisyphus pushed for ever and nobody wrote it down. Your card keeps your days.', 'सिसिफ़स हमेशा धकेलता रहा, किसी ने लिखा नहीं। आपका कार्ड आपके दिन संभालता है।']
    cardStore.set((s) => ({ ...s, trade: tradeId }))
    return [`Your card is set to ${trade.label}. Choose the skills you really do.`, `आपका कार्ड ${trade.hi} पर है। वही कौशल चुनें जो आप करते हैं।`]
  }
  if (mode === 'trust') {
    if (!trade) {
      offerStore.set({ offer: { ...PRESETS.scam }, source: null, preset: 'scam' })
      return ['Sisyphus’ deal: endless work, pay never stated. The scales tip to risk.', 'सिसिफ़स का सौदा: अंतहीन काम, मज़दूरी तय नहीं। तराज़ू जोखिम की ओर।']
    }
    offerStore.set({ offer: { trade: tradeId, pay: String(rateOf(id) ?? 800), unit: 'day', hours: '9', payday: 'weekly', address: 'yes', fee: '0', written: 'unknown', verified: 'unknown' }, source: null, preset: null })
    return [`${name.split(' ')[0]}’s usual terms are on the scales. Change anything to test it.`, `${name.split(' ')[0]} की आम शर्तें तराज़ू पर हैं। कुछ भी बदलकर देखें।`]
  }
  if (mode === 'rights') {
    const work = FIGURE_WORK[id] ?? 'other'
    rightsStore.set((s) => ({ ...s, work, ready: false }))
    const w = WORK_LABEL[work]
    return [`Showing schemes to check for ${w[0]}.`, `${w[1]} के लिए जाँचने लायक योजनाएँ।`]
  }
  return null
}

export const HINTS = {
  record: ['Touch a worker to open their record · drag the vase to turn it', 'रिकॉर्ड खोलने के लिए कामगार छुएँ · घुमाने के लिए कलश खींचें'],
  work: ['Touch a worker to see their trade’s work nearby', 'उनके काम का पास का काम देखने के लिए कामगार छुएँ'],
  craft: ['Touch a worker to start your card in their trade', 'उनके पेशे में अपना कार्ड शुरू करने के लिए छुएँ'],
  trust: ['Touch a worker to weigh their usual offer', 'उनका आम प्रस्ताव तौलने के लिए छुएँ'],
  rights: ['Touch a worker to see schemes for their kind of work', 'उनके काम की योजनाएँ देखने के लिए छुएँ'],
}

// Icons painted into the glowing spots on the vase, one set per mode.
const GLYPHS = {
  record: 'M12 5C7 5 3.5 9 2.5 12c1 3 4.5 7 9.5 7s8.5-4 9.5-7c-1-3-4.5-7-9.5-7zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  work: 'M12 3v18M8.5 6.5c1.2 1.6 5.8 1.6 7 0M12 9c-3 1-3 3 0 4s3 3 0 4M12 9c3 1 3 3 0 4s-3 3 0 4M12 4.5C9.5 2.5 6 3 4 5c2.5.3 4.6 1.2 6 2.5M12 4.5c2.5-2 6-1.5 8 .5-2.5.3-4.6 1.2-6 2.5',
  craft: 'M4 10h11l3-3h2v4h-2l-1 1v2H8l-1 2H5l1-3-2-1.5zM9 17h6M8 20h8M12 14v3',
  trust: 'M12 3v17M7 20h10M4 7h16M6 7l-3 6h6zM18 7l-3 6h6zM3 13a3 1.6 0 0 0 6 0M15 13a3 1.6 0 0 0 6 0',
  rights: 'M5 9c0-3 3-5 7-5s7 2 7 5v5c0 4-3 6-7 6s-7-2-7-6zM9.5 11.5a1.8 1.8 0 1 0 0 .01M14.5 11.5a1.8 1.8 0 1 0 0 .01M11 15l1 1.2 1-1.2',
}
const textures = {}
export function spotTexture(mode) {
  if (textures[mode]) return textures[mode]
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(54, 48, 6, 64, 64, 62)
  grad.addColorStop(0, '#fff1cf')
  grad.addColorStop(0.6, '#f0bf73')
  grad.addColorStop(1, '#b97a35')
  g.fillStyle = grad
  g.beginPath()
  g.arc(64, 64, 60, 0, Math.PI * 2)
  g.fill()
  g.lineWidth = 5
  g.strokeStyle = 'rgba(255,248,230,0.9)'
  g.stroke()
  g.save()
  g.translate(64 - 36, 64 - 36)
  g.scale(3, 3)
  g.strokeStyle = '#2a1408'
  g.lineWidth = 1.9
  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.stroke(new Path2D(GLYPHS[mode] ?? GLYPHS.record))
  g.restore()
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  textures[mode] = t
  return t
}
