// Fictional work around Andheri East, Mumbai. Every listing is mock data with a
// fixed position, so the map and the lists stay stable between visits. Most
// listings are ordinary work with clear or partly clear terms; a handful are
// deliberately suspicious so the trust checks have something real to catch.
// x, z are map units (one unit is 0.75 km) used by the flower sculptures.

export const KM = 0.75

export const TRADES = [
  { id: 'mason', label: 'Mason', hi: 'राजमिस्त्री', color: '#c4532a', glyph: '▤' },
  { id: 'painter', label: 'Painter', hi: 'पेंटर', color: '#d9a43e', glyph: '◐' },
  { id: 'electrician', label: 'Electrician', hi: 'बिजली मिस्त्री', color: '#4f79b0', glyph: 'ϟ' },
  { id: 'plumber', label: 'Plumber', hi: 'प्लंबर', color: '#2f8c86', glyph: '◡' },
  { id: 'carpenter', label: 'Carpenter', hi: 'बढ़ई', color: '#8f5e34', glyph: '⊤' },
  { id: 'helper', label: 'Site helper', hi: 'हेल्पर', color: '#b24c66', glyph: '◒' },
  { id: 'housekeeping', label: 'Housekeeping', hi: 'सफ़ाई', color: '#8a74c4', glyph: '✦' },
  { id: 'loading', label: 'Loading', hi: 'लोडिंग', color: '#d0763f', glyph: '▣' },
]
export const tradeOf = (id) => TRADES.find((t) => t.id === id) ?? TRADES[0]

export const KINDS = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'long', label: 'Longer work' },
]

export const DEMO_DATE = '2026-10-15'
export const DEMO_ORIGIN = [72.86542, 19.11161]

// Neighbourhoods the sample work is spread across (approximate centres).
export const LOCALITIES = [
  { id: 'chakala', name: 'Chakala', hi: 'चकाला', lngLat: [72.8608, 19.111] },
  { id: 'marol', name: 'Marol', hi: 'मरोल', lngLat: [72.8797, 19.1086] },
  { id: 'sakinaka', name: 'Saki Naka', hi: 'साकीनाका', lngLat: [72.8869, 19.103] },
  { id: 'jbnagar', name: 'JB Nagar', hi: 'जेबी नगर', lngLat: [72.8676, 19.1057] },
  { id: 'midc', name: 'MIDC Andheri', hi: 'एमआईडीसी अंधेरी', lngLat: [72.8705, 19.1199] },
  { id: 'gundavali', name: 'Gundavali', hi: 'गुंदवली', lngLat: [72.8545, 19.1168] },
  { id: 'station', name: 'Andheri East station', hi: 'अंधेरी पूर्व स्टेशन', lngLat: [72.849, 19.119] },
  { id: 'vijaynagar', name: 'Vijay Nagar', hi: 'विजय नगर', lngLat: [72.874, 19.113] },
  { id: 'mahakali', name: 'Mahakali Caves Road', hi: 'महाकाली गुफा रोड', lngLat: [72.87, 19.13] },
  { id: 'sherepunjab', name: 'Sher-e-Punjab Colony', hi: 'शेर-ए-पंजाब कॉलोनी', lngLat: [72.864, 19.1255] },
  { id: 'jogeshwari', name: 'Jogeshwari East', hi: 'जोगेश्वरी पूर्व', lngLat: [72.856, 19.138] },
  { id: 'powai', name: 'Powai edge', hi: 'पवई के पास', lngLat: [72.899, 19.116] },
]

const SPOTS = [
  ['behind the bus depot', 'बस डिपो के पीछे'], ['Lane 3, near the temple', 'गली 3, मंदिर के पास'], ['Building 4, B wing', 'इमारत 4, बी विंग'],
  ['opposite the post office', 'डाकघर के सामने'], ['Road 12, unit 7', 'रोड 12, यूनिट 7'], ['near the metro pillar 18', 'मेट्रो खंभा 18 के पास'],
  ['market square, shop 9', 'बाज़ार चौक, दुकान 9'], ['society gate 2', 'सोसाइटी गेट 2'], ['site office by the water tank', 'पानी की टंकी के पास साइट ऑफ़िस'],
  ['school compound', 'स्कूल परिसर'], ['warehouse lane, gate 3', 'गोदाम गली, गेट 3'], ['hospital service gate', 'अस्पताल सर्विस गेट'],
]

// Kept fictional on purpose. Public employers are described by role only.
const EMPLOYERS = {
  contractor: ['Sai Constructions', 'Shree Ganesh Builders', 'Patil & Sons Contractors', 'Noor Infra', 'Vighnaharta Developers'],
  household: ['Mrs. D’Souza (home)', 'Mr. Rao (home)', 'Kulkarni family (home)', 'Mr. Shaikh (home)', 'Mrs. Iyer (home)'],
  business: ['Shah Interiors', 'Kapoor Traders', 'Mehta Medical', 'Homecraft Studio', 'Iqbal Hardware', 'QuickKart hub', 'Clearline Facilities', 'Patel Grain Traders', 'Swift Movers', 'Hotel Sea Breeze'],
  public: ['Ward works contractor', 'Municipal school maintenance', 'Public hospital facilities team', 'Metro station upkeep contractor'],
}

const T = (en, hi) => ({ en, hi })
// Per trade: titles, what to bring, a pay range (per day unless noted) and who hires.
const TEMPLATES = {
  mason: {
    titles: [T('Brickwork for a ground-floor extension', 'भूतल विस्तार में ईंट का काम'), T('Plaster repair after a monsoon leak', 'बारिश के रिसाव के बाद प्लास्टर मरम्मत'), T('Tile laying, kitchen and bathroom', 'रसोई और बाथरूम में टाइल लगाना'), T('Compound wall, about 40 feet', 'लगभग 40 फ़ीट की चारदीवारी')],
    bring: T('Trowel, level and plumb line. Cement is on site.', 'करणी, लेवल और साहुल। सीमेंट साइट पर है।'), pay: [850, 1100], who: ['contractor', 'household', 'contractor'],
  },
  painter: {
    titles: [T('Two coats on a 2BHK interior', '2BHK के अंदर दो कोट पेंट'), T('Shop shutter and signboard painting', 'दुकान के शटर और बोर्ड की पेंटिंग'), T('Putty and primer, office cabins', 'ऑफ़िस केबिन में पुट्टी और प्राइमर'), T('Exterior touch-up, ground and first floor', 'बाहरी टच-अप, भूतल और पहली मंज़िल')],
    bring: T('Roller, brushes and scraper. Paint is provided.', 'रोलर, ब्रश और स्क्रेपर। पेंट दिया जाएगा।'), pay: [800, 1000], who: ['business', 'household', 'contractor'],
  },
  electrician: {
    titles: [T('Concealed wiring for a new shop', 'नई दुकान की छिपी वायरिंग'), T('Fan, light and switchboard repairs', 'पंखा, लाइट और स्विचबोर्ड की मरम्मत'), T('Inverter and battery installation', 'इन्वर्टर और बैटरी लगाना'), T('Distribution board change, three flats', 'तीन फ़्लैट में डीबी बोर्ड बदलना')],
    bring: T('Tester, pliers and insulated tools.', 'टेस्टर, प्लायर और इंसुलेटेड औज़ार।'), pay: [950, 1300], who: ['business', 'household', 'contractor'],
  },
  plumber: {
    titles: [T('Leaking overhead tank line', 'ऊपरी टंकी की लाइन का रिसाव'), T('Bathroom fittings, two flats', 'दो फ़्लैट में बाथरूम फ़िटिंग'), T('CPVC line for a new kitchen', 'नई रसोई के लिए सीपीवीसी लाइन'), T('Drain cleaning for a housing society', 'हाउसिंग सोसाइटी की नाली सफ़ाई')],
    bring: T('Pipe wrench, thread tape and cutter.', 'पाइप रिंच, थ्रेड टेप और कटर।'), pay: [900, 1200], who: ['household', 'contractor', 'business'],
  },
  carpenter: {
    titles: [T('Wardrobe and door frames', 'अलमारी और दरवाज़े की चौखट'), T('Modular kitchen shutters', 'मॉड्यूलर किचन के शटर'), T('Shuttering for a roof slab', 'छत के स्लैब के लिए शटरिंग'), T('Repairing classroom benches', 'कक्षा की बेंचों की मरम्मत')],
    bring: T('Drill, planer and hand tools. Wood is on site.', 'ड्रिल, रंदा और हाथ के औज़ार। लकड़ी साइट पर है।'), pay: [950, 1200], who: ['business', 'contractor', 'household'],
  },
  helper: {
    titles: [T('Site helper: mixing and carrying', 'साइट हेल्पर: मसाला बनाना और सामान उठाना'), T('Shifting a household, two floors', 'घर का सामान शिफ़्ट करना, दो मंज़िल'), T('Clearing debris after demolition', 'तोड़-फोड़ के बाद मलबा हटाना')],
    bring: T('Closed shoes. Gloves are provided.', 'बंद जूते। दस्ताने दिए जाएँगे।'), pay: [600, 800], who: ['contractor', 'business', 'contractor'],
  },
  housekeeping: {
    titles: [T('Office housekeeping, day shift', 'ऑफ़िस सफ़ाई, दिन की पाली'), T('Deep clean after construction', 'निर्माण के बाद गहरी सफ़ाई'), T('Clinic cleaning, evening shift', 'क्लिनिक सफ़ाई, शाम की पाली')],
    bring: T('Nothing. Supplies and uniform are provided.', 'कुछ नहीं। सामान और वर्दी दी जाएगी।'), pay: [600, 760], who: ['business', 'business', 'household'],
  },
  loading: {
    titles: [T('Unloading grain at the wholesale market', 'थोक बाज़ार में अनाज उतारना'), T('Warehouse packing, festival rush', 'त्योहार में गोदाम पैकिंग'), T('Tempo loading for a furniture shop', 'फ़र्नीचर दुकान के लिए टेम्पो लोडिंग')],
    bring: T('Gloves. Tea and a meal during the shift.', 'दस्ताने। पाली में चाय और खाना।'), pay: [650, 850], who: ['business', 'business', 'business'],
  },
}

const PUBLIC_WORK = [
  ['painter', T('Repainting a municipal school', 'नगरपालिका स्कूल की पुताई'), 'Municipal school maintenance'],
  ['plumber', T('Public toilet plumbing repair', 'सार्वजनिक शौचालय की प्लंबिंग मरम्मत'), 'Ward works contractor'],
  ['mason', T('Footpath paver laying', 'फ़ुटपाथ पर पेवर ब्लॉक लगाना'), 'Ward works contractor'],
  ['electrician', T('Streetlight wiring check, public garden', 'सार्वजनिक बगीचे में स्ट्रीटलाइट वायरिंग जाँच'), 'Ward works contractor'],
  ['housekeeping', T('Hospital ward housekeeping', 'अस्पताल वार्ड की सफ़ाई'), 'Public hospital facilities team'],
  ['carpenter', T('School library shelves', 'स्कूल पुस्तकालय की अलमारियाँ'), 'Municipal school maintenance'],
  ['helper', T('Station platform upkeep helper', 'स्टेशन प्लेटफ़ॉर्म रखरखाव हेल्पर'), 'Metro station upkeep contractor'],
  ['loading', T('Relief supplies loading, ward store', 'वार्ड भंडार में राहत सामग्री लोडिंग'), 'Ward works contractor'],
]

// A tiny seeded generator keeps the sample world identical on every load.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SHIFTS = [
  { id: 'morning', from: 7, to: 15 },
  { id: 'day', from: 9, to: 18 },
  { id: 'day', from: 8, to: 17 },
  { id: 'day', from: 10, to: 18 },
  { id: 'evening', from: 15, to: 22 },
  { id: 'night', from: 22, to: 6 },
]
const part = (h) => (h < 12 ? ['am', 'सुबह'] : h < 16 ? ['pm', 'दोपहर'] : h < 20 ? ['pm', 'शाम'] : ['pm', 'रात'])
const clock = (h) => ((h + 11) % 12) + 1
function hoursText(from, to) {
  const [a, ha] = part(from), [b, hb] = part(to % 24)
  return { en: `${clock(from)} ${a} – ${clock(to % 24)} ${b}`, hi: `${ha} ${clock(from)} – ${hb} ${clock(to % 24)}` }
}

const addDays = (date, n) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

const toLngLat = (center, r) => {
  const a = r() * Math.PI * 2, d = 0.06 + r() * 0.42
  return [center[0] + (Math.cos(a) * d) / (111.32 * Math.cos(center[1] * Math.PI / 180)), center[1] + (Math.sin(a) * d) / 110.57]
}
const toXZ = ([lng, lat]) => ({
  x: ((lng - DEMO_ORIGIN[0]) * 111.32 * Math.cos(DEMO_ORIGIN[1] * Math.PI / 180)) / KM,
  z: (-(lat - DEMO_ORIGIN[1]) * 110.57) / KM,
})

function makeJob(i, r, { trade, title, employer, employerType, sector }) {
  const tpl = TEMPLATES[trade]
  const loc = LOCALITIES[Math.floor(r() * LOCALITIES.length)]
  const spot = SPOTS[Math.floor(r() * SPOTS.length)]
  const lngLat = toLngLat(loc.lngLat, r)
  const shift = trade === 'loading' && r() < 0.5 ? SHIFTS[5] : trade === 'housekeeping' && r() < 0.3 ? SHIFTS[4] : SHIFTS[Math.floor(r() * 4)]
  const hoursCount = (shift.to - shift.from + 24) % 24 || 8
  const span = r()
  const durationDays = sector === 'public' ? [10, 21, 30, 45][Math.floor(r() * 4)] : span < 0.42 ? 1 : span < 0.62 ? 0.5 : span < 0.8 ? [2, 3, 4, 5, 6][Math.floor(r() * 5)] : span < 0.93 ? [14, 21, 30, 60][Math.floor(r() * 4)] : null
  const offset = [0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 8, 12, 17][Math.floor(r() * 13)]
  const monthly = durationDays === null && trade === 'housekeeping'
  const job = durationDays === 0.5 && r() < 0.6
  const unit = monthly ? 'month' : trade === 'loading' ? 'shift' : job ? 'job' : 'day'
  const base = tpl.pay[0] + Math.round((r() * (tpl.pay[1] - tpl.pay[0])) / 50) * 50
  const pay = unit === 'month' ? 15500 + Math.round(r() * 5) * 500 : unit === 'job' ? Math.round((base * (0.6 + r() * 0.6)) / 50) * 50 : base
  const payRoll = r()
  const payday = sector === 'public' ? (r() < 0.5 ? 'weekly' : 'monthly') : unit === 'month' ? 'monthly' : durationDays !== null && durationDays <= 1 ? (payRoll < 0.8 ? 'daily' : 'completion') : payRoll < 0.45 ? 'weekly' : payRoll < 0.75 ? 'daily' : payRoll < 0.9 ? 'completion' : null
  const verified = employerType !== 'household' && r() < 0.75
  const reports = verified ? Math.floor(4 + r() * 40) : Math.floor(r() * 3)
  const late = Math.floor(reports * (r() < 0.75 ? 0.04 : 0.22))
  const h = hoursText(shift.from, shift.to)
  return {
    id: `j${i + 1}`,
    trade,
    sector: sector === 'public' ? 'government' : 'private',
    title: title.en,
    titleHi: title.hi,
    employer,
    employerType,
    verified,
    hires: reports,
    reports: { onTime: reports - late, late, unpaid: verified ? 0 : Math.floor(r() * 2) },
    pay,
    unit,
    startDate: addDays(DEMO_DATE, offset),
    durationDays,
    shift: shift.id,
    hours: h.en,
    hoursHi: h.hi,
    hoursCount,
    payday,
    fee: r() < 0.55 ? 0 : null,
    written: sector === 'public' ? true : r() < 0.45 ? true : r() < 0.85 ? null : false,
    address: true,
    meals: r() < 0.35,
    transport: r() < 0.15,
    vacancies: 1 + Math.floor(r() * (trade === 'helper' || trade === 'loading' ? 6 : 3)),
    locality: loc.id,
    place: `${loc.name}, ${spot[0]}`,
    placeHi: `${loc.hi}, ${spot[1]}`,
    bring: tpl.bring.en,
    bringHi: tpl.bring.hi,
    asks: [],
    verification: verified ? 'sample-history' : 'unknown',
    lngLat,
    ...toXZ(lngLat),
  }
}

function regularJobs() {
  const r = rng(20261015)
  const list = []
  const trades = Object.keys(TEMPLATES)
  for (let n = 0; n < 104; n++) {
    const trade = trades[n % trades.length]
    const tpl = TEMPLATES[trade]
    const employerType = tpl.who[Math.floor(r() * tpl.who.length)]
    const names = EMPLOYERS[employerType]
    list.push(makeJob(list.length, r, { trade, title: tpl.titles[Math.floor(r() * tpl.titles.length)], employer: names[Math.floor(r() * names.length)], employerType, sector: 'private' }))
  }
  for (let n = 0; n < 24; n++) {
    const [trade, title, employer] = PUBLIC_WORK[n % PUBLIC_WORK.length]
    list.push(makeJob(list.length, r, { trade, title, employer, employerType: 'public', sector: 'public' }))
  }
  return list
}

// Listings that should make a worker stop and ask. Each `asks` code is a red
// flag explained by the trust checks (src/domain/trust.js).
const SUSPICIOUS = [
  { trade: 'helper', title: T('Helpers needed urgently — ₹2,600 a day', 'तुरंत हेल्पर चाहिए — ₹2,600 रोज़'), employer: 'Contact on WhatsApp only', pay: 2600, unit: 'day', fee: 1500, written: false, address: false, payday: null, asks: ['fee', 'otp', 'noAddress', 'pressure'], locality: 'sakinaka', bring: T('Pay the ₹1,500 registration fee to confirm your place.', 'जगह पक्की करने के लिए ₹1,500 पंजीकरण शुल्क दें।') },
  { trade: 'mason', title: T('Overseas mason work — visa in 7 days', 'विदेश में मिस्त्री का काम — 7 दिन में वीज़ा'), employer: 'Global Manpower Placement', pay: 3500, unit: 'day', fee: 30000, written: null, address: true, payday: 'monthly', asks: ['fee', 'overseas', 'documents'], locality: 'station', bring: T('Bring your passport and ₹30,000 processing charge.', 'पासपोर्ट और ₹30,000 प्रोसेसिंग शुल्क लाएँ।') },
  { trade: 'loading', title: T('Packing work from home, ₹3,000 a day', 'घर से पैकिंग का काम, ₹3,000 रोज़'), employer: 'EasyEarn Packing', pay: 3000, unit: 'day', fee: 999, written: false, address: false, payday: null, asks: ['fee', 'noAddress'], locality: 'jbnagar', bring: T('Buy the starter kit for ₹999.', '₹999 का स्टार्टर किट खरीदें।') },
  { trade: 'painter', title: T('Painting crew — full pay after two months', 'पेंटिंग टीम — पूरी मज़दूरी दो महीने बाद'), employer: 'Royal Decor Works', pay: 900, unit: 'day', fee: 0, written: false, address: true, payday: null, duration: 60, asks: ['payLater'], locality: 'marol', bring: T('Own brushes. Food deducted from pay.', 'अपने ब्रश। खाने के पैसे मज़दूरी से कटेंगे।') },
  { trade: 'loading', title: T('Warehouse loading — hand over ID to supervisor', 'गोदाम लोडिंग — पहचान पत्र सुपरवाइज़र को दें'), employer: 'Om Logistics', pay: 700, unit: 'shift', fee: 0, written: null, address: true, payday: 'monthly', asks: ['documents'], locality: 'midc', bring: T('Your original Aadhaar card will be kept until the contract ends.', 'असली आधार कार्ड अनुबंध खत्म होने तक रखा जाएगा।') },
  { trade: 'electrician', title: T('Electrician — one unpaid trial week', 'बिजली मिस्त्री — एक हफ़्ता बिना मज़दूरी ट्रायल'), employer: 'Bright Spark Services', pay: 1000, unit: 'day', fee: 0, written: false, address: true, payday: 'monthly', asks: ['trial'], locality: 'vijaynagar', bring: T('Own tools. Pay starts after the trial.', 'अपने औज़ार। ट्रायल के बाद मज़दूरी शुरू।') },
  { trade: 'helper', title: T('Night helpers — vehicle picks up at the highway', 'रात के हेल्पर — हाइवे से गाड़ी ले जाएगी'), employer: 'Unnamed site supervisor', pay: 1400, unit: 'shift', fee: 0, written: false, address: false, payday: null, asks: ['noAddress', 'pressure'], locality: 'powai', bring: T('Wait at the highway signal at 10 pm. Do not tell anyone.', 'रात 10 बजे हाइवे सिग्नल पर रुकें। किसी को न बताएँ।') },
  { trade: 'housekeeping', title: T('Housekeeping, ₹9,000 a month, 12 hours, no day off', 'सफ़ाई, ₹9,000 महीना, 12 घंटे, कोई छुट्टी नहीं'), employer: 'Sparkle Facility Agency', pay: 9000, unit: 'month', fee: 500, written: false, address: true, payday: 'monthly', hoursCount: 12, asks: ['fee'], locality: 'gundavali', bring: T('₹500 for the uniform, deducted from the first salary.', 'वर्दी के ₹500, पहली तनख़्वाह से काटे जाएँगे।') },
]

function suspiciousJobs(start) {
  const r = rng(777)
  return SUSPICIOUS.map((s, k) => {
    const loc = LOCALITIES.find((l) => l.id === s.locality)
    const lngLat = toLngLat(loc.lngLat, r)
    const hoursCount = s.hoursCount ?? (s.unit === 'shift' ? 8 : 9)
    const h = s.unit === 'shift' && s.trade === 'helper' ? hoursText(22, 6) : hoursCount === 12 ? hoursText(8, 20) : hoursText(9, 18)
    return {
      id: `j${start + k + 1}`, trade: s.trade, sector: 'private', title: s.title.en, titleHi: s.title.hi, employer: s.employer, employerType: 'unknown', verified: false, hires: 0,
      reports: { onTime: 0, late: 0, unpaid: k % 3 === 0 ? 2 : 0 }, pay: s.pay, unit: s.unit, startDate: addDays(DEMO_DATE, k % 3), durationDays: s.duration ?? (s.unit === 'month' ? null : 30),
      shift: s.trade === 'helper' && s.unit === 'shift' ? 'night' : 'day', hours: h.en, hoursHi: h.hi, hoursCount, payday: s.payday, fee: s.fee, written: s.written, address: s.address,
      meals: false, transport: s.asks.includes('noAddress'), vacancies: 10 + k * 3, locality: loc.id, place: s.address ? `${loc.name}, office on the first floor` : `${loc.name} (exact place not given)`,
      placeHi: s.address ? `${loc.hi}, पहली मंज़िल पर ऑफ़िस` : `${loc.hi} (सही जगह नहीं बताई)`, bring: s.bring.en, bringHi: s.bring.hi, asks: s.asks, verification: 'unknown', suspicious: true, lngLat, ...toXZ(lngLat),
    }
  })
}

const REGULAR = regularJobs()
export const JOBS = [...REGULAR, ...suspiciousJobs(REGULAR.length)]
export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`
export const payLine = (j) => `${money(j.pay)} / ${j.unit}`
