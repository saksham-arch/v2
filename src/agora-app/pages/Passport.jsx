// Β · Hephaestus — the work passport. The full-page twin of the compact card
// tool in the vase: the same card store, the same photos and voice in this
// browser's storage, the same bronze canvas and the same work diary. Few words,
// big type; the bronze tablet, the trade tool and the amphorae do the showing.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../domain/storage.js'
import { cardStore, withDefaults, availabilityLine, cardText, DAYS, TIMES } from '../../domain/card.js'
import { diary, addEntry, updateEntry, removeEntry, summarise, owedByEmployer, recentStates, sampleEntries, owedOn, diaryCounts } from '../../domain/diary.js'
import { mediaRead, mediaWrite, preparePhoto } from '../../domain/media.js'
import { rightsStore } from '../../domain/rights.js'
import { TRADES, tradeOf, money } from '../../hermes/jobs.js'
import { NAKAS } from '../../hermes/nakas.js'
import { CARD_W, CARD_H, SKILLS, LANGS, PLATES, drawCard, plate } from '../../hephaestus/card.js'
import { whenFonts } from '../../gl/tex.js'
import { hall } from '../../vase/hall.js'
import Tablet from '../../vase/exhibits/Tablet.jsx'
import { tradeTool, amphoraShelf } from '../../world/agora-models.js'
import { Voice } from '../../tasks/Card.jsx'
import { SaveStatus } from '../../tasks/common.jsx'
import { useI18n } from '../../i18n/index.jsx'
import Listen from '../../ui/Listen.jsx'
import Hero3D from '../Hero3D.jsx'
import Icon from '../icons.jsx'
import { SectionNav, Sheet, Stat, Term, toast, today, useSay, whatsappUrl } from '../ui.jsx'
import './passport.css'

// Two sections. Old links to #passport/share land on the card.
const SECTIONS = [
  ['card', 'Work card', 'काम कार्ड', 'hephaestus'],
  ['diary', 'Work diary', 'काम की डायरी', 'calendar'],
]
const validSection = (id) => (id === 'diary' ? 'diary' : 'card')

// [id, title en, title hi, icon, one line en, one line hi]
const STEPS = [
  ['trade', 'Your trade', 'आपका काम', 'tools', 'Tap your work.', 'अपना काम छुएँ।'],
  ['name', 'Your name', 'आपका नाम', 'me', 'Big on the card.', 'कार्ड पर बड़े अक्षरों में।'],
  ['skills', 'What you do', 'आप क्या करते हैं', 'star', 'Tap only what you really do.', 'वही छुएँ जो सच में करते हैं।'],
  ['langs', 'Languages', 'भाषाएँ', 'speaker', 'Tap every language you speak.', 'जो भी भाषा बोलते हैं, छुएँ।'],
  ['when', 'When and where', 'कब और कहाँ', 'calendar', 'Days, times, naka and rate.', 'दिन, समय, नाका और दर।'],
  ['proof', 'Photos and voice', 'फ़ोटो और आवाज़', 'camera', 'Optional.', 'वैकल्पिक।'],
  ['done', 'Your work card', 'आपका काम कार्ड', 'eye', 'Download it, or show it at the naka.', 'डाउनलोड करें, या नाके पर दिखाएँ।'],
]
const LAST = STEPS.length - 1

// The same labelled sample as the compact tool in the vase.
const SAMPLE = { name: 'Sunita Devi (sample)', trade: 'mason', years: 11, skills: { mason: ['Brickwork', 'Plaster'] }, langs: ['Hindi', 'Marathi'], rate: '950', naka: 'naka-marol', times: ['morning', 'day'] }

// Skills are stored in English (the PNG prints them); these help people read them.
const SKILL_HI = {
  Brickwork: 'ईंट की चिनाई', Plaster: 'प्लास्टर', Tiling: 'टाइल लगाना', Waterproofing: 'वॉटरप्रूफ़िंग', Shuttering: 'शटरिंग', 'Reads drawings': 'नक्शा पढ़ लेते हैं',
  Putty: 'पुट्टी', Interiors: 'अंदर की पुताई', Exteriors: 'बाहर की पुताई', 'Texture walls': 'टेक्सचर दीवार', Spray: 'स्प्रे पेंट', 'Wood polish': 'लकड़ी पर पॉलिश',
  'House wiring': 'घर की वायरिंग', 'DB boards': 'डीबी बोर्ड', Inverters: 'इन्वर्टर', 'Fans and lights': 'पंखे और लाइट', 'Fault finding': 'ख़राबी ढूँढना', Solar: 'सोलर',
  'CPVC lines': 'सीपीवीसी पाइप लाइन', 'Bathroom fittings': 'बाथरूम फ़िटिंग', 'Leak repair': 'लीकेज ठीक करना', 'Tank work': 'टंकी का काम', Drainage: 'नाली और ड्रेनेज', 'Gas lines': 'गैस लाइन',
  Furniture: 'फ़र्नीचर', 'Door frames': 'दरवाज़े की चौखट', 'Modular kitchens': 'मॉड्यूलर किचन', Polish: 'पॉलिश', Repairs: 'मरम्मत',
  Mixing: 'मसाला मिलाना', Carrying: 'सामान ढोना', 'Site cleaning': 'साइट की सफ़ाई', Scaffolding: 'पाड़ बाँधना', Loading: 'लोडिंग',
  'Office cleaning': 'दफ़्तर की सफ़ाई', 'Deep cleaning': 'गहरी सफ़ाई', 'Post-construction': 'निर्माण के बाद सफ़ाई', 'Kitchen help': 'रसोई में मदद',
  Packing: 'पैकिंग', 'Forklift (licensed)': 'फ़ोर्कलिफ़्ट (लाइसेंस)', 'Stock counting': 'स्टॉक गिनना', 'Night shifts': 'रात की पाली',
}
const LANG_HI = { Hindi: 'हिंदी', Marathi: 'मराठी', Tamil: 'तमिल', Telugu: 'तेलुगु', Kannada: 'कन्नड़', Bengali: 'बांग्ला', Gujarati: 'गुजराती', Punjabi: 'पंजाबी', Odia: 'ओड़िया', Urdu: 'उर्दू', English: 'अंग्रेज़ी' }
// Each language in its own script, so people can find theirs at a glance.
const LANG_NATIVE = { Hindi: 'हिन्दी', Marathi: 'मराठी', Tamil: 'தமிழ்', Telugu: 'తెలుగు', Kannada: 'ಕನ್ನಡ', Bengali: 'বাংলা', Gujarati: 'ગુજરાતી', Punjabi: 'ਪੰਜਾਬੀ', Odia: 'ଓଡ଼ିଆ', Urdu: 'اردو', English: 'English' }

const UNIT = { day: ['day', 'दिन'], shift: ['shift', 'पाली'], job: ['whole job', 'पूरा काम'] }
const STATUS = { paid: ['Paid', 'पूरा मिला', 'check'], unpaid: ['Not paid', 'नहीं मिला', 'alert'], part: ['Part paid', 'कुछ मिला', 'minus'] }
const ENTRY_ERRORS_HI = {
  'Enter a date, who you worked for, your trade and a positive rate.': 'तारीख, किसके लिए काम किया, काम का प्रकार और सही दर भरें।',
  'For part payment, enter how much you received (less than the rate).': 'आंशिक भुगतान में बताएँ कितना मिला (दर से कम)।',
  'Entry not found.': 'यह दिन डायरी में नहीं मिला।',
}
const entryError = (e, lang) => (lang === 'hi' ? ENTRY_ERRORS_HI[e?.message] ?? 'यह दिन सहेजा नहीं जा सका। जानकारी जाँचें।' : e?.message || 'This day could not be saved. Check the details.')

const LEDE = ['No résumé. No certificate. Just your work, on this phone.', 'न बायोडाटा, न प्रमाणपत्र। बस आपका काम, इसी फ़ोन में।']

// One stable make function per trade, so Hero3D keeps its sculpture between renders.
const toolMakers = {}
const makeTool = (id) => (toolMakers[id] ??= () => tradeTool(id))

// The last seven days as amphorae. The diary is read inside the frame loop,
// so makeShelf never changes; states are only pushed when the diary does.
const makeShelf = () => amphoraShelf(7)
let shelfMemo = { entries: null, day: '', states: [] }
const shelfApplied = new WeakMap()
const updateShelf = (model) => {
  const entries = diary.getSnapshot().data.entries
  const day = today()
  if (shelfMemo.entries !== entries || shelfMemo.day !== day) shelfMemo = { entries, day, states: recentStates(entries, day, 7) }
  if (shelfApplied.get(model) !== shelfMemo.states) {
    model.setStates(shelfMemo.states)
    shelfApplied.set(model, shelfMemo.states)
  }
}

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
const digits = (v, n = 7) => v.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, n)
const shiftDay = (iso, k) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + k)
  return d.toISOString().slice(0, 10)
}
const fmtDay = (iso, lang, opts = { day: 'numeric', month: 'short' }) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'UTC', ...opts })
const monthTitle = (ym, lang) => fmtDay(`${ym}-01`, lang, { month: 'long', year: 'numeric' })
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function useReducedMotion() {
  const [reduced, setReduced] = useState(reducedMotion)
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(q.matches)
    q.addEventListener('change', change)
    return () => q.removeEventListener('change', change)
  }, [])
  return reduced
}

// A sentence a screen reader can say for the drawn card.
function cardLabel(s, skills, photos, lang) {
  const hi = lang === 'hi'
  const t = tradeOf(s.trade)
  return [
    hi ? 'काम कार्ड' : 'Work card',
    s.name.trim() || (hi ? 'नाम अभी नहीं भरा' : 'no name yet'),
    `${hi ? t.hi : t.label}${s.years ? `, ${s.years} ${hi ? 'साल' : s.years === 1 ? 'year' : 'years'}` : ''}`,
    skills.length ? `${hi ? 'कौशल' : 'Skills'}: ${skills.join(', ')}` : hi ? 'कोई कौशल नहीं चुना' : 'no skills chosen yet',
    s.langs.length ? `${hi ? 'भाषाएँ' : 'Speaks'}: ${s.langs.join(', ')}` : null,
    availabilityLine(s, lang),
    Number(s.rate) > 0 ? `${money(s.rate)} ${hi ? 'प्रति दिन' : 'a day'}` : null,
    `${photos} ${hi ? 'फ़ोटो' : photos === 1 ? 'photo' : 'photos'}`,
  ].filter(Boolean).join('. ')
}

// What "Listen to my card" says, in plain words.
function cardSpeech(s, lang) {
  const hi = lang === 'hi'
  const t = tradeOf(s.trade)
  const skills = s.skills[s.trade] ?? []
  const parts = hi
    ? [
        s.name.trim() || 'नाम अभी नहीं भरा',
        `${t.hi}${s.years ? `, ${s.years} साल का अनुभव` : ''}`,
        skills.length ? `कौशल: ${skills.map((k) => SKILL_HI[k] ?? k).join(', ')}` : null,
        s.langs.length ? `भाषाएँ: ${s.langs.map((k) => LANG_HI[k] ?? k).join(', ')}` : null,
        `उपलब्ध: ${availabilityLine(s, 'hi')}`,
        Number(s.rate) > 0 ? `अपेक्षित मज़दूरी ${Number(s.rate)} रुपये प्रति दिन` : null,
        'यह खुद बताई जानकारी है, सत्यापित नहीं',
      ]
    : [
        s.name.trim() || 'No name yet',
        `${t.label}${s.years ? `, ${s.years} ${s.years === 1 ? 'year' : 'years'} of experience` : ''}`,
        skills.length ? `Skills: ${skills.join(', ')}` : null,
        s.langs.length ? `Speaks ${s.langs.join(', ')}` : null,
        `Available ${availabilityLine(s, 'en')}`,
        Number(s.rate) > 0 ? `Expected rate ${Number(s.rate)} rupees a day` : null,
        'This card is self-described, not verified',
      ]
  return [[parts.filter(Boolean).join(hi ? '। ' : '. '), hi ? 'hi-IN' : 'en-IN']]
}

// The card, its photos and voice, and the bronze canvas they are drawn on.
// Uses the same stores as the compact tool, so edits show up on both.
function useWorkCard() {
  const say = useSay()
  const { lang } = useI18n()
  const [saved, set, status] = useStore(cardStore)
  const [record] = useStore(diary)
  const s = useMemo(() => withDefaults(saved), [saved])
  const skills = useMemo(() => s.skills[s.trade] ?? [], [s])
  const [media, setMedia] = useState({ photos: [], audio: null })
  const mediaRef = useRef(media)
  const [mediaStatus, setMediaStatus] = useState('new')
  const [ready, setReady] = useState(false)
  // Decoded photos, tagged with the photo list they belong to; null where a photo would not open.
  const [images, setImages] = useState({ photos: null, list: [] })
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [busy, setBusy] = useState(false)
  const [undo, setUndo] = useState(null)
  const [drawn, setDrawn] = useState(0)
  const write = useRef(Promise.resolve())
  const paintRef = useRef(() => {})
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = CARD_W
    c.height = CARD_H
    return c
  }, [])

  useEffect(() => {
    let live = true
    mediaRead()
      .then((x) => {
        if (!live) return
        if (Array.isArray(x.photos) && x.photos.length <= 3 && x.photos.every((b) => b instanceof Blob && b.size < 10000000) && (!x.audio || x.audio instanceof Blob)) {
          mediaRef.current = x
          setMedia(x)
          setMediaStatus('saved')
        } else setMediaStatus('recovered')
      })
      .catch(() => { if (live) setMediaStatus('unavailable') })
      .finally(() => { if (live) setReady(true) })
    return () => { live = false }
  }, [])

  const updateMedia = (next) => {
    mediaRef.current = next
    setMedia(next)
    setMediaStatus('saving')
    write.current = write.current.catch(() => {}).then(() => mediaWrite(next)).then(() => setMediaStatus('saved')).catch(() => setMediaStatus('unavailable'))
  }

  useEffect(() => {
    let live = true
    const photos = media.photos
    const urls = photos.map((b) => URL.createObjectURL(b))
    Promise.allSettled(urls.map((src) => new Promise((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = reject
      im.src = src
    }))).then((r) => { if (live) setImages({ photos, list: r.map((x) => (x.status === 'fulfilled' ? x.value : null)) }) })
    return () => {
      live = false
      urls.forEach(URL.revokeObjectURL)
    }
  }, [media.photos])

  // Draw the bronze card and hand it to the 3D tablet, exactly as the vase does.
  useEffect(() => {
    let live = true
    const trade = tradeOf(s.trade)
    const paint = () => {
      if (!live) return
      drawCard(canvas, {
        name: s.name.trim(),
        tradeLabel: lang === 'hi' ? trade.hi : trade.label,
        years: s.years,
        skills,
        langs: s.langs,
        photos: images.list.filter(Boolean),
        forged: true,
        plate: plate(s.trade, paint),
        avail: availabilityLine(s, 'en'),
        rate: s.rate,
        ...diaryCounts(record.entries),
      })
      hall.card = { canvas, version: (hall.card?.version ?? 0) + 1 }
      setDrawn((n) => n + 1)
    }
    paintRef.current = paint
    // The plate may still be loading from an earlier draw: paint again when it lands.
    const art = plate(s.trade)
    if (art && !art.complete) art.addEventListener('load', paint, { once: true })
    whenFonts().then(paint)
    return () => {
      live = false
      art?.removeEventListener('load', paint)
    }
  }, [s, skills, images, canvas, lang, record.entries])

  const matched = images.photos === media.photos
  const broken = matched && images.list.some((x) => !x)
  const canDownload = ready && !busy && matched && !broken

  const add = async (files) => {
    setBusy(true)
    setPhotoError('')
    setUndo(null)
    const next = [...mediaRef.current.photos]
    for (const file of files) {
      if (next.length >= 3) {
        setPhotoError(say('Three photos fit. Remove one first.', 'तीन फ़ोटो आती हैं। पहले एक हटाएँ।'))
        break
      }
      try {
        next.push(await preparePhoto(file))
      } catch (e) {
        const why = {
          type: say('use a JPEG, PNG or WebP photo.', 'JPEG, PNG या WebP फ़ोटो चुनें।'),
          size: say('over 10 MB.', '10 MB से बड़ी है।'),
          pixels: say('over 40 megapixels.', '40 मेगापिक्सेल से बड़ी है।'),
        }[e?.message] ?? say('could not be read.', 'पढ़ी नहीं जा सकी।')
        setPhotoError(`${file.name}: ${why}`)
      }
    }
    if (next.length !== mediaRef.current.photos.length) updateMedia({ ...mediaRef.current, photos: next })
    setBusy(false)
  }
  const removePhoto = (i) => {
    setUndo(mediaRef.current)
    setPhotoError('')
    updateMedia({ ...mediaRef.current, photos: mediaRef.current.photos.filter((_, n) => n !== i) })
  }
  const undoRemove = () => {
    if (!undo) return
    updateMedia({ ...mediaRef.current, photos: undo.photos })
    setUndo(null)
  }
  const setAudio = (audio) => updateMedia({ ...mediaRef.current, audio })
  const clearAll = () => {
    cardStore.clear()
    setUndo(null)
    setError('')
    setPhotoError('')
    updateMedia({ photos: [], audio: null })
  }

  // Same checks and the same honest failure as the compact tool.
  const download = async () => {
    setError('')
    if (!s.name.trim()) return setError(say('Enter your name first (step 2).', 'पहले अपना नाम भरें (कदम 2)।'))
    if (!skills.length) return setError(say('Choose at least one skill (step 3).', 'कम से कम एक कौशल चुनें (कदम 3)।'))
    setBusy(true)
    try {
      await whenFonts()
      const pics = images.list.filter(Boolean)
      await Promise.all([plate(s.trade)?.decode?.(), ...pics.map((im) => im.decode())])
      paintRef.current()
      const b = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!b) throw Error('no image')
      const url = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = url
      a.download = `ergon-${s.name.trim().replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 50) || 'work-card'}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      toast(say('Download started.', 'डाउनलोड शुरू हुआ।'))
    } catch {
      setError(say('The image could not be prepared. Your draft is kept; retry.', 'चित्र तैयार नहीं हुआ। मसौदा सुरक्षित है; फिर प्रयास करें।'))
    } finally {
      setBusy(false)
    }
  }

  return { s, set, status, skills, media, mediaStatus, ready, images, matched, broken, canDownload, busy, error, photoError, undo, drawn, canvas, entries: record.entries, add, removePhoto, undoRemove, setAudio, clearAll, download }
}

// A copy of the bronze canvas, redrawn whenever the card is.
function CardCanvas({ card, scale = 1, className = '' }) {
  const ref = useRef()
  const { lang } = useI18n()
  const w = Math.round(CARD_W * scale)
  const h = Math.round(CARD_H * scale)
  useEffect(() => {
    const g = ref.current?.getContext('2d')
    if (!g) return
    g.clearRect(0, 0, w, h)
    g.drawImage(card.canvas, 0, 0, w, h)
  }, [card.canvas, card.drawn, w, h])
  const photos = card.matched ? card.images.list.filter(Boolean).length : card.media.photos.length
  return <canvas ref={ref} width={w} height={h} className={`pp-canvas ${className}`} role="img" aria-label={cardLabel(card.s, card.skills, photos, lang)} />
}

/* ---------- Show to an employer ---------- */

// Full screen, high contrast, big letters: turn the phone to the contractor.
function ShowCard({ s, skills, photo, onClose }) {
  const say = useSay()
  const close = useRef()
  useEffect(() => {
    const opener = document.activeElement
    const root = document.documentElement
    root.classList.add('pp-locked')
    close.current?.focus()
    const key = (e) => {
      if (e.key === 'Escape') onClose()
      // Close is the only control here, so keep focus on it.
      if (e.key === 'Tab') {
        e.preventDefault()
        close.current?.focus()
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      root.classList.remove('pp-locked')
      opener?.focus?.({ preventScroll: true })
    }
  }, [onClose])
  const trade = tradeOf(s.trade)
  const avail = availabilityLine(s, 'en')
  return (
    <div className="pp-show" role="dialog" aria-modal="true" aria-label={say('My work card, for an employer', 'नियोक्ता के लिए मेरा काम कार्ड')}>
      <div className="pp-show-inner">
        <p className="pp-show-kicker">ERGON · WORK CARD · <span lang="hi">काम कार्ड</span></p>
        <h2 className="pp-show-name">{s.name.trim() || say('Your name', 'आपका नाम')}</h2>
        <p className="pp-show-trade">
          {trade.label} · <span lang="hi">{trade.hi}</span>
          {s.years ? <> · {s.years} {s.years === 1 ? 'year' : 'years'} <span lang="hi">/ {s.years} साल</span></> : null}
        </p>
        <div className="pp-show-body">
          {photo && <img className="pp-show-photo" src={photo.src} alt={say('Photo of my work', 'मेरे काम की फ़ोटो')} />}
          <dl className="pp-show-facts">
            <div><dt>Skills · <span lang="hi">कौशल</span></dt><dd>{skills.length ? skills.join(' · ') : '—'}</dd></div>
            <div><dt>Speaks · <span lang="hi">भाषाएँ</span></dt><dd>{s.langs.length ? s.langs.join(' · ') : '—'}</dd></div>
            {avail && <div><dt>Available · <span lang="hi">उपलब्ध</span></dt><dd>{avail}<br /><span lang="hi">{availabilityLine(s, 'hi')}</span></dd></div>}
            {Number(s.rate) > 0 && <div><dt>Rate · <span lang="hi">मज़दूरी</span></dt><dd className="pp-show-rate">{money(s.rate)} / day · <span lang="hi">दिन</span></dd></div>}
            {s.from && <div><dt>Lives in · <span lang="hi">इलाका</span></dt><dd>{s.from}</dd></div>}
          </dl>
        </div>
        <p className="pp-show-note">Self-described. Not verified by Ergon. · <span lang="hi">खुद बताई जानकारी, सत्यापित नहीं।</span></p>
      </div>
      <button ref={close} type="button" className="pp-show-close" onClick={onClose}><Icon name="close" size={30} />{say('Close', 'बंद करें')}</button>
    </div>
  )
}

/* ---------- Β·1 The card builder ---------- */

function Chip({ pressed, onClick, main, sub, icon }) {
  return (
    <button type="button" className="ag-chip pp-chip" aria-pressed={pressed} onClick={onClick}>
      {pressed ? <Icon name="check" size={18} /> : icon ? <Icon name={icon} size={18} /> : null}
      <span>
        {main}
        {sub && sub !== main && <small>{sub}</small>}
      </span>
    </button>
  )
}

function CardBuilder({ card }) {
  const say = useSay()
  const { lang, t } = useI18n()
  const { s, set, skills, media } = card
  const trade = tradeOf(s.trade)
  const [step, setStep] = useState(() => (s.name.trim() && skills.length ? LAST : 0))
  const [stepError, setStepError] = useState('')
  const [clearing, setClearing] = useState(false)
  const [showing, setShowing] = useState(false)
  const closeShow = useCallback(() => setShowing(false), [])
  const panel = useRef()
  const head = useRef()
  const moved = useRef(false)
  const canRecord = !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'

  // After Back / Next, bring the new step's title into view and focus.
  useEffect(() => {
    if (!moved.current) return
    if (panel.current && panel.current.getBoundingClientRect().top < 120) panel.current.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' })
    head.current?.focus({ preventScroll: true })
  }, [step])

  const edit = (patch) => set((a) => ({ ...withDefaults(a), ...(typeof patch === 'function' ? patch(withDefaults(a)) : patch) }))
  const rateBad = s.rate !== '' && !(Number(s.rate) > 0)
  const problem = (n) => {
    if (n === 1 && !s.name.trim()) return say('Enter your name.', 'अपना नाम भरें।')
    if (n === 2 && !skills.length) return say('Choose at least one skill you really do.', 'कम से कम एक कौशल चुनें जो सच में करते हैं।')
    if (n === 4 && rateBad) return say('Enter a rate above ₹0, or leave it empty.', '₹0 से ज़्यादा दर भरें, या खाली छोड़ें।')
    return ''
  }
  const goStep = (n) => {
    moved.current = true
    setStepError('')
    setStep(Math.max(0, Math.min(LAST, n)))
  }
  const next = () => {
    const p = problem(step)
    if (p) return setStepError(p)
    goStep(step + 1)
  }
  const fillSample = () => {
    if (s.name.trim() && !window.confirm(say('Replace your card with the labelled sample?', 'अपने कार्ड की जगह नमूना भरें?'))) return
    set(withDefaults(SAMPLE))
    goStep(LAST)
    toast(say('Sample filled in. Change it to your own.', 'नमूना भरा गया। इसे अपनी जानकारी से बदलें।'))
  }

  const [, titleEn, titleHi, icon, lineEn, lineHi] = STEPS[step]
  const avail = availabilityLine(s, lang)
  const text = cardText(s, { lang, ...diaryCounts(card.entries) })
  const photo = card.matched ? card.images.list.find(Boolean) : null

  return (
    <div className="ag-stack-lg">
      <div className="pp-head-actions">
        <button type="button" className="ag-btn ag-btn-tinted ag-btn-sm" onClick={fillSample}><Icon name="star" />{say('Use a labelled sample', 'नामांकित नमूना भरें')}</button>
        {clearing ? (
          <span className="pp-confirm" role="group" aria-label={say('Confirm clearing', 'मिटाने की पुष्टि')}>
            <span>{say('Clear card, photos and voice?', 'कार्ड, फ़ोटो और आवाज़ मिटाएँ?')}</span>
            <button type="button" className="ag-btn ag-btn-danger ag-btn-sm" onClick={() => { card.clearAll(); setClearing(false); goStep(0) }}>{say('Clear', 'मिटाएँ')}</button>
            <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => setClearing(false)}>{say('Cancel', 'रद्द करें')}</button>
          </span>
        ) : (
          <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => setClearing(true)}><Icon name="trash" />{say('Start again', 'फिर से शुरू')}</button>
        )}
      </div>
      <SaveStatus status={card.status} />

      <div className={`pp-builder ${step === LAST ? 'is-final' : ''}`}>
        <section ref={panel} className="ag-tablet pp-step" aria-labelledby="pp-step-title">
          <div className="ag-steps" aria-hidden="true">
            {STEPS.map((x, i) => <span key={x[0]} className={i <= step ? 'on' : ''} />)}
          </div>
          <div className="pp-step-head">
            <span className="ag-coin lg pp-step-coin"><Icon name={icon} /></span>
            <div>
              <p className="pp-step-count">{say(`Step ${step + 1} of ${STEPS.length}`, `कदम ${step + 1} / ${STEPS.length}`)}</p>
              <h2 id="pp-step-title" className="pp-step-title" ref={head} tabIndex={-1}>{say(titleEn, titleHi)}</h2>
              <p className="pp-step-line">{say(lineEn, lineHi)}</p>
            </div>
          </div>

          <div className="pp-step-body">
            {step === 0 && (
              <div className="pp-trade">
                <Hero3D make={makeTool(s.trade)} height={1.5} camera={[0, 1.2, 3.9]} target={[0, 0.72, 0]} className="pp-tool-niche" fallback={PLATES[s.trade]} label={say(trade.label, trade.hi)} />
                <div className="ag-tiles pp-trade-tiles" role="group" aria-label={say('Your trade', 'आपका काम')}>
                  {TRADES.map((x) => (
                    <button key={x.id} type="button" className="ag-tile" aria-pressed={s.trade === x.id} onClick={() => edit({ trade: x.id })}>
                      <span className="ag-tile-art" aria-hidden="true" style={{ '--art': `url(${PLATES[x.id]})`, '--c': tradeOf(x.id).color }} />
                      {say(x.label, x.hi)}
                      <small>{lang === 'hi' ? x.label : x.hi}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="ag-stack-lg">
                <label className="ag-field pp-big-field">
                  <span>{say('Name · required', 'नाम · ज़रूरी')}</span>
                  <input value={s.name} maxLength={80} autoComplete="name" aria-invalid={!!stepError && !s.name.trim()} aria-describedby={stepError ? 'pp-step-error' : undefined} placeholder={say('e.g. Ramesh Kumar', 'जैसे रमेश कुमार')} onChange={(e) => edit({ name: e.target.value })} />
                </label>
                <div className="ag-field pp-big-field">
                  <span id="pp-years-label">{say('Years of experience', 'कितने साल का अनुभव')}: <output className="pp-years-out">{s.years}</output></span>
                  <div className="pp-years">
                    <button type="button" className="pp-round" aria-label={say('One year less', 'एक साल कम')} onClick={() => edit((c) => ({ years: Math.max(0, c.years - 1) }))}><Icon name="minus" size={24} /></button>
                    <input type="range" min="0" max="60" value={s.years} aria-labelledby="pp-years-label" onChange={(e) => edit({ years: Number(e.target.value) })} />
                    <button type="button" className="pp-round" aria-label={say('One year more', 'एक साल ज़्यादा')} onClick={() => edit((c) => ({ years: Math.min(60, c.years + 1) }))}><Icon name="plus" size={24} /></button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ag-chips pp-chips" role="group" aria-label={say(`Skills for ${trade.label}`, `${trade.hi} के कौशल`)}>
                {SKILLS[s.trade].map((k) => (
                  <Chip key={k} pressed={skills.includes(k)} main={say(k, SKILL_HI[k] ?? k)} sub={lang === 'hi' ? k : SKILL_HI[k]} onClick={() => edit((c) => ({ skills: { ...c.skills, [c.trade]: toggle(c.skills[c.trade] ?? [], k) } }))} />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="ag-chips pp-chips" role="group" aria-label={say('Languages you speak', 'आपकी भाषाएँ')}>
                {LANGS.map((k) => (
                  <Chip key={k} pressed={s.langs.includes(k)} main={say(k, LANG_HI[k])} sub={LANG_NATIVE[k]} onClick={() => edit((c) => ({ langs: toggle(c.langs, k) }))} />
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="ag-stack-lg">
                <fieldset className="pp-fieldset">
                  <legend>{say('Days', 'दिन')}</legend>
                  <div className="ag-chips pp-chips">
                    {DAYS.map(([en, hi], i) => <Chip key={en} pressed={s.days.includes(i)} main={say(en, hi)} onClick={() => edit((c) => ({ days: toggle(c.days, i) }))} />)}
                  </div>
                </fieldset>
                <fieldset className="pp-fieldset">
                  <legend>{say('Times', 'समय')}</legend>
                  <div className="ag-chips pp-chips">
                    {TIMES.map(([id, en, hi]) => <Chip key={id} pressed={s.times.includes(id)} icon={id === 'night' || id === 'evening' ? 'moon' : 'sun'} main={say(en, hi)} onClick={() => edit((c) => ({ times: toggle(c.times, id) }))} />)}
                  </div>
                </fieldset>
                <div className="ag-fields">
                  <label className="ag-field pp-big-field">
                    <span><Icon name="naka" size={18} /> {say('My naka', 'मेरा नाका')}</span>
                    <select value={s.naka ?? ''} onChange={(e) => edit({ naka: e.target.value || null })}>
                      <option value="">{say('No fixed naka', 'कोई तय नाका नहीं')}</option>
                      {NAKAS.map((n) => <option key={n.id} value={n.id}>{lang === 'hi' ? n.hi : n.name}</option>)}
                    </select>
                  </label>
                  <label className="ag-field pp-big-field">
                    <span><Icon name="pin" size={18} /> {say('Area I live in · not full address', 'मेरा इलाका · पूरा पता नहीं')}</span>
                    <input value={s.from} maxLength={60} placeholder={say('e.g. Saki Naka', 'जैसे साकीनाका')} onChange={(e) => edit({ from: e.target.value })} />
                  </label>
                  <label className="ag-field pp-big-field">
                    <span><Icon name="rupee" size={18} /> {say('Daily rate · optional', 'दैनिक दर · वैकल्पिक')}</span>
                    <span className="pp-rupee">
                      <b aria-hidden="true">₹</b>
                      <input inputMode="numeric" pattern="[0-9]*" value={s.rate} placeholder="900" aria-invalid={!!stepError && rateBad} aria-describedby={stepError ? 'pp-step-error' : undefined} onChange={(e) => edit({ rate: digits(e.target.value) })} />
                    </span>
                  </label>
                </div>
                {avail && <p className="pp-avail"><Icon name="clock" size={22} />{avail}</p>}
              </div>
            )}

            {step === 5 && (
              <div className="ag-stack-lg">
                <div className="pp-photos">
                  {media.photos.map((_, i) => {
                    const im = card.matched ? card.images.list[i] : undefined
                    return (
                      <figure key={i} className="pp-photo">
                        {im ? <img src={im.src} alt={`${say('Work photo', 'काम की फ़ोटो')} ${i + 1}`} /> : <span className="pp-photo-missing">{im === null ? say('Could not open', 'नहीं खुली') : '…'}</span>}
                        <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => card.removePhoto(i)} aria-label={`${say('Remove photo', 'फ़ोटो हटाएँ')} ${i + 1}`}><Icon name="trash" />{say('Remove', 'हटाएँ')}</button>
                      </figure>
                    )
                  })}
                  {media.photos.length < 3 && (
                    <label className={`pp-add-photo ${!card.ready || card.busy ? 'is-off' : ''}`}>
                      <Icon name="camera" size={36} />
                      <span>{card.busy ? say('Preparing…', 'तैयार हो रही…') : say('Add a photo', 'फ़ोटो जोड़ें')}</span>
                      <small>{media.photos.length}/3</small>
                      <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" multiple disabled={!card.ready || card.busy} onChange={(e) => { card.add([...e.target.files]); e.target.value = '' }} />
                    </label>
                  )}
                </div>
                {card.undo && <button type="button" className="ag-btn ag-btn-tinted ag-btn-sm pp-undo" onClick={card.undoRemove}><Icon name="back" />{say('Undo remove', 'हटाना वापस लें')}</button>}
                {card.photoError && <p className="ag-error" role="alert">{card.photoError}</p>}
                {card.broken && <p className="ag-error" role="alert">{say('A saved photo could not be opened. Remove it.', 'एक सहेजी फ़ोटो नहीं खुली। उसे हटाएँ।')}</p>}
                <div className="pp-voice">
                  <p className="pp-sub"><Icon name="mic" size={22} />{say('Your voice · 12 seconds', 'आपकी आवाज़ · 12 सेकंड')}</p>
                  {!canRecord ? <p className="ag-muted">{t('micUnavailable')}</p> : card.ready ? <Voice blob={media.audio} onDone={card.setAudio} /> : null}
                </div>
                <SaveStatus status={card.mediaStatus} />
              </div>
            )}

            {step === LAST && (
              <div className="ag-stack-lg">
                <CardCanvas card={card} className="pp-canvas-lg" />
                {avail && <p className="pp-avail"><Icon name="clock" size={22} />{avail}</p>}
                <div className="pp-final">
                  <button type="button" className="ag-btn ag-btn-primary pp-big-btn" disabled={!card.canDownload} onClick={card.download}><Icon name="download" />{card.busy ? say('Preparing…', 'तैयार हो रहा…') : say('Download work card (PNG)', 'काम कार्ड डाउनलोड (PNG)')}</button>
                  <button type="button" className="ag-btn ag-btn-dark pp-big-btn" onClick={() => setShowing(true)}><Icon name="eye" />{say('Show to employer', 'नियोक्ता को दिखाएँ')}</button>
                  <a className="ag-btn ag-btn-plain pp-big-btn" href={whatsappUrl(text)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />{say('Send on WhatsApp', 'व्हाट्सऐप पर भेजें')}</a>
                  <Listen key={lang} className="ag-btn ag-btn-tinted pp-big-btn" lines={() => cardSpeech(s, lang)} label={say('Listen to my card', 'मेरा कार्ड सुनें')} />
                </div>
                {card.error && <p className="ag-error" role="alert">{card.error}</p>}
                {card.broken && <p className="ag-error" role="alert">{say('A saved photo could not be opened. Remove it in step 6.', 'एक सहेजी फ़ोटो नहीं खुली। कदम 6 में उसे हटाएँ।')}</p>}
                <p className="ag-note quiet pp-note">{say('Self-described, not verified. Voice is not in the PNG. Your phone number is never on the card.', 'खुद बताई जानकारी, सत्यापित नहीं। आवाज़ PNG में नहीं। आपका फ़ोन नंबर कार्ड पर कभी नहीं।')}</p>
                <div className="ag-chips pp-jump" role="group" aria-label={say('Change a step', 'कोई कदम बदलें')}>
                  {STEPS.slice(0, LAST).map(([id, en, hi, ic], n) => (
                    <button key={id} type="button" className="ag-chip" onClick={() => goStep(n)}><Icon name={ic} size={18} />{say(en, hi)}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {stepError && <p id="pp-step-error" className="ag-error pp-step-error" role="alert">{stepError}</p>}
          <div className="pp-step-foot">
            <button type="button" className="ag-btn ag-btn-plain pp-big-btn" onClick={() => goStep(step - 1)} disabled={step === 0}><Icon name="back" />{say('Back', 'पीछे')}</button>
            {step < LAST && (
              <button type="button" className="ag-btn ag-btn-primary pp-big-btn" onClick={next}>{step === LAST - 1 ? say('See my card', 'मेरा कार्ड देखें') : say('Next', 'आगे')}<Icon name="chevron" /></button>
            )}
          </div>
        </section>

        <aside className="pp-aside ag-tablet" aria-label={say('Live preview', 'लाइव झलक')}>
          <CardCanvas card={card} scale={0.5} />
        </aside>
      </div>
      {showing && <ShowCard s={s} skills={skills} photo={photo} onClose={closeShow} />}
    </div>
  )
}

/* ---------- Β·2 The work diary ---------- */

function StatusBadge({ entry }) {
  const say = useSay()
  const [en, hi, icon] = STATUS[entry.status]
  const owed = owedOn(entry)
  return (
    <span className={`pp-badge ${entry.status}`}>
      <Icon name={icon} size={15} />
      {say(en, hi)}
      {owed > 0 && entry.status === 'part' ? ` · ${money(owed)} ${say('owed', 'बाकी')}` : ''}
    </span>
  )
}

function StatusPicker({ value, onChange, label }) {
  const say = useSay()
  return (
    <div className="pp-status" role="group" aria-label={label}>
      {Object.entries(STATUS).map(([id, [en, hi, icon]]) => (
        <button key={id} type="button" className={`pp-status-btn ${id}`} aria-pressed={value === id} onClick={() => onChange(id)}>
          <Icon name={icon} size={28} />
          <span>{say(en, hi)}</span>
        </button>
      ))}
    </div>
  )
}

function DayForm({ cardTrade, cardRate, employers }) {
  const say = useSay()
  const { lang } = useI18n()
  const [d, setD] = useState(() => ({ date: today(), employer: '', trade: cardTrade, rate: Number(cardRate) > 0 ? String(cardRate) : '', unit: 'day', status: 'paid', paidAmount: '', note: '' }))
  const [error, setError] = useState('')
  const field = (patch) => setD((x) => ({ ...x, ...patch }))
  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (d.date && d.date > today()) return setError(say('That date is in the future.', 'यह तारीख आगे की है।'))
    if (d.status === 'part' && !(Number(d.paidAmount) > 0)) return setError(say('Enter how much you received.', 'लिखें कि कितना मिला।'))
    try {
      addEntry({ ...d, paidAmount: d.status === 'part' ? d.paidAmount : null, source: 'self' })
      toast(say('Day added.', 'दिन जुड़ गया।'))
      setD((x) => ({ ...x, status: 'paid', paidAmount: '', note: '' }))
    } catch (err) {
      setError(entryError(err, lang))
    }
  }
  return (
    <form className="ag-tablet ag-stack-lg pp-dayform" onSubmit={submit} noValidate aria-labelledby="pp-add-day">
      <div className="pp-step-head">
        <span className="ag-coin lg"><Icon name="plus" /></span>
        <h2 id="pp-add-day" className="pp-step-title">{say('Add a day', 'एक दिन जोड़ें')}</h2>
      </div>
      <div className="ag-fields">
        <label className="ag-field pp-big-field">
          <span><Icon name="calendar" size={18} /> {say('Date', 'तारीख')}</span>
          <input type="date" value={d.date} max={today()} onChange={(e) => field({ date: e.target.value })} />
        </label>
        <label className="ag-field pp-big-field">
          <span><Icon name="tools" size={18} /> {say('Trade', 'काम')}</span>
          <select value={d.trade} onChange={(e) => field({ trade: e.target.value })}>
            {TRADES.map((x) => <option key={x.id} value={x.id}>{say(x.label, x.hi)}</option>)}
          </select>
        </label>
      </div>
      <div className="ag-field pp-big-field">
        <label htmlFor="pp-employer" className="ag-label"><Icon name="people" size={18} /> {say('Worked for', 'किसके लिए')}</label>
        {!!employers.length && (
          <div className="ag-chips pp-chips" role="group" aria-label={say('Recent employers', 'हाल के नियोक्ता')}>
            {employers.map((name) => <Chip key={name} pressed={d.employer === name} main={name} onClick={() => field({ employer: d.employer === name ? '' : name })} />)}
          </div>
        )}
        <input id="pp-employer" className="ag-input" value={d.employer} maxLength={80} placeholder={say('Contractor, company or home', 'ठेकेदार, कंपनी या घर')} onChange={(e) => field({ employer: e.target.value })} />
      </div>
      <div className="ag-fields">
        <label className="ag-field pp-big-field">
          <span><Icon name="rupee" size={18} /> {say('Rate', 'दर')}</span>
          <span className="pp-rupee"><b aria-hidden="true">₹</b><input inputMode="numeric" pattern="[0-9]*" value={d.rate} placeholder="900" onChange={(e) => field({ rate: digits(e.target.value) })} /></span>
        </label>
        <div className="ag-field pp-big-field">
          <span className="ag-label">{say('Per', 'प्रति')}</span>
          <div className="ag-seg ag-seg-wide pp-seg-big" role="group" aria-label={say('Rate is per', 'दर किसके लिए')}>
            {Object.entries(UNIT).map(([id, [en, hi]]) => <button key={id} type="button" aria-pressed={d.unit === id} onClick={() => field({ unit: id })}>{say(en, hi)}</button>)}
          </div>
        </div>
      </div>
      <fieldset className="pp-fieldset">
        <legend>{say('Were you paid?', 'पैसे मिले?')}</legend>
        <StatusPicker value={d.status} onChange={(status) => field({ status })} label={say('Were you paid?', 'पैसे मिले?')} />
        {d.status === 'part' && (
          <label className="ag-field pp-big-field pp-part">
            <span>{say('Received', 'मिला')}</span>
            <span className="pp-rupee"><b aria-hidden="true">₹</b><input inputMode="numeric" pattern="[0-9]*" value={d.paidAmount} onChange={(e) => field({ paidAmount: digits(e.target.value) })} /></span>
          </label>
        )}
      </fieldset>
      <label className="ag-field pp-big-field">
        <span><Icon name="edit" size={18} /> {say('Note · optional', 'नोट · वैकल्पिक')}</span>
        <input value={d.note} maxLength={160} placeholder={say('e.g. Will pay on Saturday', 'जैसे शनिवार को देगा')} onChange={(e) => field({ note: e.target.value })} />
      </label>
      {error && <p className="ag-error" role="alert">{error}</p>}
      <button type="submit" className="ag-btn ag-btn-primary ag-btn-block pp-big-btn"><Icon name="plus" />{say('Add this day', 'यह दिन जोड़ें')}</button>
    </form>
  )
}

function EntrySheet({ entry, onClose, onDeleted }) {
  const say = useSay()
  const { lang } = useI18n()
  const [status, setStatus] = useState(entry.status)
  const [amount, setAmount] = useState(entry.status === 'part' && entry.paidAmount ? String(entry.paidAmount) : '')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const trade = tradeOf(entry.trade)
  const save = () => {
    setError('')
    if (status === 'part' && !(Number(amount) > 0)) return setError(say('Enter how much you received.', 'लिखें कि कितना मिला।'))
    try {
      updateEntry(entry.id, status === 'part' ? { status, paidAmount: Number(amount) } : { status })
      toast(say('Diary updated.', 'डायरी बदली गई।'))
      onClose()
    } catch (e) {
      setError(entryError(e, lang))
    }
  }
  return (
    <div className="ag-stack-lg pp-sheet">
      <dl className="ag-terms">
        <Term icon="tools" label={say('Trade', 'काम')} value={say(trade.label, trade.hi)} />
        <Term icon="rupee" label={say('Rate', 'दर')} value={`${money(entry.rate)} / ${say(...UNIT[entry.unit])}`} />
        {entry.note && <Term icon="edit" label={say('Note', 'नोट')} value={entry.note} />}
        {entry.source === 'booking' && <Term icon="laurel" label={say('Confirmed', 'पुष्टि')} value={say('By the employer on Ergon', 'नियोक्ता ने एर्गोन पर')} />}
      </dl>
      <StatusPicker value={status} onChange={setStatus} label={say('Payment', 'भुगतान')} />
      {status === 'part' && (
        <label className="ag-field pp-big-field">
          <span>{say('Received', 'मिला')}</span>
          <span className="pp-rupee"><b aria-hidden="true">₹</b><input inputMode="numeric" pattern="[0-9]*" value={amount} onChange={(e) => setAmount(digits(e.target.value))} /></span>
        </label>
      )}
      {error && <p className="ag-error" role="alert">{error}</p>}
      <button type="button" className="ag-btn ag-btn-primary ag-btn-block pp-big-btn" onClick={save}><Icon name="check" />{say('Save', 'सहेजें')}</button>
      {confirm ? (
        <div className="pp-confirm pp-confirm-block" role="group" aria-label={say('Confirm delete', 'हटाने की पुष्टि')}>
          <span>{say('Delete this day? It cannot be undone.', 'यह दिन हटाएँ? वापस नहीं आएगा।')}</span>
          <button type="button" className="ag-btn ag-btn-danger" onClick={() => { removeEntry(entry.id); toast(say('Day deleted.', 'दिन हटाया गया।')); onDeleted() }}><Icon name="trash" />{say('Delete', 'हटाएँ')}</button>
          <button type="button" className="ag-btn ag-btn-plain" onClick={() => setConfirm(false)}>{say('Keep it', 'रहने दें')}</button>
        </div>
      ) : (
        <button type="button" className="ag-btn ag-btn-plain ag-btn-block" onClick={() => setConfirm(true)}><Icon name="trash" />{say('Delete this day', 'यह दिन हटाएँ')}</button>
      )}
    </div>
  )
}

function Diary({ cardTrade, cardRate }) {
  const say = useSay()
  const { lang } = useI18n()
  const [record, , status] = useStore(diary)
  const entries = record.entries
  const day = today()
  const month = day.slice(0, 7)
  const stats = summarise(entries, month)
  const owed = owedByEmployer(entries)
  const week = recentStates(entries, day, 7)
  const [openId, setOpenId] = useState(null)
  const closeSheet = useCallback(() => setOpenId(null), [])
  const listHead = useRef()
  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries])
  const groups = useMemo(() => {
    const m = new Map()
    for (const e of sorted) {
      const k = e.date.slice(0, 7)
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(e)
    }
    return [...m]
  }, [sorted])
  const employers = useMemo(() => [...new Set(sorted.map((e) => e.employer))].slice(0, 6), [sorted])
  const open = entries.find((e) => e.id === openId)

  const addSample = () => {
    let n = 0
    for (const e of sampleEntries(day)) {
      try {
        if (addEntry({ ...e, note: e.note ? `${say('Sample', 'नमूना')} · ${e.note}` : say('Sample', 'नमूना') })) n++
      } catch { /* a sample day that does not fit is skipped */ }
    }
    toast(say(`${n} sample days added.`, `${n} नमूना दिन जोड़े गए।`))
  }
  const askOwed = (g) => {
    rightsStore.set((r) => ({ ...r, employer: g.employer.slice(0, 120), days: String(g.days), rate: String(g.rate), ready: false }))
    location.hash = '#athena/wages'
  }

  return (
    <div className="ag-stack-lg">
      <SaveStatus status={status} />
      <div className="ag-grid">
        <div className="ag-col-7 ag-tablet ag-stack-lg">
          <h2 className="pp-step-title">{say('This month', 'इस महीने')} <small>{monthTitle(month, lang)}</small></h2>
          <div className="ag-stats pp-stats">
            <Stat value={stats.days} label={say('days worked', 'दिन काम')} />
            <Stat value={money(stats.earned)} label={say('earned', 'कमाया')} tone={stats.earned ? 'good' : undefined} />
            <Stat value={money(stats.owed)} label={say('owed to you', 'बाकी')} tone={stats.owed > 0 ? 'bad' : undefined} />
            <Stat value={stats.employers} label={say('employers', 'नियोक्ता')} />
          </div>
          <p className="ag-note quiet pp-note">
            {say('Your own record, on this phone. It helps with the welfare board’s 90-day work certificate and wage claims.', 'आपका अपना रिकॉर्ड, इसी फ़ोन में। कल्याण बोर्ड के 90 दिन के प्रमाणपत्र और मज़दूरी के दावे में काम आता है।')}
            {' '}<Icon name="laurel" size={18} className="pp-laurel" /> {say('= confirmed by the employer.', '= नियोक्ता की पुष्टि।')}
          </p>
        </div>
        <div className="ag-col-5 ag-tablet ag-stack">
          <h2 className="pp-step-title">{say('Last 7 days', 'पिछले 7 दिन')}</h2>
          <Hero3D make={makeShelf} update={updateShelf} height={1.4} camera={[0, 0.75, 2.85]} target={[0, 0.28, 0]} turn={false} spin={false} className="pp-shelf-niche" fallback="/art/terracotta.jpg" label={say('One amphora for each day', 'हर दिन का एक घड़ा')} />
          <ol className="pp-week" aria-label={say('Last 7 days', 'पिछले 7 दिन')}>
            {week.map((st, i) => {
              const date = shiftDay(day, i - 6)
              return (
                <li key={date} className={st}>
                  <b>{i === 6 ? say('Today', 'आज') : fmtDay(date, lang, { weekday: 'short' })}</b>
                  <span>{{ empty: '—', paid: say('Paid', 'मिला'), unpaid: say('Owed', 'बाकी') }[st]}</span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {!!owed.length && (
        <section className="pp-owed-grid" aria-label={say('Money owed to you', 'आपके बाकी पैसे')}>
          {owed.map((g) => (
            <article key={g.employer} className="ag-tablet pp-owed">
              <strong className="pp-owed-who">{g.employer}</strong>
              <p className="pp-owed-sum">{money(g.owed)}</p>
              <p className="pp-owed-days">{g.days} {say(g.days === 1 ? 'day' : 'days', 'दिन')} · {fmtDay(g.dates[0], lang)}{g.dates.length > 1 ? ` – ${fmtDay(g.dates.at(-1), lang)}` : ''}</p>
              <button type="button" className="ag-btn ag-btn-primary ag-btn-block pp-big-btn" onClick={() => askOwed(g)}><Icon name="athena" />{say('Ask for what you’re owed', 'अपना बकाया माँगें')}</button>
            </article>
          ))}
        </section>
      )}

      <div className="ag-grid">
        <div className="ag-col-5">
          <DayForm cardTrade={cardTrade} cardRate={cardRate} employers={employers} />
        </div>
        <section className="ag-col-7 ag-stack-lg" aria-labelledby="pp-days">
          <h2 id="pp-days" className="pp-step-title" ref={listHead} tabIndex={-1}>{say('Your days', 'आपके दिन')}</h2>
          {!entries.length ? (
            <div className="ag-tablet pp-empty">
              <span className="ag-coin lg bronze"><Icon name="calendar" /></span>
              <p>{say('No days yet.', 'अभी कोई दिन नहीं।')}</p>
              <button type="button" className="ag-btn ag-btn-tinted pp-big-btn" onClick={addSample}><Icon name="star" />{say('Add a sample week', 'नमूना हफ़्ता जोड़ें')}</button>
            </div>
          ) : (
            groups.map(([m, list]) => {
              const sum = summarise(list)
              return (
                <div key={m} className="pp-month">
                  <div className="ag-split pp-month-head">
                    <h3>{monthTitle(m, lang)}</h3>
                    <span>{list.length} {say(list.length === 1 ? 'day' : 'days', 'दिन')} · {money(sum.earned)}{sum.owed ? <b> · {money(sum.owed)} {say('owed', 'बाकी')}</b> : null}</span>
                  </div>
                  <ul className="ag-list">
                    {list.map((e) => (
                      <li key={e.id}>
                        <button type="button" className="ag-list-row pp-day" onClick={() => setOpenId(e.id)}>
                          <span className="pp-day-date"><b>{fmtDay(e.date, lang, { day: 'numeric' })}</b><small>{fmtDay(e.date, lang, { weekday: 'short' })}</small></span>
                          <span className="pp-day-main">
                            <strong>
                              {e.employer}
                              {e.source === 'booking' && <Icon name="laurel" size={18} className="pp-laurel" title={say('Confirmed by the employer on Ergon', 'नियोक्ता ने एर्गोन पर पुष्टि की')} />}
                            </strong>
                            <small>{money(e.rate)} / {say(...UNIT[e.unit])}</small>
                          </span>
                          <StatusBadge entry={e} />
                          <Icon name="chevron" className="ag-chev" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </section>
      </div>

      <Sheet open={!!open} onClose={closeSheet} title={open ? `${fmtDay(open.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })} · ${open.employer}` : ''}>
        {open && <EntrySheet key={open.id} entry={open} onClose={closeSheet} onDeleted={() => { closeSheet(); requestAnimationFrame(() => listHead.current?.focus()) }} />}
      </Sheet>
    </div>
  )
}

/* ---------- The page ---------- */

export default function Passport({ section }) {
  const say = useSay()
  const { lang } = useI18n()
  const card = useWorkCard()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(() => validSection(section))
  useEffect(() => { setActive(validSection(section)) }, [section])
  // A link to another passport section while already here.
  useEffect(() => {
    const onHash = () => {
      const m = location.hash.match(/^#passport(?:\/(\w+))?$/)
      if (m) setActive(validSection(m[1]))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // Keep the address honest: #passport/share becomes #passport/card.
  useEffect(() => {
    if (location.hash.startsWith('#passport/') && location.hash !== `#passport/${active}`) history.replaceState(null, '', `#passport/${active}`)
  }, [active])
  const go = (id) => {
    const v = validSection(id)
    setActive(v)
    history.replaceState(null, '', `#passport/${v}`)
  }
  const hi = lang === 'hi'
  return (
    <div className="pp-page">
      <div className="ag-hero">
        <div>
          <p className="ag-kicker"><span className="ag-numeral">Β</span>{say('Hephaestus', 'हेफ़ेस्टस')}</p>
          <h1 className="ag-title">{say('Your hands', 'आपके हाथ ही')} <em>{say('are the résumé.', 'आपका बायोडाटा हैं।')}</em></h1>
          <p className="ag-lede">{LEDE[hi ? 1 : 0]}</p>
          <p className="ag-lede-hi" lang={hi ? 'en' : 'hi'}>{LEDE[hi ? 0 : 1]}</p>
        </div>
        <Hero3D camera={[0, 1.05, 4.4]} target={[0, 0.88, 0]} turn={false} fallback="/art/gods/hephaestus.jpg" label={say('Your card in bronze · drag to turn', 'काँसे में आपका कार्ड · खींचकर घुमाएँ')}>
          {/* Lift the tablet off the niche floor so its shadow falls below it. */}
          <group position={[0, 0.9, 0]}>
            <Tablet standalone reducedMotion={reduced} />
          </group>
        </Hero3D>
      </div>

      <SectionNav value={active} onChange={go} label={say('Work passport', 'काम पासपोर्ट')} items={SECTIONS.map(([id, en, hiText, icon]) => [id, say(en, hiText), icon])} />

      {active === 'card' ? <CardBuilder card={card} /> : <Diary cardTrade={card.s.trade} cardRate={card.s.rate} />}
    </div>
  )
}
