// The frame every agora page shares: a glass bar with the four keepers'
// tabs (and "Me"), a bottom tab bar on phones, and the way back to the vase.
import { useEffect } from 'react'
import { useI18n } from '../i18n/index.jsx'
import Icon from './icons.jsx'
import { ToastHost } from './ui.jsx'
import './agora.css'

export const TABS = [
  { id: 'work', href: '#map', icon: 'hermes', numeral: 'Α', en: 'Find work', hi: 'काम खोजें', short: 'Work', shortHi: 'काम', match: (r) => r === '#map' || r.startsWith('#naka/') },
  { id: 'craft', href: '#passport', icon: 'hephaestus', numeral: 'Β', en: 'Work passport', hi: 'काम पासपोर्ट', short: 'Passport', shortHi: 'पासपोर्ट', match: (r) => r.startsWith('#passport') },
  { id: 'trust', href: '#scales', icon: 'themis', numeral: 'Γ', en: 'Check an offer', hi: 'प्रस्ताव जाँचें', short: 'Offer', shortHi: 'प्रस्ताव', match: (r) => r.startsWith('#scales') },
  { id: 'rights', href: '#athena', icon: 'athena', numeral: 'Δ', en: 'Rights & help', hi: 'हक़ और मदद', short: 'Rights', shortHi: 'हक़', match: (r) => r.startsWith('#athena') },
  { id: 'me', href: '#profiles', icon: 'me', numeral: 'Ε', en: 'Me', hi: 'मैं', short: 'Me', shortHi: 'मैं', match: (r) => r.startsWith('#profiles') || r.startsWith('#book-work/') || r === '#post-work' },
]

export default function Shell({ route, full = false, dark = false, children }) {
  const { lang, setLang } = useI18n()
  const say = (en, hi) => (lang === 'hi' ? hi : en)
  useEffect(() => {
    document.documentElement.classList.add('in-agora')
    return () => document.documentElement.classList.remove('in-agora')
  }, [])
  return (
    <div className={`ag ${full ? 'ag-full' : ''} ${dark ? 'ag-dark' : ''}`}>
      <a className="sr-only" href="#ag-main" onClick={(e) => { e.preventDefault(); document.getElementById('ag-main')?.focus() }}>{say('Skip to content', 'सामग्री पर जाएँ')}</a>
      <header className="ag-bar">
        <a className="ag-wordmark" href="#top" aria-label="Ergon home">ergon <small>{say('agora', 'अगोरा')}</small></a>
        <nav className="ag-tabs" aria-label={say('Ergon tools', 'एर्गोन के साधन')}>
          {TABS.map((t) => (
            <a key={t.id} href={t.href} aria-current={t.match(route) ? 'page' : undefined}>
              <Icon name={t.icon} size={18} />
              <span className="ag-tab-full">{say(t.en, t.hi)}</span>
              <span className="ag-tab-short">{say(t.short, t.shortHi)}</span>
            </a>
          ))}
        </nav>
        <div className="ag-bar-actions">
          <a className="ag-btn ag-btn-tinted ag-btn-sm" href="#post-work">{say('Hire workers', 'कामगार रखें')}</a>
          <select className="ag-lang" aria-label="Language / भाषा" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">EN</option>
            <option value="hi">हिन्दी</option>
          </select>
          <a className="ag-vase-link" href="#record">← {say('The vase', 'कलश')}</a>
        </div>
      </header>
      <main id="ag-main" className="ag-main" tabIndex={-1}>{children}</main>
      <nav className="ag-tabbar" aria-label={say('Ergon tools', 'एर्गोन के साधन')}>
        {TABS.map((t) => (
          <a key={t.id} href={t.href} aria-current={t.match(route) ? 'page' : undefined}>
            <Icon name={t.icon} />
            {say(t.short, t.shortHi)}
          </a>
        ))}
      </nav>
      <ToastHost />
    </div>
  )
}
