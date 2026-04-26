# Min Økonomi Coach – TODO & Roadmap

**Seneste opdatering:** 26. april 2026  
**Projekt:** https://github.com/MattOMadsen/Min-konomi-Coach

---

## 🎯 Overordnet vision
En personlig økonomi-coach der hjælper danskere med at få **ro i økonomien** gennem smart import, visualisering, AI-rådgivning og løbende opfølgning.

**Mål:** Blive den bedste danske app til privatøkonomi – både gratis og Pro-version.

---

## 🔴 Høj prioritet (Næste 1-2 uger)

- [ ] **Edit Transaction** – Mulighed for at redigere eksisterende transaktioner (modal + gem ændringer)
- [ ] **Date Range Filter med presets** – "Sidste 30 dage", "Denne måned", "Sidste 3 måneder", "Hele perioden", brugerdefineret
- [ ] **Bedre mobil-responsivt design** – Mange komponenter skal optimeres til mobil (især FilterSection, BudgetVisualizer, MainContent)
- [ ] **Rigtig Grok API integration** – Erstat simuleret AI med rigtig Grok (via `useGrokAI.ts`)
- [ ] **Forbedret PDF-eksport** – Inkluder grafer, top-kategorier, budget-analyse og opsparingsforslag
- [ ] **Bank-parsere – udvidelse**
  - [ ] Tilføj Nykredit / Totalkredit
  - [ ] Tilføj Realkredit Danmark
  - [ ] Tilføj Arbejdernes Landsbank
  - [ ] Tilføj Lån & Spar Bank
  - [ ] Tilføj Vestjysk Bank
  - [ ] Tilføj Merkur Bank
  - [ ] Forbedre "Ukendt bank"-parser (auto-gæt format)

---

## 🟡 Mellem prioritet (Næste 3-6 uger)

- [ ] **Pie Chart / Donut Chart i BudgetVisualizer** – Rigtig interaktiv pie chart (Recharts eller SVG)
- [ ] **Bedre Dark Mode** – Fix kontrastproblemer (især tekst, knapper og tabeller)
- [ ] **Flere kategorier + smartere spareforslag** – Undgå dårlige råd (f.eks. "spar på husleje")
- [ ] **SmartInsights** – Gør den mere konkret og handlingsorienteret
- [ ] **BudgetGoals** – Mulighed for at sætte og følge personlige mål med fremskridt
- [ ] **Recurring Transactions** – Bedre auto-detektering + påmindelser
- [ ] **Forbedret AIChat** – Proaktiv coaching (f.eks. "Jeg har lagt mærke til...")
- [ ] **Onboarding flow** – Guidet introduktion første gang brugeren åbner appen

---

## 🟢 Lavere prioritet (Senere)

- [ ] Premium animations & loading states (føles dyrt og poleret)
- [ ] Bedre fejlhåndtering + lokal fallback til AI-coachen
- [ ] **Export til Excel (xlsx)** – Pænere layout, formatering og summer
- [ ] **Firebase Auth + Firestore** – Brugerregistrering, login og sky-synkronisering
- [ ] Automatisk månedlig rapport (PDF + email)
- [ ] Push-notifikationer (PWA)
- [ ] Familie-deling / delt budget
- [ ] Skatte-rapport (årsopgørelse klar til SKAT)

---

## 💰 Monetisering & Pro-version (Plan)

### Gratis (Light)
- Begrænset antal uploads
- 5 AI-beskeder pr. måned
- Grundlæggende visualisering og filtre

### Pro (49–69 kr/måned eller 490–690 kr/år)
- Ubegrænset alt
- Avanceret AI (Grok)
- Pie charts, detaljerede rapporter
- BudgetGoals + Recurring detection
- PDF-rapporter med grafer
- Bank-synkronisering (fremtid)
- Prioriteret support

**Alternativ:** Lifetime Pro for engangsbeløb (f.eks. 899 kr)

---

## 🛠 Teknisk gæld & Forbedringer

- [ ] Tilføj **Recharts** eller **Chart.js** til rigtige grafer
- [ ] Bedre TypeScript-typer (især i parsers)
- [ ] Tilføj **Zod** + React Hook Form til alle formularer
- [ ] Forbedre `categorizeTransaction` (regel-baseret + lærende)
- [ ] Tilføj unit tests til parserne
- [ ] Optimér PWA (offline support, bedre manifest)

---

## 📋 Seneste commits & ændringer

- **26. april 2026** – "Masser af forbedringer" (AIChat forbedringer, FilterSection UI, MainContent oprydning)
- **26. april 2026** – "Mange forbedringer" (BudgetVisualizer, nye komponenter, dark mode)
- **19. april 2026** – Setup + grundlæggende struktur

---

**Denne fil opdateres løbende.**  
Når en opgave er færdig, sæt [x] og skriv dato + commit-hash.

**Næste trin:** Vælg en opgave fra Høj prioritet og begynd at implementere!

---

*Sidst redigeret: 26. april 2026 af MattOMadsen + Grok*
