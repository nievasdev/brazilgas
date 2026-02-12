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
  ReferenceLine,
} from 'recharts';
import { MarginData } from '@/lib/data';

const REGION_COLORS: Record<string, string> = {
  'NORTE': '#3b82f6',
  'NORDESTE': '#f59e0b',
  'CENTRO OESTE': '#22c55e',
  'SUDESTE': '#ef4444',
  'SUL': '#a855f7',
};

interface MarginChartProps {
  data: MarginData[];
}

export default function MarginChart({ data }: MarginChartProps) {
  const avgMargem = data.length > 0
    ? data.reduce((s, d) => s + d.margemMedia, 0) / data.length
    : 0;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Margen de Ganancia Promedio por Estado
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Ultimo ano de datos — Margen = Precio Reventa - Precio Distribucion
      </p>

      <div className="flex gap-3 mb-3 flex-wrap">
        {Object.entries(REGION_COLORS).map(([region, color]) => (
          <div key={region} className="flex items-center gap-1 text-xs text-gray-600">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span>{region}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
          <div className="w-4 border-t-2 border-dashed border-gray-400" />
          <span>Promedio nacional: {formatCurrency(avgMargem)}</span>
        </div>
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
            tickFormatter={formatCurrency}
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
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload as MarginData;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                  <p className="font-semibold text-gray-800">{d.estado}</p>
                  <p className="text-gray-600">Region: {d.regiao}</p>
                  <div className="mt-1.5 space-y-0.5">
                    <p>Margen: <strong className="text-green-700">{formatCurrency(d.margemMedia)}</strong></p>
                    <p className="text-gray-500">Precio Reventa: {formatCurrency(d.precoRevenda)}</p>
                    <p className="text-gray-500">Precio Distribucion: {formatCurrency(d.precoDistribuicao)}</p>
                  </div>
                </div>
              );
            }}
          />
          <ReferenceLine
            x={avgMargem}
            stroke="#9ca3af"
            strokeDasharray="4 4"
          />
          <Bar dataKey="margemMedia" radius={[0, 4, 4, 0]}>
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
