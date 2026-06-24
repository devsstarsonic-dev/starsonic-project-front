'use client';

import Link from 'next/link';
import type { SpringOptions } from 'motion/react';
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface ModoCardProps {
  href: string;
  icon: string;
  title: string;
  tag: string;
  desc: string;
  bullets: string[];
  featured: boolean;
  comingSoon?: boolean;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function ModoCard({ href, icon, title, tag, desc, bullets, featured, comingSoon = false }: ModoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setLastY] = useState(0);

  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -8);
    rotateY.set((offsetX / (rect.width / 2)) * 8);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(1.03);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    setLastY(0);
  }

  return (
    <Link href={comingSoon ? '#' : href} onClick={comingSoon ? (e) => e.preventDefault() : undefined} style={{ textDecoration: 'none', display: 'block', perspective: 800 }}>
      <motion.div
        ref={ref}
        className="card-glow"
        style={{
          padding: 24,
          cursor: 'pointer',
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          scale,
          opacity: comingSoon ? 0.55 : 1,
          ...(featured
            ? {
                border: '1.5px solid #00c5e4',
                background: 'linear-gradient(160deg, #16024f 0%, #0d0133 100%)',
                boxShadow: '0 0 32px rgba(0, 197, 228, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
              }
            : {
                border: '1px solid rgba(0, 197, 228, 0.18)',
                background: 'rgba(255,255,255,0.02)',
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
        <div style={{ width: 52, height: 52, borderRadius: 14, background: featured ? 'linear-gradient(135deg, #00c5e4, #16024f)' : 'rgba(0, 197, 228, 0.08)', border: featured ? 'none' : '1px solid rgba(0, 197, 228, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 }}>
          {icon}
        </div>
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
