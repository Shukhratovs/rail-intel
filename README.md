# 🚄 Rail Intel

O'zbekiston Temir Yo'llari marshrutlari bo'yicha haftalik poyezd reyslari monitoringi.

## Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL (serverless)
- **Hosting**: Vercel
- **Data source**: eticket.railway.uz API
- **Scheduler**: Vercel Cron (har dushanba 06:00)

---

## 🚀 GitHub va Vercel'ga joylashtirish

### 1. GitHub reponi yarating

```bash
# Loyiha papkasiga o'ting
cd rail-intel

# Git'ni ishga tushiring
git init
git add .
git commit -m "Initial commit: Rail Intel dashboard"

# GitHub'da yangi repo yarating (github.com → New repository → "rail-intel")
# Keyin quyidagini bajaring:
git remote add origin https://github.com/YOUR_USERNAME/rail-intel.git
git branch -M main
git push -u origin main
```

### 2. Vercel'ga ulang

1. [vercel.com](https://vercel.com) ga kiring
2. **"Add New Project"** tugmasini bosing
3. GitHub'dagi `rail-intel` reponi tanlang
4. **Environment Variables** bo'limiga quyidagilarni qo'shing:

| O'zgaruvchi | Qiymat |
|---|---|
| `DATABASE_URL` | Neon console'dan olingan connection string |
| `CRON_SECRET` | Tasodifiy maxfiy so'z (masalan: `openssl rand -hex 32`) |

5. **Deploy** tugmasini bosing ✅

### 3. Database jadvallarini yarating

```bash
# Lokal muhitda bir marta ishga tushiring
npm install
npm run db:push
```

### 4. Birinchi sinxronlashni boshlang

Vercel'ga deploy qilingandan so'ng:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Yoki dashboard'dagi **"Hozir sinxronlash"** tugmasini bosing.

---

## 🔄 Avtomatik sinxronlash

`vercel.json` dagi sozlama har dushanba soat 06:00 (UTC) da `/api/sync` endpointini avtomatik chaqiradi:

```json
{
  "crons": [{ "path": "/api/sync", "schedule": "0 6 * * 1" }]
}
```

Vercel Hobby rejasida kunlik 1 ta cron, Pro rejasida cheksiz cron mavjud.

---

## 📡 API Endpointlar

| Method | Endpoint | Tavsif |
|---|---|---|
| `GET` | `/api/routes` | Barcha marshrut ma'lumotlari |
| `GET` | `/api/routes?from=Toshkent` | Filtr bo'yicha |
| `POST` | `/api/sync` | Qo'lda sinxronlash |
| `GET` | `/api/sync` | Oxirgi sinxronlash holati |

---

## 🗄 Database Schema

```sql
CREATE TABLE route_snapshots (
  id           SERIAL PRIMARY KEY,
  from_station TEXT NOT NULL,
  to_station   TEXT NOT NULL,
  total_count  INT  NOT NULL DEFAULT 0,
  afrosiyob    INT  NOT NULL DEFAULT 0,
  sharq        INT  NOT NULL DEFAULT 0,
  tezkor       INT  NOT NULL DEFAULT 0,
  yolovchi     INT  NOT NULL DEFAULT 0,
  week_start   DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env.local
# .env.local faylini to'ldiring
npm run dev
```

`http://localhost:3000` da ochiladi.
