// Genera CSV con población y estaciones por estado (datos usados por los mapas)
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Datos de STATE_POPULATION de src/lib/constants.ts (IBGE 2021)
const STATE_POPULATION = {
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

const ESTADO_ISO_MAP = {
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

function normalizeEstado(estado) {
  return estado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  const csvPath = path.join(__dirname, 'public/data/gas-prices.csv');
  const rl = readline.createInterface({ input: fs.createReadStream(csvPath) });

  let headers = null;
  const stateMap = new Map(); // estado -> { totalPostos, totalPreco, count, regiao }

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);

    if (!headers) {
      headers = cols;
      continue;
    }

    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i] || ''; });

    const estado = normalizeEstado(row['ESTADO']);
    const postos = parseInt(row['NÚMERO DE POSTOS PESQUISADOS'], 10) || 0;
    const preco = parseFloat(row['PREÇO MÉDIO REVENDA']);
    const regiao = row['REGIÃO'];

    if (!estado) continue;

    const existing = stateMap.get(estado) || { totalPostos: 0, totalPreco: 0, count: 0, regiao: '' };
    stateMap.set(estado, {
      totalPostos: existing.totalPostos + postos,
      totalPreco: existing.totalPreco + (isNaN(preco) ? 0 : preco),
      count: existing.count + (isNaN(preco) ? 0 : 1),
      regiao: regiao || existing.regiao,
    });
  }

  // Build CSV rows combining both datasets
  const rows = [];
  const allStates = new Set([...Object.keys(STATE_POPULATION), ...stateMap.keys()]);

  for (const estado of [...allStates].sort()) {
    const pop = STATE_POPULATION[estado] ?? '';
    const stats = stateMap.get(estado);
    const totalPostos = stats ? stats.totalPostos : '';
    const precoMedio = stats && stats.count > 0 ? (stats.totalPreco / stats.count).toFixed(3) : '';
    const iso = ESTADO_ISO_MAP[estado] || '';
    const regiao = stats ? stats.regiao : '';
    rows.push([estado, iso, regiao, pop, totalPostos, precoMedio]);
  }

  const header = 'estado,codigo_iso,regiao,poblacion_ibge2021,total_postos_acumulado,precio_medio_revenda';
  const csvLines = [header, ...rows.map(r => r.join(','))];
  const outPath = path.join(__dirname, 'map-data.csv');
  fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8');
  console.log(`CSV generado: ${outPath}`);
  console.log(`Total estados: ${rows.length}`);
}

main().catch(console.error);
