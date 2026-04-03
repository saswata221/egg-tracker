import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { addConsumption, getSummary } from "./api";
import AdminPanel from "./AdminPanel";

// ===== Load Lordicon script once =====
if (
  !document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]')
) {
  const script = document.createElement("script");
  script.src = "https://cdn.lordicon.com/lordicon.js";
  document.head.appendChild(script);
}

// ===== EggSelector Component =====
function EggSelector({ isGuest, selectedDate, onSuccess }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selected === null || isGuest || loading) return;
    setLoading(true);
    try {
      await addConsumption(Number(selected), selectedDate.format("YYYY-MM-DD"));
      await onSuccess();
      setSelected(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = isGuest || loading;
  const saveDisabled = isDisabled || selected === null || submitted;

  return (
    <div className="mt-4 pb-4">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => !isDisabled && setSelected(n)}
            disabled={isDisabled}
            className={`flex-1 py-3 rounded-lg text-lg font-bold transition-all duration-150
              ${isDisabled ? "opacity-50 cursor-not-allowed bg-white/5" : "cursor-pointer"}
              ${
                selected === n
                  ? "bg-green-600 text-white scale-105 shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
          >
            {n}
          </button>
        ))}

        {/* Save / Submitted Button */}
        <button
          onClick={handleSubmit}
          disabled={saveDisabled}
          className={`px-5 py-3 rounded-lg font-semibold text-sm whitespace-nowrap
            transition-all duration-300
            ${
              submitted
                ? "bg-green-500 text-white scale-105 shadow-lg shadow-green-500/40"
                : saveDisabled
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 text-white cursor-pointer"
            }`}
          style={{ minWidth: "96px" }}
        >
          {loading ? "..." : submitted ? "✅ Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ===== Stat Card — plays exactly one loop per hover =====
const StatCard = ({ title, value, iconSrc }) => {
  const iconRef = useRef(null);

  const playOnce = () => {
    const el = iconRef.current;
    if (!el) return;

    const player = el.playerInstance;

    // If player not ready yet, retry shortly
    if (!player) {
      setTimeout(playOnce, 100);
      return;
    }

    // Reset
    player.seek(0);

    // Remove old listener (avoid stacking)
    player.removeEventListener("complete", handleComplete);

    // Add listener for one loop
    player.addEventListener("complete", handleComplete);

    player.play();
  };

  const handleComplete = () => {
    const player = iconRef.current?.playerInstance;
    if (!player) return;

    player.pause(); // stop looping
    player.seek(0); // reset to start
  };

  return (
    <div
      onMouseEnter={playOnce}
      className="flex flex-col items-center justify-center h-full
                  rounded-xl bg-black/5 backdrop-blur-[5px] border border-white/30
                  shadow-xl p-6 transition hover:bg-white/10 cursor-default"
    >
      <lord-icon
        src={iconSrc}
        trigger="hover"
        state="hover-1"
        colors="primary:#9ca3af"
        style={{ width: "60px", height: "60px" }}
      />
      <p className="text-sm text-gray-400 mt-2">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
};

// ===== DayPanel Component =====
export default function DayPanel({ selectedDate, role }) {
  const [summary, setSummary] = useState(null);

  const today = dayjs();
  const isToday = selectedDate.isSame(today, "day");
  const isAdmin = role === "su";
  const isGuest = role === "guest";
  const canEdit = isAdmin || isToday;

  const loadSummary = async () => {
    const res = await getSummary();
    setSummary(res.data);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (!summary) return null;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 text-white">
      {/* ===== ROW 1 : PURCHASE + STATS ===== */}
      <div className="grid md:grid-cols-5 grid-cols-2 gap-6 mb-6 items-stretch">
        <AdminPanel role={role} refresh={loadSummary} />

        <StatCard
          title="Bought"
          value={summary.totalBought}
          iconSrc="https://cdn.lordicon.com/hwpohgdf.json"
        />
        <StatCard
          title="Eaten"
          value={summary.totalEaten}
          iconSrc="https://cdn.lordicon.com/mopbqkrv.json"
        />
        <StatCard
          title="Remaining"
          value={summary.remaining}
          iconSrc="https://cdn.lordicon.com/xzvgfwwv.json"
        />
        <StatCard
          title="Price/Egg"
          value={`₹${summary.pricePerEgg}`}
          iconSrc="https://cdn.lordicon.com/rhmhivzj.json"
        />
      </div>

      {/* ===== ROW 2 : CONSUMPTION + BILL ===== */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-black/5 backdrop-blur-[5px] border border-white/10 shadow-xl">
          <h3 className="font-bold text-lg text-red-500 font-mono">
            Consumption
          </h3>

          {Object.entries(summary.personTotals).map(([p, v]) => (
            <div key={p} className="flex justify-between py-1">
              <span className="text-white">{p}</span>
              <span className="text-white font-medium">{v} eggs</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-black/5 backdrop-blur-[5px] border border-white/10 shadow-xl">
          <h3 className="font-bold text-lg text-red-500 font-mono">
            Bill Split
          </h3>

          {Object.entries(summary.billSplit).map(([p, v]) => (
            <div key={p} className="flex justify-between py-1">
              <span className="text-white">{p}</span>
              <span className="text-white font-medium">₹{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ENTRY BOX ===== */}
      {canEdit && (
        <EggSelector
          isGuest={isGuest}
          selectedDate={selectedDate}
          onSuccess={loadSummary}
        />
      )}

      {!canEdit && (
        <p className="text-gray-500 mt-4">
          Past days locked (only admin can edit)
        </p>
      )}
    </div>
  );
}
