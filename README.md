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
| `#map` | Α Hermes | A full-screen 3D city where glass flowers are jobs and stoas are nakas. Filters sit in a glass bar along the top: trade, day, distance, private or public work, distance from your naka, and hide warnings. Each job shows pay, start, hours, payday, distance and a **trust seal** (Clear terms / Ask first / Warning), its most serious red flag, and three actions: weigh it, save it, listen. |
| `#naka/<id>` | Α Hermes | A big-type board for one naka: the stoa, peak hours, people waiting, amenities, the work picked up nearby, read-aloud, "I am here today" and a printable board. |
| `#passport` | Β Hephaestus | **Card**: a seven-step, icon-first builder over the live bronze tablet that ends in a PNG, a full-screen "show to employer" view and WhatsApp. **Diary**: days worked, paid or unpaid, shown on an amphora shelf. Money owed goes straight to Athena. |
| `#scales` | Γ Themis | **Check an offer** on the live 3D balance. **Read a message**: paste a forwarded job message to pull out the pay, fee, hours and warning signs. |
| `#athena` | Δ Athena | **Schemes**: possibly relevant schemes with tap-to-mark papers. **Money owed**: a reminder built from your diary. **Get help**: complaint steps on the 3D temple stairs and tap-to-call helplines. |
| `#post-work` | Hermes' herald | Employers post work in three steps, with a live listing preview, Themis' seal and a required fair-work commitment. |
| `#book-work/<id>` · `#profiles` | — | Workers request work and follow its status. Employers accept, decline or complete it. Completed work adds an employer-confirmed day to the worker's diary. |

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
