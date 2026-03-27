# Smart OD Management System

A robust, location-aware full-stack web application designed for university campuses to manage event attendance seamlessly.

### 🔴 Live Demos
- **🎓 Student Portal:** [https://smart-events-attendance.vercel.app](https://smart-events-attendance.vercel.app)
- **⚙️ Admin Portal:** [https://smart-od-admin.vercel.app](https://smart-od-admin.vercel.app/)

---

## 🚀 Features

- **Dual-Portal Sandbox Architecture**: The system is physically split into two separate React applications (`client` for students, `admin` for faculty). This aggressively mitigates cross-role attacks and optimizes frontend bundle sizes.
- **CSV Identity Whitelisting**: Faculty can natively upload memory-safe `.csv` files mapping standard-issue Student Admission Numbers to Emails, dynamically granting or grey-listing UI controls strictly to pre-approved cohorts globally.
- **Dynamic Event Creation**: Define radius, duration, and exact GPS coordinates on an interactive Google Map.
- **Real-Time GPS Engine**:
  - Heartbeat-based polling with automatic battery-saving validation.
  - Haversine formula distance bounding arrays.
- **Server-Authoritative Anti-Cheat**:
  - `node-cron` sweeps for offline drops and idle expiries.
  - Multi-tab session caching constraints.
  - 180km/h spoofing detection (sudden GPS jump flagging).
- **Responsive Dashboard UI**: Tailwind CSS.

## 🛠️ Tech Stack
- Frontend: React + Vite + Tailwind CSS + Lucide React
- Backend: Node.js + Express + Mongoose + node-cron
- Parsers: `multer` + `csv-parser`
- Database: MongoDB Core / Atlas
- Hosting: Vercel Serverless

## 📦 How to Run Locally

You must run all three micro-architectures simultaneously:

**1. API Engine**
```bash
cd server
npm install
node server.js
```
*Requires a `.env` with `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, and `EMAIL_PASS`.*

**2. Student Client (Port 5173)**
```bash
cd client
npm install
npm run dev
```

**3. Faculty Admin (Port 5174)**
```bash
cd admin
npm install
npm run dev
```
