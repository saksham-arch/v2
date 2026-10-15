// Α · Hermes — find work. The 3D city fills the screen; filters sit in a
// glass bar along the top and the listings in a glass rail. Each job says
// only what a worker needs at a glance: pay, when, hours, payday, distance
// and Themis' seal.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../domain/storage.js'
import { jobStore, selectJobs, setInterest, dateLabel, distanceKm } from '../../domain/jobs.js'
import { marketplace, allJobs } from '../../domain/marketplace.js'
import { checkJob } from '../../domain/offers.js'
import { assessJob } from '../../domain/trust.js'
import { TRADES, DEMO_ORIGIN, DEMO_DATE, money, tradeOf } from '../../hermes/jobs.js'
import { NAKAS, nearestNaka } from '../../hermes/nakas.js'
import { PLACES } from '../../agora/places.js'
import { useI18n } from '../../i18n/index.jsx'
import SceneBoundary from '../../ui/SceneBoundary.jsx'
import { speak } from '../../ui/Listen.jsx'
import Icon from '../icons.jsx'
import { Seal, Flag, ShareRow, toast, useSay } from '../ui.jsx'
import './work.css'

const MapView = lazy(() => import('../../agora/MapView.jsx'))

const UNIT = { day: ['day', 'दिन'], shift: ['shift', 'पाली'], job: ['job', 'काम'], month: ['month', 'महीना'] }
const PAYDAY = { daily: ['Daily', 'रोज़'], weekly: ['Weekly', 'हफ़्ते में'], completion: ['On completion', 'काम पूरा होने पर'], monthly: ['Monthly', 'हर महीने'], end: ['At the end', 'अंत में'] }

export function jobSpeech(job, lang) {
  const a = assessJob(job)
  const hi = lang === 'hi'
  const seal = { good: ['Terms are clear.', 'शर्तें साफ़ हैं।'], mid: ['Ask questions first.', 'पहले सवाल पूछें।'], bad: ['Warning.', 'चेतावनी।'] }[a.tone][hi ? 1 : 0]
  const flags = a.flags.map((f) => (hi ? f.hi : f.en)).join('. ')
  return [[hi ? `${job.titleHi}। ${job.pay} रुपये ${UNIT[job.unit][1]}। ${job.hoursHi}। ${seal} ${flags}` : `${job.title}. ${job.pay} rupees a ${UNIT[job.unit][0]}. ${job.hours}. ${seal} ${flags}`, hi ? 'hi-IN' : 'en-IN']]
}

const startLabel = (job, lang, say) => (job.startDate === DEMO_DATE ? say('Today', 'आज') : dateLabel(job.startDate, lang).replace(/ 2026$/, '').replace(/ 2026/, ''))

export function JobRow({ job, onOpen, interested }) {
  const say = useSay()
  const { lang } = useI18n()
  const trade = tradeOf(job.trade)
  const tone = assessJob(job).tone
  return (
    <button type="button" id={`job-${job.id}`} className={`ag-job-row tone-${tone}`} onClick={() => onOpen(job.id)} style={{ '--c': trade.color }}>
      <span className="ag-job-trade" aria-hidden="true">{trade.glyph}</span>
      <span className="ag-job-main">
        <span className="ag-job-pay">{money(job.pay)}<small>/{say(...UNIT[job.unit])}</small></span>
        <strong>{lang === 'hi' ? job.titleHi : job.title}</strong>
        <span className="ag-job-meta">
          {startLabel(job, lang, say)} · {Number.isFinite(job.dist) ? `${job.dist.toFixed(1)} km` : ''}
          {interested && <Icon name="heart" size={15} />}
        </span>
      </span>
      <Seal tone={tone} short />
    </button>
  )
}

function Fact({ icon, label, value, warn }) {
  return (
    <div className={`ag-fact ${warn ? 'warn' : ''}`}>
      <Icon name={icon} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )
}

function JobDetail({ job, state, set, onBack, titleRef }) {
  const say = useSay()
  const { lang } = useI18n()
  const [allFlags, setAllFlags] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const stop = useRef(() => {})
  useEffect(() => () => stop.current(), [])
  const a = assessJob(job)
  const trade = tradeOf(job.trade)
  const naka = nearestNaka(job.lngLat)
  const interested = !!state.interest[job.id]
  const unknown = say('Ask', 'पूछें')
  const questions = a.questions.slice(0, 3).map((q) => say(q[0], q[1]))
  const shown = allFlags ? a.flags : a.flags.slice(0, 1)
  return (
    <article className="ag-job-detail" aria-labelledby="job-title">
      <button type="button" className="ag-back" onClick={onBack}><Icon name="back" size={20} />{say('All work', 'सारा काम')}</button>

      <header className="ag-job-head" style={{ '--c': trade.color }}>
        <span className="ag-job-trade lg" aria-hidden="true">{trade.glyph}</span>
        <div>
          <p className="ag-job-kicker">{say(trade.label, trade.hi)} · {job.employer}</p>
          <h2 id="job-title" tabIndex={-1} ref={titleRef}>{lang === 'hi' ? job.titleHi : job.title}</h2>
        </div>
      </header>

      <div className="ag-job-paybar">
        <p className="ag-big-pay">{money(job.pay)}<small>/{say(...UNIT[job.unit])}</small></p>
        <Seal tone={a.tone} large />
      </div>

      <div className="ag-facts">
        <Fact icon="calendar" label={say('Starts', 'शुरू')} value={startLabel(job, lang, say)} />
        <Fact icon={job.shift === 'night' ? 'moon' : 'clock'} label={say('Hours', 'समय')} value={lang === 'hi' ? job.hoursHi : job.hours} warn={job.hoursCount >= 11} />
        <Fact icon="coin" label={say('Payday', 'भुगतान')} value={job.payday ? say(...PAYDAY[job.payday]) : unknown} warn={!job.payday} />
        <Fact icon="pin" label={say('Distance', 'दूरी')} value={`${distanceKm(state.origin, job.lngLat).toFixed(1)} km`} />
      </div>

      {shown.map((f) => <Flag key={f.id} flag={f} />)}
      {a.flags.length > 1 && !allFlags && <button type="button" className="ag-link" onClick={() => setAllFlags(true)}>+{a.flags.length - 1} {say('more to check', 'और जाँचें')}</button>}

      <p className="ag-job-where"><Icon name="pin" size={18} />{lang === 'hi' ? job.placeHi : job.place}</p>

      <div className="ag-job-actions">
        <a className={`ag-btn ${a.tone === 'bad' ? 'ag-btn-plain' : 'ag-btn-primary'} ag-btn-block`} href={`#book-work/${job.id}`}>{say('Request this work', 'काम का अनुरोध करें')}</a>
        <div className="ag-job-actions-row">
          <button type="button" className="ag-icon-btn" onClick={() => checkJob(job, 'scales')}><Icon name="themis" /><span>{say('Weigh', 'तौलें')}</span></button>
          <button type="button" className="ag-icon-btn" aria-pressed={interested} onClick={() => { set((s) => setInterest(s, job.id, !interested)); toast(interested ? say('Removed', 'हटाया') : say('Saved on this phone', 'इस फ़ोन पर सहेजा')) }}><Icon name="heart" /><span>{interested ? say('Saved', 'सहेजा') : say('Save', 'सहेजें')}</span></button>
          <button type="button" className="ag-icon-btn" aria-pressed={speaking} onClick={() => {
            if (speaking) { stop.current(); return }
            setSpeaking(true)
            stop.current = speak(jobSpeech(job, lang), () => setSpeaking(false))
          }}><Icon name="speaker" /><span>{speaking ? say('Stop', 'रोकें') : say('Listen', 'सुनें')}</span></button>
          {naka && <a className="ag-icon-btn" href={`#naka/${naka.id}`}><Icon name="naka" /><span>{say('Naka', 'नाका')}</span></a>}
        </div>
      </div>

      <details className="ag-job-ask">
        <summary>{say('Questions to ask first', 'पहले ये पूछें')}</summary>
        <ol>{questions.map((q) => <li key={q}>{q}</li>)}</ol>
        <ShareRow text={`${lang === 'hi' ? job.titleHi : job.title}\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`} file="ergon-questions.txt" />
      </details>
    </article>
  )
}

function Places({ origin, onPick, picked }) {
  const say = useSay()
  const { lang } = useI18n()
  if (picked) {
    const p = picked
    return (
      <section className="ag-job-detail">
        <button type="button" className="ag-back" onClick={() => onPick(null)}><Icon name="back" size={20} />{say('All places', 'सभी स्थान')}</button>
        <p className="ag-job-kicker">{p.category}{p.demo ? ` · ${say('illustrative', 'उदाहरण')}` : ''}</p>
        <h2 className="ag-place-title">{lang === 'hi' ? p.hi : p.name}</h2>
        <p className="ag-place-body">{lang === 'hi' ? p.descriptionHi ?? p.description : p.description}</p>
        <p className="ag-job-where"><Icon name="pin" size={18} />{p.address} · {distanceKm(origin, p.lngLat).toFixed(1)} km</p>
        {p.naka && <a className="ag-btn ag-btn-primary ag-btn-block" href={`#naka/${p.naka}`}>{say('Open the naka board', 'नाका बोर्ड खोलें')}</a>}
        {!p.demo && <a className="ag-btn ag-btn-primary ag-btn-block" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.name}, ${p.address}`)}`} target="_blank" rel="noreferrer">{say('Directions', 'रास्ता देखें')}</a>}
        {!p.demo && <a className="ag-link" href={p.source} target="_blank" rel="noreferrer">{say('Official page', 'आधिकारिक पेज')}</a>}
      </section>
    )
  }
  const groups = [['work', say('Nakas', 'नाके'), 'naka'], ['craft', say('Registration', 'पंजीकरण'), 'hephaestus'], ['rights', say('Labour offices', 'श्रम कार्यालय'), 'athena'], ['trust', say('Courts & legal aid', 'न्यायालय'), 'themis']]
  return (
    <div className="ag-place-groups">
      {groups.map(([kind, title, icon]) => (
        <section key={kind}>
          <h3 className="ag-rail-h">{title}</h3>
          <div className="ag-place-grid">
            {PLACES.filter((p) => p.kind === kind).map((p) => {
              const n = p.naka && NAKAS.find((x) => x.id === p.naka)
              return (
                <button key={p.id} type="button" className="ag-place-card" onClick={() => onPick(p)}>
                  <span className={`ag-coin ${kind === 'work' ? '' : 'slip'}`}><Icon name={icon} /></span>
                  <strong>{lang === 'hi' ? p.hi : p.name}</strong>
                  <small>{n ? (lang === 'hi' ? n.peakHi : n.peak) : `${distanceKm(origin, p.lngLat).toFixed(1)} km`}</small>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function FilterBar({ state, filters, hideWarnings, setHideWarnings, locate, geo }) {
  const say = useSay()
  const { lang } = useI18n()
  const originNaka = NAKAS.find((n) => n.lngLat[0] === state.origin[0] && n.lngLat[1] === state.origin[1])
  const from = originNaka?.id ?? (distanceKm(state.origin, DEMO_ORIGIN) < 0.01 ? 'demo' : 'me')
  return (
    <div className="ag-filterbar" role="search" aria-label={say('Filter work', 'काम छाँटें')}>
      <div className="ag-filter-trades" role="group" aria-label={say('Trade', 'पेशा')}>
        <button type="button" className="ag-chip" aria-pressed={state.trade === 'all'} onClick={() => filters({ trade: 'all' })}>{say('All', 'सभी')}</button>
        {TRADES.map((t) => (
          <button key={t.id} type="button" className="ag-chip" aria-pressed={state.trade === t.id} onClick={() => filters({ trade: t.id })} style={{ '--c': t.color }}><span className="dot" />{say(t.label, t.hi)}</button>
        ))}
      </div>
      <div className="ag-filter-row">
        <div className="ag-seg" role="group" aria-label={say('When', 'कब')}>
          {[['all', 'Any day', 'कभी भी'], ['day', 'Today', 'आज'], ['week', 'This week', 'इस हफ़्ते'], ['long', 'Long', 'लंबा']].map(([id, en, hi]) => (
            <button key={id} type="button" aria-pressed={state.when === id} onClick={() => filters({ when: id })}>{say(en, hi)}</button>
          ))}
        </div>
        <div className="ag-seg" role="group" aria-label={say('Distance', 'दूरी')}>
          {[2, 4, 7].map((k) => <button key={k} type="button" aria-pressed={state.km === k} onClick={() => filters({ km: k })}>{k} km</button>)}
        </div>
        <div className="ag-seg" role="group" aria-label={say('Source', 'स्रोत')}>
          {[['all', 'All', 'सभी'], ['private', 'Private', 'निजी'], ['government', 'Govt', 'सरकारी']].map(([id, en, hi]) => (
            <button key={id} type="button" aria-pressed={(state.sector ?? 'all') === id} onClick={() => filters({ sector: id })}>{say(en, hi)}</button>
          ))}
        </div>
        <label className="ag-filter-from">
          <Icon name="pin" size={18} />
          <span className="sr-only">{say('Count distance from', 'दूरी कहाँ से')}</span>
          <select value={from} onChange={(e) => {
            const v = e.target.value
            if (v === 'demo') filters({ origin: DEMO_ORIGIN })
            else if (v === 'me') locate()
            else filters({ origin: [...NAKAS.find((n) => n.id === v).lngLat] })
          }}>
            <option value="demo">{say('Andheri East', 'अंधेरी पूर्व')}</option>
            {NAKAS.map((n) => <option key={n.id} value={n.id}>{lang === 'hi' ? n.hi : n.name}</option>)}
            <option value="me">{geo === 'asking' ? say('Finding you…', 'ढूँढ रहे…') : say('My location', 'मेरी जगह')}</option>
          </select>
        </label>
        <button type="button" className="ag-chip ag-filter-safe" aria-pressed={hideWarnings} onClick={() => setHideWarnings(!hideWarnings)}><Icon name="shield" size={17} />{say('Hide warnings', 'चेतावनी छिपाएँ')}</button>
      </div>
    </div>
  )
}

export default function Work() {
  const say = useSay()
  const [state, set] = useStore(jobStore)
  useStore(marketplace)
  const [panel, setPanel] = useState('jobs')
  const [place, setPlace] = useState(null)
  const [view, setView] = useState(() => (matchMedia('(max-width: 860px)').matches ? 'list' : 'map'))
  const [geo, setGeo] = useState('idle')
  const [mapAttempt, setMapAttempt] = useState(0)
  const [hideWarnings, setHideWarnings] = useState(false)
  const rail = useRef()
  const title = useRef()
  const lastRow = useRef(null)
  const listScroll = useRef(0)
  const jobs = allJobs()
  const filtered = useMemo(() => selectJobs(state).filter((j) => !hideWarnings || assessJob(j).tone !== 'bad'), [state, hideWarnings, jobs.length])
  const selected = jobs.find((j) => j.id === state.selected)
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
      (e) => { setGeo(e.code === 1 ? 'denied' : 'failed'); toast(say('Location unavailable — choose your naka instead.', 'जगह नहीं मिली — अपना नाका चुनें।')) },
      { timeout: 8000, maximumAge: 60000 },
    )
  }
  const outOfArea = distanceKm(state.origin, DEMO_ORIGIN) > 10
  const shell = useRef()
  useEffect(() => {
    const bar = shell.current?.querySelector('.ag-filterbar')
    if (!bar) return
    const ro = new ResizeObserver(() => shell.current?.style.setProperty('--fb', `${Math.round(bar.offsetHeight)}px`))
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={shell} className={`ag-work view-${view}`}>
      <div className="ag-work-map">
        <SceneBoundary key={mapAttempt} fallback={<div className="ag-map-fallback"><p>{say('The map could not load. The list still works.', 'नक़्शा नहीं खुला। सूची काम कर रही है।')}</p><button className="ag-btn ag-btn-primary ag-btn-sm" onClick={() => setMapAttempt((n) => n + 1)}>{say('Retry', 'फिर कोशिश')}</button></div>}>
          <Suspense fallback={<div className="ag-map-fallback">{say('Loading the city…', 'शहर लोड हो रहा है…')}</div>}>
            <MapView jobs={filtered} origin={state.origin} selected={state.selected} selectedPlace={place} interest={state.interest} km={state.km} onSelect={choose} onPlaceSelect={(p) => { setPlace(p); setPanel('places') }} onMove={(origin) => filters({ origin })} onRetry={() => setMapAttempt((n) => n + 1)} />
          </Suspense>
        </SceneBoundary>
      </div>

      <FilterBar state={state} filters={filters} hideWarnings={hideWarnings} setHideWarnings={setHideWarnings} locate={locate} geo={geo} />

      <div className="ag-work-switch ag-seg" role="tablist" aria-label={say('View', 'दृश्य')}>
        <button type="button" role="tab" aria-selected={view === 'list'} onClick={() => setView('list')}><Icon name="list" size={18} />{say('List', 'सूची')}</button>
        <button type="button" role="tab" aria-selected={view === 'map'} onClick={() => setView('map')}><Icon name="map" size={18} />{say('Map', 'नक़्शा')}</button>
      </div>

      <aside ref={rail} className="map-sidebar ag-work-rail" aria-label={say('Work and places', 'काम और स्थान')}>
        <div className="ag-seg ag-seg-wide ag-rail-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={panel === 'jobs'} onClick={() => { setPanel('jobs'); setPlace(null) }}><Icon name="hermes" size={18} />{say('Jobs', 'काम')} <b>{filtered.length}</b></button>
          <button type="button" role="tab" aria-selected={panel === 'places'} onClick={() => setPanel('places')}><Icon name="naka" size={18} />{say('Nakas & help', 'नाके और मदद')}</button>
        </div>

        {panel === 'places' ? (
          <Places origin={state.origin} picked={place} onPick={(p) => { setPlace(p); if (p) setView('map') }} />
        ) : selected ? (
          <JobDetail job={selected} state={state} set={set} onBack={back} titleRef={title} />
        ) : (
          <>
            <p className="sr-only" role="status" aria-live="polite">{filtered.length} {say('jobs', 'काम')}</p>
            {!filtered.length && (
              <div className="ag-empty">
                <p>{outOfArea ? say('You are outside the demo area (Andheri East).', 'आप डेमो क्षेत्र (अंधेरी पूर्व) से बाहर हैं।') : say('No work matches.', 'कोई काम नहीं मिला।')}</p>
                <button type="button" className="ag-btn ag-btn-primary ag-btn-sm" onClick={() => filters({ sector: 'all', trade: 'all', when: 'all', km: 7, origin: outOfArea ? DEMO_ORIGIN : state.origin })}>{say('Show more work', 'और काम दिखाएँ')}</button>
              </div>
            )}
            <ul className="ag-job-list">
              {filtered.map((j) => <li key={j.id}><JobRow job={j} onOpen={choose} interested={!!state.interest[j.id]} /></li>)}
            </ul>
          </>
        )}
      </aside>
    </div>
  )
}
