import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const resp = await fetch('/data/mexico-states.json');
  cachedData = await resp.json();
  return cachedData;
}

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export async function renderMap(container) {
  const mexico = await loadData();

  container.innerHTML = '';

  const padTop = 60, padBottom = 40;
  const width = 800, height = 600;
  const projection = d3.geoMercator().fitExtent(
    [[0, padTop], [width, height - padBottom]], mexico
  );
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("path.state")
    .data(mexico.features)
    .join("path")
    .attr("class", "state")
    .attr("d", path)
    .attr("id", d => slugify(d.properties.name));
}

export const names = {
  'aguascalientes': 'Aguascalientes',
  'baja-california': 'Baja California',
  'baja-california-sur': 'Baja California Sur',
  'campeche': 'Campeche',
  'chiapas': 'Chiapas',
  'chihuahua': 'Chihuahua',
  'ciudad-de-mexico': 'Ciudad de Mexico',
  'coahuila': 'Coahuila',
  'colima': 'Colima',
  'durango': 'Durango',
  'guanajuato': 'Guanajuato',
  'guerrero': 'Guerrero',
  'hidalgo': 'Hidalgo',
  'jalisco': 'Jalisco',
  'mexico': 'Mexico',
  'michoacan': 'Michoacan',
  'morelos': 'Morelos',
  'nayarit': 'Nayarit',
  'nuevo-leon': 'Nuevo Leon',
  'oaxaca': 'Oaxaca',
  'puebla': 'Puebla',
  'queretaro': 'Queretaro',
  'quintana-roo': 'Quintana Roo',
  'san-luis-potosi': 'San Luis Potosi',
  'sinaloa': 'Sinaloa',
  'sonora': 'Sonora',
  'tabasco': 'Tabasco',
  'tamaulipas': 'Tamaulipas',
  'tlaxcala': 'Tlaxcala',
  'veracruz': 'Veracruz',
  'yucatan': 'Yucatan',
  'zacatecas': 'Zacatecas',
};
