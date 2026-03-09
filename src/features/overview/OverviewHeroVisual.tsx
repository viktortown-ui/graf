const visualId = 'overview-flow-glow';

export const OverviewHeroVisual = () => (
  <div className="overview-hero-media" role="img" aria-label="Причина в графе проходит через ядро решения и разворачивается в сценарии Oracle">
    <svg viewBox="0 0 1200 980" aria-hidden="true" preserveAspectRatio="xMidYMid slice" className="overview-hero-svg">
      <defs>
        <linearGradient id="flow-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(5, 17, 30, 0.98)" />
          <stop offset="46%" stopColor="rgba(6, 12, 24, 0.98)" />
          <stop offset="100%" stopColor="rgba(4, 9, 20, 0.98)" />
        </linearGradient>
        <radialGradient id="graph-zone" cx="32%" cy="14%" r="58%">
          <stop offset="0%" stopColor="rgba(92, 208, 255, 0.24)" />
          <stop offset="72%" stopColor="rgba(8, 20, 36, 0)" />
        </radialGradient>
        <radialGradient id="oracle-zone" cx="70%" cy="84%" r="62%">
          <stop offset="0%" stopColor="rgba(120, 102, 255, 0.2)" />
          <stop offset="78%" stopColor="rgba(9, 16, 32, 0)" />
        </radialGradient>
        <radialGradient id="pressure-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 145, 96, 0.95)" />
          <stop offset="100%" stopColor="rgba(255, 145, 96, 0.05)" />
        </radialGradient>
        <filter id={visualId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="980" fill="url(#flow-bg)" />
      <rect width="1200" height="980" fill="url(#graph-zone)" />
      <rect width="1200" height="980" fill="url(#oracle-zone)" />

      <g strokeLinecap="round" fill="none">
        <path d="M130 160 L250 194 L370 214 L500 250 L580 330" stroke="rgba(118, 209, 255, 0.52)" strokeWidth="2.8" />
        <path d="M250 194 L320 110" stroke="rgba(123, 190, 255, 0.28)" strokeWidth="1.7" />
        <path d="M370 214 L460 140" stroke="rgba(129, 170, 255, 0.24)" strokeWidth="1.6" />
        <path d="M500 250 L640 190" stroke="rgba(162, 142, 255, 0.22)" strokeWidth="1.5" />
        <path d="M500 250 L418 318" stroke="rgba(102, 202, 255, 0.2)" strokeWidth="1.5" />
        <path d="M580 330 L700 346" stroke="rgba(102, 202, 255, 0.16)" strokeWidth="1.4" />
      </g>

      <g filter={`url(#${visualId})`}>
        <circle cx="130" cy="160" r="26" fill="url(#pressure-core)" />
        <circle cx="250" cy="194" r="16" fill="rgba(109, 217, 255, 0.88)" />
        <circle cx="370" cy="214" r="15" fill="rgba(126, 186, 255, 0.84)" />
        <circle cx="500" cy="250" r="16" fill="rgba(127, 163, 255, 0.82)" />
        <circle cx="580" cy="330" r="18" fill="rgba(112, 225, 255, 0.9)" />
        <circle cx="320" cy="110" r="10" fill="rgba(109, 186, 255, 0.58)" />
        <circle cx="460" cy="140" r="9" fill="rgba(145, 153, 255, 0.52)" />
        <circle cx="640" cy="190" r="10" fill="rgba(163, 139, 255, 0.56)" />
        <circle cx="418" cy="318" r="9" fill="rgba(106, 203, 255, 0.52)" />
      </g>

      <path d="M580 330 C602 378, 605 418, 602 462" stroke="rgba(133, 228, 255, 0.76)" strokeWidth="4" fill="none" filter={`url(#${visualId})`} />

      <g transform="translate(600,500)">
        <circle r="72" fill="rgba(24, 46, 84, 0.72)" stroke="rgba(116, 220, 255, 0.46)" strokeWidth="1.5" />
        <circle r="44" fill="rgba(11, 25, 48, 0.9)" stroke="rgba(154, 206, 255, 0.72)" strokeWidth="2" />
        <circle r="8" fill="rgba(157, 244, 255, 0.96)" filter={`url(#${visualId})`} />
        <path d="M-60 -6 C-24 -20, 16 -18, 58 -4" stroke="rgba(125, 203, 255, 0.52)" strokeWidth="1.4" fill="none" />
        <path d="M-52 16 C-12 28, 20 30, 52 16" stroke="rgba(173, 153, 255, 0.44)" strokeWidth="1.3" fill="none" />
      </g>

      <g strokeLinecap="round" fill="none">
        <path d="M600 560 C515 662, 408 758, 250 850" stroke="rgba(99, 199, 255, 0.46)" strokeWidth="3" />
        <path d="M600 560 C636 676, 706 768, 794 842" stroke="rgba(130, 154, 255, 0.42)" strokeWidth="2.6" />
        <path d="M600 560 C710 644, 850 716, 1050 800" stroke="rgba(120, 238, 255, 0.88)" strokeWidth="4.2" filter={`url(#${visualId})`} />
      </g>

      <g filter={`url(#${visualId})`}>
        <circle cx="250" cy="850" r="18" fill="rgba(92, 152, 220, 0.82)" />
        <circle cx="794" cy="842" r="16" fill="rgba(136, 128, 225, 0.84)" />
        <circle cx="1050" cy="800" r="25" fill="rgba(123, 247, 255, 0.98)" />
      </g>

      <g stroke="rgba(166, 207, 255, 0.18)" strokeWidth="1.2" fill="none">
        <path d="M180 710 C340 654, 516 654, 720 694" />
        <path d="M260 760 C430 706, 624 710, 860 772" />
      </g>
    </svg>
  </div>
);
