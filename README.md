# Komplettering – Avancerad fullstackutveckling

## Projektstruktur

```
startkod/
  api/         Express-backend (Node.js)
  frontend/    React-frontend (Vite)
  docker-compose.yml
  .env.example
.github/
  workflows/
    ci.yml     CI/CD-pipeline
```

---

## Köra lokalt med Docker

Kräver Docker Desktop.

```bash
cd startkod
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost
- API: http://localhost:3000
- Hälsokontroll: http://localhost:3000/health

### Köra utan Docker

```bash
# Terminal 1 – API
cd startkod/api && npm install && npm start

# Terminal 2 – Frontend
cd startkod/frontend && npm install && npm run dev
```

---

## Tjänster

| Tjänst | Teknik | Port |
|---|---|---|
| `api` | Express + Node.js | 3000 |
| `frontend` | React + Vite + nginx | 80 |

Frontend-containern kör nginx som reverse-proxar `/api/` → `http://api:3000/` internt, så webbläsaren aldrig behöver känna till backend-hostnamnet direkt.

---

## Tester

```bash
# Backend (Jest + Supertest)
cd startkod/api && npm test

# Frontend (Vitest + Testing Library)
cd startkod/frontend && npm test
```

---

## Driftsatt app

| Tjänst | URL |
|---|---|
| Frontend (Netlify) | https://rococo-hummingbird-4deb3f.netlify.app |
| Backend (Render) | https://avancerad-fullstack-komplettering.onrender.com |
| Hälsokontroll | https://avancerad-fullstack-komplettering.onrender.com/health |

---

## CI/CD-pipeline

Fil: `.github/workflows/ci.yml`

**Triggers:** Alla pushar och pull requests på alla branches.

**Jobb:**

| Jobb | Vad händer |
|---|---|
| `test-api` | `npm ci` + `npm test` för backend |
| `test-frontend` | `npm ci` + `npm test` + `npm run build` för frontend |
| `deploy` | Triggar Render deploy hook via curl – **körs bara vid push till `main` och kräver att test-jobben är gröna** |
| `codeql` | Statisk säkerhetsanalys med GitHub CodeQL |
| `docs` | Genererar `openapi.json` med swagger-jsdoc och laddar upp som artefakt |

npm-cachen cachar `node_modules` mellan körningar via `actions/setup-node` med `cache: npm`, vilket gör att installationssteget går snabbare vid upprepade körningar.

Netlify deployas automatiskt vid push till `main` via sin egen GitHub-koppling.

---

## Loggning

API:et loggar varje inkommande request med tidsstämpel:
```
[2026-04-30T10:00:00.000Z] GET /
```

Loggar visas i realtid under **Logs**-fliken i Render-dashboarden. Om något går fel efter en deploy är det första steget att öppna loggen och leta efter felmeddelanden eller 500-svar.

---

## API-dokumentation

Genereras automatiskt i pipelinen med `swagger-jsdoc` från JSDoc-annotationer i `index.js`. Finns som nedladdningsbar artefakt (`openapi-spec`) under varje Actions-körning.

---

## Reflektion

### 1. Varför Docker och docker-compose?

Docker gör att appen beter sig likadant oavsett om den körs på min dator, en kollegas eller en server i molnet. Utan Docker kan skillnader i Node-version eller systeminställningar göra att något fungerar lokalt men kraschar i produktion.

Att ha två separata tjänster i docker-compose istället för en monolitisk container ger tydlig separation – frontend och backend kan starta om, skalas och deployas oberoende av varandra. Det speglar också hur det ser ut i produktion, där Render kör API:et och Netlify kör frontend var för sig.

### 2. Vad händer i CI/CD-pipelinen när du pushar?

När jag pushar till main startar tre jobb parallellt: backend-tester, frontend-tester + build, och CodeQL-analys. Om alla går igenom triggas deploy-jobbet som skickar en HTTP-request till Renders deploy hook, vilket startar en ny byggprocess på Render. Netlify plockar upp ändringen via sin GitHub-koppling och bygger om frontend.

Deploy ska bara ske om testerna är gröna för att inte riskera att trasig kod hamnar i produktion. Om ett test faller vet man att något är fel och det är bättre att ta reda på det innan användarna påverkas.

### 3. Loggning och felsökning

API:et loggar varje request med metod, path och tidsstämpel. Render samlar dessa loggar och visar dem i realtid i dashboarden. Om en deploy går igenom men något ändå är fel – t.ex. att frontend visar ett felmeddelande – är nästa steg att öppna Render-loggen och se om API:et tar emot requests och om det dyker upp några fel. Det gick faktiskt att felsöka CORS-problemet på det sättet: API:et svarade med 200 men webbläsaren blockerade svaret, vilket syntes i konsolen.

### 4. Prestandaåtgärd

Jag valde tre åtgärder: in-memory cache på `GET /` (5 sekunders TTL), `Cache-Control: public, max-age=60` på `/health`, och npm-cache i GitHub Actions. In-memory-cachen valdes för att `GET /` annars skapar ett nytt objekt vid varje request – med cache returneras samma svar under 5 sekunder utan onödig CPU-användning. npm-cachen i CI gör att `npm ci` hoppar över nätverksnedladdning om `package-lock.json` inte ändrats, vilket sparar 20–30 sekunder per körning.

### 5. CodeQL i pipelinen

CodeQL är GitHubs egna verktyg för statisk kodanalys. Det skannar koden efter kända säkerhetsproblem som SQL-injektion, XSS och osäker användning av kryptografi. Steget körs parallellt med testerna och resultaten visas under Security → Code scanning i repot.

En begränsning är att CodeQL kräver Advanced Security för privata repon, vilket är en betald funktion. Det orsakade en del problem under setup. För ett litet projekt som detta är det lite överkurs, men det är standardverktyget i professionella pipelines och värt att känna till.

### 6. Automatisk API-dokumentation

Om dokumentationen skrivs för hand är risken stor att den snabbt blir inaktuell – det är lätt att glömma uppdatera den när en endpoint ändras. Genom att generera `openapi.json` direkt från annotationerna i koden är dokumentationen alltid synkroniserad med det faktiska beteendet. Den publiceras som artefakt i varje pipeline-körning, vilket gör att man alltid kan ladda ner dokumentationen för exakt den version som är i produktion.
 bygga och driftsätta en fullstack-app