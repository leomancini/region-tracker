import { readFileSync, writeFileSync } from 'fs';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';

const world = JSON.parse(readFileSync('public/data/world-110m.json', 'utf-8'));
const countries = topojson.feature(world, world.objects.countries);

const width = 1200, height = 630;
const projection = geoNaturalEarth1().fitSize([width - 80, height - 120], countries).translate([width / 2, height / 2 + 10]);
const path = geoPath(projection);

let paths = '';
for (const feature of countries.features) {
  const d = path(feature);
  if (d) {
    paths += `    <path d="${d}" fill="#333" stroke="#555" stroke-width="0.5"/>\n`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#000"/>
  <g>
${paths}  </g>
</svg>`;

writeFileSync('public/img/og.svg', svg);
console.log('Generated public/img/og.svg');
