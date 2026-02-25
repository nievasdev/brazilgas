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

  const minPostos = useMemo(() => {
    return Math.min(...data.map((d) => d.totalPostos));
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleQuantize<string>()
      .domain([0, maxPostos])
      .range([
        '#FFEF5E', // amarillo claro
        '#FFD600', // amarillo bandera Brasil
        '#ADDE6C', // verde amarillento
        '#00C44F', // verde medio
        '#009c3b', // verde bandera Brasil
        '#007A2F', // verde oscuro
        '#004A8F', // azul medio
        '#002776', // azul bandera Brasil
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
      <div className="bg-white rounded-lg shadow p-4 h-[620px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[620px] relative">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Distribucion de Estaciones por Estado
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
              const stateData = getStateData(geo.properties.name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={stateData ? colorScale(stateData.totalPostos) : '#d1e8c2'}
                  stroke="#fff"
                  strokeWidth={0.8}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#FF6B00' },
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
          <span className="text-gray-600 font-medium">{minPostos.toLocaleString('pt-BR')}</span>
          {['#FFEF5E', '#FFD600', '#ADDE6C', '#00C44F', '#009c3b', '#007A2F', '#004A8F', '#002776'].map(
            (color) => (
              <div
                key={color}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            )
          )}
          <span className="text-gray-600 font-medium">{maxPostos.toLocaleString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}
