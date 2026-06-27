import { useEffect, useRef } from "react";

/**
 * Premium ambient background:
 * - Deep gradient base
 * - Animated mesh/aurora blobs
 * - Drifting grid lines
 * - Twinkling star field
 * - Mouse-reactive radial glow
 * - Soft noise overlay
 */
export function Background() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(56,189,248,0.18), transparent 60%)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // deterministic star positions
  const stars = Array.from({ length: 60 }).map((_, i) => ({
    top: `${(i * 53) % 100}%`,
    left: `${(i * 97) % 100}%`,
    size: (i % 3) + 1,
    delay: `${(i % 7) * 0.6}s`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 80% -10%, rgba(56,189,248,0.22), transparent 60%), radial-gradient(900px 500px at 10% 10%, rgba(139,92,246,0.18), transparent 60%), linear-gradient(180deg, #050816 0%, #050816 60%, #07091c 100%)",
        }}
      />

      {/* Drifting grid */}
      <div
        className="absolute inset-0 grid-lines opacity-60"
        style={{ animation: "grid-drift 24s linear infinite" }}
      />

      {/* Aurora blobs */}
      <div
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.45), transparent 60%)",
          animation: "aurora 16s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.35), transparent 60%)",
          animation: "aurora 22s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-[-200px] left-1/3 h-[700px] w-[700px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.28), transparent 60%)",
          animation: "aurora 28s ease-in-out infinite",
        }}
      />

      {/* Star field */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              opacity: 0.6,
              animation: `twinkle 4s ease-in-out infinite`,
              animationDelay: s.delay,
              boxShadow: "0 0 6px rgba(125,211,252,0.6)",
            }}
          />
        ))}
      </div>

      {/* Soft light rays */}
      <div
        className="absolute inset-x-0 top-0 h-[60vh] opacity-50"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 0%, transparent 0deg, rgba(56,189,248,0.12) 60deg, transparent 120deg, rgba(139,92,246,0.1) 200deg, transparent 260deg)",
        }}
      />

      {/* Mouse glow */}
      <div ref={glowRef} className="absolute inset-0 transition-[background] duration-200" />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
