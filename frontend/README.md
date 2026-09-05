# 🖥️ Rate Limiter Dashboard

A minimal, Vercel-styled live demo and simulator for the [Rate Limiter as a Service](../rate-limiter-x) backend. Lets you watch, configure, and stress-test all 5 rate limiting algorithms in real time, from the browser.

🔗 **Live app:** https://rate-limiter-dashboard-rouge.vercel.app
📦 **Backend repo:** [rate-limiter-x](../rate-limiter-x)
🔗 **Backend API:** https://rate-limiter-x.onrender.com

---

## ✨ What it does

- **Service Status** — live Redis connectivity + fail-open event count, polled from `/health`
- **Algorithm switcher** — change the active rate limiting algorithm at runtime, no backend redeploy needed
- **Parameters panel** — tune capacity, refill/leak rate, or window size per algorithm, live
- **Live stats** — all-time allowed/denied counts (global, across all visitors) + per-run stats (just this simulation)
- **Request simulator** — fire 1–50 requests against any key, watch allow/deny results render as they happen
- **Light/dark mode**

---

## 🧰 Stack

React + TypeScript (Vite) · Tailwind CSS v4 · Deployed on Vercel (static hosting, no server needed)

No Docker here on purpose — this is a static frontend build; Vercel serves it directly with CDN + HTTPS for free. See the backend README for why Docker is used there but not here.

---

## 🚀 Running it locally

```bash
npm install
npm run dev
```

By default this points at `VITE_API_URL` from `.env` — copy `.env.example` first:

```bash
cp .env.example .env
```

```dotenv
# .env.example
VITE_API_URL=http://localhost:3000   # local backend, e.g. via `make up` in rate-limiter-x
```

To point at the live deployed backend instead:

```dotenv
VITE_API_URL=https://rate-limiter-x.onrender.com
```

---

## ☁️ Deploying your own copy

```bash
npm install -g vercel
vercel login
vercel
```

Set `VITE_API_URL` under **Project Settings → Environment Variables** in the Vercel dashboard, pointing at your backend's URL, then:

```bash
vercel --prod
```

---

## 📁 Structure

```
src/
├── lib/
│   ├── api.ts        # typed API client + algorithm label/param maps
│   └── theme.tsx      # light/dark context
├── components/
│   ├── StatusCard.tsx
│   ├── AlgorithmSwitcher.tsx
│   ├── ConfigPanel.tsx
│   ├── StatsCard.tsx
│   └── RequestSimulator.tsx
└── App.tsx
```
