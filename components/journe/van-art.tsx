// Cartoon versions of the actual van: baby-blue '97 E350, black bug deflector + grille,
// chrome front bumper, solar on a roof rack, tow mirrors, hood light pods, black steelies on ATs.
const BLUE = "oklch(0.72 0.07 245)"
const BLUE_SHADE = "oklch(0.62 0.07 245)"
const BLACK = "oklch(0.17 0 0)"
const TINT = "oklch(0.22 0.02 250)"
const CHROME = "oklch(0.86 0 0)"
const AMBER = "oklch(0.82 0.11 80)"
const SOLAR = "oklch(0.33 0.06 255)"

// Front-on view, centered on (0,0) so it can be translated straight onto the road.
export function VanFront() {
  return (
    <g>
      <ellipse cx="0" cy="22" rx="21" ry="3" fill="black" opacity="0.4" />
      {/* tires */}
      {[-18.5, 10.5].map((x) => (
        <g key={x}>
          <rect x={x} y="9" width="8" height="13" rx="2" fill={BLACK} />
          {[12, 15, 18].map((y) => (
            <line key={y} x1={x + 1} y1={y} x2={x + 7} y2={y} stroke="oklch(0.3 0 0)" strokeWidth="0.8" />
          ))}
        </g>
      ))}
      {/* roof rack + solar */}
      <rect x="-18" y="-25" width="36" height="3" rx="0.5" fill={SOLAR} />
      <line x1="-6" y1="-25" x2="-6" y2="-22" stroke="oklch(0.5 0.05 255)" strokeWidth="0.5" />
      <line x1="6" y1="-25" x2="6" y2="-22" stroke="oklch(0.5 0.05 255)" strokeWidth="0.5" />
      <rect x="-20" y="-22" width="40" height="2" rx="0.5" fill={BLACK} />
      {/* tow mirrors */}
      <line x1="-15" y1="-7" x2="-21" y2="-7" stroke={BLACK} strokeWidth="1.2" />
      <line x1="15" y1="-7" x2="21" y2="-7" stroke={BLACK} strokeWidth="1.2" />
      <rect x="-25" y="-12" width="5" height="10" rx="1.2" fill={BLACK} />
      <rect x="20" y="-12" width="5" height="10" rx="1.2" fill={BLACK} />
      {/* body */}
      <path d="M-13 -20 H13 Q16.5 -20 16.5 -16 L17.5 -3 V14 H-17.5 V-3 L-16.5 -16 Q-16.5 -20 -13 -20 Z" fill={BLUE} />
      <path d="M17.5 -3 V14 H14 V-3 Z" fill={BLUE_SHADE} />
      {/* windshield */}
      <path d="M-13 -17 H13 L14.5 -5.5 H-14.5 Z" fill={TINT} />
      <path d="M-9 -15 L-12 -7" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="-10" y1="-5.5" x2="-2" y2="-7.5" stroke={BLACK} strokeWidth="0.8" />
      <line x1="2" y1="-5.5" x2="10" y2="-7.5" stroke={BLACK} strokeWidth="0.8" />
      {/* light pods */}
      {[-15, 12].map((x) => (
        <g key={x}>
          <rect x={x} y="-5.5" width="3" height="2.5" rx="0.5" fill={BLACK} />
          <rect x={x + 0.7} y="-5" width="1.6" height="1.5" fill="oklch(0.95 0 0)" />
        </g>
      ))}
      {/* bug deflector */}
      <rect x="-16.5" y="-3" width="33" height="3.2" rx="1.6" fill={BLACK} />
      {/* headlights + grille */}
      <rect x="-15.5" y="1.5" width="6.5" height="6" rx="1" fill={AMBER} />
      <rect x="9" y="1.5" width="6.5" height="6" rx="1" fill={AMBER} />
      <rect x="-8" y="1" width="16" height="7" rx="1.5" fill={BLACK} />
      {[3, 5, 7].map((y) => (
        <line key={y} x1="-6.5" y1={y - 0.5} x2="6.5" y2={y - 0.5} stroke="oklch(0.32 0 0)" strokeWidth="0.7" />
      ))}
      {/* chrome bumper + black valance */}
      <rect x="-18.5" y="8.5" width="37" height="3.2" rx="1.5" fill={CHROME} />
      <line x1="-17" y1="9.3" x2="17" y2="9.3" stroke="white" strokeOpacity="0.8" strokeWidth="0.6" />
      <rect x="-17" y="11.7" width="34" height="3.3" rx="1" fill={BLACK} />
      <rect x="-4" y="12.2" width="8" height="2.4" rx="0.4" fill="oklch(0.3 0 0)" />
    </g>
  )
}

// Side view for the hero, facing right.
export function VanSide() {
  return (
    <svg viewBox="0 0 220 100" className="w-full h-auto overflow-visible" aria-hidden="true">
      {/* solar panels on a black rack */}
      <rect x="34" y="7" width="140" height="5" rx="1" fill={SOLAR} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={34 + i * 20} y1="7" x2={34 + i * 20} y2="12" stroke="oklch(0.5 0.05 255)" strokeWidth="0.6" />
      ))}
      <rect x="28" y="12" width="152" height="3" rx="1" fill={BLACK} />
      {[34, 78, 122, 166].map((x) => (
        <rect key={x} x={x} y="15" width="3" height="5" fill={BLACK} />
      ))}

      {/* body */}
      <path
        d="M22 20 H166 Q173 20 177 26 L190 46 H200 Q207 46 207 53 V71 Q207 76 202 76 H18 Q12 76 12 70 V28 Q12 20 22 20 Z"
        fill={BLUE}
      />
      <path d="M12 64 H207 V71 Q207 76 202 76 H18 Q12 76 12 70 Z" fill={BLUE_SHADE} />

      {/* tinted windows */}
      {[22, 54, 86, 118].map((x) => (
        <rect key={x} x={x} y="27" width="27" height="17" rx="2" fill={TINT} />
      ))}
      <path d="M150 27 H173 L184 44 H150 Z" fill={TINT} />
      {[24, 56, 88, 120].map((x) => (
        <line key={x} x1={x + 4} y1="41" x2={x + 12} y2="30" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
      ))}

      {/* door seams + handle */}
      <line x1="147" y1="22" x2="147" y2="75" stroke={BLUE_SHADE} strokeWidth="0.8" />
      <line x1="84" y1="22" x2="84" y2="75" stroke={BLUE_SHADE} strokeWidth="0.8" />
      <rect x="151" y="49" width="7" height="2" rx="1" fill={BLACK} />

      {/* tow mirror + light pod */}
      <line x1="176" y1="36" x2="181" y2="36" stroke={BLACK} strokeWidth="1.5" />
      <rect x="179" y="29" width="5" height="12" rx="1.2" fill={BLACK} />
      <rect x="186" y="41" width="5" height="4" rx="0.8" fill={BLACK} />
      <rect x="187" y="42" width="3" height="2" fill="oklch(0.95 0 0)" />

      {/* bug deflector, headlight, grille */}
      <path d="M188 46 H200 Q207 46 207.5 51 H190 Z" fill={BLACK} />
      <rect x="202" y="52" width="6" height="6" rx="1" fill={AMBER} />
      <rect x="205" y="58" width="3" height="6" fill={BLACK} />

      {/* bumpers + running board */}
      <rect x="198" y="64" width="13" height="5" rx="1.5" fill={CHROME} />
      <rect x="199" y="69" width="11" height="6" rx="1" fill={BLACK} />
      <rect x="8" y="66" width="9" height="9" rx="1.5" fill={BLACK} />
      <rect x="70" y="74" width="84" height="3.5" rx="1.75" fill={BLACK} />
      {[80, 140].map((x) => (
        <rect key={x} x={x} y="71" width="2.5" height="4" fill={BLACK} />
      ))}
      <rect x="11" y="38" width="3" height="8" rx="1" fill="oklch(0.6 0.2 25)" />

      {/* wheel arches */}
      <circle cx="52" cy="78" r="15" fill="var(--background)" />
      <circle cx="170" cy="78" r="15" fill="var(--background)" />

      {/* chunky all-terrains on black steelies */}
      {[52, 170].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="78" r="12.5" fill={BLACK} />
          <circle cx={cx} cy="78" r="11.5" fill="none" stroke="oklch(0.28 0 0)" strokeWidth="2" strokeDasharray="2.5 2" />
          <g className="journe-wheel">
            <circle cx={cx} cy="78" r="6.5" fill="oklch(0.24 0 0)" />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle
                key={a}
                // rounded so server and browser print the same number (avoids a hydration warning)
                cx={(cx + 4 * Math.cos((a * Math.PI) / 180)).toFixed(2)}
                cy={(78 + 4 * Math.sin((a * Math.PI) / 180)).toFixed(2)}
                r="0.9"
                fill="oklch(0.5 0 0)"
              />
            ))}
            <circle cx={cx} cy="78" r="1.8" fill="oklch(0.4 0 0)" />
          </g>
        </g>
      ))}
    </svg>
  )
}
