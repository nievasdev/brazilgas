'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import { ChartDataPoint, PRODUTOS } from '@/types';
import { PRODUTO_COLORS } from '@/lib/constants';

interface PriceChartProps {
  data: ChartDataPoint[];
  selectedProduto: string;
}

const PRODUTO_LABELS: Record<string, string> = {
  'GASOLINA COMUM': 'Gasolina Comun',
  'GLP': 'GLP',
  'ÓLEO DIESEL': 'Diesel',
  'ÓLEO DIESEL S10': 'Diesel S10',
};

export default function PriceChart({ data, selectedProduto }: PriceChartProps) {
  const produtos = selectedProduto === 'all' ? [...PRODUTOS] : [selectedProduto];

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const formatDate = (date: string) => {
    const [year, month] = date.split('-');
    return `${month}/${year}`;
  };

  const formatDateShort = (date: string) => {
    const [year] = date.split('-');
    return year;
  };

  // Sample every 3rd month for good balance between detail and performance
  const sampledData = data.filter((_, index) => index % 3 === 0);

  // Find index for default brush position (last 3 years visible)
  const brushEnd = sampledData.length - 1;
  const brushStart = Math.max(0, brushEnd - 12); // ~3 years with 3-month sampling

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Evolucion de Precios de Combustibles
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Precio medio de reventa por mes — Usa la barra inferior para explorar periodos
      </p>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={sampledData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#6b7280"
            fontSize={12}
            domain={['auto', 'auto']}
            width={70}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [
              value ? formatCurrency(value) : 'N/A',
              name ? (PRODUTO_LABELS[name] || name) : '',
            ]}
            labelFormatter={(label) => `Periodo: ${formatDate(String(label))}`}
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
          <ReferenceLine
            x="2020-03"
            stroke="#9ca3af"
            strokeDasharray="4 4"
            label={{ value: 'COVID-19', position: 'top', fill: '#6b7280', fontSize: 11 }}
          />
          {produtos.map((produto) => (
            <Line
              key={produto}
              type="monotone"
              dataKey={produto}
              name={produto}
              stroke={PRODUTO_COLORS[produto] || '#8884d8'}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
          <Brush
            dataKey="date"
            height={30}
            stroke="#3b82f6"
            tickFormatter={formatDateShort}
            startIndex={brushStart}
            endIndex={brushEnd}
            fill="#f8fafc"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
