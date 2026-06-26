# 🚀 Mini AI SDR — Sales Development Representative App

A full-stack AI-powered SDR (Sales Development Representative) application built with **Next.js**, **FastAPI**, **PostgreSQL**, **OpenAI**, and **Google Gemini**.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register/login with bcrypt hashed passwords |
| 👥 **Lead Management** | Create, view, update, delete leads with full detail pages |
| 🤖 **AI Lead Qualification** | OpenAI GPT-3.5 scores leads 0–100 with reasoning |
| ✉️ **AI Email Generation** | Gemini generates personalized outreach emails |
| 📊 **Analytics Dashboard** | Pipeline stats with Recharts bar + pie charts |
| 🗃️ **PostgreSQL Storage** | Relational data with SQLAlchemy ORM |

---

## 🏗️ Tech Stack

```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS + Recharts
Backend:   Python FastAPI + SQLAlchemy + JWT (python-jose) + Passlib
Database:  PostgreSQL
AI:        OpenAI GPT-3.5 (qualification) + Google Gemini 1.5 Flash (email gen)
Auth:      JWT Bearer tokens
```

---

## 📁 Project Structure

```
mini-ai-sdr/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # DB connection & session
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── auth_utils.py        # JWT helpers & password hashing
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── routes/
│       ├── auth.py          # /api/auth/* endpoints
│       ├── leads.py         # /api/leads/* endpoints
│       └── ai.py            # /api/ai/* endpoints
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Root (redirect)
│   │   │   ├── login/page.tsx      # Login page
│   │   │   ├── register/page.tsx   # Register page
│   │   │   ├── dashboard/page.tsx  # Analytics dashboard
│   │   │   └── leads/
│   │   │       ├── page.tsx        # Leads list
│   │   │       ├── new/page.tsx    # Create lead
│   │   │       └── [id]/page.tsx   # Lead detail + AI actions
│   │   ├── components/
│   │   │   └── Sidebar.tsx         # Navigation sidebar
│   │   ├── lib/
│   │   │   └── api.ts              # Axios API client
│   │   └── types/
│   │       └── index.ts            # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.js
│
├── database/
│   └── schema.sql           # PostgreSQL DDL + seed data
│
├── postman/
│   └── Mini_AI_SDR.postman_collection.json
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (for lead qualification)
- Google Gemini API key (for email generation)

---

### 1. Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE mini_sdr_db;
\q

# Run schema
psql -U postgres -d mini_sdr_db -f database/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL, SECRET_KEY, OPENAI_API_KEY, GEMINI_API_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Leads
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads/` | List all leads (with search/filter) |
| POST | `/api/leads/` | Create new lead |
| GET | `/api/leads/stats` | Get pipeline statistics |
| GET | `/api/leads/{id}` | Get lead by ID |
| PUT | `/api/leads/{id}` | Update lead |
| DELETE | `/api/leads/{id}` | Delete lead |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/qualify` | AI qualify lead (OpenAI) |
| POST | `/api/ai/generate-email` | Generate personalized email (Gemini) |

---

## 🤖 AI Integration Details

### Lead Qualification (OpenAI GPT-3.5)
Analyzes lead data and returns:
- **Score** (0–100)
- **Status**: qualified / unqualified / needs_nurturing
- **Reason**: 2–3 sentence explanation
- **Key factors**: top 3 influencing factors

Fallback: if OpenAI key is absent, uses Gemini.

### Email Generation (Google Gemini 1.5 Flash)
Generates personalized outreach with:
- **Tone options**: professional, friendly, direct, consultative
- **Custom focus**: specific value proposition or pain point
- Auto-saves subject + body to lead record

---

## 📮 Postman Collection

Import `postman/Mini_AI_SDR.postman_collection.json` into Postman.

1. Set `base_url` variable to `http://localhost:8000`
2. Run **Register** or **Login** — token is auto-saved to `{{token}}`
3. All authenticated requests use `{{token}}` automatically

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (cost factor 12)
- JWT tokens expire in **24 hours** (configurable)
- All lead endpoints are **user-scoped** (users only see their own leads)
- Change `SECRET_KEY` in production to a random 64-char string

---

## 🚀 Production Deployment

```bash
# Backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend
npm run build
npm start
```

For production, use:
- **Render / Railway** for FastAPI backend
- **Vercel** for Next.js frontend
- **Supabase / Neon / Railway** for PostgreSQL

---

## 📊 Screenshots

> Add screenshots of:
> 1. Login page
> 2. Dashboard with charts
> 3. Leads list table
> 4. Lead detail with AI qualification score
> 5. Generated email panel

---

## 🧑‍💻 Author

Built as part of the **AI SDR Intern Technical Assessment**.

- **Stack**: React + Next.js · FastAPI · PostgreSQL · OpenAI · Gemini · JWT
- **Time**: ~20 hours
