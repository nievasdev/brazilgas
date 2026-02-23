'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { BRAZIL_GEO_URL, STATE_POPULATION } from '@/lib/constants';
import type { Geography as GeoType } from 'react-simple-maps';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: {
    name: string;
    poblacion: number;
  } | null;
}

export default function PopulationMap() {
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

  const maxPop = useMemo(() => {
    return Math.max(...Object.values(STATE_POPULATION));
  }, []);

  const colorScale = useMemo(() => {
    return scaleQuantize<string>()
      .domain([0, maxPop])
      .range([
        '#FFD600', // amarillo fuerte
        '#FF9100', // naranja vivo
        '#FF5722', // naranja rojizo
        '#E53935', // rojo
        '#C62828', // rojo oscuro
        '#880E4F', // fucsia oscuro
        '#4A148C', // violeta oscuro
        '#1A0033', // casi negro violeta
      ]);
  }, [maxPop]);

  const getStateName = (geoName: string): string => {
    return geoName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  };

  const getPopulation = (geoName: string): number | undefined => {
    return STATE_POPULATION[getStateName(geoName)];
  };

  const handleMouseMove = (
    e: React.MouseEvent,
    geo: { properties: { name: string } }
  ) => {
    const pop = getPopulation(geo.properties.name);
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      content: {
        name: geo.properties.name,
        poblacion: pop ?? 0,
      },
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (!geoData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-[620px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[620px] relative">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Población por Estado (IBGE 2021)
      </h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 760,
          center: [-55, -14],
        }}
        style={{ width: '100%', height: '92%' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }: { geographies: GeoType[] }) =>
            geographies.map((geo: GeoType) => {
              const pop = getPopulation(geo.properties.name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={pop !== undefined ? colorScale(pop) : '#f5f5f5'}
                  stroke="#fff"
                  strokeWidth={0.8}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#009c3b' },
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
          <p>
            Población:{' '}
            {tooltip.content.poblacion > 0
              ? tooltip.content.poblacion.toLocaleString('pt-BR')
              : 'N/A'}
          </p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded text-xs">
        <p className="font-medium text-gray-700 mb-1">Escala de Población</p>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Menos</span>
          {['#FFD600', '#FF9100', '#FF5722', '#E53935', '#C62828', '#880E4F', '#4A148C', '#1A0033'].map(
            (color) => (
              <div
                key={color}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            )
          )}
          <span className="text-gray-500">Más</span>
        </div>
      </div>
    </div>
  );
}
