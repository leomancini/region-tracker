import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const resp = await fetch('/data/us-states-albers.json');
  cachedData = await resp.json();
  return cachedData;
}

export async function renderMap(container) {
  const us = await loadData();
  const states = topojson.feature(us, us.objects.states);

  container.innerHTML = '';

  const width = 975, height = 610;
  const path = d3.geoPath();

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg.selectAll("path.state")
    .data(states.features)
    .join("path")
    .attr("class", "state")
    .attr("d", path)
    .attr("id", d => d.id);
}

export const names = {
  '01':'Alabama','02':'Alaska','04':'Arizona','05':'Arkansas','06':'California',
  '08':'Colorado','09':'Connecticut','10':'Delaware','11':'Washington DC','12':'Florida',
  '13':'Georgia','15':'Hawaii','16':'Idaho','17':'Illinois','18':'Indiana',
  '19':'Iowa','20':'Kansas','21':'Kentucky','22':'Louisiana','23':'Maine',
  '24':'Maryland','25':'Massachusetts','26':'Michigan','27':'Minnesota','28':'Mississippi',
  '29':'Missouri','30':'Montana','31':'Nebraska','32':'Nevada','33':'New Hampshire',
  '34':'New Jersey','35':'New Mexico','36':'New York','37':'North Carolina',
  '38':'North Dakota','39':'Ohio','40':'Oklahoma','41':'Oregon','42':'Pennsylvania',
  '44':'Rhode Island','45':'South Carolina','46':'South Dakota','47':'Tennessee',
  '48':'Texas','49':'Utah','50':'Vermont','51':'Virginia','53':'Washington',
  '54':'West Virginia','55':'Wisconsin','56':'Wyoming','72':'Puerto Rico'
};
