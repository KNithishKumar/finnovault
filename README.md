# FinVault – Personal Finance & Wealth Management System

FinVault is a production-ready, SaaS-grade personal finance, investment, and wealth management dashboard built on the MERN Stack. 

---

## Technical Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Redux Toolkit, Axios, Lucide Icons, React Hot Toast
- **Backend**: Node.js, Express, Mongoose, JWT Auth, Multer, PDFKit, ExcelJS, Node Cron, Helmet, Rate Limiting
- **Database**: MongoDB (Atlas or Local)

---

## Directory Structure
```
finvault/
├── backend/            # Express REST API, services (PDF/Excel), cron jobs, schemas
├── frontend/           # React dashboard, charts, states, preferences
├── docker-compose.yml  # Multi-container local orchestration (MongoDB + API + Nginx)
├── Dockerfile.backend
├── Dockerfile.frontend
└── package.json        # Root scripts to run both servers concurrently
```

---

## Feature highlights

1. **AI Insights Panel**: Evaluates historical cash flows, active saving milestones, and category budgets to suggest customized wealth recommendations.
2. **OCR Receipt Scanner**: Submits receipt photo attachments and automatically parses the merchant, amount, category, and date.
3. **Command Palette**: Press `Ctrl+K` (or `Cmd+K`) from any page to display search shortcuts, trigger transaction entry, or jump between modules.
4. **Statements Export**: Supports compiling transaction logs into PDF statements, Excel tables, or raw CSV sheets.
5. **EMI Tracker**: Dynamically computes loan EMI schedules and adjusts cash balances upon processing payments.
6. **Double-Entry Account Transfers**: Safely transfers funds between checking accounts, cash wallets, or UPI profiles with dual adjustments.

---

## Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port `27017` or Atlas URI)

### Local Configuration
1. Clone / download files to `C:\Users\nithi\.gemini\antigravity\scratch\finvault`.
2. Open terminal in the root folder.
3. Install all dependencies:
   ```bash
   npm run install-all
   ```
4. Configure `.env` in `backend/` (default values match local environments):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/finvault
   JWT_SECRET=super_secret_finvault_jwt_key_12345
   NODE_ENV=development
   ```
5. Spin up both servers concurrently:
   ```bash
   npm run dev
   ```
6. Open browser on `http://localhost:3000`.

---

## running via Docker Compose
If you prefer running in containers without installing Node dependencies locally, compile images and run:
```bash
docker-compose up --build
```
This spins up:
- **MongoDB**: `localhost:27017`
- **Backend API**: `localhost:5000`
- **Frontend React**: `localhost:80`
