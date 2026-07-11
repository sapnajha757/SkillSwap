"use client";

/**
 * Motion Primitives — SkillSwap OS
 * 
 * A curated library of GPU-accelerated, accessibility-safe motion components.
 * Every animation communicates meaning. Nothing is decorative-only.
 * 
 * Design Philosophy:
 * - Springs over durations (physics > timing)
 * - will-change for GPU compositing
 * - prefers-reduced-motion respected at every level
 * - 60 FPS or nothing
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  type Variants,
} from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// SPRING PRESETS — Tuned for Apple-quality feel
// ═══════════════════════════════════════════════════════════════
export const springs = {
  /** Instant response — button taps, toggles */
  snappy: { type: "spring" as const, stiffness: 600, damping: 30, mass: 0.5 },
  /** Natural movement — cards, panels */
  gentle: { type: "spring" as const, stiffness: 280, damping: 26, mass: 0.8 },
  /** Slow settle — modals, overlays */
  slow: { type: "spring" as const, stiffness: 180, damping: 22, mass: 1.0 },
  /** Bouncy — success celebrations, notifications */
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15, mass: 0.6 },
  /** Magnetic — dock items, drag targets */
  magnetic: { type: "spring" as const, stiffness: 500, damping: 22, mass: 0.6 },
};

// ═══════════════════════════════════════════════════════════════
// AI PULSE — Communicates "AI is thinking"
// ═══════════════════════════════════════════════════════════════
export function AIPulse({
  isActive = true,
  size = 40,
  color = "var(--color-primary)",
  className = "",
}: {
  isActive?: boolean;
  size?: number;
  color?: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (!isActive) return null;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer ring — expanding */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: `1.5px solid ${color}`,
              willChange: "transform, opacity",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.25, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: `1px solid ${color}`,
              willChange: "transform, opacity",
            }}
          />
        </>
      )}
      {/* Core dot */}
      <motion.div
        animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: color,
          boxShadow: `0 0 ${size * 0.5}px ${color}`,
          willChange: "transform",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL — Scroll storytelling: elements appear on viewport entry
// ═══════════════════════════════════════════════════════════════
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();

  const offsets = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  const offset = offsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, ...offset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGGER GROUP — Children appear one by one
// ═══════════════════════════════════════════════════════════════
const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export function StaggerGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={shouldReduceMotion ? staggerItemReduced : staggerItem}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD ELEVATION — Physics-based hover lift
// ═══════════════════════════════════════════════════════════════
export function ElevatedCard({
  children,
  className = "",
  as = "div",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.008 }}
      whileTap={shouldReduceMotion ? {} : { y: -1, scale: 0.995 }}
      transition={springs.gentle}
      className={className}
      onClick={onClick}
      style={{ willChange: "transform" }}
    >
      {children}
    </Component>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORB MOTION — Floating ambient background orb
// ═══════════════════════════════════════════════════════════════
export function FloatingOrb({
  size = 500,
  color = "rgba(182, 222, 195, 0.1)",
  blur = 180,
  className = "",
  speed = 20,
}: {
  size?: number;
  color?: string;
  blur?: number;
  className?: string;
  speed?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? {}
          : {
              x: [0, 30, -20, 10, 0],
              y: [0, -20, 15, -10, 0],
            }
      }
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${blur}px)`,
        willChange: "transform",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// SUCCESS CELEBRATION — Burst animation for completions
// ═══════════════════════════════════════════════════════════════
export function SuccessBurst({
  isActive,
  onComplete,
}: {
  isActive: boolean;
  onComplete?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !isActive) return null;

  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 60,
      y: Math.sin(angle) * 60,
    };
  });

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.2, delay: 0.5 }}
      onAnimationComplete={onComplete}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0
              ? "var(--color-primary)"
              : "var(--color-secondary)",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "var(--color-primary)" : "var(--color-secondary)"}`,
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}

      {/* Central flash */}
      <motion.div
        className="absolute w-8 h-8 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--color-primary), transparent)",
          willChange: "transform, opacity",
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONSTELLATION — Career skill graph with animated connections
// ═══════════════════════════════════════════════════════════════
export function ConstellationNode({
  x,
  y,
  label,
  size = 6,
  color = "var(--color-primary)",
  delay = 0,
}: {
  x: number;
  y: number;
  label?: string;
  size?: number;
  color?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldReduceMotion
        ? { duration: 0.2, delay }
        : { ...springs.bouncy, delay }
      }
    >
      {/* Ambient glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={size * 2.5}
        fill={color}
        opacity={0.08}
        animate={shouldReduceMotion ? {} : { r: [size * 2.5, size * 3.5, size * 2.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Core */}
      <circle cx={x} cy={y} r={size} fill={color} opacity={0.8} />
      <circle
        cx={x}
        cy={y}
        r={size * 0.5}
        fill="white"
        opacity={0.6}
      />
      {/* Label */}
      {label && (
        <text
          x={x}
          y={y + size + 14}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

export function ConstellationEdge({
  x1,
  y1,
  x2,
  y2,
  delay = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="var(--color-primary)"
      strokeWidth="1"
      strokeOpacity={0.2}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.2, delay }
          : { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }
      }
      style={{ willChange: "stroke-dashoffset" }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// MORPHING NUMBER — Animated counter for stats
// ═══════════════════════════════════════════════════════════════
export function MorphingNumber({
  value,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (shouldReduceMotion) {
      const timer = setTimeout(() => setDisplay(value), 0);
      return () => clearTimeout(timer);
    }
    motionValue.set(value);
  }, [value, motionValue, shouldReduceMotion]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO REVEAL — Cinematic text entrance
// ═══════════════════════════════════════════════════════════════
export function HeroReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.3 : 0.9,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CURSOR SPOTLIGHT — Interactive light that follows mouse
// ═══════════════════════════════════════════════════════════════
export function CursorSpotlight({
  children,
  className = "",
  color = "rgba(182, 222, 195, 0.12)",
  size = 280,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -size, y: -size });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (shouldReduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [shouldReduceMotion]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Spotlight */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: pos.x,
          top: pos.y,
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          opacity: isHovering && !shouldReduceMotion ? 1 : 0,
          willChange: "left, top, opacity",
        }}
      />
      {children}
    </div>
  );
}
