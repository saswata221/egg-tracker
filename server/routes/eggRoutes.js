const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../data/store");

const USERS = ["Saswata", "Tushar", "Swapnil"];

function isISODateString(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function parseNonNegNumber(n) {
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v) || v < 0) return null;
  return v;
}

function parseNonNegInt(n) {
  const v = parseNonNegNumber(n);
  if (v === null) return null;
  if (!Number.isInteger(v)) return null;
  return v;
}

router.post("/login", (req, res) => {
  const role = req.role;

  if (!role || role === "guest") {
    return res.status(401).json({
      success: false,
      message: "Invalid access code",
    });
  }

  res.json({
    success: true,
    role,
  });
});
// Get data of a specific day
router.get("/day/:date", (req, res) => {
  const date = req.params.date;
  if (!isISODateString(date)) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  const data = readData();

  const existing = data.consumption[date] || {};

  const day = {};
  USERS.forEach((u) => {
    day[u] = existing[u] || 0;
  });

  res.json(day);
});

// User adds today's consumption
router.post("/consume", (req, res) => {
  const { count, date } = req.body;
  if (!isISODateString(date)) {
    return res.status(400).send("Invalid date format");
  }

  const inc = parseNonNegInt(count);
  if (inc === null) {
    return res.status(400).send("Invalid count");
  }

  const today = new Date().toISOString().slice(0, 10);

  // Only admin can edit past days
  if (req.role !== "Saswata" && date !== today) {
    return res.status(403).send("You can only edit today's data");
  }

  const data = readData();

  if (!data.consumption[date]) {
    data.consumption[date] = {};
    USERS.forEach((u) => (data.consumption[date][u] = 0));
  }

  if (!USERS.includes(req.role)) {
    return res.status(403).send("Guests cannot add consumption");
  }

  // Save entry (allow multiple submissions per day; accumulate)
  const current = Number(data.consumption[date][req.role]) || 0;
  data.consumption[date][req.role] = current + inc;

  writeData(data);

  res.send("Consumption Added");
});

// Admin buys eggs
router.post("/buy", (req, res) => {
  if (req.role !== "Saswata") {
    return res.status(403).send("Admin only");
  }

  const { quantity, pricePerEgg } = req.body;
  const qty = parseNonNegInt(quantity);
  const price = parseNonNegNumber(pricePerEgg);
  if (qty === null || qty <= 0) return res.status(400).send("Invalid quantity");
  if (price === null) return res.status(400).send("Invalid price per egg");

  const data = readData();

  data.pricePerEgg = price;
  data.inventory.push({
    date: new Date().toISOString().slice(0, 10),
    bought: qty,
  });

  writeData(data);

  res.send("Inventory Added");
});

// Admin edits any day's consumption for any user(s)
router.post("/admin/day", (req, res) => {
  if (req.role !== "Saswata") {
    return res.status(403).send("Admin only");
  }

  const { date, consumption } = req.body || {};
  if (!isISODateString(date)) {
    return res.status(400).send("Invalid date format");
  }

  if (!consumption || typeof consumption !== "object") {
    return res.status(400).send("Invalid consumption payload");
  }

  const next = {};
  for (const u of USERS) {
    const v = parseNonNegInt(consumption[u]);
    if (v === null) return res.status(400).send(`Invalid ${u} count`);
    next[u] = v;
  }

  const data = readData();
  if (!data.consumption[date]) data.consumption[date] = {};
  for (const u of USERS) data.consumption[date][u] = next[u];

  writeData(data);
  res.send("Day updated");
});

// Summary
router.get("/summary", (req, res) => {
  const data = readData();

  const totalBought = data.inventory.reduce((a, b) => a + b.bought, 0);

  let personTotals = {
    Saswata: 0,
    Tushar: 0,
    Swapnil: 0,
  };

  Object.values(data.consumption).forEach((day) => {
    Object.entries(day).forEach(([person, count]) => {
      if (personTotals[person] !== undefined) {
        personTotals[person] += count;
      }
    });
  });

  const totalEaten = Object.values(personTotals).reduce((a, b) => a + b, 0);

  const price = data.pricePerEgg;

  const billSplit = {};
  Object.entries(personTotals).forEach(([person, eggs]) => {
    billSplit[person] = eggs * price;
  });

  res.json({
    totalBought,
    totalEaten,
    remaining: totalBought - totalEaten,
    pricePerEgg: price,
    personTotals,
    billSplit,
  });
});
// ADMIN RESET (clear all records)
router.post("/reset", (req, res) => {
  if (req.role !== "Saswata") {
    return res.status(403).send("Admin only");
  }

  const freshData = {
    pricePerEgg: 0,
    inventory: [],
    consumption: {},
  };

  writeData(freshData);

  res.send("System reset successful");
});

// Get last 7 days stats (STRICT + SAFE)
router.get("/stats", (req, res) => {
  const data = readData();

  const users = ["Saswata", "Tushar", "Swapnil"];

  const result = [];

  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const dateStr =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");

    const dayData = data.consumption[dateStr] || {};

    const entry = { date: dateStr };

    users.forEach((user) => {
      entry[user] = Number(dayData[user]) || 0;
    });

    result.push(entry);
  }

  res.json(result);
});

module.exports = router;
