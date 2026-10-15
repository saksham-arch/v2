// Α · Hermes — find work. A rail of readable listings beside the 3D city.
// Every listing carries Themis' seal, plain pictogram terms, the questions
// to ask and honest local actions (save, hold, request, share, report).
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useStore, createLocalStore, isObject } from '../../domain/storage.js'
import { jobStore, selectJobs, activeHold, makeHold, setInterest, dateLabel, distanceKm } from '../../domain/jobs.js'
import { marketplace, allJobs } from '../../domain/marketplace.js'
import { checkJob } from '../../domain/offers.js'
import { assessJob } from '../../domain/trust.js'
import { TRADES, DEMO_ORIGIN, DEMO_DATE, money, tradeOf } from '../../hermes/jobs.js'
import { NAKAS, nearestNaka, jobsAtNaka } from '../../hermes/nakas.js'
import { PLACES } from '../../agora/places.js'
import { useI18n } from '../../i18n/index.jsx'
import SceneBoundary from '../../ui/SceneBoundary.jsx'
import Listen from '../../ui/Listen.jsx'
import Icon from '../icons.jsx'
import { Seal, Term, Flag, Sheet, ShareRow, toast, useSay } from '../ui.jsx'
import './work.css'

const MapView = lazy(() => import('../../agora/MapView.jsx'))

const REASONS = [
  ['fee', 'Asked me for money', 'मुझसे पैसे माँगे'],
  ['fake', 'The work did not exist', 'काम था ही नहीं'],
  ['unpaid', 'I was not paid', 'मज़दूरी नहीं मिली'],
  ['different', 'Terms were different', 'शर्तें अलग थीं'],
  ['unsafe', 'Unsafe or abusive', 'असुरक्षित या दुर्व्यवहार'],
]
export const reportStore = createLocalStore('reports', { reports: {} }, (x) => isObject(x) && isObject(x.reports))

const UNIT = { day: ['day', 'दिन'], shift: ['shift', 'पाली'], job: ['whole job', 'पूरा काम'], month: ['month', 'महीना'] }
const PAYDAY = { daily: ['End of each day', 'हर दिन के अंत में'], weekly: ['Every week', 'हर हफ़्ते'], completion: ['When the job is done', 'काम पूरा होने पर'], monthly: ['Every month', 'हर महीने'], end: ['At the end', 'अंत में'] }
const EMPLOYER_TYPE = { contractor: ['Contractor', 'ठेकेदार'], household: ['Household', 'घर'], business: ['Business', 'व्यापार'], public: ['Public works', 'सरकारी काम'], unknown: ['Unknown recruiter', 'अनजान भर्तीकर्ता'] }

function useNow(active) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [active])
  return now
}

export function JobRow({ job, onOpen, interested, held, reported }) {
  const say = useSay()
  const { lang } = useI18n()
  const trade = tradeOf(job.trade)
  const a = assessJob(job)
  return (
    <button type="button" id={`job-${job.id}`} className={`ag-job-row tone-${a.tone}`} onClick={() => onOpen(job.id)} style={{ '--c': trade.color }}>
      <span className="ag-job-trade" aria-hidden="true">{trade.glyph}</span>
      <span className="ag-job-main">
        <span className="ag-job-top">
          <span className="ag-job-pay">{money(job.pay)}<small> / {say(...UNIT[job.unit])}</small></span>
          <Seal tone={a.tone} short />
        </span>
        <strong>{lang === 'hi' ? job.titleHi : job.title}</strong>
        <span className="ag-job-meta">
          <span><Icon name={job.shift === 'night' ? 'moon' : 'sun'} size={14} />{lang === 'hi' ? job.hoursHi : job.hours}</span>
          <span><Icon name="calendar" size={14} />{job.startDate === DEMO_DATE ? say('Today', 'आज') : dateLabel(job.startDate, lang)}</span>
          {Number.isFinite(job.dist) && <span><Icon name="pin" size={14} />{job.dist.toFixed(1)} km</span>}
        </span>
        {(interested || held || reported) && (
          <span className="ag-job-state">
            {held && <em>{say('Held', 'होल्ड')}</em>}
            {interested && <em>{say('Saved', 'सहेजा')}</em>}
            {reported && <em className="bad">{say('You reported this', 'आपने रिपोर्ट किया')}</em>}
          </span>
        )}
      </span>
    </button>
  )
}

export function JobTerms({ job, origin }) {
  const say = useSay()
  const { lang } = useI18n()
  const dur = job.durationDays === null ? say('Ongoing', 'लगातार') : job.durationDays < 1 ? say('Half day', 'आधा दिन') : `${job.durationDays} ${say(job.durationDays === 1 ? 'day' : 'days', 'दिन')}`
  const unknown = say('Not stated — ask', 'नहीं बताया — पूछें')
  return (
    <dl className="ag-terms">
      <Term icon="rupee" label={say('Pay', 'मज़दूरी')} value={`${money(job.pay)} / ${say(...UNIT[job.unit])}`} />
      <Term icon="calendar" label={say('Starts', 'शुरू')} value={job.startDate === DEMO_DATE ? say('Today', 'आज') : dateLabel(job.startDate, lang)} />
      <Term icon={job.shift === 'night' ? 'moon' : 'clock'} label={say('Hours', 'समय')} value={lang === 'hi' ? job.hoursHi : job.hours} state={job.hoursCount >= 11 ? 'bad' : ''} />
      <Term icon="steps" label={say('How long', 'कितने दिन')} value={dur} />
      <Term icon="coin" label={say('Payday', 'भुगतान')} value={job.payday ? say(...PAYDAY[job.payday]) : unknown} state={job.payday ? '' : 'unknown'} />
      <Term icon="fee" label={say('Fee to start', 'शुरू की फ़ीस')} value={job.fee === null ? unknown : job.fee === 0 ? say('None', 'कोई नहीं') : money(job.fee)} state={job.fee > 0 ? 'bad' : job.fee === null ? 'unknown' : ''} />
      <Term icon="doc" label={say('Written terms', 'लिखित शर्तें')} value={job.written === true ? say('Yes', 'हाँ') : job.written === false ? say('No', 'नहीं') : unknown} state={job.written === true ? '' : job.written === false ? 'bad' : 'unknown'} />
      <Term icon="pin" label={say('Distance', 'दूरी')} value={`${distanceKm(origin, job.lngLat).toFixed(1)} km ${say('straight line', 'सीधी रेखा')}`} />
      <Term icon="people" label={say('Workers needed', 'कितने लोग')} value={job.vacancies ?? 1} />
      <Term icon="food" label={say('Food', 'खाना')} value={job.meals ? say('Provided', 'मिलेगा') : say('Not mentioned', 'नहीं बताया')} />
      <Term icon="bus" label={say('Transport', 'आना-जाना')} value={job.transport ? say('Pick-up offered', 'गाड़ी मिलेगी') : say('Own way', 'खुद से')} />
    </dl>
  )
}

export function jobSpeech(job, lang) {
  const a = assessJob(job)
  const hi = lang === 'hi'
  const pay = `${job.pay} ${hi ? 'रुपये' : 'rupees'} ${hi ? 'प्रति' : 'per'} ${UNIT[job.unit][hi ? 1 : 0]}`
  const seal = { good: ['Terms are clear.', 'शर्तें साफ़ हैं।'], mid: ['Ask questions first.', 'पहले सवाल पूछें।'], bad: ['Warning.', 'चेतावनी।'] }[a.tone][hi ? 1 : 0]
  const flags = a.flags.map((f) => (hi ? f.hi : f.en)).join('. ')
  return [[hi ? `${job.titleHi}। ${pay}। ${job.hoursHi}। ${job.placeHi}। ${seal} ${flags}` : `${job.title}. ${pay}. ${job.hours}. ${job.place}. ${seal} ${flags}`, hi ? 'hi-IN' : 'en-IN']]
}

export function jobShareText(job, lang) {
  const hi = lang === 'hi'
  const a = assessJob(job)
  return [
    hi ? job.titleHi : job.title,
    `${money(job.pay)} / ${UNIT[job.unit][hi ? 1 : 0]} · ${hi ? job.hoursHi : job.hours}`,
    `${hi ? 'जगह' : 'Where'}: ${hi ? job.placeHi : job.place}`,
    `${hi ? 'शुरू' : 'Starts'}: ${job.startDate}`,
    `${hi ? 'जाँच' : 'Ergon check'}: ${{ good: hi ? 'साफ़ शर्तें' : 'Clear terms', mid: hi ? 'पहले पूछें' : 'Ask first', bad: hi ? 'चेतावनी' : 'Warning' }[a.tone]}`,
    hi ? '(एर्गोन पर नमूना काम)' : '(Sample listing on Ergon)',
  ].join('\n')
}

function JobDetail({ job, state, set, hold, now, onBack, titleRef }) {
  const say = useSay()
  const { lang } = useI18n()
  const [reports] = useStore(reportStore)
  const [reporting, setReporting] = useState(false)
  const [asking, setAsking] = useState(false)
  const a = assessJob(job)
  const trade = tradeOf(job.trade)
  const naka = nearestNaka(job.lngLat)
  const interested = !!state.interest[job.id]
  const heldHere = hold?.id === job.id
  const reported = reports.reports[job.id]
  const questions = a.questions.map((q) => say(q[0], q[1]))
  const questionText = `${say('Before I come for', 'आने से पहले')} “${lang === 'hi' ? job.titleHi : job.title}”:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
  return (
    <article className="ag-job-detail" aria-labelledby="job-title">
      <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={onBack}><Icon name="back" />{say('All work', 'सारा काम')}</button>
      <div className="ag-job-detail-head" style={{ '--c': trade.color }}>
        <p className="ag-kicker"><span className="ag-job-trade" aria-hidden="true">{trade.glyph}</span>{say(trade.label, trade.hi)} · {say(...(EMPLOYER_TYPE[job.employerType] ?? EMPLOYER_TYPE.unknown))}</p>
        <h2 id="job-title" className="ag-h ag-h-serif" tabIndex={-1} ref={titleRef}>{lang === 'hi' ? job.titleHi : job.title}</h2>
        <p className="ag-muted">{job.employer}{job.sector === 'government' ? ` · ${say('Government work', 'सरकारी काम')}` : ''}</p>
        <p className="ag-big-pay">{money(job.pay)}<small> / {say(...UNIT[job.unit])}</small></p>
        <Seal tone={a.tone} large />
      </div>

      <JobTerms job={job} origin={state.origin} />
      <p className="ag-job-where"><Icon name="pin" size={16} />{lang === 'hi' ? job.placeHi : job.place}</p>
      <p className="ag-job-where"><Icon name="tools" size={16} />{lang === 'hi' ? job.bringHi : job.bring}</p>

      {!!a.flags.length && (
        <section className="ag-stack">
          <h3 className="ag-h-small">{say('Themis noticed', 'थीमिस ने देखा')}</h3>
          {a.flags.map((f) => <Flag key={f.id} flag={f} />)}
        </section>
      )}
      {!!a.good.length && (
        <div className="ag-chips">
          {a.good.map(([en, hi]) => <span key={en} className="ag-good-chip"><Icon name="check" size={14} />{say(en, hi)}</span>)}
        </div>
      )}

      <section className="ag-stack">
        <div className="ag-split">
          <h3 className="ag-h-small">{say('Ask before you go', 'जाने से पहले पूछें')}</h3>
          <button type="button" className="ag-link" onClick={() => setAsking(true)}>{say('Send these', 'ये भेजें')}</button>
        </div>
        <ol className="ag-questions">{questions.slice(0, 4).map((q) => <li key={q}>{q}</li>)}</ol>
      </section>

      {job.reports && (job.reports.onTime + job.reports.late + job.reports.unpaid > 0) && (
        <p className="ag-note quiet">
          <b>{say('Sample worker reports', 'नमूना कामगार रिपोर्ट')}:</b> {job.reports.onTime} {say('paid on time', 'समय पर भुगतान')} · {job.reports.late} {say('late', 'देर से')}{job.reports.unpaid ? ` · ${job.reports.unpaid} ${say('not paid', 'भुगतान नहीं')}` : ''}
        </p>
      )}

      <div className="ag-job-actions">
        <a className={`ag-btn ${a.tone === 'bad' ? 'ag-btn-plain' : 'ag-btn-primary'} ag-btn-block`} href={`#book-work/${job.id}`}>{say('Request this work', 'इस काम का अनुरोध करें')}</a>
        <button type="button" className="ag-btn ag-btn-dark ag-btn-block" onClick={() => checkJob(job, 'scales')}><Icon name="themis" />{say('Weigh it on the scales', 'तराज़ू पर तौलें')}</button>
        <div className="ag-job-actions-row">
          <button type="button" className="ag-btn ag-btn-plain" aria-pressed={interested} onClick={() => { set((s) => setInterest(s, job.id, !interested)); toast(interested ? say('Removed from saved', 'सहेजे से हटाया') : say('Saved on this device', 'इस डिवाइस पर सहेजा')) }}>
            <Icon name="heart" />{interested ? say('Saved', 'सहेजा') : say('Save', 'सहेजें')}
          </button>
          <button type="button" className="ag-btn ag-btn-plain" aria-pressed={heldHere} onClick={() => set((s) => ({ ...s, hold: heldHere ? null : makeHold(job.id) }))}>
            <Icon name="hold" />{heldHere ? `${Math.max(1, Math.ceil((hold.until - now) / 60000))} ${say('min · release', 'मिनट · छोड़ें')}` : say('Hold 30 min', '30 मिनट रोकें')}
          </button>
          <button type="button" className="ag-btn ag-btn-plain" onClick={() => setReporting(true)}><Icon name="flag" />{reported ? say('Reported', 'रिपोर्ट किया') : say('Report', 'रिपोर्ट')}</button>
        </div>
        <p className="ag-muted">{say('Save and hold stay on this phone. They do not contact the employer or reserve a place.', 'सहेजना और रोकना इसी फ़ोन पर रहता है। इससे नियोक्ता से संपर्क या जगह पक्की नहीं होती।')}</p>
      </div>

      <div className="ag-split ag-job-listen">
        <Listen key={`${job.id}-${lang}`} lines={() => jobSpeech(job, lang)} label={say('Listen to this job', 'यह काम सुनें')} />
        {naka && <a className="ag-link" href={`#naka/${naka.id}`}>{say('Picked up near', 'पास का नाका')}: {lang === 'hi' ? naka.hi : naka.name} →</a>}
      </div>
      <details className="ag-share-details">
        <summary>{say('Share this job with someone', 'यह काम किसी को भेजें')}</summary>
        <ShareRow text={jobShareText(job, lang)} file={`ergon-${job.id}.txt`} />
      </details>

      <Sheet open={asking} onClose={() => setAsking(false)} title={say('Questions for the employer', 'नियोक्ता से सवाल')}>
        <p className="ag-p" style={{ whiteSpace: 'pre-line' }}>{questionText}</p>
        <ShareRow text={questionText} file="ergon-questions.txt" />
      </Sheet>
      <Sheet open={reporting} onClose={() => setReporting(false)} title={say('Report this listing', 'यह विज्ञापन रिपोर्ट करें')}>
        <p className="ag-p">{say('Your report is kept on this device in the demo and marks the listing for you. In a live service it would go to Ergon’s review team.', 'डेमो में आपकी रिपोर्ट इसी डिवाइस पर रहती है और विज्ञापन पर निशान लगाती है। असली सेवा में यह एर्गोन की जाँच टीम को जाती।')}</p>
        <div className="ag-list" style={{ marginTop: 14 }}>
          {REASONS.map(([id, en, hi]) => (
            <button key={id} type="button" className="ag-list-row" onClick={() => {
              reportStore.set((s) => ({ ...s, reports: { ...s.reports, [job.id]: { reason: id, at: Date.now() } } }))
              setReporting(false)
              toast(say('Report noted. Thank you for protecting others.', 'रिपोर्ट दर्ज। दूसरों को बचाने के लिए धन्यवाद।'))
            }}>
              <span className="ag-coin slip"><Icon name="flag" /></span>
              <strong>{say(en, hi)}</strong>
              <Icon name="chevron" className="ag-chev" />
            </button>
          ))}
        </div>
        {reported && <button type="button" className="ag-link" style={{ marginTop: 14 }} onClick={() => { reportStore.set((s) => { const r = { ...s.reports }; delete r[job.id]; return { ...s, reports: r } }); setReporting(false) }}>{say('Withdraw my report', 'मेरी रिपोर्ट वापस लें')}</button>}
        <p className="ag-note" style={{ marginTop: 14 }}>{say('Lost money to a job scam? Call 1930, the national cyber-fraud helpline, as soon as possible.', 'नौकरी की ठगी में पैसे गए? जल्द से जल्द राष्ट्रीय साइबर धोखाधड़ी हेल्पलाइन 1930 पर कॉल करें।')}</p>
      </Sheet>
    </article>
  )
}

function Places({ onPick, picked, origin }) {
  const say = useSay()
  const { lang } = useI18n()
  const jobs = allJobs()
  if (picked) {
    const p = picked
    return (
      <section className="ag-stack">
        <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => onPick(null)}><Icon name="back" />{say('All places', 'सभी स्थान')}</button>
        <p className="ag-kicker">{p.category}</p>
        <h2 className="ag-h ag-h-serif">{lang === 'hi' ? p.hi : p.name}</h2>
        <p className="ag-p">{lang === 'hi' ? p.descriptionHi ?? p.description : p.description}</p>
        <p className="ag-job-where"><Icon name="pin" size={16} />{p.address}</p>
        <p className="ag-muted">{distanceKm(origin, p.lngLat).toFixed(1)} km {say('straight line', 'सीधी रेखा')}{p.demo ? ` · ${say('illustrative place', 'उदाहरण स्थान')}` : ''}</p>
        {p.naka && <a className="ag-btn ag-btn-primary" href={`#naka/${p.naka}`}><Icon name="naka" />{say('Open the naka board', 'नाका बोर्ड खोलें')}</a>}
        {!p.demo && (
          <div className="ag-row-actions">
            <a className="ag-btn ag-btn-primary" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.name}, ${p.address}`)}`} target="_blank" rel="noreferrer"><Icon name="map" />{say('Directions', 'रास्ता')} ↗</a>
            <a className="ag-btn ag-btn-plain" href={p.source} target="_blank" rel="noreferrer">{say('Official page', 'आधिकारिक पेज')} ↗</a>
          </div>
        )}
      </section>
    )
  }
  const groups = [
    ['work', say('Nakas · where hiring happens', 'नाके · जहाँ काम मिलता है'), 'naka'],
    ['craft', say('Registration and training', 'पंजीकरण और प्रशिक्षण'), 'hephaestus'],
    ['rights', say('Labour offices and welfare boards', 'श्रम कार्यालय और कल्याण बोर्ड'), 'athena'],
    ['trust', say('Courts and legal aid', 'न्यायालय और कानूनी सहायता'), 'themis'],
  ]
  return (
    <section className="ag-stack-lg">
      {groups.map(([kind, title, icon]) => (
        <div key={kind}>
          <h3 className="ag-h-small" style={{ marginBottom: 8 }}>{title}</h3>
          <ul className="ag-list">
            {PLACES.filter((p) => p.kind === kind).map((p) => {
              const n = p.naka ? NAKAS.find((x) => x.id === p.naka) : null
              return (
                <li key={p.id}>
                  <button type="button" className="ag-list-row" onClick={() => onPick(p)}>
                    <span className={`ag-coin ${kind === 'work' ? '' : 'slip'}`}><Icon name={icon} /></span>
                    <span>
                      <strong>{lang === 'hi' ? p.hi : p.name}</strong>
                      <small>{n ? `${lang === 'hi' ? n.peakHi : n.peak} · ~${n.waiting} ${say('waiting', 'इंतज़ार में')} · ${jobsAtNaka(n.id, jobs).length} ${say('jobs near', 'पास काम')}` : `${p.area} · ${distanceKm(origin, p.lngLat).toFixed(1)} km`}</small>
                    </span>
                    <Icon name="chevron" className="ag-chev" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default function Work() {
  const say = useSay()
  const { lang } = useI18n()
  const [state, set] = useStore(jobStore)
  useStore(marketplace)
  const [reports] = useStore(reportStore)
  const [panel, setPanel] = useState('jobs')
  const [place, setPlace] = useState(null)
  const [view, setView] = useState(() => (matchMedia('(max-width: 860px)').matches ? 'list' : 'map'))
  const [geo, setGeo] = useState('idle')
  const [mapAttempt, setMapAttempt] = useState(0)
  const [hideWarnings, setHideWarnings] = useState(false)
  const now = useNow(!!state.hold)
  const rail = useRef()
  const title = useRef()
  const lastRow = useRef(null)
  const listScroll = useRef(0)
  const jobs = allJobs()
  const filtered = useMemo(() => selectJobs(state).filter((j) => !hideWarnings || assessJob(j).tone !== 'bad'), [state, hideWarnings, jobs.length])
  const selected = jobs.find((j) => j.id === state.selected)
  const hold = activeHold(state.hold, now)
  const filters = (patch) => set((s) => ({ ...s, ...patch, selected: null }))
  const choose = (id) => {
    setPanel('jobs')
    setPlace(null)
    lastRow.current = id
    listScroll.current = rail.current?.scrollTop ?? 0
    set((s) => ({ ...s, selected: id }))
  }
  const back = () => {
    const id = lastRow.current ?? state.selected
    set((s) => ({ ...s, selected: null }))
    requestAnimationFrame(() => {
      rail.current?.scrollTo({ top: listScroll.current, behavior: 'instant' })
      document.getElementById(`job-${id}`)?.focus({ preventScroll: true })
    })
  }
  useEffect(() => {
    if (state.hold && !activeHold(state.hold, now)) set((s) => ({ ...s, hold: null }))
  }, [now])
  useEffect(() => {
    if (selected) {
      rail.current?.scrollTo({ top: 0 })
      title.current?.focus({ preventScroll: true })
    }
  }, [selected?.id])
  const locate = () => {
    if (geo === 'asking') return
    if (!navigator.geolocation) return setGeo('failed')
    setGeo('asking')
    navigator.geolocation.getCurrentPosition(
      (p) => { filters({ origin: [p.coords.longitude, p.coords.latitude] }); setGeo('idle') },
      (e) => setGeo(e.code === 1 ? 'denied' : 'failed'),
      { timeout: 8000, maximumAge: 60000 },
    )
  }
  const originNaka = NAKAS.find((n) => n.lngLat[0] === state.origin[0] && n.lngLat[1] === state.origin[1])
  const outOfArea = distanceKm(state.origin, DEMO_ORIGIN) > 10
  const counts = useMemo(() => {
    const c = { good: 0, mid: 0, bad: 0 }
    for (const j of filtered) c[assessJob(j).tone]++
    return c
  }, [filtered])

  return (
    <div className={`ag-work view-${view}`}>
      <div className="ag-work-switch ag-seg ag-no-print" role="tablist" aria-label={say('View', 'दृश्य')}>
        <button type="button" role="tab" aria-selected={view === 'list'} onClick={() => setView('list')}><Icon name="list" size={18} />{say('List', 'सूची')}</button>
        <button type="button" role="tab" aria-selected={view === 'map'} onClick={() => setView('map')}><Icon name="map" size={18} />{say('Map', 'नक़्शा')}</button>
      </div>
      <aside ref={rail} className="map-sidebar ag-work-rail" aria-label={say('Work and places', 'काम और स्थान')}>
        <div className="ag-work-head">
          <p className="ag-kicker"><span className="ag-numeral">Α</span>{say('Hermes · the agora', 'हर्मीस · अगोरा')}</p>
          <h1 className="ag-work-title">{say('Work nearby,', 'आस-पास का काम,')} <em>{say('terms first.', 'शर्तें पहले।')}</em></h1>
          <div className="ag-seg ag-seg-wide" role="tablist" aria-label={say('Show', 'दिखाएँ')}>
            <button type="button" role="tab" aria-selected={panel === 'jobs'} onClick={() => { setPanel('jobs'); setPlace(null) }}><Icon name="hermes" size={18} />{say('Jobs', 'काम')}</button>
            <button type="button" role="tab" aria-selected={panel === 'places'} onClick={() => setPanel('places')}><Icon name="naka" size={18} />{say('Nakas & help', 'नाके और मदद')}</button>
          </div>
        </div>

        {panel === 'places' ? (
          <Places origin={state.origin} picked={place} onPick={(p) => { setPlace(p); if (p) setView('map') }} />
        ) : selected ? (
          <JobDetail job={selected} state={state} set={set} hold={hold} now={now} onBack={back} titleRef={title} />
        ) : (
          <>
            <div className="ag-work-filters">
              <div className="ag-chips ag-chips-scroll" role="group" aria-label={say('Trade', 'काम का प्रकार')}>
                <button type="button" className="ag-chip" aria-pressed={state.trade === 'all'} onClick={() => filters({ trade: 'all' })}>{say('All trades', 'सभी')}</button>
                {TRADES.map((t) => (
                  <button key={t.id} type="button" className="ag-chip" aria-pressed={state.trade === t.id} onClick={() => filters({ trade: t.id })} style={{ '--c': t.color }}><span className="dot" />{say(t.label, t.hi)}</button>
                ))}
              </div>
              <div className="ag-seg ag-seg-wide" role="group" aria-label={say('When', 'कब')}>
                {[['all', 'Any time', 'कभी भी'], ['day', 'Today', 'आज'], ['week', 'This week', 'इस हफ़्ते'], ['long', 'Longer', 'लंबा काम']].map(([id, en, hi]) => (
                  <button key={id} type="button" aria-pressed={state.when === id} onClick={() => filters({ when: id })}>{say(en, hi)}</button>
                ))}
              </div>
              <div className="ag-work-filter-row">
                <div className="ag-seg" role="group" aria-label={say('Distance', 'दूरी')}>
                  {[2, 4, 7].map((k) => <button key={k} type="button" aria-pressed={state.km === k} onClick={() => filters({ km: k })}>{k} km</button>)}
                </div>
                <div className="ag-seg" role="group" aria-label={say('Work source', 'काम का स्रोत')}>
                  {[['all', 'All', 'सभी'], ['private', 'Private', 'निजी'], ['government', 'Public', 'सरकारी']].map(([id, en, hi]) => (
                    <button key={id} type="button" aria-pressed={(state.sector ?? 'all') === id} onClick={() => filters({ sector: id })}>{say(en, hi)}</button>
                  ))}
                </div>
              </div>
              <label className="ag-field">
                <span>{say('Count distance from', 'दूरी कहाँ से')}</span>
                <select value={originNaka?.id ?? (outOfArea ? 'me' : distanceKm(state.origin, DEMO_ORIGIN) < 0.01 ? 'demo' : 'me')} onChange={(e) => {
                  const v = e.target.value
                  if (v === 'demo') filters({ origin: DEMO_ORIGIN })
                  else if (v === 'me') locate()
                  else filters({ origin: [...NAKAS.find((n) => n.id === v).lngLat] })
                }}>
                  <option value="demo">{say('Demo point · Andheri East', 'डेमो स्थान · अंधेरी पूर्व')}</option>
                  {NAKAS.map((n) => <option key={n.id} value={n.id}>{say('My naka', 'मेरा नाका')}: {lang === 'hi' ? n.hi : n.name}</option>)}
                  <option value="me">{geo === 'asking' ? say('Finding you…', 'आपको ढूँढ रहे…') : say('My current location', 'मेरी अभी की जगह')}</option>
                </select>
              </label>
              <label className="ag-switch">
                <span>{say('Hide listings with warnings', 'चेतावनी वाले विज्ञापन छिपाएँ')}</span>
                <input type="checkbox" checked={hideWarnings} onChange={(e) => setHideWarnings(e.target.checked)} />
              </label>
              {['denied', 'failed'].includes(geo) && <p className="ag-note" role="status">{say('Location is unavailable. Choose your naka instead — distances are counted from there.', 'जगह नहीं मिली। अपना नाका चुनें — दूरी वहीं से गिनी जाएगी।')}</p>}
            </div>

            <div className="ag-work-count" role="status" aria-live="polite">
              <b>{filtered.length}</b> {say('jobs within', 'काम,')} {state.km} km
              <span className="ag-work-tally">
                <Seal tone="good" short /> {counts.good}
                <Seal tone="mid" short /> {counts.mid}
                {!hideWarnings && <><Seal tone="bad" short /> {counts.bad}</>}
              </span>
            </div>
            {!filtered.length && (
              <div className="ag-note">
                <p>{outOfArea ? say('You are outside the demo neighbourhood (Andheri East, Mumbai). The sample jobs stay where they are.', 'आप डेमो क्षेत्र (अंधेरी पूर्व, मुंबई) से बाहर हैं। नमूना काम अपनी जगह पर हैं।') : say('No work matches these filters.', 'इन फ़िल्टर से कोई काम नहीं मिला।')}</p>
                <div className="ag-row-actions">
                  <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => filters({ sector: 'all', trade: 'all', when: 'all' })}>{say('Reset filters', 'फ़िल्टर हटाएँ')}</button>
                  <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => filters({ km: 7 })}>{say('Search 7 km', '7 km में खोजें')}</button>
                  <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={() => filters({ origin: DEMO_ORIGIN })}>{say('Back to the demo area', 'डेमो क्षेत्र पर लौटें')}</button>
                </div>
              </div>
            )}
            <ul className="ag-job-list">
              {filtered.map((j) => (
                <li key={j.id}>
                  <JobRow job={j} onOpen={choose} interested={!!state.interest[j.id]} held={hold?.id === j.id} reported={!!reports.reports[j.id]} />
                </li>
              ))}
            </ul>
          </>
        )}
        {hold && panel === 'jobs' && !selected && (
          <div className="ag-hold" role="status">
            <Icon name="hold" />
            <span><b>{say('On hold', 'रोका गया')}:</b> {(lang === 'hi' ? jobs.find((j) => j.id === hold.id)?.titleHi : jobs.find((j) => j.id === hold.id)?.title) ?? ''} · {Math.max(1, Math.ceil((hold.until - now) / 60000))} {say('min left', 'मिनट बाकी')}</span>
            <button type="button" className="ag-link" onClick={() => set((s) => ({ ...s, hold: null }))}>{say('Release', 'छोड़ें')}</button>
          </div>
        )}
      </aside>

      <div className="ag-work-map work-map" aria-hidden={view === 'list' ? 'true' : undefined}>
        <SceneBoundary key={mapAttempt} fallback={<div className="map-fallback"><p>{say('The map could not load. The list still works.', 'नक़्शा नहीं खुला। सूची काम कर रही है।')}</p><button className="ag-btn ag-btn-primary ag-btn-sm" onClick={() => setMapAttempt((n) => n + 1)}>{say('Retry', 'फिर कोशिश')}</button></div>}>
          <Suspense fallback={<div className="map-fallback">{say('Loading the city…', 'शहर लोड हो रहा है…')}</div>}>
            <MapView jobs={filtered} origin={state.origin} selected={state.selected} selectedPlace={place} interest={state.interest} km={state.km} onSelect={choose} onPlaceSelect={(p) => { setPlace(p); setPanel('places') }} onMove={(origin) => filters({ origin })} onRetry={() => setMapAttempt((n) => n + 1)} />
          </Suspense>
        </SceneBoundary>
        <button type="button" className="ag-btn ag-btn-dark ag-btn-sm ag-locate" onClick={locate} disabled={geo === 'asking'}><Icon name="pin" />{geo === 'asking' ? say('Finding you…', 'ढूँढ रहे…') : say('Use my location', 'मेरी जगह')}</button>
        <p className="ag-map-legend" aria-hidden="true">{say('Each glass flower is a job · its colour is the trade · sculptures are nakas, offices and courts', 'हर काँच का फूल एक काम है · रंग काम का प्रकार · मूर्तियाँ नाके, दफ़्तर और न्यायालय हैं')}</p>
      </div>
    </div>
  )
}
