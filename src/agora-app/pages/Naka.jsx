// A naka's board: the stoa where people wait, and today's work nearby in big,
// plain cards. Built to be read across a pavement or shown to a group.
import { useState } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { createLocalStore, isObject, useStore } from '../../domain/storage.js'
import { allJobs, marketplace } from '../../domain/marketplace.js'
import { jobStore, dateLabel } from '../../domain/jobs.js'
import { assessJob, SEALS } from '../../domain/trust.js'
import { DEMO_DATE, money, tradeOf } from '../../hermes/jobs.js'
import { NAKAS, nakaOf, jobsAtNaka } from '../../hermes/nakas.js'
import { nakaStoa } from '../../world/agora-models.js'
import { speak } from '../../ui/Listen.jsx'
import Hero3D from '../Hero3D.jsx'
import Icon from '../icons.jsx'
import { Seal, toast, useSay } from '../ui.jsx'
import './naka.css'

const checkinStore = createLocalStore('naka-checkin', { visits: {} }, (x) => isObject(x) && isObject(x.visits))
const makeStoa = () => nakaStoa({ figures: 4 })
const UNIT = { day: ['day', 'दिन'], shift: ['shift', 'पाली'], job: ['job', 'काम'], month: ['month', 'महीना'] }
const AMENITIES = [['water', 'Water', 'पानी'], ['shade', 'Shade', 'छाया'], ['tea', 'Tea', 'चाय'], ['toilet', 'Toilet', 'शौचालय']]
const SAFETY = [['coin', 'Agree the rate and payday first', 'पहले दर और भुगतान का दिन तय करें'], ['pin', 'Get the site address', 'साइट का पता लें'], ['phone', 'Tell someone where you go', 'किसी को बताएँ कि कहाँ जा रहे हैं'], ['fee', 'Never pay to get work', 'काम के लिए कभी पैसे न दें']]

function open(job, naka) {
  jobStore.set((s) => ({ ...s, origin: [...naka.lngLat], km: 2, trade: 'all', sector: 'all', when: 'all', selected: job.id }))
  location.hash = '#map'
}

export default function Naka({ id }) {
  const say = useSay()
  const { lang } = useI18n()
  useStore(marketplace)
  const [checkin, setCheckin] = useStore(checkinStore)
  const [trade, setTrade] = useState('all')
  const [reading, setReading] = useState(null)
  const naka = nakaOf(id)
  if (!naka) {
    return (
      <section className="nk-page">
        <h1 className="ag-title">{say('Choose a naka', 'नाका चुनें')}</h1>
        <div className="nk-others">{NAKAS.map((n) => <a key={n.id} className="nk-other" href={`#naka/${n.id}`}><Icon name="naka" />{lang === 'hi' ? n.hi : n.name}</a>)}</div>
      </section>
    )
  }
  const jobs = jobsAtNaka(id, allJobs()).sort((a, b) => Number(b.startDate === DEMO_DATE) - Number(a.startDate === DEMO_DATE) || a.startDate.localeCompare(b.startDate))
  const trades = [...new Set(jobs.map((j) => j.trade))].map(tradeOf)
  const visible = jobs.filter((j) => trade === 'all' || j.trade === trade)
  const today = jobs.filter((j) => j.startDate === DEMO_DATE).length
  const here = checkin.visits[id] && new Date(checkin.visits[id]).toDateString() === new Date().toDateString()
  const voice = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const readAll = () => {
    if (reading) { reading(); setReading(null); return }
    const lines = [[lang === 'hi' ? naka.hi : naka.name, voice], ...visible.map((j) => [`${lang === 'hi' ? j.titleHi : j.title}. ${j.pay} ${say('rupees a', 'रुपये')} ${say(...UNIT[j.unit])}. ${lang === 'hi' ? j.hoursHi : j.hours}. ${say(SEALS[assessJob(j).tone].en, SEALS[assessJob(j).tone].hi)}.`, voice])]
    setReading(() => speak(lines, () => setReading(null)))
  }

  return (
    <div className="nk-page">
      <header className="nk-hero">
        <div className="nk-copy">
          <p className="ag-kicker"><span className="ag-numeral">Α</span>{say('Labour naka', 'मज़दूर नाका')}</p>
          <h1 className="nk-title">{lang === 'hi' ? naka.hi : naka.name}</h1>
          <div className="nk-pills">
            <span><Icon name="sun" />{lang === 'hi' ? naka.peakHi : naka.peak}</span>
            <span><Icon name="people" />~{naka.waiting} {say('waiting', 'इंतज़ार में')}</span>
            <span><Icon name="hermes" />{today} {say('jobs today', 'आज के काम')}</span>
          </div>
          <div className="nk-amenities">
            {AMENITIES.map(([k, en, hi]) => <span key={k} className={naka.amenities[k] ? 'on' : ''}><Icon name={k} />{say(en, hi)}</span>)}
          </div>
          <div className="nk-actions ag-no-print">
            <button type="button" className="ag-btn ag-btn-primary" aria-pressed={here} onClick={() => {
              jobStore.set((s) => ({ ...s, origin: [...naka.lngLat], selected: null }))
              setCheckin((s) => ({ visits: { ...s.visits, [id]: Date.now() } }))
              toast(say('Distances now count from this naka', 'अब दूरी इसी नाके से गिनी जाएगी'))
            }}><Icon name={here ? 'check' : 'pin'} />{here ? say('You are here today', 'आप आज यहाँ हैं') : say('I am here today', 'मैं आज यहाँ हूँ')}</button>
            <button type="button" className="nk-round" aria-pressed={!!reading} onClick={readAll} aria-label={say('Read the board aloud', 'बोर्ड सुनें')}><Icon name="speaker" /></button>
            <button type="button" className="nk-round" onClick={() => window.print()} aria-label={say('Print the board', 'बोर्ड छापें')}><Icon name="print" /></button>
          </div>
        </div>
        <Hero3D make={makeStoa} height={2.3} camera={[0, 1.7, 6.2]} target={[0, 1, 0]} className="nk-niche" label={say('Waiting under the stoa', 'मंडप के नीचे इंतज़ार')} />
      </header>

      <section className="nk-board" aria-labelledby="nk-board-title">
        <div className="nk-board-head">
          <h2 id="nk-board-title">{say('Work near this naka', 'इस नाके के पास काम')}</h2>
          <div className="nk-trades" role="group" aria-label={say('Trade', 'पेशा')}>
            <button type="button" aria-pressed={trade === 'all'} onClick={() => setTrade('all')}>{say('All', 'सभी')}</button>
            {trades.map((t) => <button key={t.id} type="button" aria-pressed={trade === t.id} onClick={() => setTrade(t.id)} style={{ '--c': t.color }}><i />{say(t.label, t.hi)}</button>)}
          </div>
        </div>
        <div className="nk-grid">
          {visible.map((j) => {
            const t = tradeOf(j.trade)
            return (
              <button key={j.id} type="button" className="nk-card" onClick={() => open(j, naka)} style={{ '--c': t.color }}>
                <span className="nk-card-top">
                  <span className="nk-glyph" aria-hidden="true">{t.glyph}</span>
                  <Seal tone={assessJob(j).tone} short />
                </span>
                <span className="nk-pay">{money(j.pay)}<small>/{say(...UNIT[j.unit])}</small></span>
                <strong>{lang === 'hi' ? j.titleHi : j.title}</strong>
                <span className="nk-when"><Icon name={j.shift === 'night' ? 'moon' : 'sun'} />{j.startDate === DEMO_DATE ? say('Today', 'आज') : dateLabel(j.startDate, lang).replace(/ 2026$/, '')} · {lang === 'hi' ? j.hoursHi : j.hours}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="nk-safety" aria-label={say('Before you go', 'जाने से पहले')}>
        {SAFETY.map(([icon, en, hi]) => <div key={icon}><span className="ag-coin lg"><Icon name={icon} /></span><b>{say(en, hi)}</b></div>)}
      </section>

      <nav className="nk-others ag-no-print" aria-label={say('Other nakas', 'दूसरे नाके')}>
        {NAKAS.filter((n) => n.id !== id).map((n) => <a key={n.id} className="nk-other" href={`#naka/${n.id}`}><Icon name="naka" />{lang === 'hi' ? n.hi : n.name}</a>)}
      </nav>
      <p className="nk-foot">{say('Illustrative hiring point · sample crowd sizes and hours', 'उदाहरण नाका · भीड़ और समय नमूना हैं')}</p>
    </div>
  )
}
