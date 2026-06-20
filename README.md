<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,6,30&height=180&section=header&text=Restaurant+Management&fontSize=50&fontColor=000000&fontAlignY=38&desc=Next.js+restaurant+dashboard+for+orders%2C+POS%2C+inventory%2C+staff%2C+and+reports&descAlignY=58&descSize=14&animation=fadeIn" width="100%"/>

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-FED7AA?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)
![TypeScript](https://img.shields.io/badge/TypeScript-App+Router-BFDBFE?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)
![Storage](https://img.shields.io/badge/Storage-Upstash+Redis-BBF7D0?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)
![Email](https://img.shields.io/badge/Email-Resend+OTP-FBCFE8?style=for-the-badge&labelColor=1a1a1a&logoColor=1a1a1a)

</div>

<div align="center">
<i>A practical restaurant back office with menu management, table layout, kitchen display, inventory, staff login, and reporting in one place.</i>
</div>

---

## Features

| Feature | What it does |
| --- | --- |
| Admin dashboard | Manage orders, menu items, tables, inventory, staff, settings, and reports. |
| Customer menu | Public menu page for browsing items and placing orders. |
| OTP login | Email-based login flow backed by Resend and Redis session storage. |
| Seed data | One API route fills Redis with sample categories, tables, menu items, and inventory. |
| Modern UI | Next.js, TypeScript, Tailwind CSS, Radix components, Recharts, and Framer Motion. |

---

## Download and Run

```powershell
git clone https://github.com/0xnurrabby/restaurant-management.git
cd restaurant-management
npm install
copy NUL .env.local            # Windows: creates an empty env file
npm run dev
```

Open `http://localhost:3000`. Admin pages live under `/admin`.

---

## Setup

Create `.env.local` in the project root:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
RESEND_API_KEY=your_resend_api_key
MAIN_ADMIN_EMAILS=you@example.com
```

Then seed demo data after the server is running:

```bash
curl -X POST http://localhost:3000/api/seed
```

On Windows without `curl`, open PowerShell and run:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/seed
```

---

## Project Structure

```text
restaurant-management/
  app/                  -> App Router pages, admin screens, API routes
  app/api/seed/         -> demo data seeder for Redis
  components/           -> shared UI components
  lib/                  -> auth, Redis, seed data, types, helpers
  public/               -> static assets
  package.json          -> scripts and dependencies
```

---

## Notes

- Use Node.js 20 or newer for the smoothest Next.js 16 setup.
- The app expects Redis and Resend env vars before OTP login can work.
- Do not commit `.env.local`; it contains live service credentials.

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,6,30&height=90&section=footer" width="100%"/>

<p align="center">
  <sub>MIT License unless noted otherwise. Built by <a href="https://github.com/0xnurrabby">0xnurrabby</a>.</sub>
</p>
