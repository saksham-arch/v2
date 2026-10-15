// Δ · Athena — papers, pay and a path to help. All drafts stay on this device.
import { useEffect, useState } from 'react'
import { useStore } from '../../domain/storage.js'
import { rightsStore, docsStore, DOCUMENTS, readiness, HELPLINES, LADDER } from '../../domain/rights.js'
import { matchSchemes, numeric } from '../../themis/rules.js'
import { diary, owedByEmployer, summarise } from '../../domain/diary.js'
import { PLACES } from '../../agora/places.js'
import { money } from '../../hermes/jobs.js'
import { useI18n } from '../../i18n/index.jsx'
import { athena } from '../../world/myth-models.js'
import { templeSteps } from '../../world/agora-models.js'
import Listen from '../../ui/Listen.jsx'
import Hero3D from '../Hero3D.jsx'
import Icon from '../icons.jsx'
import { SectionNav, ShareRow, useSay } from '../ui.jsx'
import './athena.css'

const makeAthena = () => athena()
const makeSteps = () => templeSteps(5)
const SECTIONS = [
  ['schemes', 'Schemes for me', 'मेरे लिए योजनाएँ', 'laurel'],
  ['documents', 'Document pouch', 'काग़ज़ों की थैली', 'doc'],
  ['wages', 'Money owed', 'बकाया पैसे', 'rupee'],
  ['complaint', 'Complaint steps', 'शिकायत के कदम', 'steps'],
  ['helplines', 'Helplines', 'हेल्पलाइन', 'phone'],
]
const validSection = id => SECTIONS.some(s => s[0] === id) ? id : 'schemes'
const WORK = [['construction', 'Building work', 'निर्माण कार्य', 'tools'], ['vending', 'Street vending', 'रेहड़ी-पटरी', 'food'], ['domestic', 'Housework & cleaning', 'घरेलू काम और सफ़ाई', 'water'], ['other', 'Other work', 'अन्य काम', 'people']]

export default function Athena({ section }) {
  const say = useSay(), { lang } = useI18n()
  const [active, setActive] = useState(() => validSection(section))
  const [a, set, status] = useStore(rightsStore)
  const [docs, setDocs, docStatus] = useStore(docsStore)
  const [record] = useStore(diary)
  const [step, setStep] = useState(0), [attempt, setAttempt] = useState(false)
  useEffect(() => { setActive(validSection(section)) }, [section])
  const switchSection = id => {
    setActive(validSection(id))
    history.replaceState(null, '', `#athena/${validSection(id)}`)
  }
  const edit = (key, value) => set(s => ({ ...s, [key]: value, ready: false }))
  const schemes = matchSchemes(a).yes
  const groups = owedByEmployer(record.entries), total = summarise(record.entries)
  const days = numeric(a.days, 1, 30), rate = numeric(a.rate, .01, 10000000)
  const valid = !!a.employer.trim() && Number.isInteger(days) && rate !== null
  const estimate = (days || 0) * (rate || 0)
  const listen = text => <Listen className="ag-btn ag-btn-tinted" label={say('Listen', 'सुनें')} lines={[[text, lang === 'hi' ? 'hi-IN' : 'en-IN']]} />
  const choices = (key, title, options, help) => <fieldset className="ath-question"><legend>{title}</legend>{help && <p className="ag-muted">{help}</p>}<div className="ag-chips">{options.map(([value, label]) => <button type="button" className="ag-chip" key={value} aria-pressed={a[key] === value} onClick={() => edit(key, value)}>{label}</button>)}</div></fieldset>
  const yn = [['yes', say('Yes', 'हाँ')], ['no', say('No', 'नहीं')], ['unknown', say('Don’t know', 'पता नहीं')]]
  const papers = id => {
    const r = readiness(id, docs.have)
    return <div className="ath-readiness"><div className="ag-split"><strong>{say('Papers in your pouch', 'थैली में काग़ज़')}</strong><span>{r.got.length}/{r.need.length}</span></div><progress value={r.share} max="1" aria-label={say('Document readiness', 'काग़ज़ों की तैयारी')} /><p className="ag-muted">{r.missing.length ? `${say('Still needed', 'अभी चाहिए')}: ${r.missing.map(k => { const d = DOCUMENTS.find(x => x.id === k); return say(d.en, d.hi) }).join(' · ')}` : say('Checklist complete. Confirm accepted papers at the official desk.', 'सूची पूरी है। केंद्र पर स्वीकार्य काग़ज़ों की पुष्टि करें।')}</p></div>
  }
  const prepare = e => {
    e.preventDefault(); setAttempt(true)
    if (!valid) return
    const en = `UNPAID WAGES — LOCAL DRAFT\nEmployer: ${a.employer.trim()}\nUnpaid days: ${days}\nAgreed daily rate: ${money(rate)}\nEstimated amount: ${money(estimate)}\n\nPlease arrange payment for the work described above.\n\nMy name:\nSite address:\nDates worked:\nEvidence: attendance, messages and agreed terms.\n\nEstimate = days × daily rate. Partial payments and deductions are not included. Check and edit before sharing. Nothing has been sent or filed.`
    const hi = `बकाया मज़दूरी — स्थानीय मसौदा\nनियोक्ता: ${a.employer.trim()}\nबकाया दिन: ${days}\nतय दैनिक दर: ${money(rate)}\nअनुमानित रकम: ${money(estimate)}\n\nकृपया ऊपर बताए काम का भुगतान करें।\n\nमेरा नाम:\nकाम का पता:\nकाम की तारीखें:\nप्रमाण: हाज़िरी, संदेश और तय शर्तें।\n\nअनुमान = दिन × दैनिक दर। आंशिक भुगतान और कटौती शामिल नहीं हैं। साझा करने से पहले जाँचें। कुछ भेजा या दर्ज नहीं हुआ है।`
    set(s => ({ ...s, ready: true, draft: `${en}\n\n─────\n\n${hi}` }))
  }
  const placeCard = id => {
    const p = PLACES.find(x => x.id === id)
    if (!p) return null
    return <div className="ag-note quiet"><strong>{say(p.name, p.hi)}</strong><p>{p.demo ? say('Illustrative map point — not a confirmed office address.', 'मानचित्र का उदाहरण — कार्यालय का पुष्ट पता नहीं।') : p.address}</p><div className="ag-row-actions"><a className="ag-btn ag-btn-tinted" href="#map"><Icon name="map" />{say('Find help on map', 'नक्शे पर मदद खोजें')}</a>{p.source && <a className="ag-btn ag-btn-plain" href={p.source} target="_blank" rel="noreferrer">{say('Official contact', 'आधिकारिक संपर्क')} ↗</a>}{p.demo && <a className="ag-btn ag-btn-plain" href="https://nalsa.gov.in/" target="_blank" rel="noreferrer">{say('Official legal aid', 'आधिकारिक कानूनी सहायता')} ↗</a>}</div>{!p.demo && <p>{say('Mumbai office. Confirm the office for your workplace before travelling.', 'मुंबई कार्यालय। जाने से पहले अपने कार्यस्थल के सही कार्यालय की पुष्टि करें।')}</p>}</div>
  }

  return <div className={`athena-page ${active === 'wages' && a.ready ? 'ath-print-ready' : ''}`}>
    <div className="ag-hero ag-no-print"><div><p className="ag-kicker">{say('Δ · Athena keeps the rights', 'Δ · एथेना अधिकार सँभालती है')}</p><h1 className="ag-title">{say('Your rights,', 'आपके अधिकार,')} <em>{say('in your words.', 'आपकी ज़ुबान में।')}</em></h1><p className="ag-lede">{say('Papers in order. Wages remembered. A clear next step when you need help.', 'काग़ज़ तैयार। मज़दूरी का हिसाब। मदद के लिए साफ़ अगला कदम।')}</p><p className="ag-lede-hi" lang={lang === 'hi' ? 'en' : 'hi'}>{say('अपना हक़ समझें, अपनी बात रखें।', 'Know your rights. Make yourself heard.')}</p><div className="ag-hero-actions">{listen(say('Find schemes, organise documents, prepare a wage reminder or find complaint steps. This demo keeps answers on this browser. Nothing is sent or filed.', 'योजनाएँ खोजें, काग़ज़ सँभालें, मज़दूरी की याद-दिहानी बनाएँ या शिकायत के कदम जानें। इस डेमो में जवाब इसी ब्राउज़र में रहते हैं। कुछ भेजा या दर्ज नहीं होता।'))}</div></div><Hero3D make={active === 'complaint' ? makeSteps : makeAthena} update={active === 'complaint' ? model => model.setLevel(step) : undefined} label={say(active === 'complaint' ? 'Five steps towards a fair hearing' : 'Athena · the keeper of wisdom', active === 'complaint' ? 'सुनवाई की ओर पाँच कदम' : 'एथेना · ज्ञान की रक्षक')} /></div>
    <SectionNav value={active} onChange={switchSection} label={say('Rights and help', 'अधिकार और सहायता')} items={SECTIONS.map(([id, en, hi, icon]) => [id, say(en, hi), icon])} />
    <div className="ag-meander ag-no-print" />
    <section className="ag-stack-lg" aria-label={say(...SECTIONS.find(s => s[0] === active).slice(1, 3))}>
      <div className="ag-split ag-no-print"><h2 className="ag-h ag-h-serif">{say(...SECTIONS.find(s => s[0] === active).slice(1, 3))}</h2><span className="ag-muted">{say('Your next step', 'आपका अगला कदम')} · Δ</span></div>
      {active === 'schemes' && <>
        <div className="ag-grid"><div className="ag-col-5 ag-tablet slip ag-stack-lg">
          <p className="ag-note">{say('Only yes / no answers. Never enter Aadhaar or bank numbers.', 'सिर्फ़ हाँ / नहीं के जवाब। आधार या बैंक नंबर कभी न भरें।')}</p>
          <label className="ag-field"><span>{say('Your age', 'आपकी उम्र')} · <output>{a.age}</output></span><input type="range" min="14" max="75" value={a.age} onChange={e => edit('age', Number(e.target.value))} /></label>
          <fieldset className="ath-question"><legend>{say('What work do you do?', 'आप क्या काम करते हैं?')}</legend><div className="ag-tiles">{WORK.map(([id, en, hi, icon]) => <button type="button" className="ag-tile" key={id} aria-pressed={a.work === id} onClick={() => edit('work', id)}><span className="ag-coin lg"><Icon name={icon} /></span>{say(en, hi)}</button>)}</div></fieldset>
          {choices('income', say('Monthly income', 'मासिक आय'), [['low', say('Up to ₹15,000', '₹15,000 तक')], ['high', say('Above ₹15,000', '₹15,000 से अधिक')]])}
          {choices('coverage', say('EPFO / ESIC cover?', 'EPFO / ESIC में शामिल हैं?'), yn, say('EPFO is a work-linked provident fund. ESIC is employee health insurance. Ask your employer if unsure.', 'EPFO नौकरी से जुड़ी भविष्य निधि है। ESIC कर्मचारी स्वास्थ्य बीमा है। पता न हो तो नियोक्ता से पूछें।'))}
          {choices('aadhaar', say('Have Aadhaar?', 'आधार है?'), yn)}{choices('bank', say('Have a bank account?', 'बैंक खाता है?'), yn)}
        </div><div className="ag-col-7 ag-stack">
          <p className="ag-note" role="status">{schemes.length} {say('schemes to check. Potentially relevant — this does not decide eligibility.', 'योजनाएँ जाँचें। संभवतः उपयोगी — यह पात्रता तय नहीं करता।')}</p>
          {schemes.map(s => <article className="ag-tablet marble ag-stack" key={s.id}><div><p className="ag-kicker">{say('A possible route', 'एक संभावित रास्ता')}</p><h3 className="ag-h">{say(s.name, s.hi)}</h3><p className="ag-muted" lang={lang === 'hi' ? 'en' : 'hi'}>{say(s.hi, s.name)}</p></div><p className="ag-p">{say(s.what, s.whatHi)}</p><div><h4 className="ag-h-small">{say('Why it may fit you', 'आपके लिए क्यों उपयोगी हो सकती है')}</h4><p className="ag-p">{say(s.why, s.whyHi)}</p></div><p className="ag-muted">{say(s.need, s.needHi)}</p>{papers(s.id)}{(a.aadhaar !== 'yes' || a.bank !== 'yes') && <p className="ag-note quiet">{say('Ask the official desk about accepted identity, bank and assisted registration options. Missing papers do not rule out all help.', 'केंद्र से स्वीकार्य पहचान, बैंक और सहायक पंजीकरण पूछें। काग़ज़ न होने से सारी मदद बंद नहीं होती।')}</p>}<div><h4 className="ag-h-small">{say('Where to go', 'कहाँ जाएँ')}</h4><div className="ag-row-actions"><a className="ag-btn ag-btn-primary" href={s.url} target="_blank" rel="noreferrer">{say('Official requirements', 'आधिकारिक शर्तें')} ↗</a>{['eshram', 'bocw'].includes(s.id) && <a className="ag-btn ag-btn-tinted" href="#map"><Icon name="map" />{say('Help desks on map', 'नक्शे पर सहायता केंद्र')}</a>}</div><p className="ag-muted">{say('Source checked', 'स्रोत जाँचा')} · {s.checked}</p></div>{listen([say(s.name, s.hi), say(s.what, s.whatHi), say(s.why, s.whyHi), say(s.need, s.needHi), say('Potentially relevant — this does not decide eligibility.', 'संभवतः उपयोगी — यह पात्रता तय नहीं करता।')].join('. '))}</article>)}
          {!schemes.length && <p className="ag-note">{say('No matches from these answers. An official help desk may know other routes.', 'इन जवाबों से कोई मेल नहीं मिला। आधिकारिक सहायता केंद्र से अन्य रास्ते पूछें।')}</p>}
        </div></div>
      </>}
      {active === 'documents' && <>
        <p className="ag-lede">{say('Tick what you have. Keep the papers with you.', 'जो आपके पास हैं, उन पर निशान लगाएँ। काग़ज़ अपने पास रखें।')}</p>
        <div className="ath-documents">{DOCUMENTS.map(d => <button type="button" className="ag-tablet ath-document" aria-pressed={!!docs.have[d.id]} key={d.id} onClick={() => setDocs(s => ({ ...s, have: { ...s.have, [d.id]: !s.have[d.id] } }))}><span className={`ag-coin ${docs.have[d.id] ? 'bronze' : 'slip'}`}><Icon name={docs.have[d.id] ? 'check' : 'doc'} /></span><span><strong>{say(d.en, d.hi)}</strong><small>{say(d.tip, d.tipHi)}</small></span></button>)}</div>
        <div className="ag-tablet ag-stack"><h3 className="ag-h">{say('Your scheme checklist', 'आपकी योजना की सूची')}</h3><p role="status">{schemes.filter(s => readiness(s.id, docs.have).share === 1).length} / {schemes.length} {say('shown schemes have all listed papers. This is document readiness only.', 'दिखाई गई योजनाओं के सभी सूचीबद्ध काग़ज़ हैं। यह सिर्फ़ काग़ज़ों की तैयारी है।')}</p>{schemes.map(s => <div key={s.id}><h4 className="ag-h-small">{say(s.name, s.hi)}</h4>{papers(s.id)}</div>)}</div>
        <div className="ag-note"><h3 className="ag-h-small"><Icon name="shield" size={22} /> {say('Keep your identity safe', 'अपनी पहचान सुरक्षित रखें')}</h3><p>{say('Never give originals to recruiters. Write “for job verification only” on photocopies given for work checks. Never share an OTP.', 'भर्ती करने वालों को असली काग़ज़ कभी न दें। काम की जाँच के लिए दी फ़ोटोकॉपी पर “केवल नौकरी सत्यापन के लिए” लिखें। ओटीपी कभी न बताएँ।')}</p>{listen(say('Never give originals to recruiters. Write for job verification only on photocopies. Never share an OTP.', 'भर्ती करने वालों को असली काग़ज़ न दें। फ़ोटोकॉपी पर केवल नौकरी सत्यापन के लिए लिखें। ओटीपी कभी न बताएँ।'))}</div>
      </>}
      {active === 'wages' && <>
        <div className="ag-note ag-no-print">{say('Prepare a local reminder. Nothing is sent or filed. Never enter Aadhaar or bank numbers.', 'स्थानीय याद-दिहानी बनाएँ। कुछ भेजा या दर्ज नहीं होता। आधार या बैंक नंबर न भरें।')}</div>
        {!a.ready ? <>
          {groups.length > 0 && <div className="ag-tablet ag-stack"><h3 className="ag-h">{say('From your work diary', 'आपकी काम की डायरी से')} · {money(total.owed)}</h3>{groups.map(g => <article className="ath-owed" key={g.employer}><div><h4 className="ag-h-small">{g.employer}</h4><p>{g.days} {say('entries with money owed', 'बकाया प्रविष्टियाँ')} · <strong>{money(g.owed)}</strong></p><p className="ag-muted">{g.dates.join(' · ')}</p></div><button className="ag-btn ag-btn-tinted" onClick={() => { set(s => ({ ...s, employer: g.employer, days: String(g.days), rate: String(g.rate), ready: false })); setAttempt(false) }}>{say('Use for reminder', 'याद-दिहानी में भरें')}</button></article>)}<p className="ag-note quiet">{say('Diary balances include partial payments. The form uses entry count and one recorded rate: check whole days, mixed rates and job/shift entries before preparing.', 'डायरी के बकाया में आंशिक भुगतान शामिल हैं। फ़ॉर्म प्रविष्टियों की गिनती और एक दर्ज दर लेता है: मसौदे से पहले पूरे दिन, अलग दरें और काम/पाली की प्रविष्टियाँ जाँचें।')}</p></div>}
          <form className="ag-tablet ag-stack" onSubmit={prepare} noValidate><h3 className="ag-h">{say('Check the facts', 'तथ्य जाँचें')}</h3><div className="ag-fields">{[['employer', 'Who hired you', 'किसने काम दिया'], ['days', 'Whole unpaid days · 1–30', 'पूरे बकाया दिन · 1–30'], ['rate', 'Agreed daily rate · ₹', 'तय दैनिक दर · ₹']].map(([key, en, hi]) => <label className="ag-field" key={key}><span>{say(en, hi)}</span><input type={key === 'employer' ? 'text' : 'number'} value={a[key]} maxLength={key === 'employer' ? 120 : 20} min={key === 'rate' ? '.01' : '1'} max={key === 'days' ? '30' : key === 'rate' ? '10000000' : undefined} step={key === 'rate' ? '.01' : '1'} aria-invalid={attempt && (key === 'employer' ? !a.employer.trim() : key === 'days' ? !Number.isInteger(days) : rate === null)} onChange={e => edit(key, e.target.value.slice(0, key === 'employer' ? 120 : 20))} /></label>)}</div>{attempt && !valid && <p className="ag-error" role="alert">{say('Enter an employer, 1–30 whole unpaid days and a daily rate from ₹0.01 to ₹1,00,00,000.', 'नियोक्ता, 1–30 पूरे बकाया दिन और ₹0.01 से ₹1,00,00,000 तक दैनिक दर भरें।')}</p>}<p className="ag-note quiet">{say('Estimate = days × rate. Partial payments and deductions are not included. Check the amount before sharing.', 'अनुमान = दिन × दर। आंशिक भुगतान और कटौती शामिल नहीं हैं। साझा करने से पहले रकम जाँचें।')}</p><button type="submit" className="ag-btn ag-btn-primary"><Icon name="scroll" />{say('Prepare reminder', 'याद-दिहानी बनाएँ')} · {money(estimate)}</button></form>
        </> : <div className="ag-tablet ag-stack ath-draft"><h3 className="ag-h ag-no-print">{say('Your words, ready to review', 'आपकी बात, जाँचने के लिए तैयार')}</h3><label className="ag-field ag-no-print"><span>{say('Edit the bilingual draft before sharing', 'साझा करने से पहले दोनों भाषाओं का मसौदा बदलें')}</span><textarea rows="22" maxLength="12000" value={a.draft} onChange={e => set(s => ({ ...s, draft: e.target.value.slice(0, 12000) }))} /></label><pre className="ath-print-draft">{a.draft}</pre><div className="ag-no-print ag-stack"><ShareRow text={a.draft} file="ergon-wage-reminder.txt" title={say('Wage reminder', 'मज़दूरी की याद-दिहानी')} /><div className="ag-row-actions"><button className="ag-btn ag-btn-dark" onClick={() => window.print()}><Icon name="print" />{say('Print / save PDF', 'प्रिंट / PDF सहेजें')}</button><button className="ag-btn ag-btn-plain" onClick={() => set(s => ({ ...s, ready: false }))}><Icon name="edit" />{say('Edit facts', 'तथ्य बदलें')}</button>{listen(a.draft)}</div></div></div>}
        <div className="ag-no-print"><button className="ag-btn ag-btn-tinted" onClick={() => switchSection('complaint')}><Icon name="steps" />{say('Still unpaid? See complaint steps', 'अब भी बकाया? शिकायत के कदम देखें')}</button></div>
      </>}
      {active === 'complaint' && <>
        <div className="ag-tablet slip ag-stack"><label className="ag-field"><span>{say('Where am I?', 'मैं किस कदम पर हूँ?')}</span><select value={step} onChange={e => setStep(Number(e.target.value))}>{LADDER.map((s, i) => <option key={s.id} value={i}>{i + 1} · {say(s.en, s.hi)}</option>)}</select></label><p className="ag-muted">{say('Choose the next step you want to understand. This marker stays here while this page is open; it does not track a filed complaint.', 'जिस अगले कदम को समझना है, चुनें। पेज खुले रहने तक निशान यहीं है; यह दर्ज शिकायत की स्थिति नहीं है।')}</p></div>
        <div className="ath-ladder">{LADDER.map((s, i) => <article key={s.id} className={`ag-tablet ath-step ${step === i ? 'current' : ''}`} aria-current={step === i ? 'step' : undefined}><span className="ag-numeral" aria-hidden="true">{['Α', 'Β', 'Γ', 'Δ', 'Ε'][i]}</span><div className="ag-stack"><h3 className="ag-h"><Icon name={s.icon} size={24} /> {i + 1} · {say(s.en, s.hi)}</h3><p className="ag-p">{say(s.body, s.bodyHi)}</p><p className="ag-note quiet"><strong>{say('Bring', 'साथ लाएँ')}: </strong>{say(s.bring, s.bringHi)}</p>{s.id === 'remind' && <button className="ag-btn ag-btn-primary" onClick={() => switchSection('wages')}>{say('Prepare a reminder', 'याद-दिहानी बनाएँ')}</button>}{s.place && placeCard(s.place)}{s.link && <a className="ag-btn ag-btn-primary" href={s.link} target="_blank" rel="noreferrer">{say('Open official Samadhan portal', 'आधिकारिक समाधान पोर्टल खोलें')} ↗</a>}{listen(`${say(s.en, s.hi)}. ${say(s.body, s.bodyHi)}. ${say('Bring', 'साथ लाएँ')}: ${say(s.bring, s.bringHi)}`)}</div></article>)}</div>
        <p className="ag-note">{say('These are routes to ask for help. No complaint is filed by this demo. Confirm jurisdiction and the current process with an official desk.', 'ये मदद माँगने के रास्ते हैं। इस डेमो से शिकायत दर्ज नहीं होती। सही क्षेत्राधिकार और वर्तमान प्रक्रिया केंद्र से जाँचें।')}</p>
      </>}
      {active === 'helplines' && <>
        <p className="ag-lede">{say('A person at the other end.', 'दूसरी ओर मदद करने वाला इंसान।')}</p><div className="ath-helplines">{HELPLINES.map(h => <a href={`tel:${h.number}`} className="ag-tablet marble ath-call" key={h.id}><span className="ag-coin lg"><Icon name={h.icon} /></span><span className="ath-number">{h.number}</span><strong>{say(h.en, h.hi)}</strong><span className="ag-link"><Icon name="phone" size={18} /> {say('Tap to call', 'कॉल करने के लिए दबाएँ')}</span></a>)}</div><div className="ag-note ag-stack"><p>{say('Numbers checked on 15 Oct 2026 in the demo directory. Confirm on official sites before relying on them.', 'डेमो की सूची में नंबर 15 अक्टूबर 2026 को जाँचे गए। भरोसा करने से पहले आधिकारिक साइटों पर पुष्टि करें।')}</p><div className="ag-row-actions"><a className="ag-btn ag-btn-plain" href="https://112.gov.in/" target="_blank" rel="noreferrer">112 ↗</a><a className="ag-btn ag-btn-plain" href="https://eshram.gov.in/" target="_blank" rel="noreferrer">e-Shram / ई-श्रम ↗</a><a className="ag-btn ag-btn-plain" href="https://nha.gov.in/" target="_blank" rel="noreferrer">PM-JAY / पीएम-जय ↗</a></div>{listen(HELPLINES.map(h => `${say(h.en, h.hi)}: ${h.number}`).join('. '))}</div><div className="ag-tablet slip ag-stack"><h3 className="ag-h">{say('Lost money to a job scam?', 'नौकरी के नाम पर ठगी में पैसे गए?')}</h3><p>{say('Call 1930 and report at cybercrime.gov.in. Keep payment receipts and messages.', '1930 पर कॉल करें और cybercrime.gov.in पर रिपोर्ट करें। भुगतान की रसीदें और संदेश रखें।')}</p><div className="ag-row-actions"><a className="ag-btn ag-btn-primary" href="tel:1930"><Icon name="phone" />1930</a><a className="ag-btn ag-btn-tinted" href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer">{say('Official cybercrime report', 'आधिकारिक साइबर अपराध रिपोर्ट')} ↗</a></div></div>
      </>}
    </section>
    <p className="ag-muted ath-storage ag-no-print" role="status">{status === 'unavailable' || docStatus === 'unavailable' ? say('Browser storage unavailable. Answers last only while this page is open.', 'ब्राउज़र में सहेजना उपलब्ध नहीं। जवाब पेज खुले रहने तक हैं।') : say('Answers and drafts stay in this browser. Nothing sent or filed.', 'जवाब और मसौदे इसी ब्राउज़र में रहते हैं। कुछ भेजा या दर्ज नहीं हुआ।')}</p>
  </div>
}
