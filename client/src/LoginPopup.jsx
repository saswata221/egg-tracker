import { useState } from "react";
import { setCheatCode, login } from "./api";

export default function LoginPopup({ onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError("");
      const result = await login(code.trim());

      setCheatCode(code.trim());
      localStorage.setItem("role", result.role);
      onLogin(result.role);
    } catch (err) {
      setError("Invalid access code");
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = () => {
    setCheatCode("guest");
    onLogin("guest");
  };

  return (
    <div
      className="fixed inset-0 bg-cover bg-center flex items-center justify-center animate-fadeIn"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-red-900/60"></div>

      {/* Card */}
      <div className="relative w-[380px] p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-cardEnter">
        {/* Brand */}
        <div className="text-left mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-wide animate-slideDown">
            GYM<span className="text-red-500">.</span>
          </h1>
          <p className="text-gray-400 text-sm">Train Hard. Track Smart.</p>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-4">
          Enter Access Code
        </h2>

        {/* Input */}
        <input
          className={`w-full p-3 rounded-lg bg-white/10 border text-white placeholder-gray-400
            focus:outline-none focus:ring-2 transition-all duration-300
            focus:scale-[1.02]
            ${error ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-red-500"}
          `}
          placeholder="Enter your code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm mt-2 animate-shake">{error}</p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 
                     text-white font-semibold tracking-wide transition-all 
                     duration-200 shadow-lg hover:shadow-red-700/40
                     hover:scale-[1.03] active:scale-[0.97]
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "ENTER ACCESS CODE"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Guest */}
        <button
          onClick={guestLogin}
          className="w-full py-2 rounded-lg border border-white/20 text-gray-300
                     hover:bg-white/10 hover:text-white transition
                     hover:scale-[1.02] active:scale-[0.97]"
        >
          Continue as Guest
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Performance is built daily.
        </p>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          50% {
            transform: translateX(3px);
          }
          75% {
            transform: translateX(-3px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }

        .animate-cardEnter {
          animation: cardEnter 0.7s cubic-bezier(0.17, 0.67, 0.39, 1.25);
        }

        .animate-slideDown {
          animation: slideDown 0.6s ease forwards;
        }

        .animate-shake {
          animation: shake 0.3s ease;
        }
      `}</style>
    </div>
  );
}
