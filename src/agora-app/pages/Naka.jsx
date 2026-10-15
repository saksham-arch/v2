// A shared-phone board. Check-in stays here; it never counts a real crowd.
import { useState } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { createLocalStore, isObject, useStore } from '../../domain/storage.js'
import { allJobs, marketplace } from '../../domain/marketplace.js'
import { jobStore, dateLabel } from '../../domain/jobs.js'
import { assessJob, SEALS } from '../../domain/trust.js'
import { DEMO_DATE, money, tradeOf } from '../../hermes/jobs.js'
import { NAKAS, nakaOf, jobsAtNaka } from '../../hermes/nakas.js'
import { nakaStoa } from '../../world/agora-models.js'
import Listen from '../../ui/Listen.jsx'
import Hero3D from '../Hero3D.jsx'
import Icon from '../icons.jsx'
import { Seal, useSay } from '../ui.jsx'
import './naka.css'

const makeStoa = () => nakaStoa({ figures: 4 })
const checkinStore = createLocalStore('naka-checkin', { visits: {} }, x =>
  isObject(x) && isObject(x.visits) && Object.entries(x.visits).every(([id, at]) => nakaOf(id) && Number.isFinite(at) && at > 0))
const UNITS = { day: ['day', 'दिन'], shift: ['shift', 'पाली'], job: ['whole job', 'पूरा काम'], month: ['month', 'महीना'] }
const AMENITIES = [['water', 'Water', 'पानी'], ['shade', 'Shade', 'छाँव'], ['tea', 'Tea', 'चाय'], ['toilet', 'Toilet', 'शौचालय']]
const SAFETY = [
  ['rupee', 'Agree the rate and payday first', 'पहले मज़दूरी और भुगतान का दिन तय करें'],
  ['pin', 'Get the site address', 'काम की जगह का पता लें'],
  ['people', 'Tell someone where you are going', 'किसी को बताएँ कहाँ जा रहे हैं'],
  ['fee', 'Never pay a fee', 'काम पाने के लिए फ़ीस कभी न दें'],
]

function NakaList({ exclude }) {
  const say = useSay()
  return <ul className="ag-list">{NAKAS.filter(n => n.id !== exclude).map(n => <li key={n.id}>
    <a className="ag-list-row" href={`#naka/${n.id}`}>
      <span className="ag-coin bronze"><Icon name="naka" /></span>
      <span><strong>{say(n.name, n.hi)}</strong><small>{say(n.peak, n.peakHi)} · ~{n.waiting} {say('waiting (sample)', 'प्रतीक्षा में (नमूना)')}</small></span>
      <Icon name="chevron" className="ag-chev" />
    </a>
  </li>)}</ul>
}

function BoardCard({ job, naka, poster = false }) {
  const say = useSay()
  const { lang } = useI18n()
  const trade = tradeOf(job.trade)
  return <article className="naka-job ag-tablet slip">
    <div className="ag-split"><span className="ag-coin lg naka-trade" style={{ '--trade': trade.color }} aria-hidden="true">{trade.glyph}</span><span>{say(trade.label, trade.hi)}</span></div>
    <p className="naka-pay">{money(job.pay)}<small>/ {say(...(UNITS[job.unit] ?? ['unit', 'इकाई']))}</small></p>
    <h3 className="ag-h">{say(job.title, job.titleHi)}</h3>
    <p className="naka-meta"><Icon name={job.shift === 'night' ? 'moon' : 'sun'} size={24} />{say(job.hours, job.hoursHi)}</p>
    <p className="naka-meta"><Icon name="calendar" size={24} />{job.startDate === DEMO_DATE ? say('Today', 'आज') : dateLabel(job.startDate, lang)}</p>
    <Seal tone={assessJob(job).tone} large />
    {!poster && <a className="ag-btn ag-btn-tinted naka-details" href="#map" aria-label={`${say('Details', 'जानकारी')}: ${say(job.title, job.titleHi)}`} onClick={() => jobStore.set(s => ({ ...s, origin: naka.lngLat, km: 2, trade: 'all', sector: 'all', when: 'all', selected: job.id }))}>{say('Details', 'जानकारी')}<Icon name="chevron" size={20} /></a>}
  </article>
}

export default function Naka({ id }) {
  const say = useSay()
  const { lang } = useI18n()
  useStore(marketplace)
  const [checkin, setCheckin, checkinStatus] = useStore(checkinStore)
  const [filter, setFilter] = useState({ id, trade: 'all', clear: false })
  const active = filter.id === id ? filter : { id, trade: 'all', clear: false }
  const naka = nakaOf(id)
  if (!naka) return <div className="naka-page ag-stack-lg"><header className="ag-hero"><div><p className="ag-kicker">Α · {say('Labour naka', 'मज़दूर नाका')}</p><h1 className="ag-title">{say('Naka not found', 'नाका नहीं मिला')}</h1><p className="ag-lede">{say('Choose a sample hiring point below.', 'नीचे से एक नमूना काम का नाका चुनें।')}</p></div></header><h2 className="ag-h">{say('Choose a naka', 'नाका चुनें')}</h2><NakaList /></div>
  const jobs = jobsAtNaka(id, allJobs()).sort((a, b) => Number(b.startDate === DEMO_DATE) - Number(a.startDate === DEMO_DATE) || a.startDate.localeCompare(b.startDate))
  const trades = [...new Set(jobs.map(j => j.trade))].map(tradeOf)
  const visible = jobs.filter(j => (active.trade === 'all' || active.trade === j.trade) && (!active.clear || assessJob(j).tone === 'good'))
  const todayJobs = jobs.filter(j => j.startDate === DEMO_DATE)
  const at = checkin.visits[id]
  const checkedToday = at && new Date(at).toDateString() === new Date().toDateString()
  const time = at ? new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' }).format(at) : ''
  const boardSpeech = () => [
    [`${say(naka.name, naka.hi)}. ${say('Sample board for', 'नमूना बोर्ड की तारीख')} ${dateLabel(DEMO_DATE, lang)}.`, lang === 'hi' ? 'hi-IN' : 'en-IN'],
    ...jobs.map(j => { const seal = SEALS[assessJob(j).tone]; return [`${say(j.title, j.titleHi)}. ${j.pay} ${say('rupees per', 'रुपये प्रति')} ${say(...(UNITS[j.unit] ?? ['unit', 'इकाई']))}. ${say(j.hours, j.hoursHi)}. ${dateLabel(j.startDate, lang)}. ${say(seal.en, seal.hi)}.`, lang === 'hi' ? 'hi-IN' : 'en-IN'] }),
    ...SAFETY.map(([, en, hi]) => [say(en, hi), lang === 'hi' ? 'hi-IN' : 'en-IN']),
  ]
  return <div className="naka-page">
    <header className="ag-hero">
      <div>
        <p className="ag-kicker">Α · {say('Labour naka', 'मज़दूर नाका')}</p>
        <p className="ag-muted">{say('Illustrative place · sample crowds, hours and amenities', 'उदाहरण स्थान · भीड़, समय और सुविधाएँ नमूना हैं')}</p>
        <h1 className="ag-title"><em lang="en">{naka.name}</em></h1>
        <p className="naka-hindi" lang="hi">{naka.hi}</p>
        <p className="naka-peak"><Icon name="sun" size={26} />{say('Peak hours', 'सबसे व्यस्त समय')} · {say(naka.peak, naka.peakHi)}</p>
        <p className="naka-wait"><b>~{naka.waiting}</b> {say('people usually waiting (sample)', 'लोग आम तौर पर प्रतीक्षा में (नमूना)')}</p>
        <p className="ag-lede">{say(naka.note, naka.noteHi)}</p>
        <ul className="naka-amenities">{AMENITIES.map(([key, en, hi]) => <li key={key}><Icon name={key} size={26} /><span>{say(en, hi)}<small>{naka.amenities[key] ? say('Present', 'उपलब्ध') : say('Absent', 'नहीं है')}</small></span><Icon name={naka.amenities[key] ? 'check' : 'close'} size={18} /></li>)}</ul>
      </div>
      <Hero3D make={makeStoa} height={2.2} label={say('A stoa for people waiting for work', 'काम की प्रतीक्षा करते लोगों का स्तंभ मंडप')} fallback="/art/wall.jpg" />
    </header>
    <div className="ag-meander" aria-hidden="true" />
    <section className="naka-actions ag-no-print" aria-label={say('Board actions', 'बोर्ड के विकल्प')}>
      <div className="ag-hero-actions">
        <button type="button" className="ag-btn ag-btn-primary" onClick={() => { jobStore.set(s => ({ ...s, origin: naka.lngLat, selected: null })); setCheckin(s => ({ visits: { ...s.visits, [id]: Date.now() } })) }}><Icon name="pin" size={24} />{say('Stand here today', 'आज यहाँ खड़े हैं')}</button>
        <a href="#map" className="ag-btn ag-btn-tinted" onClick={() => jobStore.set(s => ({ ...s, origin: naka.lngLat, km: 2, selected: null, trade: 'all', sector: 'all', when: 'all' }))}><Icon name="map" size={24} />{say('See these jobs on the map', 'ये काम नक्शे पर देखें')}</a>
        <Listen key={`${id}-${lang}`} lines={boardSpeech} label={say('Read the board aloud', 'बोर्ड पढ़कर सुनाएँ')} />
        <button type="button" className="ag-btn ag-btn-plain" onClick={() => window.print()}><Icon name="print" size={24} />{say('Print poster', 'पोस्टर छापें')}</button>
      </div>
      <p role="status" className="naka-checkin">{checkedToday ? say(`You checked in at ${time} · nothing is shared`, `आपने ${time} पर यहाँ खड़े होने का निशान लगाया · कुछ साझा नहीं हुआ`) : say('Check-in stays on this browser. It does not reserve work or share your location.', 'यह निशान इसी ब्राउज़र में रहता है। इससे काम पक्का या आपकी जगह साझा नहीं होती।')}{checkedToday && checkinStatus === 'unavailable' && ` · ${say('Storage unavailable; kept for this session only.', 'स्टोरेज उपलब्ध नहीं; केवल इस सत्र में रहेगा।')}`}</p>
    </section>
    <section className="naka-board ag-no-print" aria-labelledby="naka-board-title">
      <div className="ag-split"><h2 id="naka-board-title" className="ag-h">{say('Today at this naka', 'आज इस नाके पर')}</h2><span>{dateLabel(DEMO_DATE, lang)}</span></div>
      <p className="ag-muted">{say('Demo date · sample listings, including upcoming starts. Seals describe stated terms, not employer verification.', 'डेमो तारीख · आने वाले दिनों सहित नमूना काम। मुहर शर्तें बताती है, नियोक्ता की पुष्टि नहीं।')}</p>
      <div className="naka-filters">
        <div className="naka-segments" role="group" aria-label={say('Trade', 'काम का प्रकार')}>
          <button type="button" aria-pressed={active.trade === 'all'} onClick={() => setFilter({ ...active, trade: 'all' })}>{say('All trades', 'सभी काम')}</button>
          {trades.map(t => <button type="button" key={t.id} aria-pressed={active.trade === t.id} onClick={() => setFilter({ ...active, trade: t.id })}><span aria-hidden="true">{t.glyph}</span> {say(t.label, t.hi)}</button>)}
        </div>
        <label className="ag-switch"><span>{say('Clear terms only', 'केवल साफ़ शर्तें')}</span><input type="checkbox" role="switch" checked={active.clear} onChange={e => setFilter({ ...active, clear: e.target.checked })} /></label>
      </div>
      <p role="status" className="ag-muted">{visible.length} {say('jobs shown', 'काम दिख रहे हैं')}</p>
      <div className="naka-job-grid">{visible.map(j => <BoardCard key={j.id} job={j} naka={naka} />)}</div>
      {!visible.length && <p className="naka-empty">{say('No matching jobs. Try all trades or turn off “Clear terms only”.', 'ऐसा कोई काम नहीं। सभी काम चुनें या “केवल साफ़ शर्तें” बंद करें।')}</p>}
    </section>
    <section className="naka-safety ag-no-print" aria-labelledby="naka-safety-title">
      <h2 id="naka-safety-title" className="ag-h">{say('Before you get in a vehicle', 'गाड़ी में बैठने से पहले')}</h2>
      <div className="ag-tiles">{SAFETY.map(([icon, en, hi]) => <a key={icon} href="#scales" className="ag-tile"><Icon name={icon} size={38} /><span>{say(en, hi)}</span></a>)}</div>
    </section>
    <section className="naka-others ag-no-print"><h2 className="ag-h">{say('Other nakas', 'दूसरे नाके')}</h2><NakaList exclude={id} /></section>
    <section className="naka-poster" aria-label={say('Printable board', 'छपाई का बोर्ड')}>
      <h2>{say('Jobs starting today', 'आज शुरू होने वाले काम')} · {dateLabel(DEMO_DATE, lang)}</h2>
      <p>{say('Ergon · sample jobs. Nothing is booked or shared. A seal describes terms, not verification.', 'एर्गोन · नमूना काम। कोई बुकिंग या जानकारी साझा नहीं हुई। मुहर शर्तें बताती है, पुष्टि नहीं।')}</p>
      <div className="naka-job-grid">{todayJobs.map(j => <BoardCard key={j.id} job={j} naka={naka} poster />)}</div>
      {!todayJobs.length && <p>{say('No sample jobs start today at this naka.', 'आज इस नाके पर कोई नमूना काम शुरू नहीं होता।')}</p>}
      <p>{SAFETY.map(([, en, hi]) => say(en, hi)).join(' · ')}</p>
    </section>
  </div>
}
