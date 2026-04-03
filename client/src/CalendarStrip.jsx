import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { getStats, getDayData } from "./api";

export default function CalendarStrip({ selectedDate, setSelectedDate }) {
  const today = dayjs();
  const containerRef = useRef(null);

  const [stats, setStats] = useState({});
  const [dayDataMap, setDayDataMap] = useState({});

  const [popupData, setPopupData] = useState(null);
  const [popupDate, setPopupDate] = useState(null);

  const days = Array.from({ length: 60 }, (_, i) => today.add(i - 30, "day"));

  useEffect(() => {
    const loadStats = async () => {
      const res = await getStats();
      const map = {};
      res.data.forEach((d) => {
        map[d.date] = d.total;
      });
      setStats(map);
    };
    loadStats();
  }, []);

  useEffect(() => {
    const preload = async () => {
      const map = {};

      for (let i = -30; i <= 30; i++) {
        const date = today.add(i, "day").format("YYYY-MM-DD");

        try {
          const res = await getDayData(date);
          map[date] = res.data;
        } catch {
          map[date] = {
            Saswata: 0,
            Tushar: 0,
            Swapnil: 0,
          };
        }
      }

      setDayDataMap(map);
    };

    preload();
  }, []);

  const centerElement = (el) => {
    const container = containerRef.current;
    const offset =
      el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;

    container.scrollTo({ left: offset, behavior: "smooth" });
  };

  useEffect(() => {
    const container = containerRef.current;
    const todayEl = container.querySelector("[data-today='true']");
    if (todayEl) centerElement(todayEl);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const selectedEl = container.querySelector("[data-selected='true']");
    if (selectedEl) centerElement(selectedEl);
  }, [selectedDate]);

  const handleWheel = (e) => {
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  };

  const formatFancyDate = (date) => {
    const d = dayjs(date);
    const day = d.date();

    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
            ? "rd"
            : "th";

    return `${day}${suffix} ${d.format("MMMM")}`;
  };

  const handleClick = (day) => {
    setSelectedDate(day);

    const date = day.format("YYYY-MM-DD");

    setPopupData(
      dayDataMap[date] || {
        Saswata: 0,
        Tushar: 0,
        Swapnil: 0,
      },
    );

    setPopupDate(date);

    setTimeout(() => {
      setPopupData(null);
      setPopupDate(null);
    }, 2000);
  };

  return (
    <div className="relative z-50">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border-y border-white/10"></div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="relative flex space-x-5 px-8 py-5 overflow-x-scroll scroll-smooth no-scrollbar"
      >
        {days.map((day) => {
          const isSelected = day.isSame(selectedDate, "day");
          const isToday = day.isSame(today, "day");

          const dateKey = day.format("YYYY-MM-DD");
          const eggs = stats[dateKey] || 0;

          return (
            <div
              key={dateKey}
              data-today={isToday}
              data-selected={isSelected}
              onClick={() => handleClick(day)}
              className={`
                min-w-[130px] h-[110px] rounded-xl cursor-pointer
                flex flex-col justify-center items-center
                transition-all duration-300

                ${
                  isSelected
                    ? "bg-red-600 text-white scale-110 shadow-lg"
                    : "bg-white/5 text-gray-300 border border-white/10"
                }

                ${
                  !isSelected &&
                  "hover:bg-white/10 hover:text-white hover:-translate-y-1"
                }

                ${isToday ? "ring-2 ring-red-500" : ""}
              `}
            >
              <p className="text-2xl font-bold">{day.format("DD")}</p>
              <p className="text-sm opacity-70">{day.format("MMM")}</p>
              <p className="text-xs opacity-60">{day.format("ddd")}</p>

              {eggs > 0 && (
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: Math.min(eggs, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* POPUP */}
      {popupData && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[999]"
          onClick={() => {
            setPopupData(null);
            setPopupDate(null);
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-[300px] shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-mono font-semibold mb-4 text-center text-green-600">
              {formatFancyDate(popupDate)}
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Saswata</span>
                <span>{popupData?.Saswata ?? 0} eggs</span>
              </div>

              <div className="flex justify-between">
                <span>Tushar</span>
                <span>{popupData?.Tushar ?? 0} eggs</span>
              </div>

              <div className="flex justify-between">
                <span>Swapnil</span>
                <span>{popupData?.Swapnil ?? 0} eggs</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
