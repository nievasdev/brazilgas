'use client';

import { PRODUTOS, REGIOES, FilterState } from '@/types';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
            Producto
          </label>
          <select
            id="produto"
            value={filters.produto}
            onChange={(e) => onFilterChange({ ...filters, produto: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 px-3 py-2 border"
          >
            <option value="all">Todos los productos</option>
            {PRODUTOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="regiao" className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            id="regiao"
            value={filters.regiao}
            onChange={(e) => onFilterChange({ ...filters, regiao: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 px-3 py-2 border"
          >
            <option value="all">Todas las regiones</option>
            {REGIOES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
