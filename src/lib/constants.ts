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

// Fuente: IBGE - Estimativas da População 2021
export const STATE_POPULATION: Record<string, number> = {
  'RONDONIA': 1815278,
  'ACRE': 906876,
  'AMAZONAS': 4269995,
  'RORAIMA': 652713,
  'PARA': 8777124,
  'AMAPA': 877613,
  'TOCANTINS': 1607363,
  'MARANHAO': 7153262,
  'PIAUI': 3289290,
  'CEARA': 9240580,
  'RIO GRANDE DO NORTE': 3560903,
  'PARAIBA': 4059905,
  'PERNAMBUCO': 9674793,
  'ALAGOAS': 3365351,
  'SERGIPE': 2338474,
  'BAHIA': 14985284,
  'MINAS GERAIS': 21411923,
  'ESPIRITO SANTO': 4108508,
  'RIO DE JANEIRO': 17463349,
  'SAO PAULO': 46649132,
  'PARANA': 11597484,
  'SANTA CATARINA': 7338473,
  'RIO GRANDE DO SUL': 11466630,
  'MATO GROSSO DO SUL': 2839188,
  'MATO GROSSO': 3567234,
  'GOIAS': 7206589,
  'DISTRITO FEDERAL': 3094325,
};

export const BRAZIL_GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';
