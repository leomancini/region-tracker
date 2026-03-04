import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const resp = await fetch('/data/canada-provinces.json');
  cachedData = await resp.json();
  return cachedData;
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export async function renderMap(container) {
  const canada = await loadData();

  container.innerHTML = '';

  const padTop = 60, padBottom = 40;
  const width = 800, height = 600;
  const projection = d3.geoMercator().fitExtent(
    [[0, padTop], [width, height - padBottom]], canada
  );
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("path.province")
    .data(canada.features)
    .join("path")
    .attr("class", "province")
    .attr("d", path)
    .attr("id", d => slugify(d.properties.name));
}

export const names = {
  'quebec': 'Quebec',
  'ontario': 'Ontario',
  'british-columbia': 'British Columbia',
  'alberta': 'Alberta',
  'manitoba': 'Manitoba',
  'saskatchewan': 'Saskatchewan',
  'nova-scotia': 'Nova Scotia',
  'new-brunswick': 'New Brunswick',
  'newfoundland-and-labrador': 'Newfoundland and Labrador',
  'prince-edward-island': 'Prince Edward Island',
  'northwest-territories': 'Northwest Territories',
  'yukon-territory': 'Yukon',
  'nunavut': 'Nunavut',
};
