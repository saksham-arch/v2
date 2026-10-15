// Line icons in the manner of black-figure drawing: one weight, round joins.
// Each is a 24 × 24 path set; colour follows the text.
const P = {
  // The four keepers
  hermes: 'M12 3v18M8.5 6.5c1.2 1.6 5.8 1.6 7 0M12 9c-3 1-3 3 0 4s3 3 0 4M12 9c3 1 3 3 0 4s-3 3 0 4M12 4.5C9.5 2.5 6 3 4 5c2.5.3 4.6 1.2 6 2.5M12 4.5c2.5-2 6-1.5 8 .5-2.5.3-4.6 1.2-6 2.5',
  hephaestus: 'M4 10h11l3-3h2v4h-2l-1 1v2H8l-1 2H5l1-3-2-1.5zM9 17h6M8 20h8M12 14v3',
  themis: 'M12 3v17M7 20h10M4 7h16M12 5.5V7M6 7l-3 6h6zM18 7l-3 6h6zM3 13a3 1.6 0 0 0 6 0M15 13a3 1.6 0 0 0 6 0',
  athena: 'M5 9c0-3 3-5 7-5s7 2 7 5v5c0 4-3 6-7 6s-7-2-7-6zM5 6l2.5 2.5M19 6l-2.5 2.5M9.5 11.5a1.8 1.8 0 1 0 0 .01M14.5 11.5a1.8 1.8 0 1 0 0 .01M11 15l1 1.2 1-1.2M8 19l1.5-2M16 19l-1.5-2',
  me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4M5 7c-1.5 1.5-1.5 4 0 5.5M19 7c1.5 1.5 1.5 4 0 5.5',
  // Terms
  rupee: 'M7 5h10M7 9h10M9.5 5c4 0 4.5 8 0 8H8l7 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2',
  pin: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  coin: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6-1.2 1.4-2.5 1.6-2.5.6-2.5 1.6 1 1.7 2.5 1.7 2.5-.6 2.5-1.6',
  doc: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 15h6M9 18h4',
  fee: 'M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 10v4M18 10v4',
  tools: 'M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z',
  food: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1.5-3 4-3 7h3v11',
  bus: 'M5 4h14v12H5zM5 11h14M8 19v-3M16 19v-3M8 14h.01M16 14h.01',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5M16 4.5a3.3 3.3 0 0 1 0 6.3M18 15c2 .6 3.2 2.2 3.8 5',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
  check: 'M5 12.5l4.5 4.5L19 7',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  share: 'M12 15V3M8 7l4-4 4 4M5 12v8h14v-8',
  whatsapp: 'M4 20l1.3-4A8 8 0 1 1 8 18.8zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1c-1-.5-2.5-2-3-3l1-1-1-2z',
  speaker: 'M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  download: 'M12 3v12M7 10l5 5 5-5M5 20h14',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  scroll: 'M7 4h11a2 2 0 0 1 0 4h-1v10a2 2 0 0 1-2 2H5a2 2 0 0 1 0-4h1V6a2 2 0 0 1 1-2zM6 16h9M9 8h5M9 11h5',
  steps: 'M3 20h18M5 20v-3h4v-3h4v-3h4V8h3',
  water: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  tea: 'M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2M11 3v2',
  shade: 'M3 11c3-5 15-5 18 0zM12 11v10M9 21h6',
  toilet: 'M7 3h4v8H7zM5 11h14a7 7 0 0 1-7 7v3M7 21h10',
  naka: 'M3 21h18M4 21V10l8-6 8 6v11M8 21v-6h8v6M2 10h20',
  hold: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9v6M15 9v6',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  camera: 'M4 7h4l2-3h4l2 3h4v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
  copy: 'M8 8h11v13H8zM5 16H4V3h11v1',
  laurel: 'M12 21V9M12 9C9 9 6 7 6 3c3 0 6 2 6 6zM12 13c-3 0-6-2-6-6M12 13c3 0 6-2 6-6M12 9c3 0 6-2 6-6-3 0-6 2-6 6M12 17c-3 0-5.5-1.5-6.5-4.5M12 17c3 0 5.5-1.5 6.5-4.5',
  key: 'M14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM13.2 12.4L21 20M17 16l2-2M19 18l2-2',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  building: 'M4 21V8l8-5 8 5v13M4 21h16M8 12h2M14 12h2M8 16h2M14 16h2M10 21v-3h4v3',
}

export default function Icon({ name, size, className = '', title }) {
  const d = P[name] ?? P.info
  return (
    <svg
      className={`ag-icon ${className}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  )
}
