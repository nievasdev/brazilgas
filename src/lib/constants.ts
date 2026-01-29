export const ESTADO_ISO_MAP: Record<string, string> = {
  'ACRE': 'BR-AC',
  'ALAGOAS': 'BR-AL',
  'AMAPA': 'BR-AP',
  'AMAZONAS': 'BR-AM',
  'BAHIA': 'BR-BA',
  'CEARA': 'BR-CE',
  'DISTRITO FEDERAL': 'BR-DF',
  'ESPIRITO SANTO': 'BR-ES',
  'GOIAS': 'BR-GO',
  'MARANHAO': 'BR-MA',
  'MATO GROSSO': 'BR-MT',
  'MATO GROSSO DO SUL': 'BR-MS',
  'MINAS GERAIS': 'BR-MG',
  'PARA': 'BR-PA',
  'PARAIBA': 'BR-PB',
  'PARANA': 'BR-PR',
  'PERNAMBUCO': 'BR-PE',
  'PIAUI': 'BR-PI',
  'RIO DE JANEIRO': 'BR-RJ',
  'RIO GRANDE DO NORTE': 'BR-RN',
  'RIO GRANDE DO SUL': 'BR-RS',
  'RONDONIA': 'BR-RO',
  'RORAIMA': 'BR-RR',
  'SANTA CATARINA': 'BR-SC',
  'SAO PAULO': 'BR-SP',
  'SERGIPE': 'BR-SE',
  'TOCANTINS': 'BR-TO',
};

export const ISO_TO_ESTADO: Record<string, string> = Object.fromEntries(
  Object.entries(ESTADO_ISO_MAP).map(([estado, iso]) => [iso, estado])
);

export const PRODUTO_COLORS: Record<string, string> = {
  'GASOLINA COMUM': '#ef4444',
  'GLP': '#3b82f6',
  'ÓLEO DIESEL': '#22c55e',
  'ÓLEO DIESEL S10': '#f59e0b',
};

export const NULL_VALUE = -99999;

export const BRAZIL_GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';
