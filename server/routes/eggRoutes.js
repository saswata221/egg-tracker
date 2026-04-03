const express = require("express");
const router = express.Router();
const { readData, writeData } = require("../data/store");

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
  const data = readData();
  const users = ["Saswata", "Tushar", "Swapnil"];

  const existing = data.consumption[req.params.date] || {};

  const day = {};
  users.forEach((u) => {
    day[u] = existing[u] || 0;
  });

  res.json(day);
});

// User adds today's consumption
router.post("/consume", (req, res) => {
  const { count, date } = req.body;

  const today = new Date().toISOString().slice(0, 10);

  // Only admin can edit past days
  if (req.role !== "Saswata" && date !== today) {
    return res.status(403).send("You can only edit today's data");
  }

  const data = readData();

  const users = ["Saswata", "Tushar", "Swapnil"];

  if (!data.consumption[date]) {
    data.consumption[date] = {};
    users.forEach((u) => (data.consumption[date][u] = 0));
  }

  if (
    req.role !== "Saswata" && // admin can override
    data.consumption[date][req.role] &&
    data.consumption[date][req.role] > 0
  ) {
    return res.status(400).send("You already added consumption today");
  }

  // Save entry
  data.consumption[date][req.role] = Number(count);

  writeData(data);

  res.send("Consumption Added");
});

// Admin buys eggs
router.post("/buy", (req, res) => {
  if (req.role !== "Saswata") {
    return res.status(403).send("Admin only");
  }

  const { quantity, pricePerEgg } = req.body;

  const data = readData();

  data.pricePerEgg = pricePerEgg;
  data.inventory.push({
    date: new Date().toISOString().slice(0, 10),
    bought: quantity,
  });

  writeData(data);

  res.send("Inventory Added");
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
