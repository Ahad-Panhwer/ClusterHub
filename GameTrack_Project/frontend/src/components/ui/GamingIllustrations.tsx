import React from 'react';

/**
 * Custom vector illustrations crafted in ClusterHub's pastel gaming design system.
 * Palette:
 * - Primary lavender: #8B7CF6
 * - Sky blue: #67B7F7
 * - Mint green: #6FD6B0
 * - Peach/coral: #FFAD91
 * - Soft yellow: #FFD978
 * - Soft lavender bg: #F1EEFF
 * - Main text: #252842
 */

export const GameControllerIllustration: React.FC<{ className?: string }> = ({
  className = 'w-40 h-32',
}) => (
  <svg
    className={className}
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bodyGrad" x1="20" y1="20" x2="180" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.65" stopColor="#F8F6FF" />
        <stop offset="1" stopColor="#EDE8FF" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="100" y1="10" x2="100" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B7CF6" stopOpacity="0.28" />
        <stop offset="0.7" stopColor="#67B7F7" stopOpacity="0.12" />
        <stop offset="1" stopColor="#6FD6B0" stopOpacity="0.02" />
      </linearGradient>
      <filter id="softShadow" x="12" y="24" width="176" height="126" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#8B7CF6" floodOpacity="0.22" />
      </filter>
    </defs>

    {/* Background Soft Glow Aura */}
    <ellipse cx="100" cy="85" rx="86" ry="58" fill="url(#glowGrad)" />

    {/* Controller Body Shell */}
    <g filter="url(#softShadow)">
      <path
        d="M48 42C62 38 138 38 152 42C168 46 182 66 178 98C175 120 156 138 140 134C126 130 118 108 100 108C82 108 74 130 60 134C44 138 25 120 22 98C18 66 32 46 48 42Z"
        fill="url(#bodyGrad)"
        stroke="#E9EAF3"
        strokeWidth="2.5"
      />
    </g>

    {/* Grip Ergonomic Lines */}
    <path d="M38 72C36 84 38 102 46 114" stroke="#8B7CF6" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M162 72C164 84 162 102 154 114" stroke="#67B7F7" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />

    {/* D-Pad (Left) */}
    <g transform="translate(54, 68)">
      <rect x="7" y="0" width="8" height="22" rx="3.5" fill="#8B7CF6" />
      <rect x="0" y="7" width="22" height="8" rx="3.5" fill="#8B7CF6" />
      <circle cx="11" cy="11" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />
    </g>

    {/* Action Buttons (Right) in ClusterHub Pastels */}
    <g transform="translate(132, 68)">
      {/* Top Button - Mint Green */}
      <circle cx="11" cy="1" r="4.5" fill="#6FD6B0" />
      {/* Right Button - Sky Blue */}
      <circle cx="21" cy="11" r="4.5" fill="#67B7F7" />
      {/* Bottom Button - Peach Coral */}
      <circle cx="11" cy="21" r="4.5" fill="#FFAD91" />
      {/* Left Button - Soft Yellow */}
      <circle cx="1" cy="11" r="4.5" fill="#FFD978" />
    </g>

    {/* Center Touchpad & Brand Nodes */}
    <rect x="85" y="52" width="30" height="18" rx="6" fill="#8B7CF6" fillOpacity="0.14" stroke="#8B7CF6" strokeWidth="1.5" />
    <circle cx="95" cy="61" r="2.5" fill="#8B7CF6" />
    <circle cx="105" cy="61" r="2.5" fill="#67B7F7" />
    <line x1="97" y1="61" x2="103" y2="61" stroke="#8B7CF6" strokeWidth="1.5" strokeDasharray="1 1" />

    {/* Thumbsticks */}
    <circle cx="78" cy="95" r="11" fill="#EAE5FD" stroke="#8B7CF6" strokeWidth="1.5" />
    <circle cx="78" cy="95" r="5.5" fill="#8B7CF6" />
    <circle cx="122" cy="95" r="11" fill="#E5F3FD" stroke="#67B7F7" strokeWidth="1.5" />
    <circle cx="122" cy="95" r="5.5" fill="#67B7F7" />

    {/* Floating Playful Sparkles & Dots */}
    <path d="M30 35L33 42L40 45L33 48L30 55L27 48L20 45L27 42Z" fill="#FFD978" opacity="0.9" />
    <path d="M170 30L172 35L177 37L172 39L170 44L168 39L163 37L168 35Z" fill="#6FD6B0" opacity="0.9" />
    <circle cx="166" cy="132" r="3.5" fill="#FFAD91" />
    <circle cx="34" cy="126" r="3.5" fill="#67B7F7" />
    <circle cx="100" cy="24" r="2.5" fill="#8B7CF6" opacity="0.7" />
  </svg>
);

export const TournamentTrophyIllustration: React.FC<{ className?: string }> = ({
  className = 'w-36 h-36',
}) => (
  <svg
    className={className}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="cupGrad" x1="45" y1="30" x2="115" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF4C4" />
        <stop offset="0.55" stopColor="#FFD978" />
        <stop offset="1" stopColor="#F5B942" />
      </linearGradient>
      <linearGradient id="baseGrad" x1="50" y1="120" x2="110" y2="150" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B7CF6" />
        <stop offset="1" stopColor="#6C5CDA" />
      </linearGradient>
      <filter id="trophyGlow" x="20" y="20" width="120" height="130" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#FFD978" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Soft Aura */}
    <circle cx="80" cy="70" r="54" fill="#FFD978" fillOpacity="0.18" />

    {/* Handles */}
    <path
      d="M50 48C34 48 30 68 44 80C50 86 58 88 64 90"
      stroke="#FFD978"
      strokeWidth="6.5"
      strokeLinecap="round"
    />
    <path
      d="M110 48C126 48 130 68 116 80C110 86 102 88 96 90"
      stroke="#FFD978"
      strokeWidth="6.5"
      strokeLinecap="round"
    />

    {/* Cup Body */}
    <g filter="url(#trophyGlow)">
      <path
        d="M45 36C45 36 48 94 80 94C112 94 115 36 115 36H45Z"
        fill="url(#cupGrad)"
        stroke="#E5A823"
        strokeWidth="2"
      />
    </g>

    {/* Rim */}
    <rect x="42" y="32" width="76" height="8" rx="4" fill="#FFEAA0" stroke="#E5A823" strokeWidth="1.5" />

    {/* Stem */}
    <path d="M74 94H86V116H74V94Z" fill="#E5A823" />
    <path d="M68 116H92V122H68V116Z" fill="#FFEAA0" />

    {/* Trophy Base */}
    <rect x="52" y="122" width="56" height="24" rx="7" fill="url(#baseGrad)" stroke="#E9EAF3" strokeWidth="1.5" />
    <rect x="62" y="130" width="36" height="8" rx="3" fill="#FFFFFF" fillOpacity="0.95" />

    {/* Trophy Star Emblem */}
    <path
      d="M80 48L83 57L92 58L86 64L88 73L80 69L72 73L74 64L68 58L77 57Z"
      fill="#FFFFFF"
      fillOpacity="0.95"
    />

    {/* Floating Stars & Confetti */}
    <circle cx="32" cy="40" r="3.5" fill="#67B7F7" />
    <circle cx="128" cy="42" r="4" fill="#6FD6B0" />
    <path d="M125 105L127 109L131 110L127 112L125 116L123 112L119 110L123 109Z" fill="#FFAD91" />
    <path d="M30 100L32 103L35 104L32 106L30 109L28 106L25 104L28 103Z" fill="#8B7CF6" />
  </svg>
);

export const MatchVersusIllustration: React.FC<{ className?: string }> = ({
  className = 'w-36 h-32',
}) => (
  <svg
    className={className}
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="swordLavender" x1="20" y1="20" x2="140" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="1" stopColor="#8B7CF6" />
      </linearGradient>
      <linearGradient id="swordSky" x1="140" y1="20" x2="20" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#67B7F7" />
      </linearGradient>
    </defs>

    {/* Center Glow */}
    <circle cx="80" cy="70" r="45" fill="#F1EEFF" />

    {/* Crossed Energy Blades */}
    {/* Blade 1: Top-Left to Bottom-Right */}
    <g transform="rotate(45 80 70)">
      <rect x="76" y="20" width="8" height="100" rx="4" fill="url(#swordLavender)" />
      <rect x="70" y="90" width="20" height="6" rx="3" fill="#8B7CF6" />
      <circle cx="80" cy="110" r="4" fill="#6FD6B0" />
    </g>

    {/* Blade 2: Top-Right to Bottom-Left */}
    <g transform="rotate(-45 80 70)">
      <rect x="76" y="20" width="8" height="100" rx="4" fill="url(#swordSky)" />
      <rect x="70" y="90" width="20" height="6" rx="3" fill="#67B7F7" />
      <circle cx="80" cy="110" r="4" fill="#FFAD91" />
    </g>

    {/* Center Clash Spark */}
    <circle cx="80" cy="70" r="14" fill="#FFFFFF" stroke="#FFD978" strokeWidth="2.5" />
    <path d="M80 62L82 68L88 70L82 72L80 78L78 72L72 70L78 68Z" fill="#FFD978" />

    {/* Energy Particles */}
    <circle cx="50" cy="40" r="3" fill="#8B7CF6" />
    <circle cx="110" cy="40" r="3" fill="#67B7F7" />
    <circle cx="45" cy="100" r="2.5" fill="#6FD6B0" />
    <circle cx="115" cy="100" r="2.5" fill="#FFAD91" />
  </svg>
);

export const EsportsPodiumIllustration: React.FC<{ className?: string }> = ({
  className = 'w-48 h-32',
}) => (
  <svg
    className={className}
    viewBox="0 0 200 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Glow */}
    <ellipse cx="100" cy="90" rx="80" ry="30" fill="#F1EEFF" />

    {/* 2nd Place Podium (Left) */}
    <g transform="translate(25, 45)">
      <rect x="0" y="25" width="45" height="50" rx="8" fill="#F1EEFF" stroke="#E0D8FD" strokeWidth="2" />
      <rect x="0" y="25" width="45" height="10" rx="4" fill="#E0D8FD" />
      <text x="22" y="62" fill="#8B7CF6" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">2</text>
      <circle cx="22" cy="12" r="8" fill="#8B7CF6" />
      <path d="M19 12L21 14L25 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* 1st Place Podium (Center - Highest) */}
    <g transform="translate(77, 20)">
      <rect x="0" y="20" width="46" height="80" rx="10" fill="#FEF9EB" stroke="#FDE8B5" strokeWidth="2" />
      <rect x="0" y="20" width="46" height="12" rx="4" fill="#FFD978" />
      <text x="23" y="68" fill="#96680A" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">1</text>
      {/* Crown / Star on Top */}
      <circle cx="23" cy="6" r="10" fill="#FFD978" />
      <path d="M23 1L25 5L29 6L26 9L27 13L23 11L19 13L20 9L17 6L21 5Z" fill="#96680A" />
    </g>

    {/* 3rd Place Podium (Right) */}
    <g transform="translate(130, 55)">
      <rect x="0" y="25" width="45" height="40" rx="8" fill="#FFF2EE" stroke="#FFD4C4" strokeWidth="2" />
      <rect x="0" y="25" width="45" height="10" rx="4" fill="#FFAD91" />
      <text x="22" y="55" fill="#A63519" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">3</text>
      <circle cx="22" cy="12" r="7" fill="#FFAD91" />
      <path d="M19 12L21 14L25 10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </g>

    {/* Decorative Confetti */}
    <circle cx="30" cy="20" r="3" fill="#67B7F7" />
    <circle cx="170" cy="25" r="3.5" fill="#6FD6B0" />
    <path d="M100 8L102 12L106 13L102 15L100 19L98 15L94 13L98 12Z" fill="#FFD978" />
  </svg>
);
