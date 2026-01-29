'use client';

interface StatsCardsProps {
  totalPostos: number;
  avgPreco: number;
  recentAvg: number;
  variation: number;
  produto: string;
}

export default function StatsCards({
  totalPostos,
  avgPreco,
  recentAvg,
  variation,
  produto,
}: StatsCardsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const cards = [
    {
      title: 'Total Estaciones',
      value: formatNumber(totalPostos),
      subtitle: 'Postos pesquisados',
      color: 'bg-blue-500',
    },
    {
      title: 'Precio Promedio Historico',
      value: formatCurrency(avgPreco),
      subtitle: produto === 'all' ? 'Todos los productos' : produto,
      color: 'bg-green-500',
    },
    {
      title: 'Precio Promedio Reciente',
      value: formatCurrency(recentAvg),
      subtitle: 'Ultimos registros',
      color: 'bg-purple-500',
    },
    {
      title: 'Variacion',
      value: `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`,
      subtitle: 'vs periodo anterior',
      color: variation >= 0 ? 'bg-red-500' : 'bg-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 border-l-4"
          style={{ borderLeftColor: card.color.replace('bg-', '').includes('blue') ? '#3b82f6' :
                   card.color.includes('green') ? '#22c55e' :
                   card.color.includes('purple') ? '#a855f7' : '#ef4444' }}
        >
          <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
