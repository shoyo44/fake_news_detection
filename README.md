# TruthGuard X

TruthGuard X is a Next.js misinformation-analysis application with Firebase Google sign-in, a CSI-style backend pipeline, a dedicated checker workspace, a saved-history dashboard, and MongoDB Atlas persistence for user records and analysis history.

## Stack

- Next.js 16 App Router
- React 19
- Firebase Authentication
- Cloudflare Workers AI
- Tavily search
- MongoDB Atlas
- Framer Motion

## Features

- Landing page with glassmorphism UI and animated investigative visual
- Protected `/checker` workspace for text, URL, and PDF verification
- CSI-style analysis pipeline with claim extraction, bias/manipulation analysis, evidence search, verdict generation, and "what really happened"
- Auto-minimizing input composer after analysis starts
- Two-column checker result layout, with evidence separated into the second column
- Protected `/dashboard` page with saved history, graphs, stored input preview, and expandable previous outputs
- About page with teammate cards
- Automatic sign-out after 5 minutes of inactivity
- Chrome extension scaffold in [`extension/`](/e:/CreateX/truthguard-x/extension)

## Environment Setup

Copy [`.env.example`](/e:/CreateX/truthguard-x/.env.example) to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `TAVILY_API_KEY`
- `CF_ACCOUNT_ID`
- `CF_API_TOKEN`
- `CF_LLM_MODEL`
- `MONGODB_URI`
- `MONGODB_DB`

Optional or secondary variables:

- `GEMINI_API_KEY`
- `NEWSAPI_KEY`
- `GNEWS_API_KEY`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` landing page
- `/login` Google sign-in page
- `/checker` dedicated fake-news checker
- `/dashboard` user history dashboard
- `/about` team page
- `/api/analyze` main verification API
- `/api/history` MongoDB-backed history API
- `/api/users/sync` MongoDB-backed user sync API

## System Architecture

### High-level flow

```text
Browser UI
  -> Firebase Auth
  -> Next.js App Router pages
  -> /api/analyze
       -> CSI backend orchestrator
            -> Cloudflare Workers AI
            -> Tavily trusted-source search
            -> Verdict synthesis
  -> /api/users/sync
       -> MongoDB Atlas users collection
  -> /api/history
       -> MongoDB Atlas users collection (embedded history)
```

### Request and persistence flow

1. A user signs in with Google through Firebase Authentication.
2. The client syncs the user profile to MongoDB through `/api/users/sync`.
3. The user submits text, a URL, or a PDF from `/checker`.
4. `/api/analyze` normalizes the input and invokes the CSI backend in [`lib/csiBackend.ts`](/e:/CreateX/truthguard-x/lib/csiBackend.ts).
5. The backend performs claim extraction, manipulation analysis, bias analysis, evidence retrieval, and final verdict generation.
6. The client saves the finished result to MongoDB through `/api/history`.
7. `/dashboard` loads the saved history from MongoDB and renders graphs plus expandable past outputs.

### Frontend structure

```text
app/
  page.tsx                 Landing page
  login/page.tsx           Login page
  checker/page.tsx         Dedicated checker page
  dashboard/page.tsx       History dashboard
  about/page.tsx           Team page
  api/analyze/route.ts     Analysis API
  api/history/route.ts     History persistence API
  api/users/sync/route.ts  User sync API

components/
  checker/CheckerWorkspace.tsx
  dashboard/*

lib/
  csiBackend.ts            Analysis orchestration
  history.ts               Client-side history API wrapper
  mongodb.ts               Atlas connection helper
  firebase.ts              Firebase client setup
```

## MongoDB Data Model

User documents are stored in the `users` collection and include:

- `uid`
- `email`
- `displayName`
- `photoURL`
- `createdAt`
- `updatedAt`
- `lastLoginAt`
- `history`

Each `history` item stores:

- `id`
- `inputType`
- `preview`
- `processedAt`
- `verdict`
- `confidence`
- `result`

## Chrome Extension

A basic Chrome extension scaffold is included in [`extension/`](/e:/CreateX/truthguard-x/extension). It can call the local `http://localhost:3000/api/analyze` endpoint from a popup UI for quick checks while the app is running locally.

To load it:

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Choose Load unpacked
4. Select [`extension/`](/e:/CreateX/truthguard-x/extension)

## Notes

- The checker and dashboard currently rely on the signed-in Firebase user on the client side; there is no Firebase Admin server-side verification in the MongoDB routes yet.
- The MongoDB-backed history is capped at 20 saved items per user.
- PDF analysis still depends on text extraction quality from `pdf-parse`.
