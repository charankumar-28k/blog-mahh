import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

export function MagneticButton({ children, className, variant = "primary", ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 });
  const rx = useTransform(sy, [-20, 20], [8, -8]);
  const ry = useTransform(sx, [-20, 20], [-8, 8]);

  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = ref.current!.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 40);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 40);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-medium tracking-tight transition-all duration-300 will-change-transform";
  const variants =
    variant === "primary"
      ? "bg-gradient-button text-white shadow-glow hover:shadow-[0_0_60px_rgba(56,189,248,0.55)]"
      : "glass text-white hover:bg-[rgba(255,255,255,0.1)]";

  return (
    <motion.button
      ref={ref}
      onMouseMove={handle}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn(base, variants, className)}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 opacity-0 transition duration-700 group-hover:translate-x-[400%] group-hover:opacity-100" />
        </span>
      )}
    </motion.button>
  );
}
