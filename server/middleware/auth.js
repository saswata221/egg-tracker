const roles = {
  [process.env.CODE_ADMIN]: "Saswata",
  [process.env.CODE_SASWATA]: "Saswata",
  [process.env.CODE_TUSHAR]: "Tushar",
  [process.env.CODE_SWAPNIL]: "Swapnil",
};

function auth(req, res, next) {
  const code = req.headers["x-cheat-code"];

  if (!code || !roles[code]) {
    req.role = "guest";
  } else {
    req.role = roles[code];
  }

  next();
}

module.exports = auth;
