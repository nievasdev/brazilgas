'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { StateData } from '@/types';
import { BRAZIL_GEO_URL } from '@/lib/constants';
import type { Geography as GeoType } from 'react-simple-maps';

interface BrazilMapProps {
  data: StateData[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: {
    name: string;
    postos: number;
    preco: number;
  } | null;
}

export default function BrazilMap({ data }: BrazilMapProps) {
  const [geoData, setGeoData] = useState<unknown>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  useEffect(() => {
    fetch(BRAZIL_GEO_URL)
      .then((res) => res.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  const maxPostos = useMemo(() => {
    return Math.max(...data.map((d) => d.totalPostos), 1);
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleQuantize<string>()
      .domain([0, maxPostos])
      .range([
        '#f7fafc',
        '#e2e8f0',
        '#cbd5e1',
        '#94a3b8',
        '#64748b',
        '#475569',
        '#334155',
        '#1e293b',
      ]);
  }, [maxPostos]);

  const getStateData = (geoName: string): StateData | undefined => {
    const normalizedName = geoName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    return data.find((d) => d.estado === normalizedName);
  };

  const handleMouseMove = (
    e: React.MouseEvent,
    geo: { properties: { name: string } }
  ) => {
    const stateData = getStateData(geo.properties.name);
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      content: stateData
        ? {
            name: geo.properties.name,
            postos: stateData.totalPostos,
            preco: stateData.precoMedio,
          }
        : {
            name: geo.properties.name,
            postos: 0,
            preco: 0,
          },
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (!geoData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px] relative">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Distribucion de Estaciones por Estado
      </h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 650,
          center: [-55, -15],
        }}
        style={{ width: '100%', height: '90%' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }: { geographies: GeoType[] }) =>
            geographies.map((geo: GeoType) => {
              const stateData = getStateData(geo.properties.name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={stateData ? colorScale(stateData.totalPostos) : '#f1f5f9'}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#3b82f6' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseMove={(e: React.MouseEvent) => handleMouseMove(e, geo)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip.visible && tooltip.content && (
        <div
          className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-50 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          <p className="font-semibold">{tooltip.content.name}</p>
          <p>Estaciones: {tooltip.content.postos.toLocaleString()}</p>
          <p>
            Precio Prom: R${' '}
            {tooltip.content.preco > 0 ? tooltip.content.preco.toFixed(2) : 'N/A'}
          </p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded text-xs">
        <p className="font-medium text-gray-700 mb-1">Escala de Estaciones</p>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Menos</span>
          {['#f7fafc', '#cbd5e1', '#94a3b8', '#64748b', '#334155', '#1e293b'].map(
            (color) => (
              <div
                key={color}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            )
          )}
          <span className="text-gray-500">Mas</span>
        </div>
      </div>
    </div>
  );
}
