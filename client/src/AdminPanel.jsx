import { useState } from "react";
import { buyEggs } from "./api";

export default function AdminPanel({ role, refresh }) {
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const isAdmin = role === "Saswata";

  const handleBuy = async () => {
    if (!isAdmin || !qty || !price) return;

    await buyEggs(Number(qty), Number(price));
    setQty("");
    setPrice("");
    refresh();
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
      <h2 className="text-lg font-semibold mb-2 text-white">Add Purchase</h2>

      <input
        type="number"
        placeholder="Eggs Bought"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="w-full mb-2 p-2 rounded-lg bg-black/40 border border-white/10 
                   text-white placeholder-gray-400
                   focus:ring-2 focus:ring-red-500 outline-none transition"
      />

      <input
        type="number"
        placeholder="Price per Egg"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full mb-2 p-2 rounded-lg bg-black/40 border border-white/10 
                   text-white placeholder-gray-400
                   focus:ring-2 focus:ring-red-500 outline-none transition"
      />

      <button
        onClick={handleBuy}
        disabled={!isAdmin}
        className={`w-full py-2 rounded-lg font-semibold tracking-wide transition-all duration-200
          ${
            isAdmin
              ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-700/40"
              : "bg-red-600 text-white cursor-not-allowed opacity-60"
          }`}
      >
        Add
      </button>
    </div>
  );
}
