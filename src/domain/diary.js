// The work diary: days worked, for whom, at what rate, and whether the money
// came. "Where the work is kept" made literal. Entries are the worker's own
// record on this device; booking completions add employer-confirmed days.
import { createLocalStore, isObject, isText } from './storage.js'
import { TRADES } from '../hermes/jobs.js'

const STATUSES = ['paid', 'unpaid', 'part']
const validEntry = (e) =>
  isObject(e) && typeof e.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && isText(e.employer, 80) && e.employer.trim() &&
  TRADES.some((t) => t.id === e.trade) && Number.isFinite(e.rate) && e.rate > 0 && e.rate <= 1000000 && ['day', 'job', 'shift'].includes(e.unit) &&
  STATUSES.includes(e.status) && (e.paidAmount === null || (Number.isFinite(e.paidAmount) && e.paidAmount >= 0)) &&
  isText(e.note ?? '', 160) && ['self', 'booking'].includes(e.source)

export const diary = createLocalStore('diary', { entries: [] }, (s) => isObject(s) && Array.isArray(s.entries) && s.entries.length <= 2000 && s.entries.every(validEntry))

const uid = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`)

export function makeEntry(d) {
  const rate = Number(d.rate)
  const paidAmount = d.status === 'part' ? Number(d.paidAmount) : d.status === 'paid' ? rate : 0
  const entry = {
    id: d.id ?? `day-${uid()}`,
    date: d.date,
    employer: String(d.employer ?? '').trim().slice(0, 80),
    trade: d.trade,
    rate,
    unit: d.unit ?? 'day',
    status: d.status ?? 'paid',
    paidAmount: Number.isFinite(paidAmount) ? Math.min(paidAmount, rate) : null,
    note: String(d.note ?? '').slice(0, 160),
    source: d.source ?? 'self',
    ...(d.bookingId ? { bookingId: d.bookingId } : {}),
  }
  if (!validEntry(entry)) throw new Error('Enter a date, who you worked for, your trade and a positive rate.')
  if (entry.status === 'part' && !(entry.paidAmount < rate)) throw new Error('For part payment, enter how much you received (less than the rate).')
  return entry
}

export function addEntry(d) {
  const entry = makeEntry(d)
  if (entry.bookingId && diary.getSnapshot().data.entries.some((e) => e.bookingId === entry.bookingId)) return null
  diary.set((s) => ({ ...s, entries: [...s.entries, entry].sort((a, b) => b.date.localeCompare(a.date)) }))
  return entry
}

export function updateEntry(id, patch) {
  const current = diary.getSnapshot().data.entries.find((e) => e.id === id)
  if (!current) throw new Error('Entry not found.')
  const next = makeEntry({ ...current, ...patch, id })
  diary.set((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? next : e)) }))
  return next
}

export const removeEntry = (id) => diary.set((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }))

export const owedOn = (e) => (e.status === 'paid' ? 0 : e.rate - (e.paidAmount ?? 0))

export function summarise(entries, month) {
  const list = month ? entries.filter((e) => e.date.startsWith(month)) : entries
  const earned = list.reduce((a, e) => a + (e.status === 'paid' ? e.rate : e.paidAmount ?? 0), 0)
  const owed = list.reduce((a, e) => a + owedOn(e), 0)
  return { days: list.length, earned, owed, employers: new Set(list.map((e) => e.employer)).size }
}

// Unpaid days grouped by employer, for the wage reminder.
export function owedByEmployer(entries) {
  const map = new Map()
  for (const e of entries) {
    const owed = owedOn(e)
    if (!owed) continue
    const k = e.employer
    const v = map.get(k) ?? { employer: k, days: 0, owed: 0, dates: [], rate: e.rate, trade: e.trade }
    v.days += 1
    v.owed += owed
    v.dates.push(e.date)
    map.set(k, v)
  }
  return [...map.values()].map((v) => ({ ...v, dates: v.dates.sort() })).sort((a, b) => b.owed - a.owed)
}

export const diaryCounts = (entries) => ({ days: entries.length, confirmed: entries.filter((e) => e.source === 'booking').length })

// The last n calendar days ending today, each 'empty' | 'paid' | 'unpaid'.
export function recentStates(entries, endDate, n = 7) {
  const out = []
  const end = new Date(`${endDate}T00:00:00Z`)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setUTCDate(end.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    const day = entries.filter((e) => e.date === key)
    out.push(!day.length ? 'empty' : day.some((e) => owedOn(e) > 0) ? 'unpaid' : 'paid')
  }
  return out
}

// A worked example so the diary is not empty in a demonstration.
export function sampleEntries(endDate) {
  const d = (k) => {
    const x = new Date(`${endDate}T00:00:00Z`)
    x.setUTCDate(x.getUTCDate() - k)
    return x.toISOString().slice(0, 10)
  }
  return [
    { date: d(1), employer: 'Sai Constructions', trade: 'mason', rate: 950, status: 'paid' },
    { date: d(2), employer: 'Sai Constructions', trade: 'mason', rate: 950, status: 'paid' },
    { date: d(3), employer: 'Royal Decor Works', trade: 'mason', rate: 900, status: 'unpaid', note: 'Said he will pay on Saturday' },
    { date: d(4), employer: 'Royal Decor Works', trade: 'mason', rate: 900, status: 'unpaid' },
    { date: d(5), employer: 'Royal Decor Works', trade: 'mason', rate: 900, status: 'part', paidAmount: 400 },
    { date: d(8), employer: 'Mr. Rao (home)', trade: 'mason', rate: 1000, status: 'paid' },
  ].map((e) => makeEntry({ ...e, unit: 'day', source: 'self' }))
}
