// Themis' rules for listings and messages. A seal summarises what is stated
// and what is missing; it is a reason to ask questions, never a guarantee that
// work is safe or that pay will arrive.
import { LOCAL_RATE, payBand } from '../themis/rules.js'

// Every red flag the app can raise, in plain words, with what to do about it.
export const RED_FLAGS = {
  fee: {
    severity: 'hard', icon: '₹',
    en: 'Asks you to pay money first', hi: 'पहले पैसे माँगता है',
    why: 'Genuine employers do not charge workers to start. Do not pay a registration, kit, uniform, deposit or visa fee to an unknown recruiter.',
    whyHi: 'असली नियोक्ता काम शुरू करने के पैसे नहीं लेते। किसी अनजान भर्ती करने वाले को पंजीकरण, किट, वर्दी, जमा या वीज़ा शुल्क न दें।',
  },
  otp: {
    severity: 'hard', icon: '✱',
    en: 'Asks for an OTP, PIN or ID photo', hi: 'ओटीपी, पिन या पहचान की फ़ोटो माँगता है',
    why: 'Never share an OTP, ATM PIN or UPI PIN. With an OTP someone can reach your bank account or misuse your identity.',
    whyHi: 'ओटीपी, एटीएम पिन या यूपीआई पिन कभी न बताएँ। ओटीपी से कोई आपके बैंक खाते तक पहुँच सकता है या पहचान का गलत इस्तेमाल कर सकता है।',
  },
  documents: {
    severity: 'hard', icon: '⧉',
    en: 'Wants to keep your original ID', hi: 'असली पहचान पत्र अपने पास रखना चाहता है',
    why: 'Nobody should keep your original Aadhaar, passport or bank card. Give a photocopy and write “for job verification only” and the date across it.',
    whyHi: 'कोई भी आपका असली आधार, पासपोर्ट या बैंक कार्ड अपने पास न रखे। फ़ोटोकॉपी दें और उस पर “केवल नौकरी सत्यापन के लिए” और तारीख लिखें।',
  },
  overseas: {
    severity: 'hard', icon: '✈',
    en: 'Overseas job with fees or a passport request', hi: 'फ़ीस या पासपोर्ट माँगने वाली विदेश की नौकरी',
    why: 'Overseas recruiting agents must be registered. Check the agent’s name on the government eMigrate portal before paying anything or handing over your passport.',
    whyHi: 'विदेश भर्ती एजेंट का पंजीकरण ज़रूरी है। कुछ भी देने या पासपोर्ट सौंपने से पहले सरकारी ई-माइग्रेट पोर्टल पर एजेंट का नाम जाँचें।',
  },
  noAddress: {
    severity: 'warn', icon: '⌖',
    en: 'No exact work address', hi: 'काम का सही पता नहीं',
    why: 'Ask for the site address and a landmark before you go, and tell someone you trust where you will be.',
    whyHi: 'जाने से पहले साइट का पता और पहचान की जगह पूछें, और किसी भरोसेमंद व्यक्ति को बताएँ कि आप कहाँ होंगे।',
  },
  payLater: {
    severity: 'warn', icon: '⌛',
    en: 'All pay only after weeks of work', hi: 'हफ़्तों के काम के बाद ही पूरी मज़दूरी',
    why: 'Waiting a long time for all of your pay is risky. Ask for daily or weekly payment, or part payment every week.',
    whyHi: 'पूरी मज़दूरी के लिए लंबा इंतज़ार जोखिम भरा है। रोज़ या हर हफ़्ते भुगतान, या हर हफ़्ते कुछ हिस्सा माँगें।',
  },
  trial: {
    severity: 'warn', icon: '⊘',
    en: 'Unpaid trial days', hi: 'बिना मज़दूरी के ट्रायल दिन',
    why: 'Trial days are still work. Agree a rate for every day you work, including the first.',
    whyHi: 'ट्रायल के दिन भी काम है। पहले दिन समेत हर दिन की दर तय करें।',
  },
  pressure: {
    severity: 'warn', icon: '!',
    en: 'Rush, secrecy or pressure', hi: 'जल्दबाज़ी, गोपनीयता या दबाव',
    why: 'Real work can wait while you ask a question. “Decide now” and “tell no one” are warning signs.',
    whyHi: 'असली काम आपके सवाल पूछने तक रुक सकता है। “अभी तय करो” और “किसी को मत बताना” चेतावनी के संकेत हैं।',
  },
  tooGood: {
    severity: 'warn', icon: '↑',
    en: 'Pay far above the usual rate', hi: 'मज़दूरी सामान्य दर से बहुत ज़्यादा',
    why: 'Very high pay is how many scams attract people. Confirm the employer independently before you travel or pay.',
    whyHi: 'बहुत ज़्यादा मज़दूरी से कई धोखेबाज़ लोगों को लुभाते हैं। जाने या पैसे देने से पहले नियोक्ता की अलग से पुष्टि करें।',
  },
  belowRate: {
    severity: 'info', icon: '↓',
    en: 'Pay well below the usual rate', hi: 'मज़दूरी सामान्य दर से काफ़ी कम',
    why: 'You can ask for the usual rate for your trade. Compare with what others at your naka are paid.',
    whyHi: 'आप अपने काम की सामान्य दर माँग सकते हैं। अपने नाके पर दूसरों को मिलने वाली मज़दूरी से तुलना करें।',
  },
  longHours: {
    severity: 'info', icon: '◷',
    en: 'Very long working day', hi: 'बहुत लंबा काम का दिन',
    why: 'Ask about breaks, a weekly day off and extra pay for extra hours before you agree.',
    whyHi: 'तय करने से पहले आराम, हफ़्ते की छुट्टी और ज़्यादा घंटों की अतिरिक्त मज़दूरी के बारे में पूछें।',
  },
}

const QUESTIONS = {
  payday: ['When and how will I be paid — cash or UPI, daily or weekly?', 'मज़दूरी कब और कैसे मिलेगी — नकद या यूपीआई, रोज़ या हफ़्ते में?'],
  fee: ['Is there any fee, deposit or deduction from my pay?', 'क्या कोई फ़ीस, जमा या मज़दूरी से कटौती है?'],
  written: ['Can you write the rate, hours and payday on a slip or message?', 'क्या आप दर, घंटे और भुगतान का दिन पर्ची या मैसेज में लिख देंगे?'],
  address: ['What is the exact site address and a landmark?', 'साइट का सही पता और पहचान की जगह क्या है?'],
  hours: ['What time do we start and finish, and when is the break?', 'काम कब शुरू और खत्म होगा, आराम कब होगा?'],
  overtime: ['Is extra time paid extra?', 'क्या ज़्यादा समय का अलग पैसा मिलेगा?'],
  tools: ['Which tools and materials do you provide?', 'कौन से औज़ार और सामान आप देंगे?'],
  safety: ['Is safety gear provided — helmet, gloves, harness?', 'क्या सुरक्षा का सामान मिलेगा — हेलमेट, दस्ताने, हार्नेस?'],
}

// Check one listing. Unknown terms become questions; red flags are explained.
export function assessJob(job) {
  const flags = new Set(job.asks ?? [])
  if (job.fee > 0) flags.add('fee')
  if (job.address === false) flags.add('noAddress')
  if (job.payday === null && (job.durationDays === null || job.durationDays > 14)) flags.add('payLater')
  if (job.unit === 'day') {
    const band = payBand(job.pay, LOCAL_RATE[job.trade] ?? 800)
    if (band === 'wellAbove') flags.add('tooGood')
    if (band === 'wellBelow') flags.add('belowRate')
  }
  if (job.unit === 'month' && job.pay < 12000) flags.add('belowRate')
  if (job.hoursCount >= 11) flags.add('longHours')

  const list = [...flags].filter((id) => RED_FLAGS[id]).map((id) => ({ id, ...RED_FLAGS[id] }))
  const order = { hard: 0, warn: 1, info: 2 }
  list.sort((a, b) => order[a.severity] - order[b.severity])

  const good = []
  if (job.payday) good.push(['Payday stated', 'भुगतान का दिन बताया'])
  if (job.fee === 0) good.push(['No fee to start', 'शुरू करने की कोई फ़ीस नहीं'])
  if (job.written === true) good.push(['Terms in writing', 'शर्तें लिखित में'])
  if (job.address) good.push(['Site address given', 'साइट का पता दिया'])
  if (job.verification === 'sample-history') good.push(['Sample hiring history', 'नमूना भर्ती इतिहास'])

  const questions = []
  if (!job.payday) questions.push(QUESTIONS.payday)
  if (job.fee === null) questions.push(QUESTIONS.fee)
  if (job.written !== true) questions.push(QUESTIONS.written)
  if (!job.address) questions.push(QUESTIONS.address)
  if (!job.hoursCount || job.hoursCount > 9) questions.push(QUESTIONS.overtime)
  if (['mason', 'helper', 'electrician', 'painter'].includes(job.trade)) questions.push(QUESTIONS.safety)
  questions.push(QUESTIONS.tools)

  const unknowns = [job.payday == null, job.fee === null, job.written === null].filter(Boolean).length
  const hard = list.some((f) => f.severity === 'hard')
  const warn = list.some((f) => f.severity === 'warn')
  const tone = hard ? 'bad' : warn || unknowns >= 2 ? 'mid' : 'good'
  return { tone, flags: list, good, questions, unknowns }
}

export const SEALS = {
  good: { en: 'Clear terms', hi: 'साफ़ शर्तें', short: 'Clear', shortHi: 'साफ़' },
  mid: { en: 'Ask first', hi: 'पहले पूछें', short: 'Ask', shortHi: 'पूछें' },
  bad: { en: 'Warning', hi: 'चेतावनी', short: 'Warning', shortHi: 'चेतावनी' },
}

// Read a forwarded job message (WhatsApp, SMS, a poster) and pull out the
// terms and the warning signs. Simple patterns, in English, Hindi and Hinglish.
const PATTERNS = {
  fee: /(registration|regn|deposit|fees?|charges?|kit|security money|processing|advance (?:payment|amount)|pay first|शुल्क|फ़ीस|फीस|जमा राशि|जमा करें|रजिस्ट्रेशन|चार्ज)/i,
  otp: /\b(otp|o\.t\.p|pin|cvv|upi pin|ओटीपी|पिन)\b/i,
  documents: /((original|असली)\s*(aadhaa?r|aadhar|passport|id|card|आधार|पासपोर्ट))|((aadhaa?r|passport|आधार|पासपोर्ट)[^.\n]{0,40}(keep|kept|deposit|submit|रख|जमा))/i,
  overseas: /(dubai|gulf|saudi|qatar|kuwait|oman|bahrain|abroad|overseas|malaysia|russia|israel|visa|विदेश|दुबई|सऊदी|वीज़ा|वीजा)/i,
  pressure: /(urgent|urgently|immediately|today only|limited seats|hurry|don'?t tell|do not tell|secret|turant|jaldi|तुरंत|जल्दी|आज ही|किसी को न|किसी को मत)/i,
  payLater: /((after|बाद)\s*(\d+|two|three|four|six|दो|तीन|चार)\s*(months?|weeks?|महीने|हफ़्ते))|((months?|महीने)\s*(baad|बाद))|(after (the )?(project|completion|contract))/i,
  trial: /(trial|unpaid|free work|without pay|bina paise|ट्रायल|बिना मज़दूरी|बिना पैसे)/i,
}
const UNIT_WORDS = [[/(day|daily|din|roz|रोज़|रोज|दिन|प्रतिदिन)/i, 'day'], [/(month|monthly|mahina|महीना|माह)/i, 'month'], [/(shift|पाली|शिफ्ट)/i, 'shift']]

export function scanMessage(text) {
  const raw = String(text ?? '').slice(0, 4000)
  const found = new Set()
  for (const [id, re] of Object.entries(PATTERNS)) if (re.test(raw)) found.add(id)
  if (found.has('overseas') && !found.has('fee') && !/passport|पासपोर्ट/i.test(raw)) found.delete('overseas')
  // Amounts: ₹2,600 / Rs 2600 / 2600 rupees / 2600/- per day
  const amounts = [...raw.matchAll(/(?:₹|rs\.?|inr|रु\.?)\s?(\d[\d,]{1,8})|(\d[\d,]{2,8})\s*(?:\/-|rupees|rs\b|रुपये|रुपए)/gi)].map((m) => ({ n: Number((m[1] ?? m[2]).replace(/,/g, '')), at: m.index }))
  let pay = null, unit = null, fee = null
  for (const a of amounts) {
    const around = raw.slice(Math.max(0, a.at - 40), a.at + 40)
    if (PATTERNS.fee.test(around) && fee === null) fee = a.n
    else if (pay === null) {
      pay = a.n
      unit = UNIT_WORDS.find(([re]) => re.test(around))?.[1] ?? null
    }
  }
  if (fee !== null && fee > 0) found.add('fee')
  const hoursMatch = raw.match(/(\d{1,2})\s*(?:hours?|hrs?|घंटे|ghante)/i)
  const hours = hoursMatch ? Number(hoursMatch[1]) : null
  if (hours !== null && hours >= 11) found.add('longHours')
  const hasAddress = /(address|road|lane|gali|near|gate|building|plot|shop no|sector|पता|रोड|गली|के पास|बिल्डिंग|प्लॉट)/i.test(raw)
  if (raw.trim().length > 20 && !hasAddress) found.add('noAddress')
  const phone = raw.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/)?.[0] ?? null
  const flags = [...found].filter((id) => RED_FLAGS[id]).map((id) => ({ id, ...RED_FLAGS[id] }))
  const order = { hard: 0, warn: 1, info: 2 }
  flags.sort((a, b) => order[a.severity] - order[b.severity])
  const tone = !raw.trim() ? 'none' : flags.some((f) => f.severity === 'hard') ? 'bad' : flags.some((f) => f.severity === 'warn') ? 'mid' : 'good'
  return { tone, flags, pay, unit, fee, hours, phone, hasAddress }
}

export const SAMPLE_MESSAGES = [
  ['URGENT!! Helpers needed for big project, ₹2600 per day. Limited seats. Pay ₹1500 registration fee on this number to confirm. Send Aadhaar photo and OTP.', 'Suspicious'],
  ['Painter chahiye, 2BHK, 4 din. Rs 900 per day, roz shaam ko UPI. Address: Building 4, Lane 3, Chakala. 9 am se 6 pm.', 'Ordinary'],
  ['Dubai construction job, mason, salary 3500/day. Visa in 7 days. Bring passport and 30,000 processing charge.', 'Overseas'],
]
