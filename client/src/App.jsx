import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import LoginPopup from "./LoginPopup";
import CalendarStrip from "./CalendarStrip";
import DayPanel from "./DayPanel";
import Navbar from "./Navbar";
import ChartModal from "./ChartModal";
import DynamicBackground from "./components/DynamicBackground";
import { setCheatCode, clearCheatCode } from "./api";

function App() {
  const SESSION_MS = 5 * 60 * 1000; // 5 minutes

  const [booted, setBooted] = useState(false);
  const [role, setRole] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showChart, setShowChart] = useState(false);
  const logoutTimerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("cheatCode");
    localStorage.removeItem("loginAt");
    clearCheatCode();
    setRole(null);
    setSelectedDate(dayjs());
    setShowChart(false);
  };

  // Boot: restore session (if valid), otherwise show login
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedCode = localStorage.getItem("cheatCode");
    const loginAtRaw = localStorage.getItem("loginAt");
    const loginAt = loginAtRaw ? Number(loginAtRaw) : null;

    // Never auto-enter guest
    const candidateRole =
      storedRole && storedRole !== "guest" ? storedRole : null;

    const expired =
      candidateRole &&
      (!loginAt ||
        !Number.isFinite(loginAt) ||
        Date.now() - loginAt >= SESSION_MS);

    if (candidateRole && storedCode && !expired) {
      setCheatCode(storedCode);
      setRole(candidateRole);
    } else {
      // Clean up any stale session
      localStorage.removeItem("role");
      localStorage.removeItem("cheatCode");
      localStorage.removeItem("loginAt");
      clearCheatCode();
      setRole(null);
    }

    setBooted(true);
  }, []);

  useEffect(() => {
    if (!role) return;

    // Ensure login timestamp exists (set on first render after login)
    const loginAtRaw = localStorage.getItem("loginAt");
    const loginAt = loginAtRaw ? Number(loginAtRaw) : null;
    if (!loginAt || !Number.isFinite(loginAt)) {
      localStorage.setItem("loginAt", String(Date.now()));
    }

    // Clear any previous timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    const startAt = Number(localStorage.getItem("loginAt")) || Date.now();
    const remaining = Math.max(0, SESSION_MS - (Date.now() - startAt));

    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, remaining);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [role]);

  // While booting, render nothing to avoid flash/blank transitions
  if (!booted) return null;

  // Show login first
  if (!role) return <LoginPopup onLogin={setRole} />;

  return (
    <div className="relative z-10 min-h-screen text-white">
      {/* Animated Background */}
      <DynamicBackground />

      <Navbar
        role={role}
        onShowChart={() => setShowChart(true)}
        onLogout={handleLogout}
      />

      <CalendarStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <DayPanel selectedDate={selectedDate} role={role} />

      {showChart && <ChartModal onClose={() => setShowChart(false)} />}
    </div>
  );
}

export default App;
