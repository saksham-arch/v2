// Small shared pieces for the agora pages: bilingual text, seals, pictogram
// terms, sheets, toasts and the honest share helpers (nothing is ever sent by
// Ergon itself; sharing opens the person's own apps).
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { SEALS } from '../domain/trust.js'
import Icon from './icons.jsx'

export function useSay() {
  const { lang } = useI18n()
  return (en, hi) => (lang === 'hi' ? hi ?? en : en)
}

export function Seal({ tone, large, short }) {
  const say = useSay()
  const s = SEALS[tone]
  if (!s) return null
  const mark = { good: '✓', mid: '?', bad: '!' }[tone]
  return (
    <span className={`ag-seal ${tone} ${large ? 'ag-seal-lg' : ''}`}>
      <i aria-hidden="true">{mark}</i>
      {short ? say(s.short, s.shortHi) : say(s.en, s.hi)}
    </span>
  )
}

export function Term({ icon, label, value, state }) {
  return (
    <div className={`ag-term ${state ?? ''}`}>
      <Icon name={icon} />
      <div>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  )
}

export function Flag({ flag, tone }) {
  const say = useSay()
  const sev = tone ?? flag.severity
  return (
    <div className={`ag-flag ${sev}`}>
      <span className="ag-flag-icon" aria-hidden="true">{flag.icon ?? '!'}</span>
      <div>
        <strong>{say(flag.en, flag.hi)}</strong>
        {flag.why && <p>{say(flag.why, flag.whyHi)}</p>}
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, title, children }) {
  const panel = useRef()
  const opener = useRef(null)
  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    requestAnimationFrame(() => panel.current?.focus())
    return () => {
      window.removeEventListener('keydown', key)
      opener.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="ag-sheet-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ag-sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={panel}>
        <div className="ag-sheet-grabber" aria-hidden="true" />
        <div className="ag-split" style={{ marginBottom: 14 }}>
          <h2 className="ag-h">{title}</h2>
          <button type="button" className="ag-btn ag-btn-plain ag-btn-sm" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

let toastListener = null
export function toast(message) {
  toastListener?.(message)
}
export function ToastHost() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let timer
    toastListener = (m) => {
      setMsg(m)
      clearTimeout(timer)
      timer = setTimeout(() => setMsg(null), 2600)
    }
    return () => {
      toastListener = null
      clearTimeout(timer)
    }
  }, [])
  return msg ? <div className="ag-toast" role="status">{msg}</div> : null
}

// Open WhatsApp (or the share sheet) with prepared text. The person chooses
// whom to send it to; Ergon sends nothing.
export function whatsappUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export async function shareText(text, title = 'Ergon') {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  return copyText(text)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function ShareRow({ text, file = 'ergon.txt', title }) {
  const say = useSay()
  return (
    <div className="ag-row-actions">
      <a className="ag-btn ag-btn-primary" href={whatsappUrl(text)} target="_blank" rel="noreferrer">
        <Icon name="whatsapp" />
        {say('Send on WhatsApp', 'व्हाट्सऐप पर भेजें')}
      </a>
      <button type="button" className="ag-btn ag-btn-plain" onClick={async () => {
        const r = await shareText(text, title)
        if (r === 'copied') toast(say('Copied. Paste it anywhere.', 'कॉपी हुआ। कहीं भी पेस्ट करें।'))
        else if (r === 'failed') toast(say('Could not copy on this device.', 'इस डिवाइस पर कॉपी नहीं हुआ।'))
      }}>
        <Icon name="share" />
        {say('Share or copy', 'शेयर या कॉपी')}
      </button>
      <button type="button" className="ag-btn ag-btn-plain" onClick={() => downloadText(file, text)}>
        <Icon name="download" />
        {say('Save as text', 'टेक्स्ट सहेजें')}
      </button>
    </div>
  )
}

export function Stat({ value, label, tone }) {
  return (
    <div className={`ag-stat ${tone ?? ''}`}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

export function SectionNav({ value, onChange, items, label }) {
  return (
    <div className="ag-section-nav ag-no-print">
      <div className="ag-seg" role="tablist" aria-label={label}>
        {items.map(([id, text, icon]) => (
          <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}>
            {icon && <Icon name={icon} size={18} />}
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
