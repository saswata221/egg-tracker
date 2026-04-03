import { useEffect, useState, useRef, useCallback } from "react";
import { getStats } from "./api";

const COLORS = {
  Saswata: "#ef4444",
  Tushar: "#3b82f6",
  Swapnil: "#22c55e",
};

const KEYS = ["Saswata", "Tushar", "Swapnil"];
const DURATION = 2200;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ChartModal({ onClose }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const visibleRef = useRef({ Saswata: true, Tushar: true, Swapnil: true });
  const drawParamsRef = useRef(null);
  const rawDataRef = useRef([]);

  const [visible, setVisible] = useState({
    Saswata: true,
    Tushar: true,
    Swapnil: true,
  });

  const toggleKey = (key) => {
    setVisible((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      visibleRef.current = updated;
      startRef.current = null;
      return updated;
    });
  };

  // ── Build draw params from current canvas size ─────────────────
  const buildParams = useCallback(() => {
    const canvas = canvasRef.current;
    const data = rawDataRef.current;
    if (!canvas || !data.length) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const isSmall = W < 400;
    const isMid = W < 600;
    const PAD = {
      top: isSmall ? 28 : 36,
      right: isSmall ? 12 : 20,
      bottom: isSmall ? 38 : 46,
      left: isSmall ? 32 : isMid ? 38 : 45,
    };

    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const n = data.length;

    const allVals = data.flatMap((d) => KEYS.map((k) => Number(d[k]) || 0));
    const yMax = Math.ceil(Math.max(...allVals, 1));

    const toX = (i) => PAD.left + (i / Math.max(n - 1, 1)) * chartW;
    const toY = (v) => PAD.top + chartH - (v / yMax) * chartH;

    const pointsMap = {};
    KEYS.forEach((key) => {
      pointsMap[key] = data.map((d, i) => ({
        x: toX(i),
        y: toY(Number(d[key]) || 0),
      }));
    });

    drawParamsRef.current = {
      ctx,
      W,
      H,
      PAD,
      pointsMap,
      data,
      yMax,
      fontSize: isSmall ? 9 : isMid ? 10 : 11,
      dotR: isSmall ? 2.5 : 3.5,
      dotCoreR: isSmall ? 1 : 1.5,
      leadR: isSmall ? 5 : 7,
      lineW: isSmall ? 2 : 2.5,
    };
  }, []);

  // ── Draw frame ─────────────────────────────────────────────────
  const drawFrame = useCallback((timestamp) => {
    if (!drawParamsRef.current) return;

    const {
      ctx,
      W,
      H,
      PAD,
      pointsMap,
      data,
      yMax,
      fontSize,
      dotR,
      dotCoreR,
      leadR,
      lineW,
    } = drawParamsRef.current;

    if (!startRef.current) startRef.current = timestamp;
    const elapsed = timestamp - startRef.current;
    const rawT = Math.min(elapsed / DURATION, 1);
    const progress = easeInOutCubic(rawT);

    ctx.clearRect(0, 0, W, H);

    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const n = data.length;
    const toX = (i) => PAD.left + (i / Math.max(n - 1, 1)) * chartW;
    const toY = (v) => PAD.top + chartH - (v / yMax) * chartH;

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return W < 400
        ? d.getDate()
        : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    // ── Grid & Y-axis ─────────────────────────────────────────────
    for (let i = 0; i <= yMax; i++) {
      const y = toY(i);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = "#9ca3af";
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(i, PAD.left - 5, y + fontSize * 0.4);
    }

    // ── X-axis labels ─────────────────────────────────────────────
    const skipEvery = n > 10 && W < 500 ? 2 : n > 14 && W < 700 ? 2 : 1;
    data.forEach((d, i) => {
      if (i % skipEvery !== 0 && i !== n - 1) return;
      ctx.fillStyle = "#9ca3af";
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(formatDate(d.date), toX(i), H - PAD.bottom + fontSize + 4);
    });

    // ── Axis lines ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + chartH);
    ctx.lineTo(PAD.left + chartW, PAD.top + chartH);
    ctx.stroke();

    // ── Lines + leading circles (solid colors, no blending) ───────
    KEYS.forEach((key) => {
      if (!visibleRef.current[key]) return;

      const pts = pointsMap[key];
      const color = COLORS[key];
      const totalSeg = pts.length - 1;
      const progInSeg = progress * totalSeg;
      const seg = Math.min(Math.floor(progInSeg), totalSeg - 1);
      const segT = progInSeg - seg;

      const leadX =
        seg < totalSeg
          ? pts[seg].x + segT * (pts[seg + 1].x - pts[seg].x)
          : pts[totalSeg].x;
      const leadY =
        seg < totalSeg
          ? pts[seg].y + segT * (pts[seg + 1].y - pts[seg].y)
          : pts[totalSeg].y;

      // Trail line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= seg; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.lineTo(leadX, leadY);
      ctx.stroke();

      // Passed data point dots
      for (let i = 0; i <= seg; i++) {
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, dotCoreR, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }

      // Leading glow — outer
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(leadX, leadY, leadR + 1, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Leading glow — inner intensity
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(leadX, leadY, leadR - 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // White core
      ctx.beginPath();
      ctx.arc(leadX, leadY, leadR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  useEffect(() => {
    getStats().then((res) => {
      rawDataRef.current = res.data;
      buildParams();
      startRef.current = null;
      rafRef.current = requestAnimationFrame(drawFrame);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [buildParams, drawFrame]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      if (!rawDataRef.current.length) return;
      buildParams();
      startRef.current = null;
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [buildParams]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-3 sm:px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 text-white flex flex-col gap-4">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <h2 className="text-base sm:text-xl font-semibold whitespace-nowrap">
            📊 Egg Consumption Dashboard
          </h2>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-2">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => toggleKey(key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: visible[key]
                    ? `${COLORS[key]}22`
                    : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${
                    visible[key] ? COLORS[key] : "rgba(255,255,255,0.1)"
                  }`,
                  color: visible[key] ? COLORS[key] : "#6b7280",
                }}
              >
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: visible[key] ? COLORS[key] : "#4b5563",
                    boxShadow: visible[key] ? `0 0 6px ${COLORS[key]}` : "none",
                  }}
                />
                {key}
                {!visible[key] && (
                  <span className="text-xs text-gray-500">✕</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Canvas ── */}
        <div style={{ height: "clamp(180px, 40vw, 340px)" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
