// Γ · Themis — check an offer. The full-page scales share the compact tool's
// store and rules. Two jobs only: weigh the stated terms on a live balance,
// and read a forwarded job message. Everything stays on this phone.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../domain/storage.js'
import { offerStore, offerFromJob } from '../../domain/offers.js'
import { PRESETS, weighOffer, LOCAL_RATE, payBand, numeric } from '../../themis/rules.js'
import { assessJob, scanMessage, SAMPLE_MESSAGES, RED_FLAGS, SEALS } from '../../domain/trust.js'
import { allJobs, marketplace } from '../../domain/marketplace.js'
import { TRADES, tradeOf, money } from '../../hermes/jobs.js'
import { createBalance } from '../../world/balance.js'
import { useI18n } from '../../i18n/index.jsx'
import Listen from '../../ui/Listen.jsx'
import Hero3D from '../Hero3D.jsx'
import Icon from '../icons.jsx'
import { Seal, Term, Flag, SectionNav, toast, useSay } from '../ui.jsx'
import './scales.css'

// ---------- The balance (stable, module scope) ----------

const reduceMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false }

// The balance reads the shared offer every frame; weigh it again only when it changes.
let weighed = { offer: null, w: { fair: 0, risk: 0 } }
const currentWeights = () => {
  const o = offerStore.getSnapshot().data.offer
  if (weighed.offer !== o) weighed = { offer: o, w: weighOffer(o) }
  return weighed.w
}
const makeBalance = () => {
  const b = createBalance()
  return { root: b.root, animate() {}, b }
}
const updateBalance = (m, t) => {
  const w = currentWeights()
  m.b.update(t, 1 / 30, w.fair, w.risk, reduceMotion.matches)
}

// ---------- Words ----------

const SECTIONS = [
  ['offer', 'Check an offer', 'प्रस्ताव जाँचें', 'themis'],
  ['message', 'Read a message', 'संदेश पढ़ें', 'whatsapp'],
]
// Old links (#scales/signs, #scales/slip) land on the offer.
const sectionOf = (id) => (id === 'message' ? 'message' : 'offer')

const UNITS = [['day', 'day', 'दिन'], ['shift', 'shift', 'पाली'], ['job', 'job', 'काम'], ['month', 'month', 'महीना']]
const UNIT = Object.fromEntries(UNITS.map(([id, en, hi]) => [id, [en, hi]]))
const PAYDAYS = [['daily', 'Daily', 'रोज़'], ['weekly', 'Weekly', 'हफ़्ते में'], ['monthly', 'Monthly', 'महीने में'], ['end', 'At the end', 'अंत में'], ['unknown', 'Don’t know', 'पता नहीं']]
const YES_NO = [['yes', 'Yes', 'हाँ'], ['no', 'No', 'नहीं'], ['unknown', 'Don’t know', 'पता नहीं']]
const CHECKS = [
  ['address', 'pin', 'Site address', 'काम का पता'],
  ['written', 'doc', 'In writing', 'लिखित में'],
  ['verified', 'shield', 'Employer known', 'नियोक्ता जाना-पहचाना'],
]
const PRESET_TONE = { fair: 'var(--ag-good)', doubt: 'var(--ag-mid)', scam: 'var(--ag-bad)' }
const MARK = { good: '✓', mid: '?', bad: '!', invalid: '–' }
const GLYPH = { pay: '₹', hours: '◷', payday: '▦', address: '⌖', written: '✎', verified: '◉', fee: '⊘' }
const BANDS = [
  ['wellBelow', 0, 0.75, 'Well below', 'बहुत कम'],
  ['below', 0.75, 0.9, 'Below', 'कम'],
  ['near', 0.9, 1.1, 'Near', 'बराबर'],
  ['above', 1.1, 2, 'Above', 'ज़्यादा'],
  ['wellAbove', 2, 2.4, 'Far above', 'बहुत ज़्यादा'],
]
const SPAN = 2.4
const SAMPLE_LABEL = { Suspicious: ['Suspicious', 'संदिग्ध'], Ordinary: ['Ordinary', 'सामान्य'], Overseas: ['Overseas', 'विदेश'] }
// The four signs that matter most, as an icon strip under the reader.
const TOP_SIGNS = ['fee', 'otp', 'documents', 'overseas'].map((id) => ({ id, ...RED_FLAGS[id] }))

function Label({ icon, children, htmlFor, id }) {
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <Tag className="sc-label" htmlFor={htmlFor} id={id}>
      <Icon name={icon} />
      {children}
    </Tag>
  )
}

// Pay against the sample daily rate for the trade, as a single bar.
function Benchmark({ offer }) {
  const say = useSay()
  const ref = LOCAL_RATE[offer.trade] ?? 800
  const pay = numeric(offer.pay, 0.01, 10000000)
  const daily = offer.unit === 'day' && pay !== null
  const band = daily ? BANDS.find((b) => b[0] === payBand(pay, ref)) : null
  return (
    <div className="sc-bench">
      <p className="sc-bench-line">
        <span>{say('Sample rate', 'नमूना दर')}</span>
        <b>{money(ref)}</b> / {say('day', 'दिन')}
        {band && <em className={`sc-band ${band[0]}`}>{say(band[3], band[4])}</em>}
      </p>
      {daily && (
        <div className="sc-gauge" role="img" aria-label={`${money(pay)} · ${say(band[3], band[4])}`}>
          <div className="sc-gauge-bar" aria-hidden="true">
            {BANDS.map(([id, a, z]) => <i key={id} className={id} style={{ flexGrow: z - a }} />)}
          </div>
          <span className="sc-gauge-ref" style={{ left: `${(1 / SPAN) * 100}%` }} aria-hidden="true" />
          <span className="sc-gauge-mark" style={{ left: `${(Math.min(pay / ref, SPAN) / SPAN) * 100}%` }} aria-hidden="true" />
        </div>
      )}
      <p className="sc-small">{say('Sample benchmark, not a legal minimum wage.', 'नमूना दर, कानूनी न्यूनतम मज़दूरी नहीं।')}</p>
    </div>
  )
}

// ---------- 1 · Check an offer ----------

function OfferPanel({ state, set, undo, setUndo, job }) {
  const say = useSay()
  const { t, lang } = useI18n()
  const o = state.offer
  const res = weighOffer(o)
  const tone = res.verdict.tone
  const verdictRef = useRef()
  const lastKnown = useRef({ hours: o.hours, fee: o.fee })
  useEffect(() => {
    if (o.hours !== null) lastKnown.current.hours = o.hours
    if (o.fee !== null) lastKnown.current.fee = o.fee
  }, [o.hours, o.fee])

  // The same writes as the compact tool: strings or null, 'yes' | 'no' | 'unknown'.
  const edit = (key, value) => set((s) => ({ ...s, preset: null, offer: { ...s.offer, [key]: value } }))
  const loadPreset = (k) => {
    setUndo(state)
    set({ offer: PRESETS[k], source: null, preset: k })
  }
  const stepHours = (d) => edit('hours', String(Math.min(24, Math.max(1, (numeric(o.hours, 1, 24) ?? 0) + d))))
  const fair = res.tokens.filter((x) => x.side === 'fair')
  const risk = res.tokens.filter((x) => x.side === 'risk').sort((a, b) => b.w - a.w)
  const token = (x) => <Flag key={x.id} flag={{ en: x.label, hi: x.hi, icon: GLYPH[x.id] ?? '·' }} tone={x.side === 'fair' ? 'good' : x.w >= 5 ? 'hard' : x.w === 0 ? 'info' : 'warn'} />
  const word = lang === 'hi' ? res.verdict.hi : res.verdict.word
  const speech = () => {
    const hi = lang === 'hi'
    const pick = (x) => (hi ? x.hi : x.label)
    return [[[
      word,
      fair.length ? `${hi ? 'आपके पक्ष में' : 'Weighs for you'}: ${fair.map(pick).join(' ')}` : '',
      risk.length ? `${hi ? 'आपके ख़िलाफ़' : 'Weighs against'}: ${risk.map(pick).join(' ')}` : '',
      hi ? res.verdict.lineHi : res.verdict.line,
    ].filter(Boolean).join(' '), hi ? 'hi-IN' : 'en-IN']]
  }
  const showVerdict = () => {
    verdictRef.current?.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' })
    verdictRef.current?.focus({ preventScroll: true })
  }

  // The listing this what-if started from, if any.
  const fromJob = job ? offerFromJob(job) : null
  const norm = (x) => (x === null || x === undefined ? null : String(x))
  const edited = fromJob && Object.keys(fromJob).some((k) => norm(o[k]) !== norm(fromJob[k]))
  const payday = ['daily', 'weekly', 'monthly'].includes(o.payday) ? o.payday : ['end', 'completion'].includes(o.payday) ? 'end' : 'unknown'

  return (
    <div className="ag-grid sc-offer">
      <div className="ag-col-7 ag-stack-lg sc-offer-form">
        {job && (
          <article className="ag-tablet sc-source" style={{ '--c': tradeOf(job.trade).color }} aria-labelledby="sc-source-h">
            <div className="sc-source-row">
              <h3 id="sc-source-h" className="ag-h">{lang === 'hi' ? job.titleHi : job.title}</h3>
              <Seal tone={assessJob(job).tone} large />
            </div>
            <p className="sc-source-pay">{money(job.pay)}<small> / {say(...(UNIT[job.unit] ?? UNIT.day))}</small></p>
            <p className="sc-small">{say('A local what-if. The listing is unchanged.', 'स्थानीय अनुमान। असली विज्ञापन नहीं बदलता।')}</p>
            <div className="sc-row">
              <a className="ag-btn ag-btn-plain" href="#map"><Icon name="back" />{say('Back to the job', 'काम पर लौटें')}</a>
              {edited && <button type="button" className="ag-btn ag-btn-tinted" onClick={() => set({ offer: fromJob, source: job.id, preset: null })}>{say('Reset', 'वापस करें')}</button>}
            </div>
          </article>
        )}

        <div className="ag-chips sc-samples" role="group" aria-label={t('sampleOffers')}>
          {Object.keys(PRESETS).map((k) => (
            <button key={k} type="button" className="ag-chip" aria-pressed={state.preset === k} onClick={() => loadPreset(k)} style={{ '--c': PRESET_TONE[k] }}>
              <span className="dot" />{t(k)}
            </button>
          ))}
          {undo && (
            <button type="button" className="ag-chip" onClick={() => { set(undo); setUndo(null) }}>
              <Icon name="back" size={18} />{say('Restore my offer', 'मेरा प्रस्ताव वापस')}
            </button>
          )}
        </div>

        <section className="ag-tablet ag-stack-lg sc-form" aria-label={say('Terms', 'शर्तें')}>
          <fieldset className="sc-fieldset">
            <legend><Label icon="tools">{say('Trade', 'काम')}</Label></legend>
            <div className="sc-trades">
              {TRADES.map((tr) => (
                <button key={tr.id} type="button" className="sc-trade" aria-pressed={o.trade === tr.id} onClick={() => edit('trade', tr.id)} style={{ '--c': tr.color }}>
                  <span className="sc-trade-glyph" aria-hidden="true">{tr.glyph}</span>
                  {say(tr.label, tr.hi)}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="sc-field">
            <Label icon="rupee" htmlFor="sc-pay">{say('Pay', 'मज़दूरी')}</Label>
            <div className="sc-money">
              <span aria-hidden="true">₹</span>
              <input id="sc-pay" className="ag-input sc-big" type="number" inputMode="decimal" min="1" max="10000000" step="any" value={o.pay ?? ''} aria-invalid={!!res.errors.pay} aria-describedby={res.errors.pay ? 'sc-pay-error' : undefined} onChange={(e) => edit('pay', e.target.value)} />
            </div>
            {res.errors.pay && <p id="sc-pay-error" className="sc-field-error">{t(res.errors.pay)}</p>}
            <div className="ag-seg ag-seg-wide sc-seg-lg" role="group" aria-label={say('Pay per', 'मज़दूरी प्रति')}>
              {UNITS.map(([id, en, hi]) => (
                <button key={id} type="button" aria-pressed={o.unit === id} onClick={() => edit('unit', id)}>{say(`/ ${en}`, `/ ${hi}`)}</button>
              ))}
            </div>
          </div>

          <div className="sc-pair">
            <div className="sc-field">
              <Label icon="clock" htmlFor="sc-hours">{say('Hours a day', 'रोज़ घंटे')}</Label>
              <div className="sc-stepper">
                <button type="button" className="ag-btn ag-btn-plain" aria-label={say('One hour less', 'एक घंटा कम')} disabled={numeric(o.hours, 1, 24) === 1} onClick={() => stepHours(-1)}><Icon name="minus" /></button>
                <input id="sc-hours" className="ag-input sc-big" type="number" inputMode="numeric" min="1" max="24" step="1" value={o.hours ?? ''} placeholder="?" aria-invalid={!!res.errors.hours} aria-describedby={res.errors.hours ? 'sc-hours-error' : undefined} onChange={(e) => edit('hours', e.target.value)} />
                <button type="button" className="ag-btn ag-btn-plain" aria-label={say('One hour more', 'एक घंटा ज़्यादा')} disabled={numeric(o.hours, 1, 24) === 24} onClick={() => stepHours(1)}><Icon name="plus" /></button>
              </div>
              {res.errors.hours && <p id="sc-hours-error" className="sc-field-error">{t(res.errors.hours)}</p>}
              <label className="ag-switch sc-unknown">
                <span>{say('Unknown', 'पता नहीं')}</span>
                <input type="checkbox" checked={o.hours === null} onChange={(e) => edit('hours', e.target.checked ? null : lastKnown.current.hours ?? '')} />
              </label>
            </div>

            <div className="sc-field">
              <Label icon="fee" htmlFor="sc-fee">{say('Fee asked of you', 'आपसे माँगी फ़ीस')}</Label>
              <div className="sc-money">
                <span aria-hidden="true">₹</span>
                <input id="sc-fee" className="ag-input sc-big" type="number" inputMode="decimal" min="0" max="10000000" step="any" value={o.fee ?? ''} placeholder="?" aria-invalid={!!res.errors.fee || Number(o.fee) > 0} aria-describedby={res.errors.fee ? 'sc-fee-error' : undefined} onChange={(e) => edit('fee', e.target.value)} />
              </div>
              {res.errors.fee && <p id="sc-fee-error" className="sc-field-error">{t(res.errors.fee)}</p>}
              <label className="ag-switch sc-unknown">
                <span>{say('Unknown', 'पता नहीं')}</span>
                <input type="checkbox" checked={o.fee === null} onChange={(e) => edit('fee', e.target.checked ? null : lastKnown.current.fee ?? '')} />
              </label>
            </div>
          </div>

          <fieldset className="sc-fieldset">
            <legend><Label icon="calendar">{say('Payday', 'भुगतान कब')}</Label></legend>
            <div className="ag-chips">
              {PAYDAYS.map(([id, en, hi]) => (
                <button key={id} type="button" className="ag-chip" aria-pressed={payday === id} onClick={() => edit('payday', id)}>{say(en, hi)}</button>
              ))}
            </div>
          </fieldset>

          {CHECKS.map(([key, icon, en, hi]) => {
            const v = o[key] === true ? 'yes' : o[key] === false ? 'no' : o[key] ?? 'unknown'
            return (
              <div key={key} className="sc-field sc-check" role="group" aria-labelledby={`sc-${key}-label`}>
                <Label icon={icon} id={`sc-${key}-label`}>{say(en, hi)}</Label>
                <div className="ag-seg ag-seg-wide sc-seg-lg">
                  {YES_NO.map(([id, yen, yhi]) => (
                    <button key={id} type="button" aria-pressed={v === id} onClick={() => edit(key, id)}>{say(yen, yhi)}</button>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        <button type="button" className={`sc-mini tone-${tone}`} onClick={showVerdict}>
          <span className="sc-mini-mark" aria-hidden="true">{MARK[tone]}</span>
          <strong>{word}</strong>
          <span className="sc-mini-why" aria-hidden="true">↓</span>
        </button>
      </div>

      <div className="ag-col-5 sc-verdict-col">
        <section ref={verdictRef} tabIndex={-1} className={`ag-tablet ag-stack-lg sc-verdict tone-${tone}`} aria-labelledby="sc-verdict-word">
          <div className="sc-verdict-head" role="status" aria-live="polite">
            <span className="sc-medal" aria-hidden="true">{MARK[tone]}</span>
            <strong id="sc-verdict-word" className="sc-verdict-word">{word}</strong>
          </div>
          <div className="sc-weighs">
            <div>
              <h3 className="sc-weigh-h good">{say('Weighs for you', 'आपके पक्ष में')}</h3>
              {fair.length ? fair.map(token) : <p className="sc-small">—</p>}
            </div>
            <div>
              <h3 className="sc-weigh-h bad">{say('Weighs against', 'आपके ख़िलाफ़')}</h3>
              {risk.length ? risk.map(token) : <p className="sc-small">—</p>}
            </div>
          </div>
          <Benchmark offer={o} />
          <p className="sc-honest">{lang === 'hi' ? res.verdict.lineHi : res.verdict.line}</p>
          <Listen key={lang} className="ag-btn ag-btn-tinted" lines={speech} label={say('Listen', 'सुनें')} />
        </section>
      </div>
    </div>
  )
}

// ---------- 2 · Read a job message ----------

function MessagePanel({ text, setText, onScales }) {
  const say = useSay()
  const { lang } = useI18n()
  const scan = useMemo(() => scanMessage(text), [text])
  const none = scan.tone === 'none'
  const missing = say('Not found', 'नहीं मिला')
  const feeAsked = scan.flags.some((f) => f.id === 'fee')
  const speech = () => {
    const hi = lang === 'hi'
    const seal = SEALS[scan.tone]
    return [[[seal ? (hi ? seal.hi : seal.en) : '', ...scan.flags.map((f) => (hi ? `${f.hi}। ${f.whyHi}` : `${f.en}. ${f.why}`))].filter(Boolean).join(' '), hi ? 'hi-IN' : 'en-IN']]
  }
  return (
    <div className="ag-grid">
      <div className="ag-col-7 ag-stack-lg">
        <div className="ag-tablet ag-stack-lg">
          <label className="ag-field">
            <Label icon="whatsapp">{say('Paste the message', 'संदेश डालें')}</Label>
            <textarea className="sc-msg" rows={7} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} placeholder={say('WhatsApp, SMS or poster text', 'व्हाट्सऐप, एसएमएस या पोस्टर का संदेश')} />
          </label>
          <div className="ag-chips" role="group" aria-label={say('Sample messages', 'नमूना संदेश')}>
            {SAMPLE_MESSAGES.map(([sample, label]) => (
              <button key={label} type="button" className="ag-chip" aria-pressed={text === sample} onClick={() => setText(sample)}>
                <Icon name="whatsapp" size={18} />{say(...(SAMPLE_LABEL[label] ?? [label, label]))}
              </button>
            ))}
            {text && <button type="button" className="ag-chip" onClick={() => setText('')}><Icon name="close" size={18} />{say('Clear', 'साफ़')}</button>}
          </div>
          <p className="sc-private"><Icon name="eye" size={20} />{say('Read on this device only. Not saved or sent.', 'सिर्फ़ इसी डिवाइस पर पढ़ा जाता है। न सहेजा, न भेजा।')}</p>
        </div>

        <ul className="sc-strip" aria-label={say('Never do these', 'ये कभी न करें')}>
          {TOP_SIGNS.map((f) => (
            <li key={f.id}>
              <span className="sc-strip-icon" aria-hidden="true">{f.icon}</span>
              <span>{say(f.en, f.hi)}</span>
            </li>
          ))}
          <li className="sc-strip-call">
            <a href="tel:1930"><span className="sc-strip-icon" aria-hidden="true"><Icon name="phone" /></span><span>{say('Money lost? Call 1930', 'पैसे गए? 1930')}</span></a>
          </li>
        </ul>
      </div>

      <div className="ag-col-5">
        <section className={`ag-tablet ag-stack-lg sc-scan tone-${scan.tone}`} aria-label={say('What Themis read', 'थीमिस ने क्या पढ़ा')}>
          <div className="sc-scan-head" role="status" aria-live="polite">
            {none ? (
              <p className="sc-empty">{say('Paste a message to read it.', 'पढ़ने के लिए संदेश डालें।')}</p>
            ) : (
              <>
                <span className="sc-medal sm" aria-hidden="true">{MARK[scan.tone]}</span>
                <strong className="sc-verdict-word">{say(SEALS[scan.tone].en, SEALS[scan.tone].hi)}</strong>
              </>
            )}
          </div>
          {!none && (
            <>
              <dl className="ag-terms sc-terms">
                <Term icon="rupee" label={say('Pay', 'मज़दूरी')} value={scan.pay !== null ? `${money(scan.pay)}${scan.unit ? ` / ${say(...UNIT[scan.unit])}` : ''}` : missing} state={scan.pay === null ? 'unknown' : ''} />
                <Term icon="fee" label={say('Fee', 'फ़ीस')} value={scan.fee !== null ? (scan.fee > 0 ? money(scan.fee) : say('None', 'कोई नहीं')) : feeAsked ? say('Asked', 'माँगी') : missing} state={scan.fee > 0 || feeAsked ? 'bad' : scan.fee === null ? 'unknown' : ''} />
                <Term icon="clock" label={say('Hours', 'घंटे')} value={scan.hours !== null ? `${scan.hours} ${say('hrs', 'घंटे')}` : missing} state={scan.hours === null ? 'unknown' : scan.hours >= 11 ? 'bad' : ''} />
                <Term icon="phone" label={say('Phone', 'फ़ोन')} value={scan.phone ?? missing} state={scan.phone ? '' : 'unknown'} />
                <Term icon="pin" label={say('Address', 'पता')} value={scan.hasAddress ? say('Given', 'दिया') : missing} state={scan.hasAddress ? '' : 'unknown'} />
              </dl>
              {!!scan.flags.length && <div>{scan.flags.map((f) => <Flag key={f.id} flag={{ ...f, why: null }} />)}</div>}
              <Listen key={lang} className="ag-btn ag-btn-tinted" lines={speech} label={say('Listen', 'सुनें')} />
            </>
          )}
          <button type="button" className="ag-btn ag-btn-dark ag-btn-block sc-cta" disabled={none} onClick={() => onScales(scan)}><Icon name="themis" />{say('Put it on the scales', 'तराज़ू पर रखें')}</button>
        </section>
      </div>
    </div>
  )
}

// ---------- The page ----------

export default function Scales({ section }) {
  const say = useSay()
  const { lang } = useI18n()
  const [state, set] = useStore(offerStore)
  useStore(marketplace)
  const [active, setActive] = useState(() => sectionOf(section))
  const [undo, setUndo] = useState(null)
  const [message, setMessage] = useState('')
  const title = useRef()
  const job = state.source ? allJobs().find((j) => j.id === state.source) ?? null : null
  const hi = lang === 'hi'

  // A listing sent here ("Weigh it on the scales") opens the offer; retired sections fold into it.
  useEffect(() => {
    setActive(sectionOf(section))
    if (section && section !== sectionOf(section)) history.replaceState(null, '', '#scales/offer')
  }, [section])

  const go = (id, focus = false) => {
    const next = sectionOf(id)
    setActive(next)
    history.replaceState(null, '', `#scales/${next}`)
    requestAnimationFrame(() => {
      const el = title.current
      if (!el) return
      if (focus || el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' })
      if (focus) el.focus({ preventScroll: true })
    })
  }

  // A forwarded message becomes an offer: only what it says, the rest unknown.
  const toScales = (scan) => {
    setUndo(state)
    set((s) => ({
      offer: {
        ...s.offer,
        pay: scan.pay === null ? '' : String(scan.pay),
        unit: ['day', 'month', 'shift'].includes(scan.unit) ? scan.unit : 'day',
        hours: scan.hours === null ? null : String(scan.hours),
        fee: scan.fee === null ? null : String(scan.fee),
        address: scan.hasAddress ? 'yes' : 'unknown',
        payday: 'unknown',
        written: 'unknown',
        verified: 'unknown',
      },
      source: null,
      preset: null,
    }))
    go('offer', true)
    toast(say('On the scales. Fill the gaps.', 'तराज़ू पर रखा। बाकी भरें।'))
  }

  const intro = say(
    'Enter the terms you were told. The scales tip towards you or against you. Or paste a job message to read it.',
    'जो शर्तें बताई गईं, भरें। तराज़ू आपके पक्ष या ख़िलाफ़ झुकेगा। या नौकरी का संदेश डालकर पढ़ें।',
  )

  return (
    <div className="sc-page">
      <header className="ag-hero ag-no-print">
        <div>
          <p className="ag-kicker"><span className="ag-numeral">Γ</span>Themis</p>
          <h1 className="ag-title">{say('The terms,', 'पहले शर्तें,')} <em>{say('before the work.', 'फिर काम।')}</em></h1>
          <p className="ag-lede">{say('Weigh an offer before you say yes.', 'हाँ कहने से पहले प्रस्ताव तौलें।')}</p>
          <p className="ag-lede-hi" lang={hi ? 'en' : 'hi'}>{say('हाँ कहने से पहले प्रस्ताव तौलें।', 'Weigh an offer before you say yes.')}</p>
          <div className="ag-hero-actions">
            <Listen key={lang} className="ag-btn ag-btn-tinted" label={say('Listen', 'सुनें')} lines={[[intro, hi ? 'hi-IN' : 'en-IN']]} />
          </div>
        </div>
        <Hero3D make={makeBalance} update={updateBalance} height={2.6} camera={[0, 1.7, 6.2]} target={[0, 1.25, 0]} label={say('Gold for you · red against', 'सुनहरा आपके पक्ष में · लाल ख़िलाफ़')} fallback="/art/gods/themis.jpg" />
      </header>

      <SectionNav value={active} onChange={(id) => go(id)} label={say('Check an offer', 'प्रस्ताव जाँचें')} items={SECTIONS.map(([id, en, h, icon]) => [id, say(en, h), icon])} />

      <section className="sc-panel" aria-labelledby="sc-panel-title">
        <h2 id="sc-panel-title" ref={title} tabIndex={-1} className="sc-panel-title">{say(...SECTIONS.find((s) => s[0] === active).slice(1, 3))}</h2>
        {active === 'offer'
          ? <OfferPanel state={state} set={set} undo={undo} setUndo={setUndo} job={job} />
          : <MessagePanel text={message} setText={setMessage} onScales={toScales} />}
      </section>
    </div>
  )
}
