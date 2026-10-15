# Ergon v2 — Beyond the Waiting Line

Ergon (ἔργον, "work, the deed done") is a frontend concept for India's roadside hawkers and daily-wage workers: masons, painters, electricians, plumbers, carpenters, helpers, housekeeping and loading crews. Many of them wait at a labour **naka** each morning. Ergon doesn't ask them to stop going. It meets them there, keeps a record of their work and puts the terms on the table before anyone commits.

It is told as an ancient-Greek museum with an Apple-style interface. You push Sisyphus' boulder uphill, follow the day's work down into an amphora, and turn the vase. Four gods keep four tools, and each tool opens as a full page in the **agora**.

All data is mock data and stays in your browser. Ergon never contacts an employer, reserves work, verifies anyone or files anything.

## Run

```sh
npm install
npm run dev          # http://localhost:5173
npm run check        # every headless check suite
npm run build
```

## The journey

| Where | What happens |
|---|---|
| The climb (`#top`) | The original Sisyphus climb, chrome ball and ink-printed story. Fogged copy keeps it readable over the paint. |
| The vase (`#record`) | The descent into the amphora and the painted frieze, then four chapters, each with a compact working tool. |
| The frieze | The nine painted workers are **chapter-aware controls**. In Hermes' chapter, touching one shows that trade's work nearby. In Hephaestus' it starts your card in that trade. In Themis' it puts that worker's usual offer on the scales. In Athena's it finds schemes for their kind of work. Outside the chapters, touching a worker opens their record. The glowing spots on the vase repaint with each chapter's icon. |
| The tools (`#tools`) | A rotating sculpture gallery: the caduceus, the bronze tablet, the balance and the owl. Each links to its full page. |

## The agora pages

| Route | Keeper | What a worker can do |
|---|---|---|
| `#map` | Α Hermes | Find work on a pitched 3D city, where glass flowers are jobs and stoas are nakas. Filter by trade, day, distance and public or private work, and count distance from your naka. Every listing has a **trust seal** (Clear terms / Ask first / Warning), icon-first terms, explained red flags, questions to ask (sent on WhatsApp by you), sample payment reports, save, a 30-minute local hold, report, listen and share. |
| `#naka/<id>` | Α Hermes | A big-type board for one naka: today's jobs picked up nearby, peak hours and amenities, read-aloud, local check-in, safety tiles and a printable poster. |
| `#passport` | Β Hephaestus | A guided **work passport** covering trade, skills, experience, languages, availability, your naka, rate, photos and a voice intro. It is drawn on a bronze tablet and downloads as a PNG. The **work diary** records days worked, paid or unpaid, on an amphora shelf, and unpaid days become a wage reminder. You can share the card as text, or show it full-screen to a contractor. |
| `#scales` | Γ Themis | Weigh an offer on the live 3D balance. **Read a forwarded job message** to pull out the pay, fee, hours and warning signs. Browse the warning signs, and make a bilingual **terms slip** both sides can keep. |
| `#athena` | Δ Athena | Possibly relevant **schemes**, each showing why, what papers it needs and where to go. A **document pouch** shows readiness. **Money owed** builds a reminder from your diary. **Complaint steps** go from a written reminder up to the labour office, Samadhan and legal aid. **Helplines** are tap-to-call. |
| `#post-work` | Hermes' herald | Employers post work through a three-step flow with a live listing preview and Themis' seal. Posting requires a fair-work commitment. |
| `#book-work/<id>` · `#profiles` | — | Workers request work and follow a status timeline. Employers accept, decline or complete requests. Completed work adds an employer-confirmed day to the worker's diary, and the worker can say whether pay arrived on time. |

## Trust, honestly

`src/domain/trust.js` checks each listing for upfront fees, OTP or ID-photo requests, retention of original ID, overseas visa charges, missing addresses, pay only after weeks of work, unpaid trials, pressure or secrecy, pay far above or below the usual rate, and very long days. Unknown terms become questions to ask, not reassurance. The seal is a reason to ask, never a guarantee. Eight sample listings are deliberately suspicious so the checks have something to catch. The message reader understands English, Hindi and Hinglish.

Pay comparisons use **sample benchmarks**, not legal minimum wages. Scheme results are **potentially relevant** and never an eligibility decision. Each scheme links to its official source with the date it was checked.

## 3D

- `src/world/myth-models.js` holds the original procedural Hermes, Hephaestus, Athena, Sisyphus, temples, trees and gates.
- `src/world/agora-models.js` holds procedural sculptures for this version: a votive tool for each of the eight trades, the naka stoa, a coin stack, a papyrus scroll, grievance temple steps, an amphora shelf, Hermes the herald, a laurel crown, a shield seal and a kouros.
- The map draws jobs as glass flowers and places as sculptures inside MapLibre's WebGL context.
- Every page keeps its sculpture in a lit museum niche (`src/agora-app/Hero3D.jsx`). The niche mounts on view, renders at a frame budget, rests when reduced motion is set, and falls back to painted art without WebGL.

## Code map

```
src/Story.jsx, engine.js, Ball.jsx   the climb (unchanged experience)
src/vase/                             the hall, frieze modes (frieze.js), exhibits
src/agora-app/                        shell, design system, icons, 3D niche, pages/
src/domain/                           stores and rules: jobs, trust, card, diary, rights, offers, marketplace
src/hermes/jobs.js, nakas.js          seeded sample work and the six nakas
scripts/check-*.mjs                   headless checks (npm run check)
```

## Boundaries

Places marked illustrative are not real addresses. Real offices link to their official pages. Helpline numbers were checked on 15 October 2026; confirm them on official sites. Browser speech, camera, microphone and geolocation depend on the device. Saved data lives only in this browser, and every tool can clear its own draft.
