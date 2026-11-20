<h1 align="center">💊 FEFO Pharma Stock</h1>

<p align="center">
  Batch and expiry control for a pharmaceutical warehouse, with <strong>FEFO picking suggestions</strong>.<br>
  Plain HTML, CSS and JavaScript — no frameworks, no back-end.
</p>

<p align="center">
  <a href="https://celsojr011.github.io/fefo-pharma-stock/"><img src="https://img.shields.io/badge/Live%20demo-GitHub%20Pages-0f766e?style=for-the-badge&logo=github" alt="Live demo"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Tests-node%3Atest-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node test runner">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="MIT License">
</p>

---

## Why I built this

I work in operations at a distribution center that ships medicines to pharmacies. In this kind of warehouse, the expiry date matters more than almost anything else: a box that sits on the shelf for too long turns into a loss, and a box that leaves with only a few days of shelf life left usually comes back as a return.

That's why pharma warehouses work with **FEFO — First Expired, First Out**. It sounds simple, but when the same product has five or six batches spread across different locations, deciding *which* batch to pick (and which ones to leave behind) is exactly where mistakes happen.

So I built a small tool around that one decision: look at the batches in stock, show what is getting close to expiry, and tell the picker which batches to take for an order.

> ⚠️ All products, batches, quantities and locations here are **fictional**. Nothing comes from a real company.

---

## Features

**Stock overview**
- Summary cards: total batches, units, expired, critical, warning, blocked and cold chain batches
- Table sorted in FEFO order — what is on top is what should leave first
- Color-coded status for each batch
- Search by product, batch or SKU, and filter by status
- ❄ tag for cold chain products (2–8 °C)

**Picking suggestion**
- Choose a product and a quantity, get the list of batches to pick (quantity + location)
- Skips expired batches, blocked batches and batches too close to expiry to ship
- Shows what was skipped and why
- Warns when there isn't enough stock to fill the order

**Receiving**
- Add a new batch (SKU, product, batch, expiry, quantity, location, storage)
- Refuses duplicated batch numbers and batches that are already expired
- Block / release a batch (quality hold, damaged packaging, recall…)

**Other**
- Data saved in the browser (`localStorage`)
- "Reset sample data" button to start over
- Responsive layout
- Unit tests for the business rules

---

## How it works

### 1. Status of a batch

Each batch gets a status based on how many days are left until it expires:

| Status | Rule (default) | What it means in practice |
|---|---|---|
| 🔴 Expired | less than 0 days | Can't be shipped. Goes to the loss/disposal process. |
| 🟠 Critical | up to 30 days | Needs to leave first — or it will become a loss. |
| 🟡 Warning | up to 90 days | Still fine, but worth keeping an eye on. |
| 🟢 OK | more than 90 days | Normal stock. |
| ⚫ Blocked | manual | On hold. Can't be picked, whatever the date. |

"Blocked" is checked before anything else. A batch on quality hold shouldn't leave the warehouse even if its expiry date is great.

The thresholds live in one object (`DEFAULT_RULES` in `js/fefo.js`), because every operation and every customer works with different numbers.

### 2. FEFO order

Batches are sorted by **expiry date** (not by arrival date — that would be FIFO). When two batches expire on the same day, the one with **fewer units comes first**. That way, half-empty positions get cleared instead of leaving small leftovers spread all over the warehouse.

### 3. Picking suggestion

When you ask for, say, 450 units of a product:

1. The app gets every batch of that SKU that still has stock.
2. It removes the ones that can't go out:
   - **expired**
   - **blocked**
   - **short shelf life** — not expired yet, but with less than the minimum remaining days (30 by default). In real life, stores often refuse products that are about to expire, so shipping them just creates a return.
3. It sorts what's left by FEFO.
4. It takes units from the first batch, then the next one, until the quantity is complete.
5. If the stock runs out first, it tells you how many units are missing.

Example with the sample data:

```
Order: 450 × Dipyrone 500mg

1. Take 300 from batch L24C311 at A-02-01 (expires in ~75 days)
2. Take 150 from batch L25A042 at A-02-04 (expires in ~240 days)

Skipped: L24A118 (expired), L24B207 (too close to expiry to ship)
```

### 4. Dates and time zones

This one cost me a failing test. In JavaScript, `new Date('2026-03-10')` is read as **midnight UTC**. Here in Brazil (UTC-3), that becomes 9 PM on March 9th — so a batch could show one day less than it really has. The fix was to read `YYYY-MM-DD` strings as **local dates** and compare only calendar days, ignoring the time. I ran the tests with both `TZ=UTC` and `TZ=America/Sao_Paulo` to make sure.

---

## Technical decisions

- **Business rules separated from the screen.** `js/fefo.js` has no DOM code, so it runs in the browser *and* in Node. That made the tests easy to write.
- **No framework.** For a project this size, vanilla JS keeps the logic visible. React would be my next step if the app grew (more screens, shared state).
- **Sample data relative to today.** Expiry dates are calculated from the current date. With fixed dates, the demo would slowly turn into a screen full of expired batches.
- **`localStorage` with a fallback.** If the browser blocks storage, the app just uses the sample data instead of breaking.
- **Escaping user input.** Anything typed in the form goes through `escapeHtml` before being shown in the table.

---

## Project structure

```
fefo-pharma-stock/
├── index.html          # Single page: summary, picking, stock table, receiving form
├── css/
│   └── style.css       # Layout, status colors, responsive rules
├── js/
│   ├── fefo.js         # Business rules: status, FEFO sorting, picking, summary
│   ├── sample-data.js  # Fictional batches, dates relative to today
│   └── app.js          # Screen: rendering, events, localStorage
├── tests/
│   └── fefo.test.js    # Unit tests for the rules (node:test)
├── package.json
└── LICENSE
```

---

## Running locally

The app uses ES modules, so it needs to be served (opening `index.html` directly from the file system won't load the scripts).

```bash
git clone https://github.com/CelsoJr011/fefo-pharma-stock.git
cd fefo-pharma-stock

# any static server works
python3 -m http.server 8000
# or
npx serve .
```

Then open **http://localhost:8000**.

### Running the tests

Requires Node.js 18+ (no dependencies to install):

```bash
npm test
```

---

## What I learned

- FEFO is easy to explain and easy to get wrong in code — the edge cases (blocked batches, ties, short shelf life, not enough stock) are where the real rules are.
- Dates in JavaScript need care, especially outside UTC.
- Keeping the rules in pure functions made testing much simpler than testing through the screen.
- Showing *why* something was skipped is as important as showing what to pick. A picker trusts a suggestion more when the reason is visible.

---

## Next steps

- [ ] Different minimum shelf life per customer
- [ ] Temperature log for cold chain batches, with alerts for excursions outside 2–8 °C
- [ ] Batch movement history (received, picked, blocked, released)
- [ ] Import / export CSV
- [ ] Rewrite the screen in React + TypeScript
- [ ] Simple back-end (Node + SQLite) so more than one person can use it

---

## 🇧🇷 Resumo em português

Ferramenta de controle de lotes e validade para um centro de distribuição de medicamentos. Ela mostra o status de cada lote (vencido, crítico, atenção, ok, bloqueado) e sugere a separação de pedidos seguindo o **FEFO** (o que vence primeiro sai primeiro). Na sugestão, ela ignora lotes vencidos, bloqueados ou com validade curta demais para enviar à loja. Feito com HTML, CSS e JavaScript puro, com testes das regras de negócio. Os dados são fictícios.

---

## License

MIT — see [LICENSE](LICENSE).

## Author

**Celso de Azevedo Rodrigues Junior**
Logistics Operations · Data · IT Support | Building with JavaScript and TypeScript

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/celso-j-a25688153)
[![GitHub](https://img.shields.io/badge/GitHub-CelsoJr011-181717?style=flat&logo=github&logoColor=white)](https://github.com/CelsoJr011)
