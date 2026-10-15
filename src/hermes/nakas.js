// Labour nakas: the roadside corners where workers already wait to be hired.
// Ergon meets people there instead of asking them to stop going. These are
// illustrative hiring points placed at real junction names; the crowd sizes,
// hours and amenities are sample observations, not a survey.
import { distanceKm } from '../domain/geo.js'

export const NAKAS = [
  {
    id: 'naka-marol', name: 'Marol Naka', hi: 'मरोल नाका', lngLat: [72.8794, 19.1083],
    peak: '6:30 – 9:30 am', peakHi: 'सुबह 6:30 – 9:30', waiting: 140, trades: ['mason', 'helper', 'carpenter', 'painter'],
    amenities: { water: true, shade: true, tea: true, toilet: false },
    note: 'The busiest morning corner in the sample. Contractors pull up along the bus stop side.',
    noteHi: 'नमूने में सुबह का सबसे व्यस्त नाका। ठेकेदार बस स्टॉप की ओर रुकते हैं।',
  },
  {
    id: 'naka-sakinaka', name: 'Saki Naka junction', hi: 'साकीनाका जंक्शन', lngLat: [72.8866, 19.1033],
    peak: '7:00 – 10:00 am', peakHi: 'सुबह 7 – 10', waiting: 110, trades: ['loading', 'helper', 'mason'],
    amenities: { water: true, shade: false, tea: true, toilet: true },
    note: 'Warehouse and tempo work. Night loading crews also gather after 9 pm.',
    noteHi: 'गोदाम और टेम्पो का काम। रात 9 के बाद लोडिंग के लोग भी जमा होते हैं।',
  },
  {
    id: 'naka-chakala', name: 'Chakala corner', hi: 'चकाला कॉर्नर', lngLat: [72.8612, 19.1112],
    peak: '7:30 – 10:00 am', peakHi: 'सुबह 7:30 – 10', waiting: 60, trades: ['painter', 'electrician', 'plumber'],
    amenities: { water: false, shade: true, tea: true, toilet: false },
    note: 'Shop owners and interior firms look for painters and electricians here.',
    noteHi: 'दुकानदार और इंटीरियर फ़र्म यहाँ पेंटर और बिजली मिस्त्री ढूँढते हैं।',
  },
  {
    id: 'naka-jbnagar', name: 'JB Nagar circle', hi: 'जेबी नगर सर्कल', lngLat: [72.8679, 19.1052],
    peak: '7:00 – 9:00 am', peakHi: 'सुबह 7 – 9', waiting: 45, trades: ['housekeeping', 'helper', 'plumber'],
    amenities: { water: true, shade: true, tea: false, toilet: false },
    note: 'Households and housing societies hire for the day; many workers are women.',
    noteHi: 'घर और सोसाइटी दिन भर के काम के लिए बुलाते हैं; कई कामगार महिलाएँ हैं।',
  },
  {
    id: 'naka-station', name: 'Andheri East station naka', hi: 'अंधेरी पूर्व स्टेशन नाका', lngLat: [72.8492, 19.1187],
    peak: '6:00 – 9:00 am', peakHi: 'सुबह 6 – 9', waiting: 120, trades: ['mason', 'carpenter', 'helper', 'loading'],
    amenities: { water: true, shade: true, tea: true, toilet: true },
    note: 'Workers arriving by the first trains wait outside the east exit.',
    noteHi: 'पहली ट्रेनों से आने वाले कामगार पूर्वी गेट के बाहर रुकते हैं।',
  },
  {
    id: 'naka-midc', name: 'MIDC Central Road', hi: 'एमआईडीसी सेंट्रल रोड', lngLat: [72.8702, 19.1196],
    peak: '8:00 – 10:30 am', peakHi: 'सुबह 8 – 10:30', waiting: 70, trades: ['electrician', 'loading', 'housekeeping', 'carpenter'],
    amenities: { water: false, shade: false, tea: true, toilet: false },
    note: 'Factory units hire for shifts; ask for the unit number before you go in.',
    noteHi: 'फ़ैक्टरी यूनिट पाली के लिए बुलाती हैं; अंदर जाने से पहले यूनिट नंबर पूछें।',
  },
]

export const nakaOf = (id) => NAKAS.find((n) => n.id === id) ?? null

// The naka a job is most likely picked up from: the nearest one within 1.6 km.
export function nearestNaka(lngLat) {
  let best = null, bestD = 1.6
  for (const n of NAKAS) {
    const d = distanceKm(n.lngLat, lngLat)
    if (d < bestD) { best = n; bestD = d }
  }
  return best
}

export const jobsAtNaka = (id, jobs) => jobs.filter((j) => nearestNaka(j.lngLat)?.id === id)
