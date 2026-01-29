const XLSX = require('xlsx');
const fs = require('fs');

// Leer el archivo Excel
console.log('Leyendo archivo Excel...');
const workbook = XLSX.readFile('Gas in Brazil dataset v1.0.xlsx');

// Ver todas las hojas
console.log('Hojas disponibles:', workbook.SheetNames);

// Probar cada hoja para encontrar los datos
workbook.SheetNames.forEach((sheetName, index) => {
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log(`\nHoja ${index + 1} "${sheetName}": ${data.length} filas`);
  if (data.length > 0) {
    console.log('Columnas:', Object.keys(data[0]).slice(0, 5).join(', '), '...');
  }
});

// Buscar la hoja con los datos reales (la que tenga más filas)
let mainSheet = workbook.SheetNames[0];
let maxRows = 0;

workbook.SheetNames.forEach(sheetName => {
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  if (data.length > maxRows) {
    maxRows = data.length;
    mainSheet = sheetName;
  }
});

console.log(`\n=== Usando hoja: "${mainSheet}" con ${maxRows} filas ===`);

const worksheet = workbook.Sheets[mainSheet];
const data = XLSX.utils.sheet_to_json(worksheet);

if (data.length > 100) {
  console.log(`\nColumnas: ${Object.keys(data[0]).join(', ')}`);

  // Obtener productos únicos
  const productos = [...new Set(data.map(row => row['PRODUTO']))].filter(p => p);
  console.log(`\nProductos únicos (${productos.length}):`);
  productos.forEach(p => console.log(`  - ${p}`));

  // Obtener estados únicos
  const estados = [...new Set(data.map(row => row['ESTADO']))].filter(e => e);
  console.log(`\nEstados únicos (${estados.length}):`);
  estados.forEach(e => console.log(`  - ${e}`));

  // Obtener regiones únicas
  const regiones = [...new Set(data.map(row => row['REGIÃO']))].filter(r => r);
  console.log(`\nRegiones únicas:`);
  regiones.forEach(r => console.log(`  - ${r}`));

  // Convertir a CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  fs.writeFileSync('gas-prices-raw.csv', csv);
  console.log('\nCSV guardado como gas-prices-raw.csv');

  // Mostrar primera fila de ejemplo
  console.log('\nEjemplo de fila:');
  console.log(JSON.stringify(data[0], null, 2));
}
