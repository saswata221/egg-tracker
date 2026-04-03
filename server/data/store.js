const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "eggs.json");

// Read data
function readData() {
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

// Write data
function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };
