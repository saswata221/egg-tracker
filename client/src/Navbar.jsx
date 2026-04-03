import { resetSystem } from "./api";
import { BarChart3, RotateCcw, LogOut } from "lucide-react";

export default function Navbar({ role, onShowChart, onLogout }) {
  const handleReset = async () => {
    if (!confirm("Reset all data?")) return;

    await resetSystem();
    alert("System Reset Done");
    window.location.reload();
  };

  /* ================= BUTTON BASE ================= */

  const baseBtn =
    "group relative flex items-center overflow-hidden rounded-xl " +
    "bg-white/5 backdrop-blur-xl border border-white/10 " +
    "transition-all duration-300 shadow-lg " +
    "hover:bg-white/10 hover:border-red-400/30 " +
    "hover:shadow-[0_0_25px_rgba(255,60,60,0.25)]";

  const glowLayer =
    "before:absolute before:inset-0 before:rounded-xl " +
    "before:bg-gradient-to-r before:from-red-500/0 before:via-red-500/20 before:to-red-500/0 " +
    "before:opacity-0 group-hover:before:opacity-100 " +
    "before:blur-xl before:transition-all before:duration-500";

  const iconBox = "flex items-center justify-center w-10 h-10 shrink-0";

  const label =
    "max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 " +
    "whitespace-nowrap transition-all duration-300 pr-4 text-sm text-gray-200";

  /* ================= NAVBAR ================= */

  return (
    <div
      className="
        relative overflow-hidden
        sticky top-0 z-50
        flex justify-between items-center
        px-8 py-4 text-white
        backdrop-blur-xl border-b border-white/10
        bg-[linear-gradient(90deg,rgba(255,60,60,0.10)_0%,rgba(255,60,60,0.05)_25%,rgba(255,255,255,0.03)_60%,rgba(255,255,255,0.02)_100%)]
      "
    >
      {/* Ambient Red Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Brand */}
      <h1 className="relative z-10 text-2xl font-extrabold tracking-wide">
        🥚 Egg Tracker
      </h1>

      {/* Actions */}
      <div className="relative z-10 flex gap-3">
        {/* Chart */}
        <button onClick={onShowChart} className={`${baseBtn} ${glowLayer}`}>
          <div className={iconBox}>
            <BarChart3 size={18} className="text-blue-400" />
          </div>
          <span className={label}>Chart</span>
        </button>

        {/* Reset (Admin Only) */}
        {role === "Saswata" && (
          <button onClick={handleReset} className={`${baseBtn} ${glowLayer}`}>
            <div className={iconBox}>
              <RotateCcw size={18} className="text-red-400" />
            </div>
            <span className={label}>Reset</span>
          </button>
        )}

        {/* Logout */}
        <button onClick={onLogout} className={`${baseBtn} ${glowLayer}`}>
          <div className={iconBox}>
            <LogOut size={18} className="text-gray-300" />
          </div>
          <span className={label}>Logout</span>
        </button>
      </div>
    </div>
  );
}
