'use client';

import React from 'react';

export type LogoVariant = 'knot' | 'chevrons' | 'vortex';

interface ResumeGapLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
  variant?: LogoVariant;
}

export default function ResumeGapLogo({
  size = 40,
  className = '',
  withGlow = true,
  variant = 'knot',
}: ResumeGapLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. Ambient Background Glow */}
      {withGlow && (
        <div
          className="absolute inset-1 rounded-xl pointer-events-none opacity-40 blur-md transition-opacity duration-300 group-hover:opacity-75"
          style={{
            background:
              variant === 'chevrons'
                ? 'radial-gradient(circle, rgba(45,212,245,0.4) 0%, rgba(139,108,255,0.2) 60%, transparent 100%)'
                : 'radial-gradient(circle, rgba(139,108,255,0.45) 0%, rgba(45,212,245,0.2) 60%, transparent 100%)',
          }}
        />
      )}

      {/* 2. Vector Geometrical Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Obsidian Glass Plinth Background */}
          <linearGradient id="rg-plinth-bg" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#141224" />
            <stop offset="50%" stopColor="#0E0D1A" />
            <stop offset="100%" stopColor="#070611" />
          </linearGradient>

          {/* Luminous Hairline Border */}
          <linearGradient id="rg-plinth-border" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(139, 108, 255, 0.70)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.22)" />
            <stop offset="100%" stopColor="rgba(45, 212, 245, 0.65)" />
          </linearGradient>

          {/* Hex-Knot Gradient (ChatGPT / OpenAI inspired) */}
          <linearGradient id="rg-knot-grad" x1="12" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#8B6CFF" />
            <stop offset="100%" stopColor="#2DD4F5" />
          </linearGradient>

          {/* Chevrons Violet Gradient (Anthropic / AMD) */}
          <linearGradient id="rg-chev-v" x1="16" y1="14" x2="46" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7C5CFF" />
          </linearGradient>

          {/* Chevrons Cyan Gradient (Anthropic / AMD) */}
          <linearGradient id="rg-chev-c" x1="26" y1="24" x2="56" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Subtle Glow Filter */}
          <filter id="rg-mark-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Obsidian Glass Plinth */}
        <rect
          x="1.5"
          y="1.5"
          width="69"
          height="69"
          rx="18"
          fill="url(#rg-plinth-bg)"
          stroke="url(#rg-plinth-border)"
          strokeWidth="1.5"
        />

        {/* Glass Specular Rim Highlight */}
        <path
          d="M 18 3.5 H 54"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* VARIANT 1: The Hex-Knot (ChatGPT / OpenAI Mathematical Loop) */}
        {variant === 'knot' && (
          <g filter="url(#rg-mark-glow)">
            <g
              transform="translate(36, 36)"
              stroke="url(#rg-knot-grad)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" />
              <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(60)" />
              <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(120)" />
              <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(180)" />
              <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(240)" />
              <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(300)" />
            </g>
            {/* Illuminated Nexus Core */}
            <circle cx="36" cy="36" r="3.5" fill="#FFFFFF" />
          </g>
        )}

        {/* VARIANT 2: Convergent Chevrons (AMD / Anthropic Precision Diamond) */}
        {variant === 'chevrons' && (
          <g filter="url(#rg-mark-glow)">
            {/* Top-Left Chevron (Resume / Skills) */}
            <path d="M 16 34 L 36 14 L 46 24 L 32 38 L 42 48 L 34 56 Z" fill="url(#rg-chev-v)" />
            {/* Bottom-Right Chevron (Job Description / Market) */}
            <path d="M 56 38 L 36 58 L 26 48 L 40 34 L 30 24 L 38 16 Z" fill="url(#rg-chev-c)" />
            {/* Central Aligned Gap Bridge Diamond */}
            <polygon points="36,31 41,36 36,41 31,36" fill="#FFFFFF" />
          </g>
        )}

        {/* VARIANT 3: Cyber Vortex (NVIDIA / Stepped Contour Aperture) */}
        {variant === 'vortex' && (
          <g filter="url(#rg-mark-glow)">
            <path
              d="M 36 16 A 20 20 0 0 1 56 36 A 20 20 0 0 1 36 56"
              stroke="#8B6CFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 36 23 A 13 13 0 0 1 49 36 A 13 13 0 0 1 36 49"
              stroke="#2DD4F5"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 36 30 A 6 6 0 0 1 42 36 A 6 6 0 0 1 36 42"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 18 36 L 31 36"
              stroke="#2DD4F5"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="36" cy="36" r="2.5" fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
}
