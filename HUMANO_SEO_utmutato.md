# HUMANO – Teljes Google SEO Útmutató

**Cél:** A HUMANO megjelenjen a Google keresőben a releváns kulcsszavakra.

---

## 1. FÁJLOK – Mit töltsd fel a Vercel-re?

Az alábbi fájlokat kell feltölteni a GitHub repo gyökerébe (ahol az `index.html` is van):

| Fájl | Leírás |
|------|--------|
| `index.html` | ✅ FRISSÍTVE – teljes SEO meta tagokkal |
| `sitemap.xml` | ✅ ÚJ – Google indexeléshez szükséges |
| `robots.txt` | ✅ ÚJ – irányítja a Google botot |
| `og-image.png` | ⚠️ LÉTRE KELL HOZNI – 1200×630 px kép |

---

## 2. OG IMAGE (og-image.png) – Kötelező!

Hozz létre egy **1200 × 630 pixel** méretű képet, ami megjelenik Google/Facebook/LinkedIn megosztásnál.

**Tartalma legyen:**
- Fekete háttér
- Arany "HUMANO" szöveg nagy betűkkel
- "Az emberi alkotás digitális hitelesítője" alcím
- SHA-256 | Bitcoin blokklánc | Billentyűdinamika ikonok alul

**Ingyenes eszközök:** Canva.com → "OG Image" sablon → 1200×630 → Export PNG-ként.

Mentsd `og-image.png` névvel a repo gyökerébe.

---

## 3. GOOGLE SEARCH CONSOLE – Regisztrálj!

Ez a **legfontosabb lépés**. Nélküle a Google nem tudja, hogy létezik az oldalad.

### Lépések:
1. Nyisd meg: **https://search.google.com/search-console**
2. Kattints: "Add property"
3. Válaszd: "URL prefix" → add meg: `https://humano-hu.vercel.app/`
4. **Hitelesítés módja:** Válaszd az "HTML tag" opciót
5. Kapni fogsz egy meta taget, pl.:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXX"/>
   ```
6. Ezt illeszd be az `index.html` `<head>` részébe a többi meta tag után
7. Töltsd fel a frissített `index.html`-t
8. Menj vissza a Search Console-ba → kattints "Verify"

### Sitemap beküldése:
1. Search Console-ban: Bal oldal → "Sitemaps"
2. Add meg: `sitemap.xml`
3. Kattints "Submit"
4. Google 24-72 órán belül bejárja az oldalt

---

## 4. GOOGLE MY BUSINESS (ha van fizikai cím)

Ha van magyarországi cím (akár iroda, akár saját lakcím mint székhely), regisztrálj:
**https://business.google.com**

---

## 5. KULCSSZAVAK – Mire fog megtalálni a Google?

Az oldalad jelenleg optimalizálva van ezekre:

### Magyar kulcsszavak:
- "szöveg hitelesítés"
- "emberi írás bizonyítás"
- "AI tartalom detektálás"
- "plágium elleni védelem"
- "Bitcoin blokklánc időbélyeg"
- "kriptográfiai szöveg azonosítás"
- "digitális tanúsítvány íróknak"
- "HUMANO"
- "emberi alkotás védelme"
- "AI vs ember szöveg"

### Angol kulcsszavak (jövőbeli növekedéshez):
- "human writing authentication"
- "blockchain text timestamp"
- "AI content detection alternative"
- "keystroke dynamics writing proof"

---

## 6. INDEXELÉS ELLENŐRZÉSE

Néhány nappal a feltöltés után ellenőrizd:

### Google-ban:
Keress rá: `site:humano-hu.vercel.app`

Ha megjelenik az oldalad, indexelve van. ✅
Ha nem jelenik meg, várj még 1-2 napot, vagy küldj be URL-t manuálisan.

### Manuális indexelés kérése:
1. Search Console → "URL Inspection"
2. Add meg az URL-t: `https://humano-hu.vercel.app/`
3. Kattints: "Request Indexing"

---

## 7. TECHNIKAI SEO – Mi már be van állítva?

Az `index.html`-be bekerültek:

### ✅ Meta tagok:
- `<title>` – kulcsszóval kibővítve
- `<meta name="description">` – 160 karakter, kulcsszavakkal
- `<meta name="keywords">` – 15+ releváns kulcsszó
- `<meta name="robots" content="index, follow">` – engedélyezett indexelés
- `<link rel="canonical">` – duplikáció elkerülése
- `<meta name="language" content="Hungarian">` – magyar tartalom jelzése

### ✅ Open Graph (közösségi megosztáshoz):
- `og:title`, `og:description`, `og:image`, `og:url`, `og:locale`

### ✅ Twitter Card:
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### ✅ Schema.org strukturált adatok (JSON-LD):
- **WebApplication** – az app leírása funkcionalitással
- **Organization** – a cég/szervezet leírása
- **FAQPage** – 5 GYIK kérdés/válasz pár → ezek a Google-ban "rich snippet"-ként jelenhetnek meg
- **BreadcrumbList** – navigációs kenyérmorzsa

---

## 8. HÁTTÉRLINKS (Backlinks) – Hogyan növeld a Domain Authority-t?

A Google azokat az oldalakat rangsorolja fentebb, amelyekre más oldalak hivatkoznak.

### Ingyen megszerezhető backlinkek:
1. **Product Hunt** – add be a HUMANO-t: https://producthunt.com
2. **GitHub** – hozz létre egy nyilvános repo-t README-vel és linkkel
3. **Indie Hackers** – https://indiehackers.com – mutasd be a projekted
4. **Reddit** – r/Hungary, r/webdev, r/SideProject
5. **LinkedIn** – írj egy posztot a projektről, linkelj rá
6. **Medium / Substack** – írj cikket "Hogyan védd meg az írásaidat az AI-kortól?" témában
7. **Magyar tech blogok** – nCore fórumok, HWSW, Computerworld Hungary

---

## 9. TARTALOM STRATÉGIA – Long-tail kulcsszavak

A Google szereti a tartalmat. Fontold meg egy blog szekció hozzáadását:

### Javasolt cikkek:
- "Hogyan bizonyítsd be, hogy te írtad a szöveget?"
- "Mi az a SHA-256 hash és miért fontos az íróknak?"
- "Bitcoin blokklánc időbélyeg – mit jelent valójában?"
- "AI-generált szöveg vs emberi írás – hogyan különböztesd meg?"
- "Szerzői jog védelme a digitális korban"

---

## 10. OLDAL SEBESSÉG – Core Web Vitals

A Google a sebesség alapján is rangsorol. Ellenőrizd:
- **https://pagespeed.web.dev/** → add meg az URL-t
- Cél: 90+ pont mobilon és asztali gépen

### Gyors javítások ha lassú az oldal:
- A Google Fonts betöltése már optimalizálva van (`preconnect`)
- A JavaScript scriptek a `<body>` végén vannak → ✅

---

## 11. VERCEL KONFIGURÁCIÓ – vercel.json

A jelenlegi `vercel.json` jó, minden URL az `index.html`-re irányít.
A `robots.txt` és `sitemap.xml` közvetlen URL-ként fog működni, mert a `/` re-write előtt futnak le.

**Ellenőrizd ezeket az URL-eket deployment után:**
- `https://humano-hu.vercel.app/robots.txt`
- `https://humano-hu.vercel.app/sitemap.xml`

---

## 12. ÖSSZEFOGLALÁS – Teendők sorrendben

| # | Teendő | Sürgősség |
|---|--------|-----------|
| 1 | Töltsd fel az `index.html`, `sitemap.xml`, `robots.txt` fájlokat | 🔴 AZONNAL |
| 2 | Hozz létre `og-image.png` (1200×630 px) | 🔴 AZONNAL |
| 3 | Regisztrálj a Google Search Console-ba | 🔴 AZONNAL |
| 4 | Hitelesítési meta taget add hozzá az `index.html`-hez | 🔴 AZONNAL |
| 5 | Küldd be a sitemapet a Search Console-ban | 🟠 24 órán belül |
| 6 | Kérj manuális indexelést (URL Inspection) | 🟠 24 órán belül |
| 7 | Add be Product Hunt-ra | 🟡 1 héten belül |
| 8 | LinkedIn/Reddit poszt a projektről | 🟡 1 héten belül |
| 9 | Pagespeed ellenőrzés | 🟢 2 héten belül |
| 10 | Blog tartalom írása | 🟢 1 hónapon belül |

---

*Eredmény várható ideje: az első indexelés 24-72 óra, az első szerves találatok 2-8 hét múlva.*
