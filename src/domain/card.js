// The worker's own card: what they say about their work, kept in this browser.
// Shared by the compact tool in the vase and the full passport page.
import { createLocalStore, isObject, isText } from './storage.js'
import { TRADES } from '../hermes/jobs.js'
import { LANGS, SKILLS } from '../hephaestus/card.js'
import { NAKAS } from '../hermes/nakas.js'

export const DAYS = [['Mon', 'सोम'], ['Tue', 'मंगल'], ['Wed', 'बुध'], ['Thu', 'गुरु'], ['Fri', 'शुक्र'], ['Sat', 'शनि'], ['Sun', 'रवि']]
export const TIMES = [['morning', 'Mornings', 'सुबह'], ['day', 'Full day', 'पूरा दिन'], ['evening', 'Evenings', 'शाम'], ['night', 'Nights', 'रात']]

export const CARD_DEFAULTS = { name: '', trade: 'mason', years: 0, skills: {}, langs: [], rate: '', days: [0, 1, 2, 3, 4, 5], times: ['day'], naka: null, from: '' }

const optional = (x, test) => x === undefined || test(x)
export const cardStore = createLocalStore('card', CARD_DEFAULTS, (s) =>
  isObject(s) && isText(s.name, 80) && TRADES.some((t) => t.id === s.trade) && Number.isFinite(s.years) && s.years >= 0 && s.years <= 60 &&
  isObject(s.skills) && Object.entries(s.skills).every(([k, v]) => SKILLS[k] && Array.isArray(v) && v.length <= 6 && v.every((x) => SKILLS[k].includes(x))) &&
  Array.isArray(s.langs) && s.langs.length <= 11 && s.langs.every((x) => LANGS.includes(x)) &&
  optional(s.rate, (r) => isText(String(r), 8)) &&
  optional(s.days, (d) => Array.isArray(d) && d.every((n) => Number.isInteger(n) && n >= 0 && n < 7)) &&
  optional(s.times, (t) => Array.isArray(t) && t.every((x) => TIMES.some(([id]) => id === x))) &&
  optional(s.naka, (n) => n === null || NAKAS.some((k) => k.id === n)) &&
  optional(s.from, (f) => isText(f, 60)))

export const withDefaults = (s) => ({ ...CARD_DEFAULTS, ...s })

// "Mon–Sat · Mornings · Marol Naka"
export function availabilityLine(s, lang = 'en') {
  const c = withDefaults(s)
  const hi = lang === 'hi'
  const days = [...c.days].sort((a, b) => a - b)
  const name = (i) => DAYS[i][hi ? 1 : 0]
  let dayText = ''
  if (days.length === 7) dayText = hi ? 'हर दिन' : 'Every day'
  else if (days.length && days.every((d, i) => i === 0 || d === days[i - 1] + 1)) dayText = days.length === 1 ? name(days[0]) : `${name(days[0])}–${name(days.at(-1))}`
  else dayText = days.map(name).join(', ')
  const times = c.times.map((t) => TIMES.find(([id]) => id === t)?.[hi ? 2 : 1]).filter(Boolean).join(', ')
  const naka = NAKAS.find((n) => n.id === c.naka)
  return [dayText, times, naka ? (hi ? naka.hi : naka.name) : null].filter(Boolean).join(' · ')
}

export function cardText(s, { lang = 'en', days = 0, confirmed = 0 } = {}) {
  const c = withDefaults(s)
  const trade = TRADES.find((t) => t.id === c.trade)
  const skills = c.skills[c.trade] ?? []
  const hi = lang === 'hi'
  return [
    hi ? `एर्गोन काम कार्ड — ${c.name || 'नाम'}` : `Ergon work card — ${c.name || 'Name'}`,
    `${hi ? trade.hi : trade.label}${c.years ? ` · ${c.years} ${hi ? 'साल का अनुभव' : 'years of experience'}` : ''}`,
    skills.length ? `${hi ? 'कौशल' : 'Skills'}: ${skills.join(', ')}` : null,
    c.langs.length ? `${hi ? 'भाषाएँ' : 'Speaks'}: ${c.langs.join(', ')}` : null,
    `${hi ? 'उपलब्ध' : 'Available'}: ${availabilityLine(c, lang)}`,
    c.rate ? `${hi ? 'अपेक्षित दर' : 'Expected rate'}: ₹${Number(c.rate).toLocaleString('en-IN')} / ${hi ? 'दिन' : 'day'}` : null,
    c.from ? `${hi ? 'रहते हैं' : 'Lives in'}: ${c.from}` : null,
    days ? (hi ? `${days} दिन का काम खुद दर्ज किया${confirmed ? `, ${confirmed} नियोक्ता द्वारा पुष्टि` : ''}` : `${days} days of work self-recorded${confirmed ? `, ${confirmed} confirmed by employers on Ergon` : ''}`) : null,
    hi ? '(खुद बताई जानकारी। सत्यापित सिफ़ारिश नहीं।)' : '(Self-described. Not a verified endorsement.)',
  ].filter(Boolean).join('\n')
}
