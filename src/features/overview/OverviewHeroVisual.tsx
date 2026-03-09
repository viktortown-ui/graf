const visualId = 'overview-flow-glow';

export const OverviewHeroVisual = () => (
  <div className="overview-hero-media" role="img" aria-label="Причина в графе проходит через ядро решения и разворачивается в сценарии Oracle">
    <svg viewBox="0 0 1200 980" aria-hidden="true" preserveAspectRatio="xMidYMid slice" className="overview-hero-svg">
      <defs>
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

      <rect width="1200" height="980" fill="url(#graph-zone)" />
      <rect width="1200" height="980" fill="url(#oracle-zone)" />

      <g strokeLinecap="round" fill="none">
        <path d="M148 156 L270 194 L418 236 L550 304" stroke="rgba(118, 209, 255, 0.56)" strokeWidth="3.2" />
        <path d="M148 156 L218 106" stroke="rgba(123, 190, 255, 0.2)" strokeWidth="1.5" />
        <path d="M418 236 L510 172" stroke="rgba(129, 170, 255, 0.2)" strokeWidth="1.4" />
        <path d="M550 304 L682 276" stroke="rgba(108, 218, 255, 0.18)" strokeWidth="1.5" />
      </g>

      <g filter={`url(#${visualId})`}>
        <circle cx="148" cy="156" r="34" fill="url(#pressure-core)" />
        <circle cx="148" cy="156" r="12" fill="rgba(255, 198, 158, 0.92)" />
        <circle cx="270" cy="194" r="14" fill="rgba(109, 217, 255, 0.8)" />
        <circle cx="418" cy="236" r="14" fill="rgba(126, 186, 255, 0.74)" />
        <circle cx="550" cy="304" r="16" fill="rgba(112, 225, 255, 0.84)" />
        <circle cx="218" cy="106" r="8" fill="rgba(109, 186, 255, 0.4)" />
        <circle cx="510" cy="172" r="8" fill="rgba(145, 153, 255, 0.38)" />
        <circle cx="682" cy="276" r="9" fill="rgba(106, 203, 255, 0.34)" />
      </g>

      <path d="M550 304 C594 364, 602 420, 600 466" stroke="rgba(133, 228, 255, 0.76)" strokeWidth="4.2" fill="none" filter={`url(#${visualId})`} />

      <g transform="translate(600,500)">
        <circle r="82" fill="rgba(24, 46, 84, 0.48)" stroke="rgba(116, 220, 255, 0.36)" strokeWidth="1.3" />
        <circle r="48" fill="rgba(11, 25, 48, 0.72)" stroke="rgba(154, 206, 255, 0.7)" strokeWidth="2" />
        <circle r="8" fill="rgba(157, 244, 255, 0.96)" filter={`url(#${visualId})`} />
        <path d="M-60 -6 C-24 -20, 16 -18, 58 -4" stroke="rgba(125, 203, 255, 0.52)" strokeWidth="1.4" fill="none" />
        <path d="M-52 16 C-12 28, 20 30, 52 16" stroke="rgba(173, 153, 255, 0.44)" strokeWidth="1.3" fill="none" />
      </g>

      <g strokeLinecap="round" fill="none">
        <path d="M600 560 C514 662, 398 760, 238 856" stroke="rgba(99, 199, 255, 0.42)" strokeWidth="2.9" />
        <path d="M600 560 C642 680, 706 776, 812 846" stroke="rgba(130, 154, 255, 0.38)" strokeWidth="2.5" />
        <path d="M600 560 C722 646, 866 718, 1060 800" stroke="rgba(120, 238, 255, 0.92)" strokeWidth="5" filter={`url(#${visualId})`} />
      </g>

      <g filter={`url(#${visualId})`}>
        <circle cx="238" cy="856" r="16" fill="rgba(92, 152, 220, 0.7)" />
        <circle cx="812" cy="846" r="15" fill="rgba(136, 128, 225, 0.72)" />
        <circle cx="1060" cy="800" r="28" fill="rgba(123, 247, 255, 0.99)" />
      </g>

      <g stroke="rgba(166, 207, 255, 0.12)" strokeWidth="1" fill="none">
        <path d="M172 710 C344 654, 516 658, 720 694" />
        <path d="M248 764 C430 706, 636 714, 862 776" />
      </g>

      <g className="overview-hero-labels">
        <text x="88" y="128">давление</text>
        <text x="576" y="480">ядро</text>
        <text x="760" y="610">выбор</text>
        <text x="1028" y="770">лучший ход</text>
      </g>
    </svg>
  </div>
);
