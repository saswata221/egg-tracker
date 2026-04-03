export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0b0f14] to-black" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1400 900"
        preserveAspectRatio="none"
      >
        {/* Main Threads */}
        <path
          d="M-100 200 C 200 100, 400 300, 700 200 S 1200 100, 1500 250"
          className="thread t1"
        />
        <path
          d="M-200 500 C 200 650, 500 450, 900 550 S 1300 650, 1600 500"
          className="thread t2"
        />
        <path
          d="M-150 350 C 250 250, 450 450, 800 350 S 1300 250, 1500 400"
          className="thread t3"
        />

        {/* Added Depth Threads */}
        <path
          d="M-200 700 C 300 600, 600 850, 1100 700"
          className="thread t4"
        />
        <path d="M-300 100 C 250 200, 650 0, 1200 150" className="thread t5" />
        <path
          d="M-150 450 C 300 520, 700 380, 1300 480"
          className="thread t6"
        />

        {/* Highlight Thread */}
        <path
          d="M-100 600 C 300 500, 600 700, 1200 600"
          className="thread highlight"
        />
      </svg>
    </div>
  );
}
