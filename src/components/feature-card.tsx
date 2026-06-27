import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}

export function FeatureCard({ icon: Icon, title, description }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(py - 0.5) * -6}deg) rotateY(${(px - 0.5) * 8}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden rounded-3xl glass p-7 transition-[transform,box-shadow] duration-500 will-change-transform hover:shadow-[0_30px_80px_-20px_rgba(56,189,248,0.35)]"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--mx,50%) var(--my,50%), rgba(56,189,248,0.22), transparent 60%)",
        }}
      />
      {/* glow border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(125,211,252,0.4), transparent 40%, transparent 60%, rgba(139,92,246,0.4))",
          padding: "1px",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <div className="relative">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-button glow-sky transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-soft)]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
