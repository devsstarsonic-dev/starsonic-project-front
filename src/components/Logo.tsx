interface LogoProps {
  className?: string;
  size?: number;
  withGlowFilter?: boolean;
}

export function StarLogo({
  className,
  size = 40,
  withGlowFilter = true,
}: LogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoStar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3be6ff" />
          <stop offset="50%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#0099cc" />
        </linearGradient>
        {withGlowFilter && (
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <g filter={withGlowFilter ? "url(#logoGlow)" : undefined}>
        <path
          d="M 50 8 L 56 38 L 88 44 L 60 50 L 88 56 L 56 62 L 50 92 L 44 62 L 12 56 L 40 50 L 12 44 L 44 38 Z"
          fill="url(#logoStar)"
        />
        <ellipse
          cx="56"
          cy="38"
          rx="4"
          ry="3"
          fill="#fff"
          transform="rotate(-20 56 38)"
        />
        <line
          x1="58"
          y1="20"
          x2="58"
          y2="38"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      <circle cx="50" cy="50" r="3" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function StarLogoBig({ className }: { className?: string }) {
  return (
    <div className={`star-logo-big ${className || ""}`}>
      <div className="logo-container">
        <div className="logo-background" />
        <svg
          className="logo-svg"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoStarBig" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3be6ff" />
              <stop offset="50%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#0099cc" />
            </linearGradient>
            <filter id="logoGlowBig" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#logoGlowBig)">
            <path
              d="M 50 8 L 56 38 L 88 44 L 60 50 L 88 56 L 56 62 L 50 92 L 44 62 L 12 56 L 40 50 L 12 44 L 44 38 Z"
              fill="url(#logoStarBig)"
            />
            <ellipse
              cx="56"
              cy="38"
              rx="4"
              ry="3"
              fill="#fff"
              transform="rotate(-20 56 38)"
            />
            <line
              x1="58"
              y1="20"
              x2="58"
              y2="38"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
          <circle cx="50" cy="50" r="3" fill="#fff" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
