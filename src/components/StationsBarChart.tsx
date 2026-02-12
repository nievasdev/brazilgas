'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { StationDistribution } from '@/lib/data';

const REGION_COLORS: Record<string, string> = {
  'NORTE': '#3b82f6',
  'NORDESTE': '#f59e0b',
  'CENTRO OESTE': '#22c55e',
  'SUDESTE': '#ef4444',
  'SUL': '#a855f7',
};

interface StationsBarChartProps {
  data: StationDistribution[];
}

export default function StationsBarChart({ data }: StationsBarChartProps) {
  const total = data.reduce((sum, d) => sum + d.postos, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Distribucion Actual de Estaciones por Estado
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Periodo mas reciente — {total.toLocaleString()} estaciones totales
      </p>

      <div className="flex gap-3 mb-3 flex-wrap">
        {Object.entries(REGION_COLORS).map(([region, color]) => (
          <div key={region} className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span>{region}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={700}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <YAxis
            type="category"
            dataKey="estado"
            width={160}
            stroke="#6b7280"
            fontSize={11}
            tick={{ fill: '#374151' }}
          />
          <Tooltip
            formatter={(value: number | undefined) => [value ? value.toLocaleString() : '0', 'Estaciones']}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="postos" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.estado}
                fill={REGION_COLORS[entry.regiao] || '#6b7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
