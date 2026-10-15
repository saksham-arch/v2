// Rights answers, the document pouch and the wage-reminder draft. Answers are
// questions to check with an official desk; they never decide eligibility.
import { createLocalStore, isObject, isText } from './storage.js'
import { SCHEMES } from './schemes.js'

export const RIGHTS_DEFAULTS = { age: 34, work: 'construction', income: 'low', aadhaar: 'unknown', bank: 'unknown', coverage: 'unknown', employer: '', days: '', rate: '', draft: '', ready: false }
export const rightsStore = createLocalStore('rights', RIGHTS_DEFAULTS, (x) =>
  isObject(x) && isText(x.employer, 120) && isText(x.draft, 12000) && Number(x.age) >= 14 && Number(x.age) <= 75 &&
  ['construction', 'vending', 'domestic', 'other'].includes(x.work) && ['low', 'high'].includes(x.income) &&
  ['aadhaar', 'bank', 'coverage'].every((k) => ['yes', 'no', 'unknown'].includes(x[k])) && ['days', 'rate'].every((k) => isText(x[k], 20)))

// The papers most worker schemes and boards ask for. No numbers are stored.
export const DOCUMENTS = [
  { id: 'aadhaar', en: 'Aadhaar card', hi: 'आधार कार्ड', tip: 'Keep a photocopy. Never hand over the original or share the OTP.', tipHi: 'फ़ोटोकॉपी रखें। असली कार्ड न दें, ओटीपी न बताएँ।' },
  { id: 'mobile', en: 'Mobile linked to Aadhaar', hi: 'आधार से जुड़ा मोबाइल', tip: 'Most online registration sends an OTP to this number.', tipHi: 'ज़्यादातर ऑनलाइन पंजीकरण इसी नंबर पर ओटीपी भेजते हैं।' },
  { id: 'bank', en: 'Bank passbook or account', hi: 'बैंक पासबुक या खाता', tip: 'A Jan Dhan account works for many schemes.', tipHi: 'कई योजनाओं में जन धन खाता चलता है।' },
  { id: 'ration', en: 'Ration card', hi: 'राशन कार्ड', tip: 'Often used to find a family in health-cover lists.', tipHi: 'स्वास्थ्य सूची में परिवार ढूँढने में अक्सर काम आता है।' },
  { id: 'photo', en: 'Passport-size photos', hi: 'पासपोर्ट साइज़ फ़ोटो', tip: 'Carry two or three for forms.', tipHi: 'फ़ॉर्म के लिए दो-तीन साथ रखें।' },
  { id: 'age', en: 'Proof of age', hi: 'उम्र का प्रमाण', tip: 'School certificate, Aadhaar or a birth certificate.', tipHi: 'स्कूल प्रमाणपत्र, आधार या जन्म प्रमाणपत्र।' },
  { id: 'address', en: 'Proof of address', hi: 'पते का प्रमाण', tip: 'A light bill, rent agreement or Aadhaar with the current address.', tipHi: 'बिजली बिल, किराया अनुबंध या नए पते वाला आधार।' },
  { id: 'work90', en: '90-day work certificate', hi: '90 दिन के काम का प्रमाणपत्र', tip: 'For construction boards: signed by a contractor, builder or officer. Your Ergon diary helps you remember the dates.', tipHi: 'निर्माण बोर्ड के लिए: ठेकेदार, बिल्डर या अधिकारी के हस्ताक्षर। एर्गोन डायरी से तारीखें याद रहती हैं।' },
  { id: 'vending', en: 'Vending certificate or letter', hi: 'वेंडिंग प्रमाणपत्र या पत्र', tip: 'From your urban local body or town vending committee.', tipHi: 'नगर निकाय या टाउन वेंडिंग समिति से।' },
  { id: 'eshram', en: 'e-Shram card', hi: 'ई-श्रम कार्ड', tip: 'Free registration for unorganised workers. A CSC can help.', tipHi: 'असंगठित कामगारों के लिए मुफ़्त पंजीकरण। सीएससी मदद कर सकता है।' },
]

// Which papers each scheme usually asks for (a checklist to confirm, not a rule).
export const SCHEME_DOCS = {
  eshram: ['aadhaar', 'mobile', 'bank'],
  bocw: ['age', 'address', 'photo', 'work90', 'aadhaar', 'bank'],
  pmsym: ['aadhaar', 'bank', 'mobile'],
  svanidhi: ['vending', 'aadhaar', 'bank', 'mobile'],
  pmsby: ['bank', 'aadhaar'],
  pmjjby: ['bank', 'aadhaar'],
  pmjay: ['aadhaar', 'ration'],
}

export const docsStore = createLocalStore('documents', { have: {} }, (x) => isObject(x) && isObject(x.have) && Object.entries(x.have).every(([k, v]) => DOCUMENTS.some((d) => d.id === k) && typeof v === 'boolean'))

export function readiness(schemeId, have) {
  const need = SCHEME_DOCS[schemeId] ?? []
  const got = need.filter((id) => have[id])
  return { need, got, missing: need.filter((id) => !have[id]), share: need.length ? got.length / need.length : 1 }
}

export const schemeById = (id) => SCHEMES.find((s) => s.id === id)

// Real national helplines. Numbers were checked on 15 October 2026; confirm
// on the official site before relying on one.
export const HELPLINES = [
  { id: 'emergency', number: '112', en: 'Emergency (police, fire, ambulance)', hi: 'आपातकाल (पुलिस, आग, एम्बुलेंस)', icon: 'alert' },
  { id: 'cyber', number: '1930', en: 'Cyber fraud — money lost to a scam', hi: 'साइबर धोखाधड़ी — ठगी में पैसे गए', icon: 'shield' },
  { id: 'women', number: '181', en: 'Women helpline', hi: 'महिला हेल्पलाइन', icon: 'people' },
  { id: 'child', number: '1098', en: 'Child helpline — child labour', hi: 'चाइल्ड हेल्पलाइन — बाल मज़दूरी', icon: 'heart' },
  { id: 'eshram', number: '14434', en: 'e-Shram registration help', hi: 'ई-श्रम पंजीकरण सहायता', icon: 'doc' },
  { id: 'pmjay', number: '14555', en: 'Ayushman Bharat (PM-JAY) health cover', hi: 'आयुष्मान भारत (पीएम-जय) स्वास्थ्य कवर', icon: 'heart' },
]

// The grievance ladder: climb only as far as you need to.
export const LADDER = [
  { id: 'remind', icon: 'scroll', en: 'Remind in writing', hi: 'लिखकर याद दिलाएँ', body: 'Send the employer a short, polite message with the days, rate and amount. Keep a copy. Many payments arrive here.', bodyHi: 'नियोक्ता को दिन, दर और रकम के साथ छोटा, विनम्र संदेश भेजें। एक प्रति रखें। कई भुगतान यहीं हो जाते हैं।', bring: 'Your diary dates and any messages', bringHi: 'डायरी की तारीखें और संदेश', action: 'wages' },
  { id: 'together', icon: 'people', en: 'Go with others', hi: 'दूसरों के साथ जाएँ', body: 'Ask co-workers who were on the same site, a naka elder, a union or a workers’ organisation to come with you. Employers listen to a group.', bodyHi: 'उसी साइट के साथियों, नाके के बुज़ुर्ग, यूनियन या कामगार संगठन को साथ ले जाएँ। नियोक्ता समूह की बात सुनते हैं।', bring: 'Names of witnesses', bringHi: 'गवाहों के नाम' },
  { id: 'office', icon: 'building', en: 'Labour office', hi: 'श्रम कार्यालय', body: 'File a written complaint at the labour office for your area. It is free. Ask for a receipt or inward number.', bodyHi: 'अपने क्षेत्र के श्रम कार्यालय में लिखित शिकायत दें। यह मुफ़्त है। रसीद या आवक नंबर माँगें।', bring: 'Printed reminder, diary, ID copy', bringHi: 'छपी याद-दिहानी, डायरी, पहचान की कॉपी', place: 'labour' },
  { id: 'online', icon: 'eye', en: 'Online grievance', hi: 'ऑनलाइन शिकायत', body: 'The central Samadhan portal accepts some labour disputes online; check whether yours fits and which office it goes to.', bodyHi: 'केंद्रीय समाधान पोर्टल कुछ श्रम विवाद ऑनलाइन लेता है; जाँचें कि आपका मामला उसमें आता है और किस कार्यालय में जाएगा।', bring: 'Mobile number, the facts in order', bringHi: 'मोबाइल नंबर, क्रम से तथ्य', link: 'https://samadhan.labour.gov.in/' },
  { id: 'court', icon: 'themis', en: 'Legal aid and labour court', hi: 'कानूनी सहायता और श्रम न्यायालय', body: 'Legal services authorities give free legal help to many unorganised workers. A lawyer can tell you whether to go to the labour court.', bodyHi: 'विधिक सेवा प्राधिकरण कई असंगठित कामगारों को मुफ़्त कानूनी मदद देते हैं। वकील बताएगा कि श्रम न्यायालय जाना है या नहीं।', bring: 'Everything above', bringHi: 'ऊपर का सब कुछ', place: 'legal-aid' },
]
