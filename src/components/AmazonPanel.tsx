'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AmazonAnalysis } from '@/lib/data';

interface AmazonPanelProps {
  data: AmazonAnalysis;
}

function MetricCard({
  label,
  value,
  national,
  diff,
  isCurrency,
}: {
  label: string;
  value: number;
  national: number;
  diff: number;
  isCurrency: boolean;
}) {
  const fmt = (v: number) =>
    isCurrency ? `R$ ${v.toFixed(2)}` : v.toLocaleString('es-ES', { maximumFractionDigits: 2 });

  const isHigher = diff > 0;
  // For most metrics, higher = worse for Amazon (except margin might be debatable)
  const diffColor = label === 'Estaciones Encuestadas'
    ? (isHigher ? 'text-green-700' : 'text-red-700')
    : (isHigher ? 'text-red-700' : 'text-green-700');

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-gray-400 uppercase">Amazonia</p>
          <p className="text-lg font-bold text-gray-900">{fmt(value)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase">Nacional</p>
          <p className="text-lg font-semibold text-gray-500">{fmt(national)}</p>
        </div>
      </div>
      <p className={`text-xs font-medium mt-1 ${diffColor}`}>
        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs nacional
      </p>
    </div>
  );
}

export default function AmazonPanel({ data }: AmazonPanelProps) {
  const { metrics, states } = data;

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const chartData = states.map((s) => ({
    ...s,
    // Truncate long names for chart display
    name: s.estado.length > 15 ? s.estado.slice(0, 13) + '...' : s.estado,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Distribucion de Combustibles en la Amazonia
          </h3>
          <p className="text-xs text-gray-500">
            Estados: Amazonas, Para, Acre, Amapa, Rondonia, Roraima, Tocantins — Ultimo ano de datos
          </p>
        </div>
      </div>

      {/* Metric comparison cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            national={m.national}
            diff={m.diff}
            isCurrency={m.label !== 'Estaciones Encuestadas' && m.label !== 'Coef. de Variacion'}
          />
        ))}
      </div>

      {/* State breakdown chart */}
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        Precio medio de reventa por estado amazonico
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="estado"
            stroke="#6b7280"
            fontSize={11}
            tick={{ fill: '#374151' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#6b7280"
            fontSize={12}
            width={70}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                  <p className="font-semibold text-gray-800">{d.estado}</p>
                  <p>Precio Medio: <strong>{formatCurrency(d.precoMedio)}</strong></p>
                  <p>Margen: {formatCurrency(d.margemMedia)}</p>
                  <p>Estaciones: {d.postos.toLocaleString()}</p>
                  <p>Coef. Variacion: {d.coefVariacao.toFixed(3)}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="precoMedio" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-emerald-800 mb-2">
          Caracteristicas de la distribucion amazonica
        </h4>
        <ul className="text-sm text-emerald-900 space-y-1.5 list-disc pl-4">
          <li>
            <strong>Baja densidad de estaciones:</strong> La region tiene significativamente menos estaciones de servicio respecto al total nacional, reflejando la baja densidad poblacional y las enormes distancias.
          </li>
          <li>
            <strong>Precios mas elevados:</strong> El costo logistico del transporte fluvial y por carreteras precarias encarece el combustible respecto al promedio nacional.
          </li>
          <li>
            <strong>Alta variabilidad de precios:</strong> El coeficiente de variacion tiende a ser mayor, indicando poca uniformidad de precios entre localidades aisladas.
          </li>
          <li>
            <strong>Dependencia del transporte fluvial:</strong> Muchas comunidades solo reciben combustible por rio, lo que genera estacionalidad (periodos de sequia dificultan la navegacion).
          </li>
          <li>
            <strong>Margenes mas altos:</strong> La falta de competencia y los costos operativos elevados permiten margenes superiores al promedio nacional.
          </li>
        </ul>
      </div>
    </div>
  );
}
