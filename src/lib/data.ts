'use client';

import Papa from 'papaparse';
import { GasPrice, StateData, ChartDataPoint, PRODUTOS } from '@/types';
import { ESTADO_ISO_MAP, NULL_VALUE } from './constants';
import { format } from 'date-fns';

interface RawRow {
  'DATA INICIAL': string;
  'DATA FINAL': string;
  'REGIÃO': string;
  'ESTADO': string;
  'PRODUTO': string;
  'NÚMERO DE POSTOS PESQUISADOS': string;
  'UNIDADE DE MEDIDA': string;
  'PREÇO MÉDIO REVENDA': string;
  'DESVIO PADRÃO REVENDA': string;
  'PREÇO MÍNIMO REVENDA': string;
  'PREÇO MÁXIMO REVENDA': string;
  'MARGEM MÉDIA REVENDA': string;
  'COEF DE VARIAÇÃO REVENDA': string;
  'PREÇO MÉDIO DISTRIBUIÇÃO': string;
  'DESVIO PADRÃO DISTRIBUIÇÃO': string;
  'PREÇO MÍNIMO DISTRIBUIÇÃO': string;
  'PREÇO MÁXIMO DISTRIBUIÇÃO': string;
  'COEF DE VARIAÇÃO DISTRIBUIÇÃO': string;
}

function parseDate(dateStr: string): Date {
  // Format: M/D/YY (e.g., 5/9/04)
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    // Handle 2-digit year
    year = year < 50 ? 2000 + year : 1900 + year;
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

function parseNumber(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num) || num === NULL_VALUE) {
    return NaN;
  }
  return num;
}

function normalizeEstado(estado: string): string {
  return estado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function parseRow(row: RawRow): GasPrice | null {
  const produto = row['PRODUTO'];
  if (!PRODUTOS.includes(produto as typeof PRODUTOS[number])) {
    return null;
  }

  const precoMedioRevenda = parseNumber(row['PREÇO MÉDIO REVENDA']);
  if (isNaN(precoMedioRevenda)) {
    return null;
  }

  return {
    dataInicial: parseDate(row['DATA INICIAL']),
    dataFinal: parseDate(row['DATA FINAL']),
    regiao: row['REGIÃO'],
    estado: normalizeEstado(row['ESTADO']),
    produto,
    numeroPostos: parseInt(row['NÚMERO DE POSTOS PESQUISADOS'], 10) || 0,
    unidadeMedida: row['UNIDADE DE MEDIDA'],
    precoMedioRevenda,
    desvioPadraoRevenda: parseNumber(row['DESVIO PADRÃO REVENDA']) || 0,
    precoMinimoRevenda: parseNumber(row['PREÇO MÍNIMO REVENDA']) || 0,
    precoMaximoRevenda: parseNumber(row['PREÇO MÁXIMO REVENDA']) || 0,
    margemMediaRevenda: parseNumber(row['MARGEM MÉDIA REVENDA']) || 0,
    coefVariacaoRevenda: parseNumber(row['COEF DE VARIAÇÃO REVENDA']) || 0,
    precoMedioDistribuicao: parseNumber(row['PREÇO MÉDIO DISTRIBUIÇÃO']) || 0,
    desvioPadraoDistribuicao: parseNumber(row['DESVIO PADRÃO DISTRIBUIÇÃO']) || 0,
    precoMinimoDistribuicao: parseNumber(row['PREÇO MÍNIMO DISTRIBUIÇÃO']) || 0,
    precoMaximoDistribuicao: parseNumber(row['PREÇO MÁXIMO DISTRIBUIÇÃO']) || 0,
    coefVariacaoDistribuicao: parseNumber(row['COEF DE VARIAÇÃO DISTRIBUIÇÃO']) || 0,
  };
}

export async function loadGasData(): Promise<GasPrice[]> {
  const response = await fetch('/data/gas-prices.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    const results: GasPrice[] = [];

    Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResult) => {
        for (const row of parseResult.data) {
          const parsed = parseRow(row);
          if (parsed) {
            results.push(parsed);
          }
        }
        resolve(results);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export function aggregateByState(
  data: GasPrice[],
  produto?: string,
  regiao?: string
): StateData[] {
  let filtered = data;

  if (produto && produto !== 'all') {
    filtered = filtered.filter((d) => d.produto === produto);
  }

  if (regiao && regiao !== 'all') {
    filtered = filtered.filter((d) => d.regiao === regiao);
  }

  const stateMap = new Map<string, { totalPostos: number; totalPreco: number; count: number }>();

  for (const item of filtered) {
    const existing = stateMap.get(item.estado) || { totalPostos: 0, totalPreco: 0, count: 0 };
    stateMap.set(item.estado, {
      totalPostos: existing.totalPostos + item.numeroPostos,
      totalPreco: existing.totalPreco + item.precoMedioRevenda,
      count: existing.count + 1,
    });
  }

  return Array.from(stateMap.entries()).map(([estado, stats]) => ({
    estado,
    codigoISO: ESTADO_ISO_MAP[estado] || estado,
    totalPostos: stats.totalPostos,
    precoMedio: stats.totalPreco / stats.count,
  }));
}

export function aggregateByMonth(
  data: GasPrice[],
  regiao?: string
): ChartDataPoint[] {
  let filtered = data;

  if (regiao && regiao !== 'all') {
    filtered = filtered.filter((d) => d.regiao === regiao);
  }

  const monthMap = new Map<string, Record<string, { total: number; count: number }>>();

  for (const item of filtered) {
    const monthKey = format(item.dataInicial, 'yyyy-MM');

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {});
    }

    const monthData = monthMap.get(monthKey)!;
    if (!monthData[item.produto]) {
      monthData[item.produto] = { total: 0, count: 0 };
    }

    monthData[item.produto].total += item.precoMedioRevenda;
    monthData[item.produto].count += 1;
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, products]) => {
      const point: ChartDataPoint = { date };
      for (const produto of PRODUTOS) {
        if (products[produto]) {
          point[produto] = Number((products[produto].total / products[produto].count).toFixed(3));
        }
      }
      return point;
    });
}

export function calculateStats(data: GasPrice[], produto?: string) {
  let filtered = data;

  if (produto && produto !== 'all') {
    filtered = filtered.filter((d) => d.produto === produto);
  }

  const totalPostos = filtered.reduce((sum, d) => sum + d.numeroPostos, 0);
  const avgPreco = filtered.reduce((sum, d) => sum + d.precoMedioRevenda, 0) / filtered.length;

  // Get most recent data (last year)
  const sortedByDate = [...filtered].sort(
    (a, b) => b.dataInicial.getTime() - a.dataInicial.getTime()
  );

  const recentData = sortedByDate.slice(0, Math.floor(sortedByDate.length * 0.1));
  const recentAvg = recentData.reduce((sum, d) => sum + d.precoMedioRevenda, 0) / recentData.length;

  // Previous year data
  const oldData = sortedByDate.slice(
    Math.floor(sortedByDate.length * 0.1),
    Math.floor(sortedByDate.length * 0.2)
  );
  const oldAvg = oldData.reduce((sum, d) => sum + d.precoMedioRevenda, 0) / oldData.length;

  const variation = oldAvg > 0 ? ((recentAvg - oldAvg) / oldAvg) * 100 : 0;

  return {
    totalPostos,
    avgPreco: isNaN(avgPreco) ? 0 : avgPreco,
    recentAvg: isNaN(recentAvg) ? 0 : recentAvg,
    variation: isNaN(variation) ? 0 : variation,
  };
}

export interface StationDistribution {
  estado: string;
  postos: number;
  regiao: string;
}

export function getCurrentDistribution(
  data: GasPrice[],
  produto?: string,
  regiao?: string
): StationDistribution[] {
  let filtered = data;

  if (produto && produto !== 'all') {
    filtered = filtered.filter((d) => d.produto === produto);
  }

  if (regiao && regiao !== 'all') {
    filtered = filtered.filter((d) => d.regiao === regiao);
  }

  // Find the most recent date in the data
  const maxDate = Math.max(...filtered.map((d) => d.dataInicial.getTime()));
  const recentCutoff = maxDate - 7 * 24 * 60 * 60 * 1000; // last week of data

  const recentData = filtered.filter((d) => d.dataInicial.getTime() >= recentCutoff);

  // Aggregate by state, taking the latest entry per state+product
  const stateMap = new Map<string, { postos: number; regiao: string }>();

  for (const item of recentData) {
    const existing = stateMap.get(item.estado);
    if (existing) {
      existing.postos += item.numeroPostos;
    } else {
      stateMap.set(item.estado, { postos: item.numeroPostos, regiao: item.regiao });
    }
  }

  return Array.from(stateMap.entries())
    .map(([estado, { postos, regiao: r }]) => ({ estado, postos, regiao: r }))
    .sort((a, b) => b.postos - a.postos);
}

export interface RegionPriceData {
  regiao: string;
  [produto: string]: number | string;
}

export function aggregateByRegion(data: GasPrice[]): RegionPriceData[] {
  // Use most recent year of data for "current" prices
  const maxDate = Math.max(...data.map((d) => d.dataInicial.getTime()));
  const oneYearAgo = maxDate - 365 * 24 * 60 * 60 * 1000;
  const recentData = data.filter((d) => d.dataInicial.getTime() >= oneYearAgo);

  const regionMap = new Map<
    string,
    Map<string, { total: number; count: number }>
  >();

  for (const item of recentData) {
    if (!regionMap.has(item.regiao)) {
      regionMap.set(item.regiao, new Map());
    }
    const prodMap = regionMap.get(item.regiao)!;
    const existing = prodMap.get(item.produto) || { total: 0, count: 0 };
    prodMap.set(item.produto, {
      total: existing.total + item.precoMedioRevenda,
      count: existing.count + 1,
    });
  }

  return Array.from(regionMap.entries()).map(([regiao, prodMap]) => {
    const point: RegionPriceData = { regiao };
    for (const produto of PRODUTOS) {
      const stats = prodMap.get(produto);
      if (stats) {
        point[produto] = Number((stats.total / stats.count).toFixed(3));
      }
    }
    return point;
  });
}

export interface MarginData {
  estado: string;
  regiao: string;
  margemMedia: number;
  precoRevenda: number;
  precoDistribuicao: number;
}

export function getMarginsByState(
  data: GasPrice[],
  produto?: string
): MarginData[] {
  // Use most recent year of data
  const maxDate = Math.max(...data.map((d) => d.dataInicial.getTime()));
  const oneYearAgo = maxDate - 365 * 24 * 60 * 60 * 1000;
  let recentData = data.filter((d) => d.dataInicial.getTime() >= oneYearAgo);

  if (produto && produto !== 'all') {
    recentData = recentData.filter((d) => d.produto === produto);
  }

  const stateMap = new Map<
    string,
    { regiao: string; totalMargem: number; totalRevenda: number; totalDist: number; count: number }
  >();

  for (const item of recentData) {
    if (item.margemMediaRevenda <= 0) continue;
    const existing = stateMap.get(item.estado);
    if (existing) {
      existing.totalMargem += item.margemMediaRevenda;
      existing.totalRevenda += item.precoMedioRevenda;
      existing.totalDist += item.precoMedioDistribuicao;
      existing.count += 1;
    } else {
      stateMap.set(item.estado, {
        regiao: item.regiao,
        totalMargem: item.margemMediaRevenda,
        totalRevenda: item.precoMedioRevenda,
        totalDist: item.precoMedioDistribuicao,
        count: 1,
      });
    }
  }

  return Array.from(stateMap.entries())
    .map(([estado, s]) => ({
      estado,
      regiao: s.regiao,
      margemMedia: Number((s.totalMargem / s.count).toFixed(3)),
      precoRevenda: Number((s.totalRevenda / s.count).toFixed(3)),
      precoDistribuicao: Number((s.totalDist / s.count).toFixed(3)),
    }))
    .sort((a, b) => b.margemMedia - a.margemMedia);
}

const AMAZON_STATES = new Set([
  'AMAZONAS', 'PARA', 'ACRE', 'AMAPA', 'RONDONIA', 'RORAIMA', 'TOCANTINS',
]);

export interface AmazonMetrics {
  label: string;
  value: number;
  national: number;
  diff: number; // percentage difference vs national
}

export interface AmazonStateDetail {
  estado: string;
  postos: number;
  precoMedio: number;
  margemMedia: number;
  coefVariacao: number;
}

export interface AmazonAnalysis {
  metrics: AmazonMetrics[];
  states: AmazonStateDetail[];
}

export function getAmazonAnalysis(data: GasPrice[], produto?: string): AmazonAnalysis {
  const maxDate = Math.max(...data.map((d) => d.dataInicial.getTime()));
  const oneYearAgo = maxDate - 365 * 24 * 60 * 60 * 1000;
  let recentData = data.filter((d) => d.dataInicial.getTime() >= oneYearAgo);

  if (produto && produto !== 'all') {
    recentData = recentData.filter((d) => d.produto === produto);
  }

  const amazonData = recentData.filter((d) => AMAZON_STATES.has(d.estado));

  const calcAvg = (arr: GasPrice[], field: keyof GasPrice) => {
    const valid = arr.filter((d) => typeof d[field] === 'number' && (d[field] as number) > 0);
    if (valid.length === 0) return 0;
    return valid.reduce((s, d) => s + (d[field] as number), 0) / valid.length;
  };

  const calcTotalPostos = (arr: GasPrice[]) => {
    // Get unique state entries from the most recent week
    const latestDate = Math.max(...arr.map((d) => d.dataInicial.getTime()));
    const cutoff = latestDate - 7 * 24 * 60 * 60 * 1000;
    const latest = arr.filter((d) => d.dataInicial.getTime() >= cutoff);
    return latest.reduce((s, d) => s + d.numeroPostos, 0);
  };

  const amzPreco = calcAvg(amazonData, 'precoMedioRevenda');
  const natPreco = calcAvg(recentData, 'precoMedioRevenda');
  const amzMargem = calcAvg(amazonData, 'margemMediaRevenda');
  const natMargem = calcAvg(recentData, 'margemMediaRevenda');
  const amzCoef = calcAvg(amazonData, 'coefVariacaoRevenda');
  const natCoef = calcAvg(recentData, 'coefVariacaoRevenda');
  const amzPostos = calcTotalPostos(amazonData);
  const natPostos = calcTotalPostos(recentData);
  const amzDist = calcAvg(amazonData, 'precoMedioDistribuicao');
  const natDist = calcAvg(recentData, 'precoMedioDistribuicao');

  const pctDiff = (a: number, n: number) => n > 0 ? ((a - n) / n) * 100 : 0;

  const metrics: AmazonMetrics[] = [
    { label: 'Precio Medio Reventa', value: amzPreco, national: natPreco, diff: pctDiff(amzPreco, natPreco) },
    { label: 'Precio Distribucion', value: amzDist, national: natDist, diff: pctDiff(amzDist, natDist) },
    { label: 'Margen de Ganancia', value: amzMargem, national: natMargem, diff: pctDiff(amzMargem, natMargem) },
    { label: 'Coef. de Variacion', value: amzCoef, national: natCoef, diff: pctDiff(amzCoef, natCoef) },
    { label: 'Estaciones Encuestadas', value: amzPostos, national: natPostos, diff: pctDiff(amzPostos, natPostos) },
  ];

  // Per-state breakdown
  const stateMap = new Map<
    string,
    { postos: number; totalPreco: number; totalMargem: number; totalCoef: number; count: number }
  >();

  for (const item of amazonData) {
    const existing = stateMap.get(item.estado);
    if (existing) {
      existing.postos += item.numeroPostos;
      existing.totalPreco += item.precoMedioRevenda;
      existing.totalMargem += item.margemMediaRevenda;
      existing.totalCoef += item.coefVariacaoRevenda;
      existing.count += 1;
    } else {
      stateMap.set(item.estado, {
        postos: item.numeroPostos,
        totalPreco: item.precoMedioRevenda,
        totalMargem: item.margemMediaRevenda,
        totalCoef: item.coefVariacaoRevenda,
        count: 1,
      });
    }
  }

  const states: AmazonStateDetail[] = Array.from(stateMap.entries())
    .map(([estado, s]) => ({
      estado,
      postos: s.postos,
      precoMedio: Number((s.totalPreco / s.count).toFixed(3)),
      margemMedia: Number((s.totalMargem / s.count).toFixed(3)),
      coefVariacao: Number((s.totalCoef / s.count).toFixed(4)),
    }))
    .sort((a, b) => b.precoMedio - a.precoMedio);

  return { metrics, states };
}

export function getDateRange(data: GasPrice[]): { min: Date; max: Date } {
  const dates = data.map((d) => d.dataInicial.getTime());
  return {
    min: new Date(Math.min(...dates)),
    max: new Date(Math.max(...dates)),
  };
}
