'use client';

import React, { useState } from 'react';

// Film-grain SVG data URI using feTurbulence (zero external network requests)
const FILM_GRAIN_URI = `data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noise)'/></svg>`;

export default function FluidBackground() {
  const [isLowEnd] = useState(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const concurrency = navigator.hardwareConcurrency || 4;
      const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
      return concurrency <= 2 || memory <= 1;
    }
    return false;
  });

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 bg-[#07070F]"
      style={
        {
          // Expose fluid CSS variables directly for rapid tuning
          '--fluid-blob-1': '#8B6CFF', // Violet
          '--fluid-blob-2': '#2DD4F5', // Electric Cyan
          '--fluid-blob-3': '#4C3BCF', // Deep Indigo
          '--fluid-blob-4': '#F472B6', // Rose-Pink Accent
          '--fluid-blob-5': '#FBBF24', // Warm Amber Accent
          '--fluid-blob-opacity': '0.70',
          '--fluid-blob-blur': isLowEnd ? '60px' : '85px',
          '--fluid-grain-opacity': '0.055',
          '--fluid-speed-scale': '1',
        } as React.CSSProperties
      }
    >
      {/* 1. Fluid Color Blobs Layer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blob 1: Violet (Upper Left Anchor, Drifts Across Center) */}
        <div
          className="absolute rounded-full fluid-blob fluid-blob-1"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 45% 45%, var(--fluid-blob-1) 0%, rgba(139, 108, 255, 0.80) 45%, rgba(139, 108, 255, 0.20) 68%, transparent 78%)',
          }}
        />

        {/* Blob 2: Cyan (Upper Right Anchor, Sweeps Left and Down) */}
        <div
          className="absolute rounded-full fluid-blob fluid-blob-2"
          style={{
            background:
              'radial-gradient(ellipse 55% 65% at 55% 45%, var(--fluid-blob-2) 0%, rgba(45, 212, 245, 0.80) 45%, rgba(45, 212, 245, 0.20) 68%, transparent 78%)',
          }}
        />

        {/* Blob 3: Deep Indigo (Lower Foundation, Rising Under Glass Cards) */}
        <div
          className="absolute rounded-full fluid-blob fluid-blob-3"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 55%, var(--fluid-blob-3) 0%, rgba(76, 59, 207, 0.75) 45%, rgba(76, 59, 207, 0.18) 68%, transparent 78%)',
          }}
        />

        {/* Blobs 4 & 5 rendered on standard/high-end devices */}
        {!isLowEnd && (
          <>
            {/* Blob 4: Rose-Pink (Warm Swirl Accent) */}
            <div
              className="absolute rounded-full fluid-blob fluid-blob-4"
              style={{
                background:
                  'radial-gradient(ellipse 60% 60% at 40% 50%, var(--fluid-blob-4) 0%, rgba(244, 114, 182, 0.70) 38%, rgba(244, 114, 182, 0.15) 62%, transparent 75%)',
              }}
            />

            {/* Blob 5: Warm Amber (Bottom-Right Glow Accent for Depth & Contrast) */}
            <div
              className="absolute rounded-full fluid-blob fluid-blob-5"
              style={{
                background:
                  'radial-gradient(ellipse 65% 60% at 50% 40%, var(--fluid-blob-5) 0%, rgba(251, 191, 36, 0.65) 35%, rgba(251, 191, 36, 0.12) 60%, transparent 75%)',
              }}
            />
          </>
        )}
      </div>

      {/* 2. Score Tier Mood Tint (Transitions gently during results) */}
      <div className="absolute inset-0 fluid-tier-overlay transition-colors duration-1000 ease-out" />

      {/* 3. Dark Vignette: Dims center headline locally so hero subcopy and chips meet WCAG AA even when peak blobs cross */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 22%, rgba(7, 7, 15, 0.68) 0%, rgba(7, 7, 15, 0.45) 50%, rgba(7, 7, 15, 0.88) 100%)',
        }}
      />

      {/* 4. Film Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[var(--fluid-grain-opacity,0.055)] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("${FILM_GRAIN_URI}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      />
    </div>
  );
}
