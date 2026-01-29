export interface GasPrice {
  dataInicial: Date;
  dataFinal: Date;
  regiao: string;
  estado: string;
  produto: string;
  numeroPostos: number;
  unidadeMedida: string;
  precoMedioRevenda: number;
  desvioPadraoRevenda: number;
  precoMinimoRevenda: number;
  precoMaximoRevenda: number;
  margemMediaRevenda: number;
  coefVariacaoRevenda: number;
  precoMedioDistribuicao: number;
  desvioPadraoDistribuicao: number;
  precoMinimoDistribuicao: number;
  precoMaximoDistribuicao: number;
  coefVariacaoDistribuicao: number;
}

export interface StateData {
  estado: string;
  codigoISO: string;
  totalPostos: number;
  precoMedio: number;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

export interface FilterState {
  produto: string;
  regiao: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export const PRODUTOS = [
  'GASOLINA COMUM',
  'GLP',
  'ÓLEO DIESEL',
  'ÓLEO DIESEL S10',
] as const;

export const REGIOES = [
  'CENTRO OESTE',
  'NORDESTE',
  'NORTE',
  'SUDESTE',
  'SUL',
] as const;

export type Produto = typeof PRODUTOS[number];
export type Regiao = typeof REGIOES[number];
