# MySpace – Personal Dashboard

[![Live Demo](https://img.shields.io/badge/Vercel-Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://myspace-zeta-eight.vercel.app/)

> **Live Deployment:** [https://myspace-zeta-eight.vercel.app/](https://myspace-zeta-eight.vercel.app/)

A modern, secure personal productivity dashboard built with **React + Vite** (frontend) and **Node.js + Express** (backend), deployable on **GitHub + Vercel**.

## ✨ Features

- 🔐 **Google OAuth 2.0** — real authentication with server-side token verification
- ✅ **Tasks** — add, edit, delete, complete with priorities and due dates
- 📝 **Notes** — rich text notes with autosave
- 🎯 **Daily Goals** — daily intentions that auto-reset every morning
- 📅 **Calendar** — monthly view with task overlays and upcoming list
- 🌙 **Dark/Light Mode** — theme preference saved to localStorage
- 🔒 **Account-namespaced storage** — `myspace_user_{sub}_*` isolates each Google account's data
- 📱 **Responsive** — works on desktop and mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or later
- A Google Cloud project with OAuth credentials

---

## 🔧 Google Cloud OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application**
6. Set **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://your-vercel-project.vercel.app
   ```
7. Set **Authorized redirect URIs:** (leave blank for GIS implicit flow)
8. Click **Create** and copy your **Client ID** and **Client Secret**

---

## 🛠 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/myspace.git
cd myspace
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=generate_with_node_-e_"console.log(require('crypto').randomBytes(64).toString('hex'))"
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

### 3. Create the frontend environment file

```bash
cd client
cp .env.example .env.local   # or create manually:
echo "VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com" > .env.local
```

### 4. Install dependencies

```bash
# Backend (from project root)
npm install

# Frontend
cd client && npm install
```

### 5. Run both servers

**Terminal 1 — Backend (port 3001):**
```bash
# From project root
node api/index.js
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: MySpace dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/myspace.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **New Project** → Import your GitHub repository
3. Vercel auto-detects the `vercel.json` configuration
4. Set **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `SESSION_SECRET` | A long random secret (64+ chars) |
| `NODE_ENV` | `production` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID (same value) |

5. Click **Deploy**

### 3. Update Google OAuth Origins

After deployment, add your Vercel URL to the **Authorized JavaScript origins** in Google Cloud Console:
```
https://your-project.vercel.app
```

---

## 📁 Project Structure

```
myspace/
├── api/                      # Node.js backend (Vercel serverless)
│   ├── index.js              # Express app entry point
│   ├── routes/
│   │   └── auth.js           # Authentication routes
│   └── middleware/
│       └── auth.js           # Auth middleware
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   ├── pages/            # Route-level page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/          # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useTasks.js
│   │   │   ├── useNotes.js
│   │   │   └── useGoals.js
│   │   ├── utils/            # Helper utilities
│   │   │   ├── storage.js    # Namespaced localStorage
│   │   │   ├── quotes.js
│   │   │   └── dates.js
│   │   ├── App.jsx           # Routes
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   └── package.json
├── .env.example              # Environment template
├── .gitignore
├── package.json              # Backend dependencies
├── vercel.json               # Vercel configuration
└── README.md
```

---

## 🔐 Authentication Architecture

```
Browser           Frontend (React)       Backend (Node.js)      Google
   │                    │                      │                   │
   │   Click Sign In    │                      │                   │
   │───────────────────>│                      │                   │
   │                    │  GIS popup / prompt  │                   │
   │                    │─────────────────────────────────────────>│
   │                    │        ID Token credential               │
   │                    │<─────────────────────────────────────────│
   │                    │  POST /api/auth/google                   │
   │                    │  { credential: "..." }                   │
   │                    │─────────────────────>│                   │
   │                    │                      │  Verify token     │
   │                    │                      │──────────────────>│
   │                    │                      │  Token payload    │
   │                    │                      │<──────────────────│
   │                    │  { user, session }   │                   │
   │                    │<─────────────────────│ Set HTTP-only     │
   │                    │                      │ session cookie    │
   │   Redirect /dashboard                     │                   │
   │<───────────────────│                      │                   │
```

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Token verification | `google-auth-library` on the backend |
| Session storage | `express-session` with signed HTTP-only cookie |
| Cookie security | `httpOnly`, `secure` (prod), `sameSite` |
| Session fixation | `session.regenerate()` on login |
| CORS | Whitelist-based, credentials enabled |
| Input validation | Content-Type check, credential type validation |
| Data namespacing | Google `sub` ID prevents account cross-contamination |
| Secret exposure | `GOOGLE_CLIENT_SECRET` never sent to browser |

---

## 🗄 LocalStorage Schema

Each user's data is stored under their Google `sub` ID:

```
myspace_user_{sub}_tasks      → Task[]
myspace_user_{sub}_notes      → Note[]
myspace_user_{sub}_goals      → Goal[]
myspace_user_{sub}_goals_last_reset → "YYYY-MM-DD"
myspace_theme                 → "light" | "dark"  (not user-scoped)
```

---

## 🧪 Development Tips

- Backend runs on port **3001**, frontend on **5173**
- Vite proxies `/api` requests to the backend in development
- In production, Vercel routes `/api/*` to the serverless function
- Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate a SESSION_SECRET

---

## 📝 License

MIT

