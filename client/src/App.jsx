import { useState } from "react";
import dayjs from "dayjs";
import LoginPopup from "./LoginPopup";
import CalendarStrip from "./CalendarStrip";
import DayPanel from "./DayPanel";
import Navbar from "./Navbar";
import ChartModal from "./ChartModal";
import DynamicBackground from "./components/DynamicBackground";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showChart, setShowChart] = useState(false);

  // Show login first
  if (!role) return <LoginPopup onLogin={setRole} />;

  const handleLogout = () => {
    localStorage.removeItem("role");
    setRole(null);
    setSelectedDate(dayjs());
    setShowChart(false);
  };

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
