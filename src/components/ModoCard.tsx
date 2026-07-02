'use client';

import Link from 'next/link';
import type { SpringOptions } from 'motion/react';
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface ModoCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  tag: string;
  desc: string;
  bullets: string[];
  featured: boolean;
  comingSoon?: boolean;
  /** Índice do card — usado para escalonar a animação de entrada. */
  index?: number;
}

// Mola mais rápida e "springy" (menos massa, mais rigidez) → reação ágil no tilt.
const springValues: SpringOptions = {
  damping: 18,
  stiffness: 300,
  mass: 0.5,
};

export default function ModoCard({ href, icon, title, tag, desc, bullets, featured, comingSoon = false, index = 0 }: ModoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setLastY] = useState(0);
  const [hover, setHover] = useState(false);

  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -11);
    rotateY.set((offsetX / (rect.width / 2)) * 11);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(1.055);
    setHover(true);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    setLastY(0);
    setHover(false);
  }

  return (
    <Link href={comingSoon ? '#' : href} onClick={comingSoon ? (e) => e.preventDefault() : undefined} style={{ textDecoration: 'none', display: 'block', perspective: 900 }}>
      <motion.div
        ref={ref}
        className="card-glow"
        // Entrada escalonada (stagger) + tilt 3D interativo, tudo rápido.
        initial={{ opacity: 0, y: 26, scale: 0.94 }}
        animate={{ opacity: comingSoon ? 0.55 : 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.97 }}
        style={{
          padding: 24,
          cursor: 'pointer',
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          scale,
          transition: 'box-shadow .25s ease, border-color .25s ease',
          ...(featured
            ? {
                border: '1.5px solid #00c5e4',
                background: 'linear-gradient(160deg, #16024f 0%, #0d0133 100%)',
                boxShadow: hover
                  ? '0 18px 48px rgba(0,197,228,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : '0 0 32px rgba(0, 197, 228, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
              }
            : {
                border: hover ? '1px solid rgba(0,197,228,0.5)' : '1px solid rgba(0, 197, 228, 0.18)',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: hover ? '0 16px 40px rgba(0,197,228,0.22)' : 'none',
              }),
        }}
        onMouseMove={handleMouse}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {featured && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: '#00c5e4', color: '#16024f', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>
            ⭐ RECOMENDADO
          </span>
        )}
        {comingSoon && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.1em', border: '1px solid rgba(255,255,255,0.12)' }}>
            EM BREVE
          </span>
        )}
        <motion.div
          animate={hover ? { scale: 1.14, rotate: -6, y: 0 } : { scale: 1, rotate: 0, y: [0, -4, 0] }}
          transition={
            hover
              ? { type: 'spring', stiffness: 340, damping: 14 }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }
          }
          style={{ width: 52, height: 52, borderRadius: 14, background: featured ? 'linear-gradient(135deg, #00c5e4, #16024f)' : 'rgba(0, 197, 228, 0.08)', border: featured ? 'none' : '1px solid rgba(0, 197, 228, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14, color: featured ? '#ffffff' : '#00c5e4' }}
        >
          {typeof icon === 'string' ? icon : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{icon}</span>}
        </motion.div>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: '#ffffff', marginBottom: 4 }}>
          {title}
        </h3>
        <div style={{ color: '#00c5e4', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>
          {tag}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 12 }}>
          {desc}
        </p>
        <div style={{ paddingTop: 12, borderTop: '1px solid rgba(0, 197, 228, 0.15)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          {bullets.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#00c5e4' }}>✓</span> {b}
            </div>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
