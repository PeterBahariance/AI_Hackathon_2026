'use client';

interface MatchScoreBadgeProps {
  score: number;        // 0–100
  size?: number;        // diameter in px (default 64)
}

export default function MatchScoreBadge({ score, size = 64 }: MatchScoreBadgeProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color based on score
  const color = score >= 75 ? '#059669' : score >= 55 ? '#d97706' : '#94a3b8';
  const bgColor = score >= 75 ? '#ecfdf5' : score >= 55 ? '#fffbeb' : '#f8fafc';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={bgColor}
          stroke="#e2e8f0"
          strokeWidth={3}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <span
        className="absolute font-black"
        style={{ color, fontSize: size * 0.3 }}
      >
        {score}
      </span>
    </div>
  );
}
