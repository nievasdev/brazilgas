# Plan de Implementación - Dashboard Gas Prices Brazil

## Contexto del Proyecto
Crear un dashboard en Next.js para visualizar el análisis del dataset "Gas Prices in Brazil" que muestre:
- Distribución de estaciones de servicio en el territorio nacional
- Evolución de precios de combustibles desde 2010
- Foco en: Gasoil (Diesel), Gasolina Común y GLP

## Dataset
- **Archivo**: Gas in Brazil dataset v1.0.xlsx
- **Valores vacíos**: Representados como -99999
- **Período**: 2010 - actualidad

### Columnas Principales:
| Columna | Descripción |
|---------|-------------|
| DATA INICIAL | Primer día de la semana |
| DATA FINAL | Último día de la semana |
| REGIÃO | Región de Brasil |
| ESTADO | Estado |
| PRODUTO | Producto (Diesel, Gasolina, GLP, etc.) |
| NÚMERO DE POSTOS PESQUISADOS | Estaciones consultadas |
| PREÇO MÉDIO REVENDA | Precio medio de venta |
| PREÇO MÍNIMO/MÁXIMO REVENDA | Rango de precios venta |
| PREÇO MÉDIO DISTRIBUIÇÃO | Precio medio distribución |

## Fases de Implementación

### Fase 1: Preparación de Datos
1. [ ] Convertir XLSX a CSV usando script Python/Node
2. [ ] Limpiar datos (reemplazar -99999 por null)
3. [ ] Filtrar productos relevantes: DIESEL, GASOLINA COMUM, GLP

### Fase 2: Setup del Proyecto Next.js
1. [ ] Crear proyecto Next.js con TypeScript
2. [ ] Instalar dependencias:
   - `react-simple-maps` - Mapa de Brasil
   - `recharts` - Gráficos de evolución de precios
   - `tailwindcss` - Estilos
   - `papaparse` - Parseo de CSV
   - `date-fns` - Manejo de fechas

### Fase 3: Estructura del Proyecto
```
/brazilgas-dashboard
├── /public
│   └── /data
│       └── gas-prices.csv
├── /src
│   ├── /app
│   │   ├── page.tsx (Dashboard principal)
│   │   └── layout.tsx
│   ├── /components
│   │   ├── BrazilMap.tsx
│   │   ├── PriceEvolutionChart.tsx
│   │   ├── StationsDistribution.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── DateRangeFilter.tsx
│   │   └── StatCards.tsx
│   ├── /lib
│   │   ├── data-processor.ts
│   │   └── brazil-geo.ts
│   └── /types
│       └── index.ts
```

### Fase 4: Componentes del Dashboard

#### 4.1 Mapa de Brasil (react-simple-maps)
- Mostrar distribución de estaciones por estado
- Color coding por densidad de estaciones
- Tooltip con información detallada

#### 4.2 Gráfico de Evolución de Precios
- Línea temporal desde 2010
- Series para cada producto (Diesel, Gasolina, GLP)
- Selector de región/estado

#### 4.3 Panel de Estadísticas
- Total de estaciones por región
- Precio promedio actual por producto
- Variación de precios (mensual/anual)

#### 4.4 Filtros
- Selector de producto
- Selector de región/estado
- Rango de fechas

### Fase 5: Procesamiento de Datos
1. [ ] Agregar datos por estado para el mapa
2. [ ] Calcular promedios mensuales para gráficos
3. [ ] Generar estadísticas resumen

### Fase 6: Visualizaciones
1. [ ] Implementar mapa coroplético de Brasil
2. [ ] Gráfico de líneas para evolución temporal
3. [ ] Gráficos de barras para comparativas
4. [ ] Cards con KPIs principales

### Fase 7: Optimización
1. [ ] Pre-procesar datos en build time
2. [ ] Implementar lazy loading de componentes
3. [ ] Optimizar renderizado del mapa

## Productos a Filtrar
Los productos relevantes según el requerimiento:
- **DIESEL** / **DIESEL S10** - Gasoil
- **GASOLINA COMUM** - Gasolina Común
- **GLP** - Gas Licuado de Petróleo

## Estados de Brasil (para el mapa)
AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO

## Regiones de Brasil
- Norte
- Nordeste
- Centro-Oeste
- Sudeste
- Sul

## Notas Técnicas
- Usar Server Components para carga inicial de datos
- Implementar filtros como Client Components
- El GeoJSON de Brasil se obtendrá de: https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson
