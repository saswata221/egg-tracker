import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://egg-tracker-9oya.onrender.com/api",
});

// attach cheat code
export const setCheatCode = (code) => {
  API.defaults.headers["x-cheat-code"] = code;
};

// login
export const login = async (code) => {
  const res = await API.post(
    "/login",
    {},
    {
      headers: {
        "x-cheat-code": code,
      },
    },
  );
  return res.data;
};

// summary
export const getSummary = () => API.get("/summary");

// add consumption
export const addConsumption = (count, date) =>
  API.post("/consume", { count, date });

// admin buys eggs
export const buyEggs = (quantity, pricePerEgg) =>
  API.post("/buy", { quantity, pricePerEgg });

// reset
export const resetSystem = () => API.post("/reset");

// stats
export const getStats = () => API.get("/stats");

// get specific day data
export const getDayData = (date) => API.get(`/day/${date}`);

export default API;
