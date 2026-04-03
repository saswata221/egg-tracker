# 🥚 Egg Tracker

A full-stack web application to track daily egg consumption, inventory, and cost distribution among multiple users — built with a focus on clean UI, real-time tracking, and simplicity (no database).

---

## 🌐 Live Demo

👉 https://egg-tracker-pi.vercel.app

---

## 🚀 Features

* 📅 **Daily Tracking**
  Track egg consumption per day using an interactive calendar.

* 👥 **Multi-User Support**
  Supports multiple users (Saswata, Tushar, Swapnil).

* 📊 **Interactive Dashboard**
  Beautiful animated charts showing consumption trends.

* 🧾 **Automatic Bill Splitting**
  Calculates individual cost based on total consumption.

* 🛒 **Inventory Management (Admin)**
  Add purchased eggs and update price per egg.

* 🔐 **Role-Based Access**

  * Admin → full control
  * Users → daily entry
  * Guest → read-only

* ⚡ **Smooth UI/UX**

  * Glassmorphism design
  * Animated background
  * Micro-interactions

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Custom Canvas Chart

### Backend

* Node.js
* Express.js
* File-based storage (JSON)

### Deployment

* Frontend → Vercel
* Backend → Render

---

## 📂 Project Structure

```
egg-tracker/
│
├── client/        # React frontend
│   ├── src/
│   └── public/
│
├── server/        # Express backend
│   ├── routes/
│   ├── middleware/
│   └── data/
│
└── README.md
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/egg-tracker.git
cd egg-tracker
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
node server.js
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## ⚠️ Notes

* This project uses **file-based storage (JSON)** instead of a database.
* Render free tier may cause **initial delay (~10–20 sec)** on first request.
* Authentication is simplified using access codes for demo purposes.

---
## 👨‍💻 Author

**Saswata Mahato**

* GitHub: https://github.com/saswata221

---

