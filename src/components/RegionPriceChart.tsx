'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PRODUTOS } from '@/types';
import { PRODUTO_COLORS } from '@/lib/constants';
import { RegionPriceData } from '@/lib/data';

const PRODUTO_LABELS: Record<string, string> = {
  'GASOLINA COMUM': 'Gasolina',
  'GLP': 'GLP',
  'ÓLEO DIESEL': 'Diesel',
  'ÓLEO DIESEL S10': 'Diesel S10',
};

const REGION_LABELS: Record<string, string> = {
  'NORTE': 'Norte',
  'NORDESTE': 'Nordeste',
  'CENTRO OESTE': 'Centro-Oeste',
  'SUDESTE': 'Sudeste',
  'SUL': 'Sul',
};

interface RegionPriceChartProps {
  data: RegionPriceData[];
}

export default function RegionPriceChart({ data }: RegionPriceChartProps) {
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  // Sort by average price across products (most expensive first)
  const sorted = [...data].sort((a, b) => {
    const avgA = PRODUTOS.reduce((s, p) => s + (Number(a[p]) || 0), 0) / PRODUTOS.length;
    const avgB = PRODUTOS.reduce((s, p) => s + (Number(b[p]) || 0), 0) / PRODUTOS.length;
    return avgB - avgA;
  });

  const chartData = sorted.map((d) => ({
    ...d,
    regiao: REGION_LABELS[d.regiao] || d.regiao,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Precio Promedio por Region y Combustible
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Ultimo ano de datos — Ordenado de mayor a menor precio promedio
      </p>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="regiao"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#374151' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#6b7280"
            fontSize={12}
            width={70}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [
              value ? formatCurrency(value) : 'N/A',
              name ? (PRODUTO_LABELS[name] || name) : '',
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Legend
            formatter={(value: string) => PRODUTO_LABELS[value] || value}
            wrapperStyle={{ fontSize: '12px' }}
          />
          {PRODUTOS.map((produto) => (
            <Bar
              key={produto}
              dataKey={produto}
              name={produto}
              fill={PRODUTO_COLORS[produto] || '#8884d8'}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-2">
          Hipotesis sobre las diferencias regionales
        </h4>
        <ul className="text-sm text-amber-900 space-y-1.5 list-disc pl-4">
          <li>
            <strong>Distancia a refinerias:</strong> Las regiones Norte y Nordeste estan mas alejadas de los principales polos de refinacion (Sudeste y Sul), lo que incrementa costos logisticos de transporte.
          </li>
          <li>
            <strong>Infraestructura logistica:</strong> El Norte depende fuertemente del transporte fluvial y carreteras precarias, encareciendo la distribucion.
          </li>
          <li>
            <strong>Competencia entre distribuidoras:</strong> El Sudeste y Sul tienen mayor densidad de estaciones y distribuidoras, generando mayor competencia y precios mas bajos.
          </li>
          <li>
            <strong>Carga tributaria estatal (ICMS):</strong> Cada estado define su alicuota de ICMS sobre combustibles, creando diferencias significativas entre regiones.
          </li>
          <li>
            <strong>Mezcla de etanol:</strong> Estados productores de cana de azucar (Sudeste, Centro-Oeste) tienen gasolina mas barata por la disponibilidad local de etanol anhidro.
          </li>
        </ul>
      </div>
    </div>
  );
}
