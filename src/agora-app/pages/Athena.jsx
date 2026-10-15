// Δ · Athena — rights and help. Three things only: which schemes to check,
// asking for money you are owed, and where to turn when that fails.
import { useEffect, useState } from 'react'
import { useStore } from '../../domain/storage.js'
import { rightsStore, docsStore, DOCUMENTS, readiness, HELPLINES, LADDER } from '../../domain/rights.js'
import { matchSchemes, numeric } from '../../themis/rules.js'
import { diary, owedByEmployer } from '../../domain/diary.js'
import { PLACES } from '../../agora/places.js'
import { money } from '../../hermes/jobs.js'
import { useI18n } from '../../i18n/index.jsx'
import { athena } from '../../world/myth-models.js'
import { templeSteps } from '../../world/agora-models.js'
import { speak } from '../../ui/Listen.jsx'
import Hero3D from '../Hero3D.jsx'
import Icon from '../icons.jsx'
import { SectionNav, ShareRow, useSay } from '../ui.jsx'
import './athena.css'

const makeAthena = () => athena()
const makeSteps = () => templeSteps(5)
const SECTIONS = ['schemes', 'wages', 'help']
const valid = (id) => (SECTIONS.includes(id) ? id : id === 'documents' ? 'schemes' : id === 'complaint' || id === 'helplines' ? 'help' : 'schemes')
const WORK = [['construction', 'Building work', 'निर्माण', 'building'], ['vending', 'Street vending', 'रेहड़ी-पटरी', 'coin'], ['domestic', 'Housework', 'घरेलू काम', 'water'], ['other', 'Other work', 'अन्य काम', 'tools']]
const NUMERALS = ['Α', 'Β', 'Γ', 'Δ', 'Ε']
const docOf = (id) => DOCUMENTS.find((d) => d.id === id)

function Schemes() {
  const say = useSay()
  const { lang } = useI18n()
  const [a, set] = useStore(rightsStore)
  const [docs, setDocs] = useStore(docsStore)
  const edit = (k, v) => set((s) => ({ ...s, [k]: v, ready: false }))
  const list = matchSchemes(a).yes
  const voice = lang === 'hi' ? 'hi-IN' : 'en-IN'
  return (
    <div className="ath-schemes">
      <div className="ath-panel ath-ask">
        <h2 className="ath-h">{say('About you', 'आपके बारे में')}</h2>
        <div className="ath-work" role="group" aria-label={say('Your work', 'आपका काम')}>
          {WORK.map(([id, en, hi, icon]) => (
            <button key={id} type="button" aria-pressed={a.work === id} onClick={() => edit('work', id)}><Icon name={icon} />{say(en, hi)}</button>
          ))}
        </div>
        <label className="ath-age">
          <span>{say('Age', 'उम्र')} <b>{a.age}</b></span>
          <input type="range" min="14" max="75" value={a.age} onChange={(e) => edit('age', Number(e.target.value))} />
        </label>
        <div className="ath-row">
          <span>{say('Earn per month', 'महीने की कमाई')}</span>
          <div className="ag-seg">
            {[['low', 'Up to ₹15,000', '₹15,000 तक'], ['high', 'More', 'ज़्यादा']].map(([id, en, hi]) => <button key={id} type="button" aria-pressed={a.income === id} onClick={() => edit('income', id)}>{say(en, hi)}</button>)}
          </div>
        </div>
        <div className="ath-row">
          <span>{say('PF or ESIC at work?', 'काम पर PF या ESIC?')}</span>
          <div className="ag-seg">
            {[['yes', 'Yes', 'हाँ'], ['no', 'No', 'नहीं'], ['unknown', 'Not sure', 'पता नहीं']].map(([id, en, hi]) => <button key={id} type="button" aria-pressed={a.coverage === id} onClick={() => edit('coverage', id)}>{say(en, hi)}</button>)}
          </div>
        </div>
      </div>

      <div className="ath-results">
        <p className="ath-count" role="status"><b>{list.length}</b> {say('schemes worth checking', 'योजनाएँ जाँचने लायक')}</p>
        {list.map((s) => {
          const r = readiness(s.id, docs.have)
          return (
            <article key={s.id} className="ath-panel ath-scheme">
              <div className="ath-scheme-head">
                <h3>{lang === 'hi' ? s.hi : s.name}</h3>
                <button type="button" className="ath-round" aria-label={say('Listen', 'सुनें')} onClick={() => speak([[`${lang === 'hi' ? s.hi : s.name}. ${lang === 'hi' ? s.whatHi : s.what}`, voice]])}><Icon name="speaker" /></button>
              </div>
              <p>{lang === 'hi' ? s.whatHi : s.what}</p>
              <div className="ath-docs" role="group" aria-label={say('Papers — tap the ones you have', 'काग़ज़ — जो हैं उन्हें छुएँ')}>
                {r.need.map((id) => {
                  const d = docOf(id)
                  const have = !!docs.have[id]
                  return <button key={id} type="button" aria-pressed={have} onClick={() => setDocs((x) => ({ ...x, have: { ...x.have, [id]: !have } }))}><Icon name={have ? 'check' : 'doc'} />{say(d.en, d.hi)}</button>
                })}
              </div>
              <div className="ath-meter" aria-label={`${r.got.length}/${r.need.length}`}><i style={{ width: `${r.share * 100}%` }} /></div>
              <a className="ag-btn ag-btn-dark ag-btn-sm" href={s.url} target="_blank" rel="noreferrer">{say('Official site', 'आधिकारिक साइट')}</a>
            </article>
          )
        })}
        <p className="ath-small">{say('Possibly relevant — not an eligibility decision. Never give original documents or an OTP.', 'संभावित — पात्रता का फ़ैसला नहीं। असली काग़ज़ या ओटीपी कभी न दें।')}</p>
      </div>
    </div>
  )
}

function Wages() {
  const say = useSay()
  const [a, set] = useStore(rightsStore)
  const [d] = useStore(diary)
  const [tried, setTried] = useState(false)
  const owed = owedByEmployer(d.entries)
  const days = numeric(a.days, 1, 30)
  const rate = numeric(a.rate, 0.01, 10000000)
  const ok = a.employer.trim() && Number.isInteger(days) && rate !== null
  const total = (days || 0) * (rate || 0)
  const edit = (k, v) => set((s) => ({ ...s, [k]: v, ready: false }))
  const prepare = () => {
    setTried(true)
    if (!ok) return
    const draft = say(
      `Dear ${a.employer.trim()},\n\nI worked ${days} day${days === 1 ? '' : 's'} for you at ${money(rate)} a day. ${money(total)} is still unpaid.\n\nPlease pay this amount. I have kept the dates and messages.\n\nName:\nDates worked:\nSite:\n\n(Estimate = days × daily rate. Prepared on Ergon; not sent or filed.)`,
      `${a.employer.trim()} जी,\n\nमैंने आपके लिए ${days} दिन ${money(rate)} रोज़ पर काम किया। ${money(total)} अभी बाकी हैं।\n\nकृपया यह रकम दें। मैंने तारीखें और संदेश संभालकर रखे हैं।\n\nनाम:\nकाम की तारीखें:\nसाइट:\n\n(अनुमान = दिन × दैनिक दर। एर्गोन पर तैयार; भेजा या दर्ज नहीं हुआ।)`,
    )
    set((s) => ({ ...s, ready: true, draft }))
  }
  return (
    <div className="ath-wages">
      {!!owed.length && (
        <div className="ath-owed">
          {owed.map((o) => (
            <button key={o.employer} type="button" className="ath-panel ath-owed-card" onClick={() => set((s) => ({ ...s, employer: o.employer, days: String(o.days), rate: String(o.rate), ready: false }))}>
              <span className="ath-owed-amount">{money(o.owed)}</span>
              <strong>{o.employer}</strong>
              <small>{o.days} {say('days unpaid · from your diary', 'दिन बाकी · आपकी डायरी से')}</small>
            </button>
          ))}
        </div>
      )}
      <div className="ath-panel ath-form">
        <label className="ag-field"><span>{say('Who owes you', 'किसने पैसे नहीं दिए')}</span><input maxLength={120} value={a.employer} onChange={(e) => edit('employer', e.target.value)} /></label>
        <div className="ag-fields">
          <label className="ag-field"><span>{say('Unpaid days', 'बाकी दिन')}</span><input type="number" inputMode="numeric" min="1" max="30" value={a.days} onChange={(e) => edit('days', e.target.value)} /></label>
          <label className="ag-field"><span>{say('Daily rate ₹', 'रोज़ की दर ₹')}</span><input type="number" inputMode="numeric" min="1" value={a.rate} onChange={(e) => edit('rate', e.target.value)} /></label>
        </div>
        <p className="ath-total">{money(total)}</p>
        {tried && !ok && <p className="ag-error" role="alert">{say('Add who owes you, 1–30 days and a rate.', 'नाम, 1–30 दिन और दर भरें।')}</p>}
        <button type="button" className="ag-btn ag-btn-primary ag-btn-block" onClick={prepare}><Icon name="scroll" />{say('Write my reminder', 'मेरी याद-दिहानी लिखें')}</button>
      </div>
      {a.ready && (
        <div className="ath-panel ath-draft">
          <label className="ag-field"><span>{say('Your reminder — edit freely', 'आपकी याद-दिहानी — बदल सकते हैं')}</span><textarea value={a.draft} onChange={(e) => set((s) => ({ ...s, draft: e.target.value.slice(0, 12000) }))} /></label>
          <ShareRow text={a.draft} file="ergon-wage-reminder.txt" />
          <button type="button" className="ag-btn ag-btn-plain" onClick={() => window.print()}><Icon name="print" />{say('Print', 'छापें')}</button>
        </div>
      )}
    </div>
  )
}

function Help({ step, setStep }) {
  const say = useSay()
  const place = (id) => PLACES.find((p) => p.id === id)
  return (
    <div className="ath-help">
      <h2 className="ath-h">{say('Climb only as far as you need', 'जितना ज़रूरी हो उतना ही चढ़ें')}</h2>
      <ol className="ath-ladder">
        {LADDER.map((l, i) => {
          const p = l.place && place(l.place)
          return (
            <li key={l.id}>
              <button type="button" className={`ath-step ${step === i ? 'on' : ''}`} aria-pressed={step === i} onClick={() => setStep(i)}>
                <span className="ath-num">{NUMERALS[i]}</span>
                <span className="ag-coin"><Icon name={l.icon} /></span>
                <strong>{say(l.en, l.hi)}</strong>
              </button>
              {step === i && (
                <div className="ath-step-body">
                  <p>{say(l.body, l.bodyHi)}</p>
                  <p className="ath-bring"><Icon name="doc" />{say(l.bring, l.bringHi)}</p>
                  {l.action === 'wages' && <a className="ag-btn ag-btn-primary ag-btn-sm" href="#athena/wages">{say('Write the reminder', 'याद-दिहानी लिखें')}</a>}
                  {p && <a className="ag-btn ag-btn-primary ag-btn-sm" href={p.source ?? '#map'} target={p.source ? '_blank' : undefined} rel="noreferrer">{say(p.name, p.hi)}</a>}
                  {l.link && <a className="ag-btn ag-btn-primary ag-btn-sm" href={l.link} target="_blank" rel="noreferrer">{say('Open Samadhan', 'समाधान खोलें')}</a>}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <h2 className="ath-h">{say('Call for help', 'मदद के लिए कॉल करें')}</h2>
      <div className="ath-calls">
        {HELPLINES.map((h) => (
          <a key={h.id} className="ath-call" href={`tel:${h.number}`}>
            <span className="ag-coin slip"><Icon name={h.icon} /></span>
            <b>{h.number}</b>
            <span>{say(h.en, h.hi)}</span>
          </a>
        ))}
      </div>
      <p className="ath-small">{say('National numbers, checked 15 Oct 2026.', 'राष्ट्रीय नंबर, 15 अक्टूबर 2026 को जाँचे गए।')}</p>
    </div>
  )
}

export default function Athena({ section }) {
  const say = useSay()
  const [active, setActive] = useState(valid(section))
  const [step, setStep] = useState(0)
  useEffect(() => setActive(valid(section)), [section])
  const go = (id) => {
    setActive(id)
    history.replaceState(null, '', `#athena/${id}`)
  }
  return (
    <div className="ath-page">
      <header className="ag-hero ag-no-print">
        <div>
          <p className="ag-kicker"><span className="ag-numeral">Δ</span>{say('Athena', 'एथेना')}</p>
          <h1 className="ag-title">{say('Your rights,', 'आपके हक़,')} <em>{say('in your words.', 'आपकी भाषा में।')}</em></h1>
          <p className="ag-lede">{say('Schemes to check, money you are owed, and who to call.', 'जाँचने लायक योजनाएँ, बकाया पैसा, और किसे कॉल करें।')}</p>
        </div>
        {active === 'help'
          ? <Hero3D key="steps" make={makeSteps} update={(m) => m.setLevel(step)} height={1.6} camera={[0.4, 1.6, 5.4]} target={[0, 0.6, 0]} label={say('The steps to a fair hearing', 'न्याय की सीढ़ियाँ')} />
          : <Hero3D key="athena" make={makeAthena} height={2.4} label={say('Athena keeps the rights', 'एथेना हक़ संभालती हैं')} fallback="/art/gods/athena.jpg" />}
      </header>
      <SectionNav value={active} onChange={go} label={say('Rights', 'हक़')} items={[['schemes', say('Schemes', 'योजनाएँ'), 'athena'], ['wages', say('Money owed', 'बकाया पैसा'), 'coin'], ['help', say('Get help', 'मदद'), 'phone']]} />
      {active === 'schemes' ? <Schemes /> : active === 'wages' ? <Wages /> : <Help step={step} setStep={setStep} />}
    </div>
  )
}
