const glowId = 'overview-graph-glow';
const oracleGlowId = 'overview-oracle-glow';

export const OverviewGraphVisual = () => (
  <svg viewBox="0 0 1200 580" aria-hidden="true" preserveAspectRatio="xMidYMid slice" className="overview-hero-svg">
    <defs>
      <radialGradient id="graph-bg" cx="20%" cy="22%" r="78%">
        <stop offset="0%" stopColor="rgba(58, 153, 255, 0.36)" />
        <stop offset="55%" stopColor="rgba(21, 38, 72, 0.34)" />
        <stop offset="100%" stopColor="rgba(3, 9, 18, 0.96)" />
      </radialGradient>
      <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1200" height="580" fill="url(#graph-bg)" />
    <g fill="none" strokeLinecap="round">
      <path d="M100 450 C280 360, 400 340, 530 260 S890 170, 1080 220" stroke="rgba(98,194,255,0.45)" strokeWidth="3" />
      <path d="M120 360 C300 420, 420 390, 570 340 S860 280, 1060 300" stroke="rgba(121,142,255,0.38)" strokeWidth="2.4" />
      <path d="M150 500 C360 510, 500 470, 660 400 S940 280, 1080 200" stroke="rgba(168,124,255,0.34)" strokeWidth="2" />
    </g>
    <g stroke="rgba(147,213,255,0.42)" strokeWidth="1.3" fill="none">
      <path d="M220 390 L365 300 L530 324 L710 246 L882 288" />
      <path d="M365 300 L430 214 L598 190 L760 220" />
      <path d="M530 324 L570 430 L742 462 L960 402" />
    </g>
    <g filter={`url(#${glowId})`}>
      <circle cx="220" cy="390" r="18" fill="rgba(83,211,255,0.9)" />
      <circle cx="365" cy="300" r="16" fill="rgba(125,160,255,0.94)" />
      <circle cx="530" cy="324" r="20" fill="rgba(102,233,255,0.92)" />
      <circle cx="710" cy="246" r="16" fill="rgba(166,136,255,0.9)" />
      <circle cx="882" cy="288" r="19" fill="rgba(102,189,255,0.9)" />
      <circle cx="598" cy="190" r="14" fill="rgba(118,216,255,0.8)" />
      <circle cx="742" cy="462" r="16" fill="rgba(142,152,255,0.85)" />
      <circle cx="960" cy="402" r="13" fill="rgba(173,126,255,0.85)" />
    </g>
    <g stroke="rgba(170,220,255,0.65)" strokeWidth="2" fill="none">
      <path d="M410 213 L460 132 L520 166" />
      <path d="M760 220 L820 154 L884 202" />
      <path d="M570 430 L622 502 L692 472" />
    </g>
    <g fill="none" stroke="rgba(112,227,255,0.45)" strokeWidth="2.2" strokeLinecap="round">
      <path d="M298 332 l28 -10" />
      <path d="M640 286 l35 -14" />
      <path d="M835 345 l26 -8" />
    </g>
  </svg>
);

export const OverviewOracleVisual = () => (
  <svg viewBox="0 0 1200 560" aria-hidden="true" preserveAspectRatio="xMidYMid slice" className="overview-hero-svg">
    <defs>
      <radialGradient id="oracle-bg" cx="76%" cy="40%" r="75%">
        <stop offset="0%" stopColor="rgba(113, 86, 255, 0.34)" />
        <stop offset="52%" stopColor="rgba(17, 43, 77, 0.32)" />
        <stop offset="100%" stopColor="rgba(2, 8, 20, 0.96)" />
      </radialGradient>
      <filter id={oracleGlowId} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="1200" height="560" fill="url(#oracle-bg)" />
    <g fill="none" strokeLinecap="round">
      <path d="M180 450 C340 396, 418 325, 520 286 C620 250, 716 216, 850 168" stroke="rgba(111,220,255,0.42)" strokeWidth="2.4" />
      <path d="M180 450 C312 420, 410 418, 525 412 C686 404, 822 372, 1000 305" stroke="rgba(141,156,255,0.38)" strokeWidth="2.2" />
      <path d="M180 450 C328 458, 432 488, 558 504 C694 520, 826 496, 1035 410" stroke="rgba(193,140,255,0.35)" strokeWidth="2" />
    </g>
    <g fill="none" stroke="rgba(120,236,255,0.7)" strokeWidth="3.4" strokeLinecap="round" filter={`url(#${oracleGlowId})`}>
      <path d="M180 450 C330 390, 436 338, 556 280 C674 224, 784 172, 940 120" />
    </g>
    <g fill="rgba(140,230,255,0.9)" filter={`url(#${oracleGlowId})`}>
      <circle cx="180" cy="450" r="16" />
      <circle cx="520" cy="286" r="11" />
      <circle cx="850" cy="168" r="10" />
      <circle cx="940" cy="120" r="14" />
    </g>
    <g fill="none" stroke="rgba(173,193,255,0.46)" strokeWidth="1.4">
      <path d="M300 374 A180 100 0 0 1 492 250" />
      <path d="M340 436 A240 130 0 0 0 594 388" />
      <path d="M392 486 A255 120 0 0 0 672 472" />
    </g>
    <g fill="none" stroke="rgba(115,231,255,0.54)" strokeWidth="1.5" strokeDasharray="5 9">
      <path d="M624 252 L676 208" />
      <path d="M780 189 L824 160" />
    </g>
  </svg>
);

export const OverviewHeroVisual = () => (
  <div className="overview-hero-media" role="img" aria-label="Graph и Oracle: причинные связи, рычаги и прогнозные траектории">
    <div className="overview-hero-media-pane">
      <OverviewGraphVisual />
    </div>
    <div className="overview-hero-media-seam" />
    <div className="overview-hero-media-pane">
      <OverviewOracleVisual />
    </div>
  </div>
);
