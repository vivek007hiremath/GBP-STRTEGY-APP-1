# GBPUSD Backtest Research System

Offline-first GBPUSD London Session backtesting app. Built with React + Vite + IndexedDB + Recharts.

## Features

- **Trade Entry** — Log every backtest trade with 32 fields matching your handwritten strategy
- **Trade Log** — Searchable, sortable table with advanced multi-condition filter panel
- **Filter Presets** — Save common filter combinations (Grade A + FVG + Strong Momentum, etc.)
- **Analytics** — Cumulative R curve, result distribution, win rate by every factor
- **Edge Discovery** — Factor comparison table ranking which conditions genuinely improve edge
- **Daily Accountability** — Persistent daily reports saved in IndexedDB
- **Hypothesis Parking Lot** — Track observations, unlock isolated 100-trade tests at 5 hits
- **Strategy Blueprint** — Your full GBPUSD Asia Sweep + MSS strategy reference
- **Import / Export** — CSV and JSON export, full backup restore

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/gbpusd-backtest/

## Build

```bash
npm run build
```

Output in `dist/` — ready for GitHub Pages or any static host.

## GitHub Pages Deployment


### One-time setup

1. Create a GitHub repo named `gbpusd-backtest`
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/gbpusd-backtest.git
git push -u origin main
```
3. In your repo: **Settings → Pages → Source: GitHub Actions**
4. The `.github/workflows/deploy.yml` handles everything automatically

### Auto-deploy
Every push to `main` triggers a build and deploys to:
```
https://YOUR_USERNAME.github.io/gbpusd-backtest/
```

## Data Storage

All data is stored in your **browser's IndexedDB** — no backend, no login, no API.

- Works completely offline after first load
- Data stays in the browser on the device you use
- Use **Settings → Export Full Backup** regularly
- Import backup on any new device

## Tech Stack

| | |
|---|---|
| Framework | React 18 + Vite 4 |
| Storage | IndexedDB via `idb` |
| Charts | Recharts |
| Styling | Inline styles (zero config) |
| Deployment | GitHub Pages |

## Project Structure

```
src/
├── App.jsx                     Main app, tab routing, state
├── main.jsx
├── lib/
│   ├── constants.js            Colors, field options, defaults
│   ├── db.js                   IndexedDB layer (trades, screenshots, presets, hypotheses, reports)
│   ├── calculations.js         Stats, filter engine, edge discovery, chart data
│   └── export.js               CSV + JSON export/import
└── components/
    ├── ui.jsx                  Shared primitives (Card, Btn, Input, Toggle, Modal…)
    ├── TradeEntry.jsx          Full 7-section trade logging form
    ├── TradeLog.jsx            Sortable table + advanced filter panel + preset system
    ├── TradeDetail.jsx         Full trade detail modal with screenshot
    ├── Analytics.jsx           Stats cards + 12 Recharts charts
    ├── EdgeDiscovery.jsx       Factor comparison + combination analysis
    ├── StrategyBlueprint.jsx   Full strategy reference from your notes
    ├── DailyAccountability.jsx Persistent daily report with 7 sections
    ├── HypothesisParkingLot.jsx 9 seeded ideas + counter + add new
    └── Settings.jsx            Import / Export / Backup / Clear
```

## Trading Strategy Summary

- **Setup:** Asia High or Low gets swept in London session
- **Confirmation:** 15M CHOCH / MSS after the sweep
- **Entry:** Opposite to the sweep direction
- **Session:** London Only 07:00–10:30 GMT (primary)
- **Filters:** HTF (1H) bias aligned + DXY confirms + No news ±15min
- **SL:** Beyond sweep extreme OR beyond invalidation structure — never moved
- **TP:** Model A = 1:2 fixed / Model B = Opposite Asia liquidity

## Backtesting Decision Thresholds

| Trades | Action |
|--------|--------|
| 50 | Checkpoint only — no decisions |
| 100 | Checkpoint — assess Grade A/B/C split |
| 300 | Decision gate: PF ≥ 1.4 → proceed to demo |
| 300 | PF < 1.2 → review strategy rules |
