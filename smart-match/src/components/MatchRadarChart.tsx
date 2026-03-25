'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { FactorScores } from '@/lib/matchingEngine';
import { FACTOR_LABELS } from '@/lib/matchingConstants';

interface MatchRadarChartProps {
  factors: FactorScores;
}

export default function MatchRadarChart({ factors }: MatchRadarChartProps) {
  const data = (Object.keys(factors) as (keyof FactorScores)[]).map(key => ({
    factor: FACTOR_LABELS[key],
    score: Math.round(factors[key] * 100),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#dbbde5" strokeOpacity={0.5} />
        <PolarAngleAxis
          dataKey="factor"
          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #dbbde5',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
          }}
          formatter={(value) => [`${value}%`, 'Score']}
        />
        <Radar
          name="Match Score"
          dataKey="score"
          stroke="#471f8d"
          fill="#471f8d"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
