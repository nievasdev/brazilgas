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
} from 'recharts';
import { ChartDataPoint, PRODUTOS } from '@/types';
import { PRODUTO_COLORS } from '@/lib/constants';

interface PriceChartProps {
  data: ChartDataPoint[];
  selectedProduto: string;
}

export default function PriceChart({ data, selectedProduto }: PriceChartProps) {
  const produtos = selectedProduto === 'all' ? [...PRODUTOS] : [selectedProduto];

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    const [year, month] = date.split('-');
    return `${month}/${year.slice(2)}`;
  };

  // Sample data for better performance (show every 6th point)
  const sampledData = data.filter((_, index) => index % 6 === 0);

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px]">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Evolucion de Precios (2004 - Presente)
      </h3>
      <ResponsiveContainer width="100%" height="90%">
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
          />
          <Tooltip
            formatter={(value: number | undefined) => [value ? formatCurrency(value) : 'N/A', '']}
            labelFormatter={(label) => `Fecha: ${String(label)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
