'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Filters from '@/components/Filters';
import StatsCards from '@/components/StatsCards';
import PriceChart from '@/components/PriceChart';
import {
  loadGasData,
  aggregateByState,
  aggregateByMonth,
  calculateStats,
} from '@/lib/data';
import { GasPrice, FilterState } from '@/types';

const BrazilMap = dynamic(() => import('@/components/BrazilMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow p-4 h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function Home() {
  const [data, setData] = useState<GasPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    produto: 'all',
    regiao: 'all',
    dateRange: { start: null, end: null },
  });

  useEffect(() => {
    loadGasData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    let result = data;
    if (filters.produto && filters.produto !== 'all') {
      result = result.filter((d) => d.produto === filters.produto);
    }
    if (filters.regiao && filters.regiao !== 'all') {
      result = result.filter((d) => d.regiao === filters.regiao);
    }
    return result;
  }, [data, filters.produto, filters.regiao]);

  const stateData = useMemo(
    () => aggregateByState(data, filters.produto, filters.regiao),
    [data, filters.produto, filters.regiao]
  );

  const chartData = useMemo(
    () => aggregateByMonth(data, filters.regiao),
    [data, filters.regiao]
  );

  const stats = useMemo(
    () => calculateStats(filteredData, filters.produto),
    [filteredData, filters.produto]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de combustibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error al cargar datos</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Analisis de Combustibles Brasil</h1>
          <p className="text-blue-100 mt-1">
            Dashboard de precios de gasolina, diesel y GLP (2004 - Presente)
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Filters filters={filters} onFilterChange={setFilters} />

        <StatsCards
          totalPostos={stats.totalPostos}
          avgPreco={stats.avgPreco}
          recentAvg={stats.recentAvg}
          variation={stats.variation}
          produto={filters.produto}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BrazilMap data={stateData} />
          <PriceChart data={chartData} selectedProduto={filters.produto} />
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Fuente: ANP (Agencia Nacional do Petroleo, Gas Natural e Biocombustiveis)
          </p>
          <p className="mt-1">
            Datos de {data.length.toLocaleString()} registros procesados
          </p>
        </footer>
      </main>
    </div>
  );
}
