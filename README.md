# Smart OD Management System

A robust, location-aware full-stack web application designed for university campuses to manage event attendance seamlessly.

## 🚀 Features

- **Role-based Authentication** (`student`, `lead`, `faculty`) using JWT.
- **Dynamic Event Creation**: Define radius, duration, and exact GPS coordinates.
- **Real-Time GPS Engine**:
  - Heartbeat-based polling with automatic battery-saving adjustment.
  - Haversine formula distance verification.
- **Server-Authoritative Anti-Cheat**:
  - `node-cron` sweeps for offline drops and idle expiries.
  - Multi-tab session invalidation.
  - 180km/h spoofing detection (sudden GPS jump flagging).
- **Responsive Dashboard UI**: Tailwind CSS styled components.

## 🛠️ Tech Stack
- Frontend: React + Vite + Tailwind CSS v4 + Lucide React
- Backend: Node.js + Express + Mongoose + node-cron
- Database: MongoDB

## 📦 How to Run

1. Open a terminal to run the backend engine:
```bash
cd server
npm install
node server.js
```

2. Open a second terminal to serve the React UI:
```bash
cd client
npm install
npm run dev
```

*Note: Ensure you have a local MongoDB instance running at `mongodb://localhost:27017` or set your MongoDB Atlas URI in `server/.env`.*
